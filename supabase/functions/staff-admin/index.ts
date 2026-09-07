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

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return respond(req, 405, { error: "method_not_allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return respond(req, 500, { error: "server_configuration_error" });

  const authHeader = req.headers.get("Authorization") ?? "";
  const accessToken = authHeader.replace(/^Bearer\s+/i, "");
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

  const action = payload.action;
  if (typeof action !== "string") return respond(req, 400, { error: "action_required" });

  try {
    if (action === "create_invitation") {
      const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
      const targetRole = payload.target_role;
      if (!email || !email.includes("@")) return respond(req, 400, { error: "valid_email_required" });
      if (targetRole !== "admin" && targetRole !== "volunteer") return respond(req, 400, { error: "invalid_target_role" });

      const { data, error } = await service.rpc("svc_staff_create_invitation", {
        p_actor_user_id: actor.id,
        p_email: email,
        p_target_role: targetRole,
      });
      if (error) return respond(req, 403, { error: "staff_operation_rejected", message: error.message });
      const row = Array.isArray(data) ? data[0] : data;
      return respond(req, 200, {
        ok: true,
        invitation_id: row?.invitation_id,
        invitation_token: row?.invitation_token,
        expires_at: row?.invitation_expires_at,
      });
    }

    if (action === "revoke_invitation") {
      if (!isUuid(payload.invitation_id)) return respond(req, 400, { error: "valid_invitation_id_required" });
      const { data, error } = await service.rpc("svc_staff_revoke_invitation", {
        p_actor_user_id: actor.id,
        p_invitation_id: payload.invitation_id,
      });
      if (error) return respond(req, 403, { error: "staff_operation_rejected", message: error.message });
      return respond(req, 200, data);
    }

    if (action === "expire_invitations") {
      const { data, error } = await service.rpc("svc_staff_expire_invitations", {
        p_actor_user_id: actor.id,
      });
      if (error) return respond(req, 403, { error: "staff_operation_rejected", message: error.message });
      return respond(req, 200, { ok: true, expired_count: data ?? 0 });
    }

    if (action === "set_account_status") {
      if (!isUuid(payload.user_id)) return respond(req, 400, { error: "valid_user_id_required" });
      if (payload.status !== "active" && payload.status !== "disabled") return respond(req, 400, { error: "invalid_account_status" });
      const { data, error } = await service.rpc("svc_staff_set_account_status", {
        p_actor_user_id: actor.id,
        p_user_id: payload.user_id,
        p_status: payload.status,
      });
      if (error) return respond(req, 403, { error: "staff_operation_rejected", message: error.message });
      return respond(req, 200, data);
    }

    return respond(req, 400, { error: "unsupported_action" });
  } catch {
    return respond(req, 500, { error: "unexpected_server_error" });
  }
});
