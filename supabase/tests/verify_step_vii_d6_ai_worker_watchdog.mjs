import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function requireText(text, needle, label) {
  if (!text.includes(needle)) {
    throw new Error(`VII-D6 verification failed: ${label}`);
  }
}

function forbidText(text, needle, label) {
  if (text.includes(needle)) {
    throw new Error(`VII-D6 verification failed: ${label}`);
  }
}

const worker = read("supabase/functions/ai-worker/index.ts");
const provider = read("supabase/functions/ai-worker/provider.ts");
const migration = read(
  "supabase/migrations/20260910121000_step_vii_d6_ai_worker_watchdog.sql",
);

// 1. ai-worker still contains gemini-3.6-flash indirectly through existing provider import/use
requireText(
  provider,
  'export const GEMINI_MODEL = "gemini-3.6-flash";',
  "active worker model must remain Gemini 3.6 Flash",
);
requireText(
  worker,
  "GEMINI_MODEL",
  "ai-worker must import/use GEMINI_MODEL from provider.ts",
);

// 2. existing service-key apikey authorization remains supported
requireText(
  worker,
  'req.headers.get("apikey")',
  "existing service-key apikey header check must remain supported",
);
requireText(
  worker,
  "callerApiKey === serviceKey",
  "service-key equality check must remain supported",
);

// 3. new x-auratio-ai-cron-token header exists
requireText(
  worker,
  'req.headers.get("x-auratio-ai-cron-token")',
  "new x-auratio-ai-cron-token header must be checked",
);

// 4. worker calls svc_ai_worker_cron_token_valid
requireText(
  worker,
  '"svc_ai_worker_cron_token_valid"',
  "worker must validate cron token via svc_ai_worker_cron_token_valid RPC",
);

// 5. no provider/Gemini/scoring/finalization logic was changed
requireText(
  worker,
  "svc_ai_finalize_result",
  "worker must preserve svc_ai_finalize_result call",
);
requireText(
  worker,
  "handleFileReadyGenerateContent",
  "worker must preserve handleFileReadyGenerateContent",
);
requireText(
  worker,
  "buildGenerateContentRequest",
  "worker must preserve buildGenerateContentRequest",
);

// 6. migration creates private.ai_worker_runtime_config
requireText(
  migration,
  "create table if not exists private.ai_worker_runtime_config",
  "migration must create private.ai_worker_runtime_config table",
);
requireText(
  migration,
  "singleton boolean primary key default true",
  "table must include singleton primary key",
);
requireText(
  migration,
  "edge_base_url text",
  "table must include edge_base_url",
);
requireText(
  migration,
  "cron_token uuid not null default gen_random_uuid()",
  "table must include cron_token uuid with gen_random_uuid()",
);
requireText(
  migration,
  "updated_at timestamptz not null default now()",
  "table must include updated_at timestamptz",
);

// 7. migration creates svc_configure_ai_worker_runtime
requireText(
  migration,
  "create or replace function public.svc_configure_ai_worker_runtime",
  "migration must create svc_configure_ai_worker_runtime",
);
requireText(
  migration,
  "grant execute on function\n  public.svc_configure_ai_worker_runtime(text)\n  to service_role;",
  "svc_configure_ai_worker_runtime execute must be granted to service_role",
);

// 8. migration creates svc_ai_worker_cron_token_valid
requireText(
  migration,
  "create or replace function public.svc_ai_worker_cron_token_valid",
  "migration must create svc_ai_worker_cron_token_valid",
);
requireText(
  migration,
  "grant execute on function\n  public.svc_ai_worker_cron_token_valid(text)\n  to service_role;",
  "svc_ai_worker_cron_token_valid execute must be granted to service_role",
);

// 9. migration creates private.ai_worker_cron_tick
requireText(
  migration,
  "create or replace function private.ai_worker_cron_tick()",
  "migration must create private.ai_worker_cron_tick",
);
requireText(
  migration,
  "revoke execute on function\n  private.ai_worker_cron_tick()\n  from public, anon, authenticated, service_role;",
  "private.ai_worker_cron_tick execute must be revoked from all roles",
);

// 10. migration calls svc_ai_provider_has_due_work
requireText(
  migration,
  "public.svc_ai_provider_has_due_work()",
  "migration must call public.svc_ai_provider_has_due_work()",
);

// 11. migration uses net.http_post
requireText(
  migration,
  "net.http_post",
  "migration must use net.http_post",
);
requireText(
  migration,
  "/functions/v1/ai-worker",
  "watchdog tick must target /functions/v1/ai-worker",
);
requireText(
  migration,
  "x-auratio-ai-cron-token",
  "watchdog tick must send x-auratio-ai-cron-token header",
);

// 12. migration schedules auratio-ai-worker-watchdog every minute
requireText(
  migration,
  "'auratio-ai-worker-watchdog'",
  "cron job must be named auratio-ai-worker-watchdog",
);
requireText(
  migration,
  "'* * * * *'",
  "cron schedule must run every minute",
);
requireText(
  migration,
  "'select private.ai_worker_cron_tick();'",
  "cron command must execute private.ai_worker_cron_tick()",
);

// 13. migration contains NO hardcoded TEST project ref
forbidText(
  migration,
  "dboyrlgzifpffnsznvde",
  "migration must not contain TEST project ref",
);

// 14. migration contains NO hardcoded production project ref
forbidText(
  migration,
  "czkbljnzcfsztfrwndsb",
  "migration must not contain production project ref",
);

// 15. migration contains NO API/service secret
forbidText(
  migration,
  "sb_secret_",
  "migration must not contain service secrets",
);
forbidText(
  migration,
  "service_role_key",
  "migration must not contain service_role_key literal secrets",
);

console.log("Step VII-D6 AI worker watchdog verification PASS");
