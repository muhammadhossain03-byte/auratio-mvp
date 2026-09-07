# Auratio Step VI-C Implementation Record v1.0

**Date:** 2026-09-07
**Status:** Supabase implementation complete; repository commit pending ChatGPT audit

## Accepted starting checkpoint

- Repository: `muhammadhossain03-byte/auratio-mvp`
- Branch: `step-vi/backend-orchestration`
- Accepted Step VI-B HEAD: `e9b72af69cce980c15b670beab2440fc2bba2a1e`
- Production Supabase project: `Auratio` (`czkbljnzcfsztfrwndsb`)

## Authoritative AI contract used

VI-C implements the server-side lifecycle/finalisation boundary from:

- `docs/ai/Auratio_AI_Evaluation_Specification_v1.0.md`
- `docs/ai/system-prompt-v1.md`
- `docs/ai/prompt-assembly-v1.md`
- `docs/ai/evaluation-output-schema-v1.json`
- the canonical database rubric/anchor registry accepted in Step V

Live Gemini direct-video invocation remains deferred to Step VII exactly as required by the Step VI handoff.

## Applied production migration

- `20260907113609_step_vi_c_ai_lifecycle_and_validation_boundary.sql`

Production migration source SHA-256:

`8a3d0655d4522d9825af74af9966e170d5cf23d42562ef2a6966d3008575988a`

The repository migration in this package is byte-for-byte identical to the migration statement stored by production Supabase.

## Deployed Edge Function

`ai-admin`

- Status: ACTIVE
- Version: 1
- `verify_jwt=true`
- Purpose: authenticated Admin/Super Admin cancellation of Processing AI requests through the server-only cancellation RPC

The Edge Function never accepts a client-provided role. It authenticates the JWT, passes the caller's user ID to the service-role-only RPC, and the database re-checks the persisted role.

## Internal AI provenance model

VI-C adds `private.ai_evaluation_attempts`, deliberately outside the exposed `public` schema.

It persists:

- request and evaluator-version identity;
- exactly one attempt number (`1`);
- attempt lifecycle;
- prompt version;
- rubric version;
- output-schema version;
- exact configured model identifier;
- start/finish timestamps;
- validation outcome;
- internal failure code/reason;
- optional SHA-256 digest of the model output.

The raw model output and any full transcript are not persisted by this layer.

Because the provenance table is private rather than public, Step V's accepted 19-public-RLS-table foundation remains unchanged.

## One-attempt / no-retry enforcement

Every AI evaluator version automatically creates exactly one internal attempt row.

The accepted Step-V evaluator-version constraint already prevents more than one AI evaluator version. VI-C adds a second boundary:

- only an attempt in `created` may transition to `in_flight`;
- calling `svc_ai_start_attempt` again is rejected;
- no Admin rerun operation exists;
- API failure, invalid output, usable completion, unassessable output, or cancellation terminalizes the attempt.

## Runtime context boundary

`svc_ai_start_attempt` returns only server-side AI runtime data required by Step VII:

- internal request/evaluator/attempt IDs for orchestration;
- deterministic schema-compatible submission ID (`SUB-<UPPERCASE UUID>`);
- selected track slug;
- measured duration;
- private Storage bucket/object path;
- prompt/rubric/schema versions;
- configured model identifier;
- exactly 16 rubric criteria with canonical anchors.

The assembled rubric is always:

- 8 Universal Delivery;
- 4 Structural Flow;
- exactly 4 criteria for the selected track.

The context contains no speaker name, email, prior scores, history, leaderboard, or mastery data.

## Structured finalisation boundary

`svc_ai_finalize_result` validates the parsed JSONB result before any publication effect.

It enforces:

- exact top-level schema keys and no unexpected fields;
- `schema_version = 1.0`;
- exact deterministic submission ID;
- exact selected track slug;
- usable/unusable branch shape;
- exactly 16 criteria for usable output;
- zero criteria for unusable output;
- exact expected unique criterion IDs;
- no unrelated track criteria;
- exact criterion-level keys and no unexpected fields;
- canonical anchor;
- integer score;
- anchor-score compatibility through the accepted database validator;
- `mm:ss` timestamp syntax;
- timestamp within measured video duration through the accepted database validator;
- non-empty evidence, strength, weakness, actionable improvement;
- non-empty AI Overall Summary for usable output;
- database-authoritative 40/20/40 arithmetic.

A valid usable result transitions directly to Approved.

A valid unassessable result transitions to Rejected with internal `unassessable` provenance and no score/product/report effect.

A schema-invalid or semantically invalid result transitions to Rejected with internal `invalid_output` provenance. Partial criterion inserts are rolled back before rejection.

## API/malformed-output failure boundary

`svc_ai_fail_attempt` is service-role-only and supports:

- `api_failure`;
- `invalid` for parser/malformed-result failures that cannot reach the JSONB finaliser.

Both paths reject the AI request without scores or publication effects and persist internal failure provenance.

## Cancellation-wins semantics

`svc_ai_admin_cancel` allows Admin/Super Admin cancellation only while the AI request is Processing and requires an internal reason.

If a model result/failure arrives after an in-flight request has been cancelled:

- the request remains Cancelled;
- the evaluator version receives no late criterion content;
- the late result is ignored;
- the attempt is recorded as `discarded_cancelled`;
- an audit record preserves the discard event.

## Audit behavior

VI-C records internal audit events for:

- attempt creation;
- attempt start;
- successful AI approval;
- valid unassessable outcome;
- invalid output;
- API/orchestration failure;
- Admin cancellation;
- discarded late result/failure.

Admin cancellation also records the normal internal Admin action with its mandatory reason.

## Live verification completed by ChatGPT

Transactional production tests were executed and rolled back. They covered:

- valid usable AI output -> Approved;
- authoritative /100 arithmetic;
- valid unassessable output -> Rejected with zero criterion rows;
- duplicate/missing criterion rejection with zero partial rows;
- unexpected top-level field rejection;
- anchor-score mismatch rejection;
- out-of-duration timestamp rejection;
- API failure -> Rejected;
- second attempt start blocked;
- Admin cancellation during Processing;
- late result after cancellation ignored;
- all 13 track runtime rubrics;
- exactly 16 criteria per track;
- exactly four selected-track specialization criteria;
- no unrelated-track rubric leakage;
- no identity/history/mastery/leaderboard fields in runtime AI context;
- authenticated clients blocked from service AI RPCs;
- private AI provenance blocked from authenticated clients.

After rollback:

- Auth users: 0
- Profiles: 0
- Submissions: 0
- Evaluation requests: 0
- AI attempt rows: 0
- Audit test rows: 0
- Public RLS tables: 19

Supabase Security Advisor after VI-C: **0 security lints**.

## Deferred to Step VII

VI-C intentionally does not:

- call Gemini;
- store a Gemini API key;
- upload the video to Gemini;
- parse a raw Gemini HTTP response;
- perform live model retries (retries are prohibited);
- wire Flutter/portal to these services.

Step VII will use the VI-C start/finalise/fail boundaries to perform the single live Gemini direct-video attempt.

## Acceptance gate

This record does not self-accept VI-C.

Antigravity must commit/push the exact ChatGPT-authored repository package. ChatGPT then independently audits the pushed GitHub commit against this package and the already-deployed Supabase state before VI-C is accepted.
