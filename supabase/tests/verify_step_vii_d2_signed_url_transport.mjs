import fs from "node:fs";

function requireText(text, needle, label) {
  if (!text.includes(needle)) throw new Error(`VII-D2 signed URL verification failed: ${label}`);
}
function forbidText(text, needle, label) {
  if (text.includes(needle)) throw new Error(`VII-D2 signed URL verification failed: ${label}`);
}

const worker = fs.readFileSync("supabase/functions/ai-worker/index.ts", "utf8");
const provider = fs.readFileSync("supabase/functions/ai-worker/provider.ts", "utf8");
const migration = fs.readFileSync(
  "supabase/migrations/20260909023500_step_vii_d2_signed_url_transport.sql",
  "utf8",
);

requireText(worker, "SIGNED_SOURCE_TTL_SECONDS = 2 * 60 * 60", "signed URL TTL must be pinned");
requireText(worker, "EXTERNAL_URL_MAX_BYTES = 100_000_000", "external URL input limit must be enforced");
requireText(worker, ".createSignedUrl(context.video_object_path, SIGNED_SOURCE_TTL_SECONDS)", "source must use Supabase signed URL");
requireText(worker, "buildInteractionRequest(context, sourceUrl)", "Interaction must receive ephemeral signed URL");
requireText(worker, '"legacy_gemini_file_transport_unsupported"', "legacy File API jobs must fail closed");
forbidText(worker, '"/upload/v1beta/files"', "worker must not upload new Gemini Files API objects");
forbidText(worker, "uploadSourceToGemini(", "legacy Gemini upload function must be absent");
forbidText(worker, "getGeminiFile(", "legacy Gemini file poll function must be absent");
requireText(provider, "buildInteractionRequest(context: RuntimeContext, videoUri: string)", "provider request must be transport-neutral");
requireText(provider, 'processing: "agentic"', "Agentic Video must remain enabled");
requireText(provider, 'thinking_level: "medium"', "Medium Thinking must remain pinned");
requireText(provider, 'GEMINI_MODEL = "gemini-3.8-flash"', "Gemini 3.8 Flash must remain pinned");
requireText(migration, "v_job.state not in ('initializing','file_ready')", "DB transition must accept initializing jobs");
requireText(migration, "Gemini Interaction already exists; retry is forbidden", "single-Interaction invariant must remain");

console.log("Step VII-D2 signed HTTPS URL video transport verification PASS");
