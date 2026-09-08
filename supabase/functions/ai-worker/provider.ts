export const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com";
export const GEMINI_API_REVISION = "2026-05-20";
export const GEMINI_MODEL = "gemini-3.8-flash";

export const SYSTEM_PROMPT = `# Auratio AI Evaluator — System Prompt v1.0

You are the runtime AI evaluator for Auratio — “Where Greats Orate”. Gemini is the configured runtime evaluator; Auratio’s prompt/rubric contract is versioned independently of the exact model identifier.

Evaluate one submitted English-language speaking video against the runtime rubric supplied for that submission.

## Non-negotiable rules

1. Evaluate the original submitted video directly using both audible and visible performance cues.
2. Do not generate, request, or depend on a full transcript.
3. The supplied user-selected track is authoritative. Never reclassify or substitute another track.
4. Evaluate exactly 16 criteria: 8 Universal Delivery + 4 Structural Flow + the selected track’s 4 criteria.
5. Use only the criterion definitions and Low / Competent / Excellent anchor descriptions supplied at runtime.
6. Use anchor-first scoring: select the anchor, then an integer score compatible with that anchor.
7. Mandatory score bands: 5-point criteria — Low 0–2, Competent 3–4, Excellent 5. 10-point criteria — Low 0–4, Competent 5–8, Excellent 9–10.
8. Every usable criterion result must include exactly one anchor, one integer score, one primary timestamp in mm:ss, evidence tied to that moment, exactly one strength, exactly one weakness, and exactly one actionable improvement.
9. The primary timestamp must fall within the supplied measured video duration. Additional timestamps may appear only inside evidence text when useful.
10. Evaluate observable, rubric-relevant performance only. Do not invent intent, preparation method, audience reaction, hidden context, or personal facts.
11. Do not score based on gender, age, ethnicity, appearance, disability, accent, personality type, or other personal characteristics.
12. Accent itself is never a penalty. Only actual intelligibility, articulation, or clarity problems may affect a relevant criterion.
13. Do not reward or penalize unrelated production quality such as lighting, camera quality, room background, or editing style unless it directly affects assessability or a scored criterion.
14. Recording-quality issues may be mentioned only when they materially affect a criterion or evaluation reliability.
15. Do not perform external fact-checking or browse for evidence. Obvious internal contradictions may affect only the relevant rubric criterion.
16. For criteria involving factual accuracy, evidence, citations, or methodology, judge only what is observable or stated in the video and visible presentation material. Do not independently verify claims.
17. The AI overall summary must synthesize the 16 criterion-level findings and introduce no unsupported claim.
18. Output must be in English.
19. Return JSON only, matching the supplied schema exactly. No Markdown, code fences, headings, or prose outside the JSON object.
20. Before returning, internally verify complete criterion coverage, unique criterion IDs, anchor-score compatibility, integer scores, in-range timestamps, non-empty feedback fields, and summary consistency.

## Unassessable video rule

If reliable rubric-based evaluation is impossible because the audio/visual content is corrupted, unusable, insufficient, or otherwise prevents meaningful assessment, do not invent scores. Return evaluation_usable=false, a concise unusable_reason, criteria=[], and overall_summary=null.

Weak performance is not unassessable; assess and score it when the video is usable.

## Privacy/minimum-context rule

You must not be given and must not infer the speaker’s name, email, prior Auratio scores, leaderboard position, mastery state, past evaluation history, or prior evaluator feedback. Judge this submission independently.
`;

export type RuntimeCriterion = {
  criterion_id: string;
  name: string;
  category: "universal_delivery" | "structural_flow" | "track_specialisation";
  max_points: number;
  anchors: Array<{
    anchor: "Low" | "Competent" | "Excellent";
    description: string;
    min_score: number;
    max_score: number;
  }>;
};

export type RuntimeContext = {
  request_id: string;
  evaluation_version_id: string;
  attempt_id: string;
  submission_id: string;
  track_slug: string;
  duration_seconds: number;
  duration_mm_ss: string;
  video_bucket: string;
  video_object_path: string;
  video_mime_type: string;
  video_size_bytes: number | null;
  prompt_version: string;
  rubric_version: string;
  schema_version: string;
  model_identifier: string;
  criteria: RuntimeCriterion[];
};

export type ProviderJob = {
  attempt_id: string;
  request_id: string;
  evaluation_version_id: string;
  provider: string;
  model_identifier: string;
  state: string;
  provider_file_name: string | null;
  provider_file_uri: string | null;
  interaction_id: string | null;
  interaction_creation_started_at: string | null;
  interaction_creation_uncertain_at: string | null;
  provider_status: string | null;
  poll_count: number;
  next_action_at: string;
  claim_token: string;
  claimed_at: string;
  cleanup_attempt_count: number;
  provider_file_deleted_at: string | null;
  interaction_deleted_at: string | null;
  request_requested_mode: string;
  request_mode: string;
  request_status: string;
  attempt_status: string;
};

const TRACK_SLUGS = [
  "informative",
  "extempore",
  "persuasive",
  "argumentative-debate",
  "explanatory",
  "news-delivery",
  "business-pitch",
  "general-presentation-multimedia",
  "academic-poster-project-thesis",
  "corporate-report",
  "infotainment-oriented",
  "academic-lecture-course",
  "marketing-promotional",
] as const;

export function buildTransportSchema(context: RuntimeContext): Record<string, unknown> {
  const criterionIds = context.criteria.map((criterion) => criterion.criterion_id);
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      schema_version: { type: "string", enum: [context.schema_version] },
      submission_id: { type: "string" },
      track_slug: { type: "string", enum: [context.track_slug] },
      evaluation_usable: { type: "boolean" },
      unusable_reason: { type: ["string", "null"] },
      criteria: {
        type: "array",
        minItems: 0,
        maxItems: 16,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            criterion_id: { type: "string", enum: criterionIds },
            anchor: { type: "string", enum: ["Low", "Competent", "Excellent"] },
            score: { type: "integer", minimum: 0, maximum: 10 },
            primary_timestamp: { type: "string" },
            evidence: { type: "string" },
            strength: { type: "string" },
            weakness: { type: "string" },
            actionable_improvement: { type: "string" },
          },
          required: [
            "criterion_id",
            "anchor",
            "score",
            "primary_timestamp",
            "evidence",
            "strength",
            "weakness",
            "actionable_improvement",
          ],
        },
      },
      overall_summary: { type: ["string", "null"] },
    },
    required: [
      "schema_version",
      "submission_id",
      "track_slug",
      "evaluation_usable",
      "unusable_reason",
      "criteria",
      "overall_summary",
    ],
  };
}

export function buildRuntimeInstruction(context: RuntimeContext): string {
  if (!TRACK_SLUGS.includes(context.track_slug as (typeof TRACK_SLUGS)[number])) {
    throw new Error("unsupported_track_slug");
  }
  if (context.criteria.length !== 16) throw new Error("runtime_criteria_count_invalid");

  return JSON.stringify(
    {
      runtime_identity: {
        submission_id: context.submission_id,
        track_slug: context.track_slug,
        measured_video_duration_seconds: context.duration_seconds,
        measured_video_duration_mm_ss: context.duration_mm_ss,
        prompt_version: context.prompt_version,
        rubric_version: context.rubric_version,
        schema_version: context.schema_version,
      },
      scoring_contract: {
        exact_criterion_count: 16,
        universal_delivery: "8 criteria × 5 points = 40",
        structural_flow: "4 criteria × 5 points = 20",
        track_specialisation: "4 criteria × 10 points = 40",
        final_score_authority: "Auratio backend calculates totals; do not add total-score fields.",
      },
      selected_track_runtime_rubric: context.criteria,
      output_branch_rules: {
        usable:
          "evaluation_usable=true; unusable_reason=null; exactly 16 unique expected criterion results; overall_summary non-empty.",
        unassessable:
          "evaluation_usable=false; unusable_reason non-empty; criteria=[]; overall_summary=null.",
      },
      instruction:
        "Evaluate only this video and this selected-track rubric. Return only the structured JSON result.",
    },
    null,
    2,
  );
}

export function buildInteractionRequest(context: RuntimeContext, videoUri: string): Record<string, unknown> {
  return {
    model: GEMINI_MODEL,
    background: true,
    store: true,
    system_instruction: SYSTEM_PROMPT,
    input: [
      {
        type: "video",
        uri: videoUri,
        mime_type: "video/mp4",
        processing: "agentic",
      },
      {
        type: "text",
        text: buildRuntimeInstruction(context),
      },
    ],
    generation_config: {
      thinking_level: "medium",
      thinking_summaries: "none",
      max_output_tokens: 32768,
    },
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: buildTransportSchema(context),
    },
  };
}

export function normalizeFileState(value: unknown): "ACTIVE" | "PROCESSING" | "FAILED" | "UNKNOWN" {
  if (typeof value !== "string") return "UNKNOWN";
  const normalized = value.toUpperCase();
  if (normalized === "ACTIVE" || normalized === "PROCESSING" || normalized === "FAILED") {
    return normalized;
  }
  return "UNKNOWN";
}

export function normalizeInteractionStatus(value: unknown): string {
  return typeof value === "string" ? value.toLowerCase() : "unknown";
}

export function extractFinalStructuredText(interaction: Record<string, unknown>): string {
  const steps = Array.isArray(interaction.steps) ? interaction.steps : [];
  for (let stepIndex = steps.length - 1; stepIndex >= 0; stepIndex -= 1) {
    const step = steps[stepIndex];
    if (!step || typeof step !== "object") continue;
    const typed = step as Record<string, unknown>;
    if (typed.type !== "model_output") continue;
    const content = Array.isArray(typed.content) ? typed.content : [];
    const pieces = content
      .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
      .filter((item) => item.type === "text" && typeof item.text === "string")
      .map((item) => item.text as string);
    const text = pieces.join("").trim();
    if (text) return text;
  }
  throw new Error("gemini_completed_without_text_output");
}

export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function providerErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const error = record.error;
    if (error && typeof error === "object") {
      const message = (error as Record<string, unknown>).message;
      if (typeof message === "string" && message.trim()) return message.trim().slice(0, 500);
    }
  }
  return fallback;
}
