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

function uuid(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null;
}

function reason(value: unknown): string {
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

  const action = typeof payload.action === "string" ? payload.action : "";
  const requestId = uuid(payload.request_id);
  if (!requestId) return respond(req, 400, { error: "valid_request_id_required" });

  let rpc = "";
  let args: Record<string, unknown> = { p_actor_user_id: actor.id, p_request_id: requestId };

  if (action === "assign") {
    const volunteerId = uuid(payload.volunteer_user_id);
    if (!volunteerId) return respond(req, 400, { error: "valid_volunteer_user_id_required" });
    rpc = "svc_human_admin_assign";
    args = { ...args, p_volunteer_user_id: volunteerId };
  } else if (action === "reassign") {
    const volunteerId = uuid(payload.volunteer_user_id);
    const why = reason(payload.reason);
    if (!volunteerId) return respond(req, 400, { error: "valid_volunteer_user_id_required" });
    if (!why) return respond(req, 400, { error: "reason_required" });
    rpc = "svc_human_admin_reassign";
    args = { ...args, p_volunteer_user_id: volunteerId, p_reason: why };
  } else if (action === "cancel") {
    const why = reason(payload.reason);
    if (!why) return respond(req, 400, { error: "reason_required" });
    rpc = "svc_human_admin_cancel";
    args = { ...args, p_reason: why };
  } else if (action === "reject") {
    const why = reason(payload.reason);
    if (!why) return respond(req, 400, { error: "reason_required" });
    rpc = "svc_human_admin_reject";
    args = { ...args, p_reason: why };
  } else if (action === "approve") {
    rpc = "svc_human_admin_approve";
  } else if (action === "reopen") {
    const why = reason(payload.reason);
    if (!why) return respond(req, 400, { error: "reason_required" });
    rpc = "svc_human_admin_reopen";
    args = { ...args, p_reason: why };
  } else {
    return respond(req, 400, { error: "unsupported_action" });
  }

  const { data, error } = await service.rpc(rpc, args);
  if (error) return respond(req, 409, { error: "human_admin_operation_rejected", message: error.message });
  return respond(req, 200, data);
});
