# Auratio Gemini Provider Contract v1.0

**Status:** Authoritative provider adapter contract for Step VII-D  
**Verified:** 2026-09-08  
**Provider:** Google Gemini API  
**Model:** `gemini-3.8-flash`

## 1. Purpose

This file pins the provider-specific transport/orchestration contract used by Auratio without changing Auratio's scoring semantics.

If this file conflicts with the provider-agnostic scoring/validation rules in `Auratio_AI_Evaluation_Specification_v1.1.md`, the scoring/validation rules win. If Google changes the API, update this provider contract before changing implementation.

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

## 3. API surface pinned for VII-D

Use REST from Supabase Edge Functions.

Base host:

`https://generativelanguage.googleapis.com`

Authenticate with:

`x-goog-api-key: <GEMINI_API_KEY>`

### Provider file

- Start resumable upload: `POST /upload/v1beta/files`.
- Get provider file metadata: `GET /v1beta/{file_name}`.
- Delete provider file: `DELETE /v1beta/{file_name}`.

Use `video/mp4` and the server-known content length. Persist only the returned provider `name` and `uri` needed for orchestration, in private server-only state.

### Background Interaction

- Create: `POST /v1beta/interactions`.
- Retrieve: `GET /v1beta/interactions/{interaction_id}`.
- Cancel running background work: `POST /v1beta/interactions/{interaction_id}/cancel`.
- Delete stored Interaction: `DELETE /v1beta/interactions/{interaction_id}`.

For background execution, use the currently documented API revision header:

`Api-Revision: 2026-05-20`

## 4. One Interaction request shape

The request must use:

- `model: "gemini-3.8-flash"`;
- `background: true`;
- `generation_config.thinking_level: "medium"`;
- `generation_config.thinking_summaries: "none"`;
- system instruction from Auratio's locked prompt;
- input containing:
  - one video item with provider URI, `mime_type: "video/mp4"`, `processing: "agentic"`;
  - one text item containing runtime identity, measured duration, selected Track and the exact 16-criterion rubric/anchors;
- `response_format`:
  - `type: "text"`;
  - `mime_type: "application/json"`;
  - provider-compatible transport schema.

No tools for external search, URL context, browsing or fact checking are enabled.

Do not send speaker identity/history or unrelated Track rubrics.

## 5. Background status handling

Persist the Interaction ID before relying on later work.

The scheduled worker may retrieve the same Interaction until terminal.

Recognized provider statuses include:

- `queued`;
- `in_progress`;
- `completed`;
- `failed`;
- `cancelled`;
- `incomplete`;
- `budget_exceeded`;
- `requires_action`.

Auratio behavior:

- `queued`: leave Auratio attempt in flight; poll the same Interaction later.
- `in_progress`: leave Auratio attempt in flight; poll the same Interaction later.
- `completed`: parse final structured output and run the accepted Auratio finalize boundary exactly once.
- `failed`: fail the Auratio AI attempt as provider/API failure.
- `incomplete`: fail the attempt; do not create a retry Interaction.
- `budget_exceeded`: fail the attempt; do not create a retry Interaction.
- `requires_action`: fail the attempt; Auratio does not expose an interactive provider-tool loop.
- `cancelled`: if Auratio already cancelled/redirected, preserve Auratio state; otherwise treat as provider failure.
- unknown terminal/provider state: fail closed.

Retrieval of an existing Interaction is not an evaluation retry.

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

1. delete Gemini Files API object;
2. delete stored Gemini Interaction;
3. persist cleanup success;
4. permit cleanup retry if provider cleanup temporarily fails.

Google's automatic file expiry and Interaction retention are secondary safeguards.

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
- Files API lifecycle changes;
- Supabase Edge runtime/scheduling limits materially change.
