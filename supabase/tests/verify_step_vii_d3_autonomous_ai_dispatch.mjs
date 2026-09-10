import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function requireText(text, needle, label) {
  if (!text.includes(needle)) {
    throw new Error(`VII-D3 verification failed: ${label}`);
  }
}

const requestSource = read(
  "supabase/functions/evaluation-request/index.ts",
);
const workerSource = read(
  "supabase/functions/ai-worker/index.ts",
);
const migrationSource = read(
  "supabase/migrations/20260910072000_step_vii_d3_autonomous_ai_worker_wake.sql",
);

requireText(
  requestSource,
  'Deno.env.get("SUPABASE_SECRET_KEYS")',
  "evaluation-request must support modern Supabase secret keys",
);

requireText(
  requestSource,
  'if (mode === "ai")',
  "only AI request creation may trigger the AI worker",
);

requireText(
  requestSource,
  "/functions/v1/ai-worker",
  "evaluation-request must kick the AI worker",
);

requireText(
  requestSource,
  '"apikey": serviceKey',
  "AI worker kickoff must use server secret apikey auth",
);

requireText(
  requestSource,
  "EdgeRuntime.waitUntil",
  "AI kickoff must run as a background task",
);

requireText(
  workerSource,
  "svc_ai_provider_next_wake_seconds",
  "worker must consult durable next-wake state",
);

requireText(
  workerSource,
  "scheduleNextWorkerWake",
  "worker must schedule continuation",
);

requireText(
  workerSource,
  "EdgeRuntime.waitUntil",
  "worker continuation must run as a background task",
);

requireText(
  workerSource,
  "/functions/v1/ai-worker",
  "worker must self-invoke for unfinished durable work",
);

requireText(
  workerSource,
  '"apikey": serviceKey',
  "worker self-wake must use secret apikey auth",
);

requireText(
  migrationSource,
  "svc_ai_provider_next_wake_seconds",
  "next-wake RPC must exist",
);

requireText(
  migrationSource,
  "grant execute on function public.svc_ai_provider_next_wake_seconds()",
  "next-wake RPC must be granted explicitly",
);

requireText(
  migrationSource,
  "to service_role",
  "next-wake RPC must remain service-role only",
);

requireText(
  migrationSource,
  "from public, anon, authenticated",
  "client roles must not execute the next-wake RPC",
);

console.log(
  "Step VII-D3 autonomous AI dispatch verification PASS",
);
