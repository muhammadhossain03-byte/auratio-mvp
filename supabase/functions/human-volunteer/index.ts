import { createClient } from "jsr:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://auratio.cloud",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

const anchors = new Set(["Low", "Competent", "Excellent"]);

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

  const action = typeof payload.action === "string" ? payload.action : "";
  const requestId = uuid(payload.request_id);
  if (!requestId) return respond(req, 400, { error: "valid_request_id_required" });

  let rpc = "";
  let args: Record<string, unknown> = { p_actor_user_id: actor.id, p_request_id: requestId };

  if (action === "accept" || action === "decline" || action === "return") {
    const why = text(payload.reason);
    if ((action === "decline" || action === "return") && !why) return respond(req, 400, { error: "reason_required" });
    rpc = "svc_human_volunteer_respond";
    args = { ...args, p_action: action, p_reason: why || null };
  } else if (action === "begin") {
    rpc = "svc_human_volunteer_begin";
  } else if (action === "save_criterion") {
    const criterionId = text(payload.criterion_id);
    const anchor = payload.anchor;
    const score = Number(payload.score);
    const timestamp = Number(payload.primary_timestamp_seconds);
    const evidence = text(payload.evidence);
    const strength = text(payload.strength);
    const weakness = text(payload.weakness);
    const improvement = text(payload.actionable_improvement);

    if (!criterionId) return respond(req, 400, { error: "criterion_id_required" });
    if (typeof anchor !== "string" || !anchors.has(anchor)) return respond(req, 400, { error: "invalid_anchor" });
    if (!Number.isInteger(score)) return respond(req, 400, { error: "integer_score_required" });
    if (!Number.isFinite(timestamp) || timestamp < 0) return respond(req, 400, { error: "invalid_timestamp" });
    if (!evidence || !strength || !weakness || !improvement) return respond(req, 400, { error: "complete_feedback_required" });

    rpc = "svc_human_volunteer_save_criterion";
    args = {
      ...args,
      p_criterion_id: criterionId,
      p_anchor: anchor,
      p_score: score,
      p_primary_timestamp_seconds: timestamp,
      p_evidence: evidence,
      p_strength: strength,
      p_weakness: weakness,
      p_actionable_improvement: improvement,
    };
  } else if (action === "save_summary") {
    const summary = text(payload.overall_summary);
    if (!summary) return respond(req, 400, { error: "overall_summary_required" });
    rpc = "svc_human_volunteer_save_summary";
    args = { ...args, p_overall_summary: summary };
  } else if (action === "submit") {
    rpc = "svc_human_volunteer_submit";
  } else {
    return respond(req, 400, { error: "unsupported_action" });
  }

  const { data, error } = await service.rpc(rpc, args);
  if (error) return respond(req, 409, { error: "human_volunteer_operation_rejected", message: error.message });
  return respond(req, 200, data);
});
