# Auratio AI Evaluation Specification v1.1

**Status:** Authoritative for AI implementation  
**Date:** 2026-09-08  
**Supersedes:** `Auratio_AI_Evaluation_Specification_v1.0.md` where they conflict  
**Product:** Auratio — Where Greats Orate

## 1. Architecture

Auratio uses **one shared Gemini evaluator framework**, not 13 independent prompts. Each request contains the stable system prompt, runtime metadata, original video, 8 Universal Delivery criteria, 4 Structural Flow criteria, the selected Track's 4 criteria, their anchors, and the output contract. The other 12 Track rubrics are not sent.

The verified runtime provider/model for Step VII-D is:

- Provider: Google Gemini API.
- Model identifier: `gemini-3.8-flash`.
- API: Gemini Interactions API.
- Thinking: explicitly enabled with `generation_config.thinking_level: "medium"`.
- Thinking summaries: disabled with `generation_config.thinking_summaries: "none"`; Auratio does not request or persist reasoning summaries.
- Video mode: Agentic Video Understanding, `processing: "agentic"`.
- Media transport: Gemini Files API for a temporary copy of the original submitted MP4.
- Interaction execution: one background Interaction, then retrieval of that same Interaction until terminal.
- Credential: one `GEMINI_API_KEY`, server-side Supabase secret only.

This provider contract was rechecked against current official Google Gemini documentation on 2026-09-08. Provider details are further locked in `Auratio_Gemini_Provider_Contract_v1.0.md`.

The provider/model is implementation configuration. Auratio's scoring, validation, privacy, one-attempt and publication semantics remain independent of provider changes.

## 2. Scoring

Exactly 16 criteria produce a score /100:

- Universal Delivery: 8 × 5 = 40.
- Structural Flow: 4 × 5 = 20.
- Track Specialisation: 4 × 10 = 40.

Anchor-first score bands are mandatory for both AI and Human evaluation:

- 5-point: Low 0–2; Competent 3–4; Excellent 5.
- 10-point: Low 0–4; Competent 5–8; Excellent 9–10.

The backend calculates all category subtotals and the final /100. Gemini is never the arithmetic authority.

## 3. Criterion output

For each of the 16 usable criteria return:

- `criterion_id`;
- `anchor`;
- integer `score`;
- one `primary_timestamp` in `mm:ss`;
- `evidence`;
- exactly one `strength`;
- exactly one `weakness`;
- exactly one `actionable_improvement`.

The primary timestamp must be within the server-measured duration. Evidence must be tied to what is observable at or around that moment. Additional timestamps may appear in evidence text.

## 4. Overall Summary

Gemini generates the AI Overall Summary. It must synthesize the criterion findings and add no unsupported claim. In Human Evaluation the Volunteer writes the Overall Summary manually.

## 5. Video, language, transcript and fact checking

- Evaluate the original submitted video directly using audio and visuals.
- Use Agentic Video Understanding for the Gemini provider call; do not silently downgrade to default static video processing.
- English-only MVP evaluation.
- No full transcript is generated or stored by Auratio for this workflow.
- No external fact-checking or browsing.
- Internal contradictions may affect relevant criteria.
- Production quality is ignored unless it affects assessability or a criterion.
- Accent itself is never penalized.

Gemini may internally inspect audio/transcript segments as part of provider-side agentic video processing. Auratio does not request, persist, expose or treat a full transcript as a product artifact.

## 6. Identity and context isolation

Do not send Gemini:

- speaker name;
- email;
- prior submissions or scores;
- mastery;
- leaderboard state;
- prior evaluator feedback;
- Volunteer/Admin identities;
- moderation notes;
- unrelated Track rubrics.

Do not score personal characteristics.

Gemini receives only the minimum context required for the current submission: original video, runtime request identifiers required by the output contract, measured duration, selected Track, exact 16-criterion rubric/anchors, prompt version and output contract.

## 7. One-attempt rule

Exactly **one Gemini model interaction per AI submission attempt**.

No:

- automatic model retry;
- Admin rerun;
- fallback model;
- hidden second-model validation;
- silent static-video re-evaluation.

Polling/retrieving the same background Interaction is not a retry and does not create another attempt.

A user may create a new submission after a terminal Rejected/Cancelled outcome under the MVP duplicate policy.

## 8. Asynchronous orchestration

Supabase Edge Functions have finite wall-clock/request limits. VII-D must not depend on a single Edge invocation remaining alive while the provider processes the complete video.

The accepted orchestration pattern is:

1. claim/start the existing Auratio AI attempt exactly once through `svc_ai_start_attempt`;
2. obtain the private original video server-side;
3. upload a temporary provider file through Gemini Files API;
4. wait/poll only until that file is provider-usable;
5. create exactly one Gemini background Interaction with the agentic video input;
6. persist the provider file identity and Interaction ID in a private provider-orchestration record;
7. return from the initiating worker;
8. an idempotent scheduled worker retrieves the **same** Interaction on later invocations;
9. terminal provider output is parsed and passed once to the existing Auratio finalize/fail boundary;
10. clean up the provider file and stored Interaction record.

A scheduled worker may poll repeatedly, but it must never create a second Gemini Interaction for the same Auratio attempt.

If the Auratio request is cancelled or explicitly redirected to Human while the provider Interaction is running, the worker must not publish the late AI result. It should cancel the background provider Interaction when still possible, clean provider artifacts, and preserve the already-authoritative Auratio request state.

## 9. Output schema: authoritative contract vs provider transport schema

`evaluation-output-schema-v1.json` remains the **authoritative Auratio semantic output contract**.

Current Gemini structured-output mode supports only a subset of JSON Schema. The authoritative Auratio schema contains keywords that are not part of Gemini's currently documented supported subset, including conditional/validation keywords such as `const`, `pattern`, `minLength`, `allOf`, `if`, and `then`.

Therefore VII-D must **not** send the authoritative schema verbatim as Gemini `response_format.schema`.

Instead, server code must derive or define a provider-compatible **transport schema** that:

- preserves the same top-level fields and criterion item shape;
- requires all top-level fields;
- requires all criterion fields;
- uses the Gemini-supported structured-output subset;
- uses `enum: ["1.0"]` rather than `const` for schema version;
- constrains known Track IDs and anchors with `enum`;
- constrains numeric score range and criterion count where supported;
- does not weaken the authoritative server-side validation boundary.

The provider transport schema is only a generation aid. The existing Auratio backend remains authoritative for:

- exact usable/unusable branch semantics;
- exact schema version;
- submission ID format and match;
- Track match;
- exact expected 16 unique criterion IDs;
- criterion maximum;
- anchor-score compatibility;
- timestamp syntax and duration;
- required non-empty feedback strings;
- unexpected fields;
- final arithmetic and publication effects.

Provider-schema compliance alone is never sufficient for acceptance.

## 10. Provider response handling

The Gemini Interactions API response uses structured text output with JSON MIME type. Auratio must:

- read only the final structured output text from the terminal Interaction;
- parse it once as JSON;
- compute a SHA-256 digest of the raw structured model output for provenance;
- pass the parsed result to the accepted `svc_ai_finalize_result` boundary;
- use `svc_ai_fail_attempt` for provider/API/invalid/unassessable failures according to the existing Step VI-C semantics;
- never write model-provided totals directly.

A valid usable AI result auto-approves through the accepted backend boundary. An unassessable result, malformed/invalid result, or API failure becomes Rejected with no score/product/report effect.

Admin cancellation while Processing wins over a late result.

## 11. Provider artifact lifecycle and privacy

Gemini Files API objects are temporary. Auratio must explicitly delete the provider file after the attempt reaches a terminal/abandoned state; Google's automatic 48-hour expiry is only secondary cleanup.

Background Interactions require provider-side storage so that they can be retrieved. Auratio must delete the stored Gemini Interaction after terminal processing/cleanup. Provider automatic retention is secondary cleanup, not Auratio's primary policy.

Provider cleanup retries are allowed because they do not create or rerun an AI evaluation attempt.

For real participant video, the deployment configuration should use a Gemini **Paid Tier** project because Google's current pricing/data-use documentation states Paid Tier content is not used to improve Google products, while Free Tier content may be. Synthetic/non-personal development fixtures may be used for Free Tier testing if needed.

## 12. Provenance

Persist internally at minimum:

- Auratio request ID;
- evaluation version ID;
- attempt ID;
- prompt version;
- rubric version;
- output schema version;
- exact Gemini model identifier;
- provider file name/URI as private transient orchestration data;
- provider Interaction ID as private transient orchestration data;
- attempt start/finish timestamps;
- validation outcome;
- failure code/reason;
- structured output SHA-256 digest;
- provider cleanup status/timestamps.

Do not expose provider IDs, internal reasons, prompt internals or AI provenance to End Users or Volunteers.

## 13. Secret handling

Gemini API credentials are server-side secrets only.

Never expose the key in:

- Flutter;
- React/Vite;
- Vercel client bundles;
- repository plaintext;
- screenshots;
- logs;
- audit metadata;
- model request bodies;
- reports;
- user-visible payloads.

Use one `GEMINI_API_KEY` for the MVP unless an explicitly accepted later decision changes this.

## 14. Acceptance tests

AI integration is incomplete until tests cover:

- all 13 Tracks;
- 8 + 4 + 4 assembly;
- no unrelated Track leakage;
- no speaker identity/history leakage;
- all anchor-score bands;
- invalid/missing/duplicate criteria;
- invalid timestamps;
- malformed JSON;
- usable and unassessable branches;
- provider API failure;
- provider file failure;
- background Interaction failure/incomplete/cancelled states;
- exactly one Interaction creation per Auratio attempt;
- no automatic retry;
- late-result cancellation discard;
- AI-to-Human consent redirect while provider work is in flight;
- auto-approval of valid output;
- provider file deletion;
- provider Interaction deletion;
- cleanup retry without evaluation retry;
- no silent static-video fallback;
- provider transport schema compatibility plus authoritative backend semantic validation;
- request construction pins `thinking_level: "medium"` and `thinking_summaries: "none"` together with agentic video processing.

## 15. Provider verification freshness

The following provider facts were rechecked on 2026-09-08 before VII-D implementation:

- `gemini-3.8-flash` is stable GA and supports video input, structured outputs and Thinking at low/medium/high;
- Auratio explicitly pins Thinking to `medium` and disables thinking summaries;
- Gemini 3.8 Flash supports Agentic Video Understanding with `processing: "agentic"`;
- Interactions API is the recommended API primitive and supports background execution/retrieval/cancel/delete;
- Files API supports upload/get/delete and 48-hour automatic file expiry;
- Interactions structured output uses `response_format` with JSON MIME type and a supported JSON-Schema subset;
- Gemini structured output must still be validated by the application;
- Supabase hosted Edge Functions have hard wall-clock/request limits, so background provider execution plus persisted polling is required for robust video orchestration.

Recheck provider documentation again if VII-D implementation is delayed materially or if Google changes the current model/API contract.
