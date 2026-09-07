import { createClient } from "jsr:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://auratio.cloud",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://auratio.cloud",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function respond(req: Request, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

function boundedLimit(value: unknown): number {
  const parsed = Number(value ?? 10);
  if (!Number.isInteger(parsed)) return 10;
  return Math.min(Math.max(parsed, 1), 25);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return respond(req, 405, { error: "method_not_allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return respond(req, 500, { error: "server_configuration_error" });

  const accessToken = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!accessToken) return respond(req, 401, { error: "authentication_required" });

  const service = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (accessToken !== serviceRoleKey) {
    const { data: authData, error: authError } = await service.auth.getUser(accessToken);
    const actor = authData.user;
    if (authError || !actor) return respond(req, 401, { error: "invalid_session" });

    const { data: profile, error: profileError } = await service
      .from("profiles")
      .select("role,account_status")
      .eq("user_id", actor.id)
      .maybeSingle();

    if (
      profileError ||
      !profile ||
      profile.account_status !== "active" ||
      (profile.role !== "admin" && profile.role !== "super_admin")
    ) {
      return respond(req, 403, { error: "admin_required" });
    }
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const limit = boundedLimit(body.limit);

  const { data: claimedData, error: claimError } = await service.rpc("svc_claim_video_deletion_jobs", {
    p_limit: limit,
  });
  if (claimError) return respond(req, 500, { error: "claim_failed", message: claimError.message });

  const claimed = Array.isArray(claimedData) ? claimedData as Record<string, unknown>[] : [];
  const results: Record<string, unknown>[] = [];

  for (const job of claimed) {
    const claimToken = typeof job.claim_token === "string" ? job.claim_token : "";
    const submissionId = typeof job.submission_id === "string" ? job.submission_id : "";
    const bucketName = typeof job.bucket_name === "string" ? job.bucket_name : "";
    const objectPath = typeof job.object_path === "string" ? job.object_path : "";

    if (!claimToken || !submissionId || bucketName !== "evaluation-videos" || !objectPath) {
      if (claimToken) {
        await service.rpc("svc_fail_video_deletion", {
          p_claim_token: claimToken,
          p_error: "invalid_worker_claim",
        });
      }
      results.push({ submission_id: submissionId || null, status: "failed", error: "invalid_worker_claim" });
      continue;
    }

    let alreadyMissing = false;
    try {
      const { data: removal, error: removeError } = await service.storage.from(bucketName).remove([objectPath]);
      if (removeError) {
        const message = removeError.message ?? "storage_delete_failed";
        if (/not found|does not exist/i.test(message)) {
          alreadyMissing = true;
        } else {
          throw new Error(message);
        }
      } else if (!removal || removal.length === 0) {
        alreadyMissing = true;
      }

      const { data: completed, error: completeError } = await service.rpc("svc_complete_video_deletion", {
        p_claim_token: claimToken,
        p_already_missing: alreadyMissing,
      });
      if (completeError) throw new Error(completeError.message ?? "completion_failed");

      results.push({ submission_id: submissionId, status: "succeeded", already_missing: alreadyMissing, result: completed });
    } catch (error) {
      const message = error instanceof Error ? error.message : "video_deletion_failed";
      const { data: failed, error: failError } = await service.rpc("svc_fail_video_deletion", {
        p_claim_token: claimToken,
        p_error: message,
      });
      results.push({
        submission_id: submissionId,
        status: "retry",
        error: message,
        retry_result: failError ? null : failed,
      });
    }
  }

  return respond(req, 200, {
    claimed: claimed.length,
    succeeded: results.filter((item) => item.status === "succeeded").length,
    retry: results.filter((item) => item.status === "retry").length,
    results,
  });
});
