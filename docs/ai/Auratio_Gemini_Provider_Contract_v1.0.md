# Auratio Gemini Provider Contract v1.0

**Status:** Authoritative provider adapter contract for Step VII-D  
**Verified:** 2026-09-08  
**Provider:** Google Gemini API  
**Model:** `gemini-3.8-flash`

## 1. Purpose

This file pins the provider-specific transport/orchestration contract used by Auratio without changing Auratio's scoring semantics.

If this file conflicts with the provider-agnostic scoring/validation rules in `Auratio_AI_Evaluation_Specification_v1.1.md`, the scoring/validation rules win. If Google changes the API, update this provider contract before changing implementation.

### VII-D2 live provider correction — 2026-09-09

Live testing in the isolated Auratio Supabase test project established two provider-side failures in the Interactions API video path:

1. background Agentic Video created from a Gemini Files API URI later failed retrieval with an internal `Unsupported file uri: blobstore:///...` error;
2. background video created from a Supabase signed HTTPS URL also later failed retrieval (`invalid_request` / permission errors), even though the URL itself was independently retrievable.

A controlled call using the same project/key, the same Auratio video, Gemini Files API upload, and the Generate Content API with `media_processing: "AGENTIC"` reached the model normally; the observed non-success response was the model's standard transient `503 UNAVAILABLE / high demand`, not a permission or request-shape error.

Therefore Auratio VII-D2 MUST use Gemini Files API for temporary video upload plus the Generate Content API for the single model evaluation call. The Interactions API is no longer used for new video evaluations. This is a provider transport/orchestration correction only; the model, Medium Thinking, Agentic Video mode, rubric, structured-output contract, no-retry semantics, backend validation, and cleanup rules remain unchanged.


## 2. Verified provider capabilities

Current official Google documentation confirms:

- `gemini-3.8-flash` is a stable GA model;
- Thinking is supported at `low`, `medium`, and `high`; default is `medium`;
- Auratio pins `thinking_level: "medium"` for the MVP because Google currently recommends Medium as the balanced setting for complex/agentic use cases;
- `thinking_summaries: "none"` is used so Auratio does not request or persist reasoning summaries;
- inputs include text, image, video, audio and PDF;
- output is text;
- structured outputs are supported;
- Agentic Video Understanding is supported by Gemini 3.8 Flash;
- Interactions API accepts `processing: "agentic"` on video input;
- background Interactions are supported and return an Interaction ID for later retrieval;
- background Interactions can be cancelled;
- stored Interactions can be deleted;
- Files API supports upload, metadata retrieval and deletion;
- uploaded Files API objects automatically expire after 48 hours;
- Files API maximum file size is 2 GB;
- Interactions structured output accepts a JSON schema through `response_format`.
- External public HTTPS and pre-signed HTTPS URLs are supported as file inputs across Gemini API endpoints including Interactions; the current external-URL payload limit is 100 MB.

## 3. API surface pinned for VII-D

Use REST from Supabase Edge Functions.

Base host:

`https://generativelanguage.googleapis.com`

Authenticate with:

`x-goog-api-key: <GEMINI_API_KEY>`

### Video source transport

For new Auratio AI evaluations:

- download the private Supabase `evaluation-videos` object server-side;
- upload it to Gemini Files API using resumable upload;
- poll the same provider file until `ACTIVE`;
- pass the Gemini Files API URI to `models/gemini-3.8-flash:generateContent`;
- set the video part's `media_processing` to `AGENTIC`;
- delete the Gemini file during Auratio cleanup;
- never expose the Gemini API key or provider file URI to mobile/web clients.

The original Supabase video remains governed by Auratio's existing terminal video-deletion lifecycle.

### Generate Content evaluation

- Endpoint: `POST /v1beta/models/gemini-3.8-flash:generateContent`.
- Authentication: `x-goog-api-key: <GEMINI_API_KEY>`.
- The provider call is one-shot and fail-closed: Auratio MUST NOT automatically issue a second model evaluation call after a call has begun.
- The existing durable provider state `interaction_creating` is retained temporarily as the fail-closed one-shot provider-call guard; it does **not** mean the new runtime creates an Interactions API resource.
- A normal provider capacity response such as `503 UNAVAILABLE / high demand` is recorded as an API failure, not silently retried.

## 4. One Generate Content request shape

The request must use:

- model endpoint `gemini-3.8-flash`;
- `system_instruction` from Auratio's locked prompt;
- one user content item containing:
  - one `file_data` video part with the Gemini Files API URI and `mime_type: "video/mp4"`;
  - `media_processing: "AGENTIC"` on that video part;
  - one text part containing runtime identity, measured duration, selected Track and the exact 16-criterion rubric/anchors;
- `generationConfig.thinkingConfig.thinkingLevel: "medium"`;
- `generationConfig.thinkingConfig.includeThoughts: false`;
- `generationConfig.maxOutputTokens: 32768`;
- `generationConfig.responseFormat.text.mimeType: "APPLICATION_JSON"` for raw REST; this enum value represents JSON output. Live provider verification on 2026-09-09 showed that raw `generateContent` rejects the literal `"application/json"` at this field with `INVALID_ARGUMENT`, while `"APPLICATION_JSON"` succeeds with the same schema, model, Thinking configuration and Agentic Video input;
- the provider-compatible transport schema under `generationConfig.responseFormat.text.schema`.

No tools for external search, URL context, browsing or fact checking are enabled.

Do not send speaker identity/history or unrelated Track rubrics.

## 5. Provider result handling

Generate Content returns one terminal HTTP response to the worker.

Auratio behavior:

- HTTP 2xx with valid structured output: validate and finalize through `svc_ai_finalize_result` exactly once;
- HTTP 503 / `UNAVAILABLE`: fail the AI attempt as provider high demand; do not automatically issue a second model call;
- other provider 4xx/5xx: fail the AI attempt as provider/API failure;
- transport uncertainty after the provider call begins: fail closed and do not automatically retry;
- invalid/missing JSON: fail as invalid provider output;
- late output after Admin cancellation or explicit AI-to-Human redirect: discard and preserve the authoritative Auratio state.

The Files API metadata polling that occurs **before** model evaluation is not an evaluation retry.

## 6. Cancellation and redirect precedence

## 6. Cancellation and redirect precedence

Before every provider poll/finalize operation, the worker must re-read authoritative Auratio attempt/request state.

If Admin cancellation or explicit End-User AI-to-Human redirect has already made the Auratio AI attempt non-active:

- do not finalize provider output;
- attempt provider Interaction cancellation if still running;
- delete provider Interaction record when safe;
- delete provider file;
- mark provider orchestration cleanup without changing the authoritative Auratio terminal/redirect state.

## 7. Structured-output transport schema

Gemini supports only a subset of JSON Schema.

Auratio's full `evaluation-output-schema-v1.json` is the authoritative backend semantic schema and includes validation keywords that are not in Gemini's documented supported subset.

The provider request must therefore use a derived transport schema built only from supported features used by Auratio, including:

- `type`;
- `title` / `description` where useful;
- `properties`;
- `required`;
- `additionalProperties`;
- `enum`;
- `items`;
- `minItems` / `maxItems`;
- `minimum` / `maximum`;
- nullable type arrays;
- `anyOf` only where useful and provider-compatible.

Do not send unsupported authoritative validators such as:

- `const`;
- `pattern`;
- `minLength`;
- `allOf`;
- `if`;
- `then`.

Where necessary:

- replace `const: "1.0"` with `enum: ["1.0"]`;
- leave regex/string-length and branch consistency to the existing server validator;
- keep exact 16-criterion and anchor/score semantics in backend validation even if the transport schema cannot express all of them.

Provider structured output improves syntactic shape; it does not replace `svc_ai_finalize_result`.

## 8. Edge-runtime orchestration

Do not wait synchronously for the whole evaluation inside one Edge Function request.

Current Supabase hosted limits include:

- 150-second wall clock on Free;
- 400-second wall clock on paid plans;
- 150-second request idle timeout.

The provider Interaction must therefore be backgrounded and later polled by an idempotent worker.

Use a persisted private provider job/run record and a scheduled invocation mechanism (Supabase `pg_cron` + `pg_net` is an accepted platform pattern).

A worker invocation should do bounded work and exit. Repeated polling is allowed. Repeated model creation is not.

## 9. Cleanup

Primary Auratio cleanup policy after terminal/abandoned provider work:

1. delete/cancel the stored Gemini Interaction when possible;
2. persist cleanup success;
3. permit cleanup retry if provider cleanup temporarily fails;
4. allow the ephemeral Supabase signed source URL to expire naturally.

New signed-URL jobs create no Gemini Files API object. The original Supabase video remains governed by Auratio's existing terminal video-deletion lifecycle.

No cleanup retry may invoke a new model Interaction.

## 10. Gemini billing/privacy gate

Current Google pricing documentation states:

- Gemini Free Tier content may be used to improve Google products;
- Gemini Paid Tier content is not used to improve Google products.

Therefore:

- use synthetic/non-personal fixtures for any Free Tier development test;
- use a Paid Tier Gemini project before sending real Auratio participant videos unless the user explicitly accepts different provider-data-use terms.

This is a deployment/privacy gate, not a reason to expose credentials or copy videos elsewhere.

## 11. Secret name

Use:

`GEMINI_API_KEY`

Store only as a Supabase Edge Function secret/environment secret.

Never commit it.

## 12. Implementation compatibility requirements

The provider adapter must compose with existing accepted Auratio services:

- `svc_ai_start_attempt`;
- `svc_ai_finalize_result`;
- `svc_ai_fail_attempt`;
- `svc_ai_admin_cancel`;
- VII-C explicit AI-to-Human consent redirection;
- terminal video deletion queue.

Do not duplicate scoring/lifecycle logic in TypeScript.

## 13. Reverification trigger

Recheck official Google and Supabase docs before implementation if:

- the model identifier stops being stable/GA;
- Interactions request or revision contract changes;
- agentic video support changes;
- structured-output schema support changes;
- Google confirms the background Agentic Video + Gemini Files API retrieval defect is fixed and Auratio considers returning to provider-file transport;
- Files API lifecycle changes;
- Supabase Edge runtime/scheduling limits materially change.
