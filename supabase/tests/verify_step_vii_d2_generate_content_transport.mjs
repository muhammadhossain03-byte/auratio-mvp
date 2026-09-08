import fs from "node:fs";

function requireText(text, needle, label) {
  if (!text.includes(needle)) {
    throw new Error(`VII-D2 Generate Content verification failed: ${label}`);
  }
}
function forbidText(text, needle, label) {
  if (text.includes(needle)) {
    throw new Error(`VII-D2 Generate Content verification failed: ${label}`);
  }
}

const worker = fs.readFileSync("supabase/functions/ai-worker/index.ts", "utf8");
const provider = fs.readFileSync("supabase/functions/ai-worker/provider.ts", "utf8");
const contract = fs.readFileSync(
  "docs/ai/Auratio_Gemini_Provider_Contract_v1.0.md",
  "utf8",
);

requireText(worker, '"/upload/v1beta/files"', "Gemini Files API upload must be restored");
requireText(worker, "handleFileReadyGenerateContent", "file-ready Generate Content path must exist");
requireText(worker, "models/${GEMINI_MODEL}:generateContent", "Generate Content endpoint must be used");
requireText(worker, '"provider_high_demand"', "503 high-demand outcome must be explicit");
requireText(worker, "svc_ai_provider_begin_interaction", "fail-closed one-shot guard must remain");
requireText(provider, "buildGenerateContentRequest", "Generate Content adapter must exist");
requireText(provider, 'media_processing: "AGENTIC"', "Agentic Video must remain locked");
requireText(provider, 'thinkingLevel: "medium"', "Medium Thinking must remain locked");
requireText(provider, "includeThoughts: false", "thought summaries must remain disabled");
requireText(provider, 'mimeType: "application/json"', "structured JSON output must remain locked");
requireText(contract, "Generate Content API", "provider contract must pin Generate Content");
requireText(contract, "MUST NOT automatically issue a second model evaluation call", "no-retry rule must remain");
forbidText(contract, "MUST use an external pre-signed HTTPS URL", "superseded signed-URL mandate must be removed");

console.log("Step VII-D2 Files API + Generate Content transport verification PASS");
