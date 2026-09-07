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

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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

  const trackId = text(payload.track_id);
  const mode = payload.mode;
  const period = payload.period ?? "all_time";
  const monthRaw = payload.month == null ? null : text(payload.month);
  const limitRaw = payload.limit == null ? 100 : Number(payload.limit);

  if (!trackId) return respond(req, 400, { error: "track_id_required" });
  if (mode !== "ai" && mode !== "human") return respond(req, 400, { error: "invalid_mode" });
  if (period !== "all_time" && period !== "monthly") return respond(req, 400, { error: "invalid_period" });
  if (monthRaw !== null && !/^\d{4}-\d{2}(?:-\d{2})?$/.test(monthRaw)) return respond(req, 400, { error: "invalid_month" });
  if (!Number.isInteger(limitRaw) || limitRaw < 1 || limitRaw > 200) return respond(req, 400, { error: "invalid_limit" });

  const month = monthRaw == null ? null : (monthRaw.length === 7 ? `${monthRaw}-01` : monthRaw);
  const { data, error } = await service.rpc("svc_get_leaderboard", {
    p_actor_user_id: actor.id,
    p_track_id: trackId,
    p_mode: mode,
    p_period: period,
    p_month: month,
    p_limit: limitRaw,
  });

  if (error) return respond(req, 422, { error: "leaderboard_request_rejected", message: error.message });
  return respond(req, 200, data);
});
