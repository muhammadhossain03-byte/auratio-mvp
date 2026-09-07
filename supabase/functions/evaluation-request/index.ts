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
  const { data: authData, error: authError } = await service.auth.getUser(accessToken);
  const actor = authData.user;
  if (authError || !actor) return respond(req, 401, { error: "invalid_session" });

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return respond(req, 400, { error: "invalid_json" });
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

  return respond(req, 200, data);
});
