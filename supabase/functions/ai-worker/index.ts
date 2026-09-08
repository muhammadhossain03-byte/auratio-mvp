import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  buildInteractionRequest,
  extractFinalStructuredText,
  GEMINI_API_REVISION,
  GEMINI_BASE_URL,
  GEMINI_MODEL,
  normalizeFileState,
  normalizeInteractionStatus,
  providerErrorMessage,
  ProviderJob,
  RuntimeContext,
  sha256Hex,
} from "./provider.ts";

type SupabaseService = ReturnType<typeof createClient>;

const FILE_POLL_SECONDS = 5;
const INTERACTION_POLL_SECONDS = 15;

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function boundedLimit(value: unknown): number {
  const parsed = Number(value ?? 1);
  if (!Number.isInteger(parsed)) return 1;
  return Math.min(Math.max(parsed, 1), 3);
}

function isActiveAiJob(job: ProviderJob): boolean {
  return job.request_mode === "ai" &&
    job.request_status === "processing" &&
    (job.attempt_status === "created" || job.attempt_status === "in_flight");
}

async function rpc(service: SupabaseService, name: string, args: Record<string, unknown>): Promise<unknown> {
  const { data, error } = await service.rpc(name, args);
  if (error) throw new Error(`${name}: ${error.message}`);
  return data;
}

async function readRequestActive(service: SupabaseService, requestId: string): Promise<boolean> {
  const { data, error } = await service
    .from("evaluation_requests")
    .select("mode,status")
    .eq("id", requestId)
    .maybeSingle();
  if (error) throw new Error(`request_state_read_failed: ${error.message}`);
  return !!data && data.mode === "ai" && data.status === "processing";
}

async function geminiFetch(
  apiKey: string,
  path: string,
  init: RequestInit = {},
  apiRevision = false,
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("x-goog-api-key", apiKey);
  if (apiRevision) headers.set("Api-Revision", GEMINI_API_REVISION);
  return await fetch(`${GEMINI_BASE_URL}${path}`, { ...init, headers });
}

async function safeJson(response: Response): Promise<Record<string, unknown>> {
  try {
    const value = await response.json();
    return value && typeof value === "object" ? value as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

async function failActiveAttempt(
  service: SupabaseService,
  requestId: string,
  failureKind: "api_failure" | "invalid",
  code: string,
  reason: string,
  digest: string | null = null,
): Promise<void> {
  const active = await readRequestActive(service, requestId);
  if (!active) return;
  await rpc(service, "svc_ai_fail_attempt", {
    p_request_id: requestId,
    p_failure_kind: failureKind,
    p_failure_code: code,
    p_failure_reason: reason.slice(0, 1000),
    p_output_digest_sha256: digest,
  });
}

async function markCleanup(
  service: SupabaseService,
  claimToken: string,
  error: string | null = null,
): Promise<void> {
  await rpc(service, "svc_ai_provider_mark_cleanup_pending", {
    p_claim_token: claimToken,
    p_error: error,
  });
}

async function createSignedSource(
  service: SupabaseService,
  context: RuntimeContext,
): Promise<Response> {
  if (context.video_bucket !== "evaluation-videos") throw new Error("invalid_source_bucket");
  if (context.video_mime_type !== "video/mp4") throw new Error("invalid_source_mime_type");

  const { data, error } = await service.storage
    .from(context.video_bucket)
    .createSignedUrl(context.video_object_path, 120);
  if (error || !data?.signedUrl) throw new Error(`source_sign_failed: ${error?.message ?? "missing_signed_url"}`);

  const source = await fetch(data.signedUrl);
  if (!source.ok || !source.body) throw new Error(`source_download_failed: ${source.status}`);
  return source;
}

async function getGeminiFile(apiKey: string, fileName: string): Promise<Record<string, unknown>> {
  const response = await geminiFetch(apiKey, `/v1beta/${fileName}`, { method: "GET" });
  const body = await safeJson(response);
  if (!response.ok) throw new Error(`gemini_file_get_failed: ${providerErrorMessage(body, String(response.status))}`);
  return body;
}

async function uploadSourceToGemini(
  service: SupabaseService,
  apiKey: string,
  context: RuntimeContext,
): Promise<{ name: string; uri: string; state: string }> {
  const source = await createSignedSource(service, context);
  const headerSize = Number(source.headers.get("content-length") ?? 0);
  const size = Number(context.video_size_bytes ?? headerSize);
  if (!Number.isFinite(size) || size <= 0) throw new Error("source_content_length_missing");

  const start = await geminiFetch(apiKey, "/upload/v1beta/files", {
    method: "POST",
    headers: {
      "X-Goog-Upload-Protocol": "resumable",
      "X-Goog-Upload-Command": "start",
      "X-Goog-Upload-Header-Content-Length": String(size),
      "X-Goog-Upload-Header-Content-Type": "video/mp4",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file: { display_name: `Auratio ${context.submission_id}` } }),
  });
  if (!start.ok) {
    const body = await safeJson(start);
    throw new Error(`gemini_file_start_failed: ${providerErrorMessage(body, String(start.status))}`);
  }

  const uploadUrl = start.headers.get("x-goog-upload-url");
  if (!uploadUrl) throw new Error("gemini_upload_url_missing");

  const upload = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length": String(size),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
      "Content-Type": "video/mp4",
    },
    body: source.body,
  });
  const uploadBody = await safeJson(upload);
  if (!upload.ok) {
    throw new Error(`gemini_file_upload_failed: ${providerErrorMessage(uploadBody, String(upload.status))}`);
  }

  const file = uploadBody.file && typeof uploadBody.file === "object"
    ? uploadBody.file as Record<string, unknown>
    : uploadBody;

  const name = typeof file.name === "string" ? file.name : "";
  const uri = typeof file.uri === "string" ? file.uri : "";
  if (!name || !uri) throw new Error("gemini_uploaded_file_identity_missing");

  return { name, uri, state: normalizeFileState(file.state) };
}

async function handleFileReady(
  service: SupabaseService,
  apiKey: string,
  job: ProviderJob,
  context: RuntimeContext,
): Promise<string> {
  if (!job.provider_file_name || !job.provider_file_uri) throw new Error("provider_file_identity_missing");

  const metadata = await getGeminiFile(apiKey, job.provider_file_name);
  const fileState = normalizeFileState(metadata.state);

  if (fileState === "PROCESSING" || fileState === "UNKNOWN") {
    await rpc(service, "svc_ai_provider_schedule_file_poll", {
      p_claim_token: job.claim_token,
      p_provider_status: fileState,
      p_delay_seconds: FILE_POLL_SECONDS,
    });
    return "file_processing";
  }

  if (fileState === "FAILED") {
    const reason = providerErrorMessage(metadata, "Gemini file processing failed");
    await failActiveAttempt(service, job.request_id, "api_failure", "gemini_file_processing_failed", reason);
    await markCleanup(service, job.claim_token, reason);
    return "file_failed";
  }

  await rpc(service, "svc_ai_provider_begin_interaction", {
    p_claim_token: job.claim_token,
  });

  let response: Response;
  let body: Record<string, unknown>;
  try {
    response = await geminiFetch(apiKey, "/v1beta/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildInteractionRequest(context, job.provider_file_uri)),
    }, true);
    body = await safeJson(response);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "gemini_interaction_creation_transport_error";
    await rpc(service, "svc_ai_provider_mark_interaction_uncertain", {
      p_claim_token: job.claim_token,
      p_error: reason,
    });
    await failActiveAttempt(
      service,
      job.request_id,
      "api_failure",
      "gemini_interaction_creation_uncertain",
      reason,
    );
    await markCleanup(service, job.claim_token, reason);
    return "interaction_creation_uncertain";
  }

  const interactionId = typeof body.id === "string" ? body.id : "";
  if (!response.ok || !interactionId) {
    const reason = providerErrorMessage(body, `Gemini Interaction creation failed (${response.status})`);
    await rpc(service, "svc_ai_provider_mark_interaction_uncertain", {
      p_claim_token: job.claim_token,
      p_error: reason,
    });
    await failActiveAttempt(
      service,
      job.request_id,
      "api_failure",
      "gemini_interaction_creation_uncertain",
      reason,
    );
    await markCleanup(service, job.claim_token, reason);
    return "interaction_creation_uncertain";
  }

  await rpc(service, "svc_ai_provider_record_interaction", {
    p_claim_token: job.claim_token,
    p_interaction_id: interactionId,
    p_provider_status: normalizeInteractionStatus(body.status),
  });
  return "interaction_created";
}

async function initializeJob(
  service: SupabaseService,
  apiKey: string,
  job: ProviderJob,
): Promise<string> {
  if (!isActiveAiJob(job)) {
    await markCleanup(service, job.claim_token, "auratio_request_no_longer_active");
    return "inactive_cleanup";
  }

  if (job.attempt_status === "created") {
    await rpc(service, "svc_ai_start_attempt", {
      p_request_id: job.request_id,
      p_model_identifier: GEMINI_MODEL,
    });
  }

  await rpc(service, "svc_ai_provider_mark_initializing", {
    p_claim_token: job.claim_token,
  });

  const context = await rpc(service, "svc_ai_provider_runtime_context", {
    p_request_id: job.request_id,
  }) as RuntimeContext;

  try {
    const uploaded = await uploadSourceToGemini(service, apiKey, context);
    await rpc(service, "svc_ai_provider_record_file", {
      p_claim_token: job.claim_token,
      p_provider_file_name: uploaded.name,
      p_provider_file_uri: uploaded.uri,
    });

    job.provider_file_name = uploaded.name;
    job.provider_file_uri = uploaded.uri;
    job.state = "file_ready";

    if (uploaded.state === "PROCESSING" || uploaded.state === "UNKNOWN") {
      await rpc(service, "svc_ai_provider_schedule_file_poll", {
        p_claim_token: job.claim_token,
        p_provider_status: uploaded.state,
        p_delay_seconds: FILE_POLL_SECONDS,
      });
      return "file_uploaded_processing";
    }

    if (uploaded.state === "FAILED") {
      await failActiveAttempt(
        service,
        job.request_id,
        "api_failure",
        "gemini_file_processing_failed",
        "Gemini file processing failed immediately after upload",
      );
      await markCleanup(service, job.claim_token, "gemini_file_processing_failed");
      return "file_failed";
    }

    return await handleFileReady(service, apiKey, job, context);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "gemini_file_upload_error";
    await failActiveAttempt(service, job.request_id, "api_failure", "gemini_file_upload_error", reason);
    await markCleanup(service, job.claim_token, reason);
    return "file_upload_failed";
  }
}

async function pollInteraction(
  service: SupabaseService,
  apiKey: string,
  job: ProviderJob,
): Promise<string> {
  if (!job.interaction_id) throw new Error("interaction_id_missing");

  if (!isActiveAiJob(job)) {
    try {
      await geminiFetch(
        apiKey,
        `/v1beta/interactions/${encodeURIComponent(job.interaction_id)}/cancel`,
        { method: "POST" },
        true,
      );
    } catch {
      // Cleanup remains authoritative; cancellation is best effort.
    }
    await markCleanup(service, job.claim_token, "auratio_request_no_longer_active");
    return "inactive_cleanup";
  }

  const response = await geminiFetch(
    apiKey,
    `/v1beta/interactions/${encodeURIComponent(job.interaction_id)}`,
    { method: "GET" },
    true,
  );
  const body = await safeJson(response);
  if (!response.ok) {
    const reason = providerErrorMessage(body, `Gemini Interaction retrieval failed (${response.status})`);
    await failActiveAttempt(service, job.request_id, "api_failure", "gemini_interaction_get_failed", reason);
    await markCleanup(service, job.claim_token, reason);
    return "interaction_get_failed";
  }

  const status = normalizeInteractionStatus(body.status);

  // Gemini may queue a background Interaction before it becomes in_progress.
  // Both states are nonterminal and must poll the same Interaction ID.
  if (status === "in_progress" || status === "queued") {
    await rpc(service, "svc_ai_provider_schedule_poll", {
      p_claim_token: job.claim_token,
      p_provider_status: status,
      p_delay_seconds: INTERACTION_POLL_SECONDS,
    });
    return "interaction_processing";
  }

  if (status === "completed") {
    let rawText: string;
    let digest: string;
    try {
      rawText = extractFinalStructuredText(body);
      digest = await sha256Hex(rawText);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "gemini_output_missing";
      await failActiveAttempt(service, job.request_id, "invalid", "invalid_output_json", reason);
      await markCleanup(service, job.claim_token, reason);
      return "invalid_output";
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      await failActiveAttempt(
        service,
        job.request_id,
        "invalid",
        "invalid_output_json",
        "Gemini structured output was not valid JSON",
        digest,
      );
      await markCleanup(service, job.claim_token, "invalid_output_json");
      return "invalid_output";
    }

    const activeBeforeFinalize = await readRequestActive(service, job.request_id);
    if (!activeBeforeFinalize) {
      await markCleanup(service, job.claim_token, "auratio_request_no_longer_active");
      return "late_output_discarded";
    }

    const { error: finalizeError } = await service.rpc("svc_ai_finalize_result", {
      p_request_id: job.request_id,
      p_result: parsed,
      p_output_digest_sha256: digest,
    });

    if (finalizeError) {
      const stillActive = await readRequestActive(service, job.request_id);
      if (stillActive) {
        await failActiveAttempt(
          service,
          job.request_id,
          "api_failure",
          "auratio_finalize_failed",
          finalizeError.message,
          digest,
        );
      }
    }

    await markCleanup(service, job.claim_token, finalizeError?.message ?? null);
    return finalizeError ? "finalize_failed" : "completed";
  }

  const active = await readRequestActive(service, job.request_id);
  if (active) {
    const reason = providerErrorMessage(body, `Gemini Interaction ended with status ${status}`);
    await failActiveAttempt(
      service,
      job.request_id,
      "api_failure",
      `gemini_interaction_${status.replace(/[^a-z0-9_]/g, "_")}`,
      reason,
    );
  }
  await markCleanup(service, job.claim_token, `gemini_interaction_${status}`);
  return `interaction_${status}`;
}

async function failClosedUncertainInteraction(
  service: SupabaseService,
  job: ProviderJob,
): Promise<string> {
  const reason = job.interaction_creation_uncertain_at
    ? "Gemini Interaction creation previously became uncertain; retry is forbidden"
    : "Worker resumed after Interaction creation began; retry is forbidden";

  if (!job.interaction_creation_uncertain_at) {
    await rpc(service, "svc_ai_provider_mark_interaction_uncertain", {
      p_claim_token: job.claim_token,
      p_error: reason,
    });
  }
  await failActiveAttempt(
    service,
    job.request_id,
    "api_failure",
    "gemini_interaction_creation_uncertain",
    reason,
  );
  await markCleanup(service, job.claim_token, reason);
  return "interaction_creation_uncertain";
}

async function deleteGeminiFile(apiKey: string, fileName: string | null, alreadyDeleted: boolean): Promise<boolean> {
  if (!fileName || alreadyDeleted) return true;
  const response = await geminiFetch(apiKey, `/v1beta/${fileName}`, { method: "DELETE" });
  return response.ok || response.status === 404;
}

async function deleteGeminiInteraction(
  apiKey: string,
  interactionId: string | null,
  providerStatus: string | null,
  alreadyDeleted: boolean,
): Promise<boolean> {
  if (!interactionId || alreadyDeleted) return true;

  const status = normalizeInteractionStatus(providerStatus);
  if (status === "queued" || status === "in_progress" || status === "requires_action" || status === "unknown") {
    try {
      await geminiFetch(
        apiKey,
        `/v1beta/interactions/${encodeURIComponent(interactionId)}/cancel`,
        { method: "POST" },
        true,
      );
    } catch {
      // Deletion below decides whether cleanup is complete.
    }
  }

  const response = await geminiFetch(
    apiKey,
    `/v1beta/interactions/${encodeURIComponent(interactionId)}`,
    { method: "DELETE" },
    true,
  );
  return response.ok || response.status === 404;
}

async function cleanupJob(
  service: SupabaseService,
  apiKey: string,
  job: ProviderJob,
): Promise<string> {
  let fileDeleted = false;
  let interactionDeleted = false;
  const errors: string[] = [];

  try {
    fileDeleted = await deleteGeminiFile(apiKey, job.provider_file_name, !!job.provider_file_deleted_at);
    if (!fileDeleted) errors.push("provider_file_delete_failed");
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "provider_file_delete_failed");
  }

  try {
    interactionDeleted = await deleteGeminiInteraction(
      apiKey,
      job.interaction_id,
      job.provider_status,
      !!job.interaction_deleted_at,
    );
    if (!interactionDeleted) errors.push("provider_interaction_delete_failed");
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "provider_interaction_delete_failed");
  }

  await rpc(service, "svc_ai_provider_cleanup_result", {
    p_claim_token: job.claim_token,
    p_provider_file_deleted: fileDeleted,
    p_interaction_deleted: interactionDeleted,
    p_error: errors.length ? errors.join("; ").slice(0, 1000) : null,
  });

  return errors.length ? "cleanup_retry" : "cleaned";
}

async function processJob(
  service: SupabaseService,
  apiKey: string,
  job: ProviderJob,
): Promise<string> {
  if (!job.claim_token || !job.request_id) throw new Error("invalid_provider_claim");

  switch (job.state) {
    case "queued":
    case "initializing":
      return await initializeJob(service, apiKey, job);

    case "file_ready": {
      if (!isActiveAiJob(job)) {
        await markCleanup(service, job.claim_token, "auratio_request_no_longer_active");
        return "inactive_cleanup";
      }
      const context = await rpc(service, "svc_ai_provider_runtime_context", {
        p_request_id: job.request_id,
      }) as RuntimeContext;
      return await handleFileReady(service, apiKey, job, context);
    }

    case "interaction_creating":
      return await failClosedUncertainInteraction(service, job);

    case "interaction_pending":
      return await pollInteraction(service, apiKey, job);

    case "cleanup_pending":
      return await cleanupJob(service, apiKey, job);

    default:
      throw new Error(`unsupported_provider_job_state:${job.state}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return jsonResponse(405, { error: "method_not_allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

  if (!supabaseUrl || !serviceRoleKey || !geminiApiKey) {
    return jsonResponse(500, { error: "server_configuration_error" });
  }

  const accessToken = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!accessToken || accessToken !== serviceRoleKey) {
    return jsonResponse(403, { error: "service_role_required" });
  }

  const service = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const limit = boundedLimit(body.limit);
  const { data: claimedData, error: claimError } = await service.rpc("svc_ai_provider_claim_jobs", {
    p_limit: limit,
  });

  if (claimError) return jsonResponse(500, { error: "claim_failed" });

  const claimed = Array.isArray(claimedData) ? claimedData as ProviderJob[] : [];
  const results: Array<Record<string, unknown>> = [];

  for (const job of claimed) {
    try {
      const outcome = await processJob(service, geminiApiKey, job);
      results.push({ request_id: job.request_id, state: job.state, outcome });
    } catch (error) {
      const message = error instanceof Error ? error.message : "worker_job_failed";
      try {
        if (job.claim_token) {
          await failActiveAttempt(service, job.request_id, "api_failure", "ai_worker_internal_error", message);
          await markCleanup(service, job.claim_token, message);
        }
      } catch {
        // The durable claim remains recoverable by the stale-claim timeout.
      }
      results.push({ request_id: job.request_id, state: job.state, outcome: "worker_error" });
    }
  }

  return jsonResponse(200, {
    claimed: claimed.length,
    processed: results.length,
    results,
  });
});
