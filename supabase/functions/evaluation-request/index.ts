import { createClient } from "jsr:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://auratio.cloud",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const aiToHumanConsentCopyVersion = "ai-to-human-v1";

function readSupabaseBackendSecretKey(): string | null {
  const rawSecretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");

  if (rawSecretKeys) {
    try {
      const parsed = JSON.parse(rawSecretKeys) as Record<string, unknown>;
      const defaultKey = parsed.default;
      if (typeof defaultKey === "string" && defaultKey.trim()) {
        return defaultKey.trim();
      }
    } catch {
      // Fall through to the compatibility environment variable.
    }
  }

  const fallback = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  return fallback || null;
}

function kickAiWorker(
  supabaseUrl: string,
  serviceKey: string,
): void {
  EdgeRuntime.waitUntil((async () => {
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/ai-worker`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": serviceKey,
          },
          body: JSON.stringify({ limit: 3 }),
        },
      );

      if (!response.ok) {
        console.error("ai_worker_kickoff_failed", {
          status: response.status,
        });
      }
    } catch (error) {
      console.error("ai_worker_kickoff_failed", {
        message: error instanceof Error
          ? error.message
          : "unknown_worker_kickoff_error",
      });
    }
  })());
}

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return respond(req, 405, { error: "method_not_allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = readSupabaseBackendSecretKey();
  if (!supabaseUrl || !serviceKey) {
    return respond(req, 500, { error: "server_configuration_error" });
  }

  const accessToken = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!accessToken) return respond(req, 401, { error: "authentication_required" });

  const service = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await service.auth.getUser(accessToken);
  const actor = authData.user;
  if (authError || !actor) return respond(req, 401, { error: "invalid_session" });

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return respond(req, 400, { error: "invalid_json" });
  }

  const action = typeof payload.action === "string" ? payload.action.trim() : "create";

  if (action === "consent_ai_to_human") {
    const requestId = typeof payload.request_id === "string" ? payload.request_id.trim() : "";
    if (!uuidPattern.test(requestId)) {
      return respond(req, 400, { error: "invalid_request_id" });
    }

    const { data, error } = await service.rpc("svc_end_user_consent_ai_to_human", {
      p_actor_user_id: actor.id,
      p_request_id: requestId,
      p_consent_copy_version: aiToHumanConsentCopyVersion,
    });

    if (error) {
      const message = error.message ?? "mode_redirection_rejected";
      return respond(req, 409, { error: "mode_redirection_rejected", message });
    }

    return respond(req, 200, data);
  }

  if (action !== "create") {
    return respond(req, 400, { error: "invalid_action" });
  }

  const trackId = typeof payload.track_id === "string" ? payload.track_id.trim() : "";
  const mode = payload.mode;
  const objectPath = typeof payload.object_path === "string" ? payload.object_path.trim() : "";
  const mimeType = typeof payload.mime_type === "string" ? payload.mime_type.trim().toLowerCase() : "video/mp4";
  const duration = typeof payload.duration_seconds === "number" ? payload.duration_seconds : Number.NaN;
  const size = payload.size_bytes == null ? null : Number(payload.size_bytes);

  if (!trackId) return respond(req, 400, { error: "track_id_required" });
  if (mode !== "ai" && mode !== "human") return respond(req, 400, { error: "invalid_mode" });
  if (!objectPath) return respond(req, 400, { error: "object_path_required" });
  if (!Number.isFinite(duration) || duration <= 0) return respond(req, 400, { error: "invalid_duration" });
  if (size !== null && (!Number.isSafeInteger(size) || size <= 0)) return respond(req, 400, { error: "invalid_size_bytes" });

  const { data, error } = await service.rpc("svc_create_evaluation_request", {
    p_actor_user_id: actor.id,
    p_track_id: trackId,
    p_mode: mode,
    p_object_path: objectPath,
    p_duration_seconds: duration,
    p_size_bytes: size,
    p_mime_type: mimeType,
  });

  if (error) {
    const message = error.message ?? "request_rejected";
    const status = message.includes("active evaluation request") ? 409 : 422;
    return respond(req, status, { error: "evaluation_request_rejected", message });
  }

  if (mode === "ai") {
    kickAiWorker(supabaseUrl, serviceKey);
  }

  return respond(req, 200, data);
});
