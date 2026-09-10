import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function requireText(text, needle, label) {
  if (!text.includes(needle)) {
    throw new Error(`VII-D4 verification failed: ${label}`);
  }
}

function forbidText(text, needle, label) {
  if (text.includes(needle)) {
    throw new Error(`VII-D4 verification failed: ${label}`);
  }
}

const provider = read(
  "supabase/functions/ai-worker/provider.ts",
);

const migration = read(
  "supabase/migrations/20260910101000_step_vii_d4_gemini_36_runtime.sql",
);

requireText(
  provider,
  'export const GEMINI_MODEL = "gemini-3.6-flash";',
  "active worker model must be Gemini 3.6 Flash",
);

forbidText(
  provider,
  'export const GEMINI_MODEL = "gemini-3.8-flash";',
  "active worker must no longer select Gemini 3.8 Flash",
);

requireText(
  migration,
  "set default 'gemini-3.6-flash'",
  "new provider jobs must default to Gemini 3.6 Flash",
);

requireText(
  migration,
  "'gemini-3.6-flash'",
  "provider-job trigger must persist Gemini 3.6 Flash",
);

requireText(
  migration,
  "create or replace function private.create_ai_provider_job_for_attempt()",
  "provider-job trigger function must be updated",
);

console.log(
  "Step VII-D4 Gemini 3.6 runtime verification PASS",
);
