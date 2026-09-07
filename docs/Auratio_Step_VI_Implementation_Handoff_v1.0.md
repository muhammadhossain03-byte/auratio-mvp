# Auratio Step VI Implementation Handoff v1.0

**Date:** 2026-09-07
**Status:** Step V closed; Step VI authorized after closeout commit acceptance

## Purpose
This is the starting handoff for **Step VI — backend lifecycle/orchestration and server-side services**.

Step VI builds operational backend behavior on top of the accepted Step-V database/RLS foundation. It must not replace the Step-V schema with parallel client state or bypass the accepted database constraints.

## Starting checkpoint
- Repository: `muhammadhossain03-byte/auratio-mvp`
- Step-V implementation commit: `102dc424788e177601fd7683c1c2f54015ae1c78`
- Production Supabase project: `Auratio` (`czkbljnzcfsztfrwndsb`)
- Next branch after documentation closeout acceptance: `step-vi/backend-orchestration`

The Step-V closeout documentation commit becomes the actual Step-VI branch base after ChatGPT independently accepts it.

## Accepted Step-V foundation
- 9 reproducible migrations.
- 19 RLS-enabled Auratio public tables.
- 2 private Storage buckets.
- 3 Paths / 13 Tracks / 64 criteria / 192 anchors.
- Four-role profile model and protected root Super Admin bootstrap.
- One-active-request and one-active-Human-owner relational constraints.
- Human evaluator versions and immutable submitted result model.
- Anchor-score, selected-track, timestamp, 16-criterion, subtotal/total, Approved/report, and terminal video-deletion constraints/triggers.
- Security Advisor clean at acceptance.
- `supabase/tests/step_v_schema_verification.sql` accepted.

## Step VI objective
Implement the privileged server-side operations that safely mutate and derive the accepted persisted model.

Step VI should expose a narrow, auditable backend command surface through Supabase Edge Functions and/or explicitly designed database RPC functions where appropriate. Direct client writes to sensitive lifecycle tables must not become the application architecture merely because RLS exists.

## Required Step-VI workstreams

### 1. Identity and staff administration
Implement server-side operations for:
- protected root Super Admin recognition/bootstrap completion;
- Super Admin invitation/management/deactivation of Admins;
- Admin/Super Admin invitation/management/deactivation of Volunteers under locked role rules;
- invitation acceptance and expiry/revocation semantics;
- prevention of client-controlled role escalation;
- audit logging for privileged role/account changes.

Do not expose service-role credentials to Flutter or React.

### 2. Submission and request creation
Implement authoritative operations for:
- submission/video metadata registration;
- `.mp4` and duration acceptance path using the canonical track gates already persisted;
- one active evaluation request per user;
- user-selected AI/Human mode;
- no duplicate-prevention gate;
- request creation in the correct initial state (`Processing` for AI, `Unassigned` for Human);
- user-consented mode redirection only where a later operation requires it.

### 3. Human Evaluation lifecycle
Implement atomic server-side commands for:
- Admin assign;
- Admin reassign at any pre-Approved state;
- Volunteer accept;
- Volunteer decline/return with mandatory reason and return to Admin Unassigned queue;
- begin/in-evaluation state;
- criterion/result draft writes for the active owner/version only;
- Human Overall Summary write;
- evaluator submit and immutable lock;
- first-in-track moderation decision;
- >15-point prior-approved-Human anomaly moderation trigger;
- Admin approve;
- Admin reopen/re-review with vN+1;
- post-submission reassignment through a new version while preserving provenance;
- Admin Cancel Request for pre-submission Human states;
- Admin Reject Evaluation for submitted/moderation/re-review states;
- mandatory internal reasons for Admin termination/reassignment actions;
- Approved terminality.

The operation layer must preserve the persisted lifecycle:
`Unassigned → Assigned → Accepted → In Evaluation → Submitted → Pending Moderation → Approved / Reopened / Rejected`.

### 4. AI lifecycle primitives
Implement the server-side request lifecycle needed by Step VII Gemini integration:
- create exactly one AI evaluator version/attempt;
- Processing state;
- Admin cancellation while Processing;
- cancellation wins over late result;
- valid structured result finalisation path to Approved;
- invalid/unassessable/API-failure path to Rejected;
- no retry/no Admin rerun;
- no user identity/history/leaderboard/mastery payload dependency.

Step VI may implement the orchestration boundaries and validation/finalisation services, but the live Gemini direct-video API integration belongs to Step VII.

### 5. Evaluation finalisation and moderation services
Use the accepted database criterion/anchor registry as the authoritative rubric source. Implement server-side validation/commands that ensure:
- exactly 16 criteria for the selected track;
- shared Human/AI canonical anchors;
- compatible integer score bands;
- required timestamp/evidence/strength/weakness/actionable improvement;
- non-empty Overall Summary;
- authoritative database arithmetic;
- no silent Admin rewriting of submitted evaluator content.

### 6. Progress, mastery and public leaderboard services
Implement deterministic query/service logic from Approved evaluations only:
- private mastery combining Approved AI + Human;
- public boards separated by Track, AI/Human mode, and All-Time/Monthly period;
- 3-evaluation qualification;
- 3 scores → average 3;
- 4 scores → average 4;
- 5+ → five most recent, discard one lowest, average remaining four;
- All-Time activity decay and Monthly D=1.00;
- monthly membership by submission date once Approved;
- participation count display without using it in ALR;
- canonical tie-break sequence.

Do not denormalize in a way that makes the authoritative Approved source unrecoverable. Cached/materialized projections are allowed only if deterministic and refreshable from source data.

### 7. DOCX report service
Implement deterministic Approved-only report generation from structured persisted data according to `Auratio_DOCX_Report_Generation_Specification_v1.0.md`:
- same renderer for AI/Human;
- generate once on final approval;
- immutable stored `.docx`;
- unlimited re-download of the same file;
- exact filename contract;
- all required report fields and exactly 16 criterion sections;
- no email/internal evaluator identity/model/prompt/history/leaderboard/mastery/full transcript in report body;
- plain-text timestamps;
- Human summary from Volunteer; AI summary from validated AI result.

### 8. Terminal video deletion worker
Implement the worker/retry behavior represented by `video_deletion_jobs`:
- terminal Approved/Rejected/Cancelled queues deletion;
- delete the primary Storage object;
- preserve metadata/audit/structured Approved result/report;
- mark success;
- log failure and schedule retry;
- never delete the Approved DOCX as part of video cleanup.

### 9. Audit and observability
Ensure privileged lifecycle changes produce sufficient audit records to reconstruct:
- who assigned/reassigned/terminated/moderated;
- reasons where mandatory;
- version provenance;
- terminal outcome;
- deletion attempts/failures.

Internal reasons remain invisible to End Users and Volunteers.

## Deferred frontend coherence requirement
The prior `SUB-8821` issue is now a backend integration invariant, not a mock-data patch task.

All Volunteer/Admin surfaces in Step VII must read one persisted source so that:
- exactly one Volunteer owns active Human work;
- submitted evaluator versions are immutable history;
- decline removes active ownership;
- reassignment changes active ownership without fabricating entities;
- user-facing moderation/re-review remains Processing where specified;
- Approved is terminal.

Step VI must make those facts queryable and atomic before Step VII wires the clients.

## Security requirements
- No service-role/Gemini secret in client code.
- Prefer authenticated Edge Functions with explicit authorization checks for privileged mutations.
- Do not trust client-provided roles, user IDs, ownership, scores, status transitions, or totals without server-side derivation/validation.
- Keep internal Admin reasons and audit details out of End-User/Volunteer read paths.
- Maintain the accepted private Storage policies; privileged workers may use server credentials only server-side.
- Any new SECURITY DEFINER function requires a fixed `search_path`, minimal EXECUTE grants, and a clean Supabase Security Advisor review.

## Step VI non-goals
Do not yet:
- wire Flutter/portal comprehensively to the real backend;
- perform live Gemini direct-video evaluation from the production clients;
- complete Auth email/invitation UX in clients;
- deploy the portal to Vercel/`auratio.cloud`;
- build the final Android release APK;
- perform full release QA.

Those belong to Steps VII–IX.

## Suggested Step-VI batches
1. **VI-A — Backend command architecture + identity/staff operations.**
2. **VI-B — Human lifecycle operations + audit/versioning.**
3. **VI-C — AI lifecycle primitives + structured finalisation boundary.**
4. **VI-D — progress/mastery/ALR/leaderboard services.**
5. **VI-E — deterministic DOCX service + report persistence.**
6. **VI-F — terminal video deletion/retry worker + complete backend adversarial test suite.**
7. **VI-G — final Step-VI security/performance review and handoff to Step VII.**

ChatGPT may refine batch boundaries after inspecting current repository and Supabase state, but it must author each implementation package before Antigravity writes repository code.

## Required Step-VI workflow
1. Read `AGENTS.md`, `docs/CURRENT.md`, this handoff, and the accepted Step-V migrations/tests.
2. Confirm the final accepted closeout HEAD and create `step-vi/backend-orchestration` from it.
3. Inspect connected Supabase state before each database/backend change.
4. ChatGPT authors exact Edge Function/SQL/test files.
5. Antigravity applies only the exact repository package and runs exact validations.
6. ChatGPT applies/validates Supabase changes through the connected Supabase tool where appropriate, keeping repository migration/source parity.
7. Any validation failure returns to ChatGPT; Antigravity must not independently fix code.
8. ChatGPT audits every pushed commit and Supabase deployed state.
9. Step VII remains blocked until Step VI is explicitly accepted.

## Step VI exit criteria
Step VI closes only when:
- privileged lifecycle operations are implemented and tested;
- Human assign/accept/decline/reassign/submit/moderate/reopen/reject/cancel semantics are atomic and correct;
- AI one-attempt/cancel/finalise/reject primitives are correct;
- active ownership/version invariants remain intact under adversarial operations;
- progress/mastery/ALR/leaderboard services reproduce the locked formulas;
- deterministic Approved-only DOCX generation is implemented and verified;
- terminal video deletion/retry worker is implemented and verified;
- role/invitation management cannot escalate privileges improperly;
- internal reasons/audit details remain correctly restricted;
- no secrets are committed;
- Supabase Security Advisor is clean of release-relevant security findings;
- backend tests are reproducible;
- ChatGPT independently accepts the final GitHub and Supabase state.
