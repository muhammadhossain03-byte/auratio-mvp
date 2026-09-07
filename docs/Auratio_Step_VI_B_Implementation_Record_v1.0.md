# Auratio Step VI-B Implementation Record v1.0

**Date:** 2026-09-07
**Status:** Supabase implementation complete; repository commit pending ChatGPT audit

## Accepted starting checkpoint

- Repository: `muhammadhossain03-byte/auratio-mvp`
- Branch: `step-vi/backend-orchestration`
- Accepted Step VI-A HEAD: `6343d0e10d9985a77110230ae94e7d50c5ff5014`
- Production Supabase project: `Auratio` (`czkbljnzcfsztfrwndsb`)

## Locked moderation baseline clarification

For later Human evaluations, the `>15` anomaly baseline is the user's **most recent previously Approved Human evaluation in the same track**.

- First Approved Human evaluation in that user+track scope: Admin moderation required.
- Later Human evaluation: `abs(new score - latest prior Approved Human score) > 15` requires Admin moderation.
- Difference of exactly 15 does not trigger the anomaly rule.
- If the difference is 15 or less, the Human result auto-approves unless another validity rule blocks it.
- The implementation orders prior approvals by Approved time with the monotonic approval audit ID as a deterministic tie-break.

This interpretation was explicitly approved by the product owner before VI-B implementation.

## Applied production migrations

1. `20260907110042_step_vi_b_submission_request_operations.sql`
2. `20260907110205_step_vi_b_human_lifecycle_operations.sql`
3. `20260907110447_step_vi_b_moderation_baseline_order_fix.sql`
4. `20260907110605_step_vi_b_rereview_termination_fix.sql`

The repository migration files in this package are byte-for-byte/source-hash matched to the migration statement text stored by the production Supabase migration history.

## Deployed Edge Functions

All are ACTIVE and `verify_jwt=true`:

- `evaluation-request`
- `human-admin`
- `human-volunteer`

The existing VI-A functions remain active:

- `staff-admin`
- `staff-accept-invitation`

## Implemented server-side behavior

### Submission/request creation

`evaluation-request` + `svc_create_evaluation_request` now provide the authoritative registration path after the user uploads the private Storage object.

The service:

- requires an active End User;
- accepts only the canonical track registry;
- requires `.mp4` / `video/mp4`;
- requires a user-owned Storage path;
- verifies the Storage object exists;
- relies on the accepted server-side track duration trigger;
- blocks a second active evaluation request for the same user;
- creates Submission + video metadata + Evaluation Request + evaluator version atomically;
- starts Human as `Unassigned`;
- starts AI as `Processing`;
- creates evaluator version `v1`;
- records the actor in the audit trail.

Direct authenticated INSERT policies for `submissions` and `submission_videos` were removed so clients cannot bypass this atomic operation. Direct private-Storage upload remains allowed under the accepted owner/path policy.

### Human Admin operations

`human-admin` exposes JWT-authenticated server commands for:

- Assign;
- Reassign;
- Cancel Request;
- Reject Evaluation;
- Approve Evaluation;
- Reopen / formal re-review.

Database service functions re-check the actor's persisted role and target Volunteer eligibility. Client-supplied role claims are not trusted.

Reassignment behavior:

- before submission: revokes the old active assignment, clears the prior Volunteer's partial draft criterion rows/summary, keeps the same Draft evaluator version, and assigns the new Volunteer;
- after submission/moderation: marks the submitted version Reopened, creates `vN+1`, and assigns the new Volunteer;
- formal `reopen` creates `vN+1` while preserving the prior submitted version;
- Admin reasons are mandatory for reassignment, cancel, reject, and reopen.

Termination behavior is provenance-aware:

- genuinely pre-submission work uses **Cancel Request**;
- any request with a prior Human submission/re-review must use **Reject Evaluation**, even if its current re-review UI state is Assigned/Accepted/In Evaluation;
- Approved remains terminal.

### Human Volunteer operations

`human-volunteer` exposes JWT-authenticated server commands for:

- accept assignment;
- decline with mandatory reason;
- return accepted/in-progress work with mandatory reason;
- begin evaluation;
- upsert one criterion result for the caller's active Draft version;
- save Overall Summary;
- submit.

The server derives the active assignment/version from the authenticated Volunteer. A Volunteer cannot choose another evaluator version or write another Volunteer's work.

Criterion writes continue to use the accepted Step-V database validation for:

- selected-track criterion scope;
- canonical Low / Competent / Excellent anchor;
- anchor-compatible integer score band;
- timestamp within video duration;
- required evidence, strength, weakness, and actionable improvement.

Submission invokes the accepted exact-16-criterion finalisation trigger and authoritative 40/20/40 arithmetic.

### Moderation

Human submission now deterministically decides:

1. no prior Approved Human in the same user+track scope → `Pending Moderation`;
2. latest prior Approved Human exists and absolute score difference is greater than 15 → `Pending Moderation`;
3. otherwise → `Approved` automatically.

The decision, current score, baseline score/version, and reason are recorded in `audit_log`.

### Audit actor propagation

Privileged Edge Functions invoke service-role-only RPCs. VI-B adds a transaction-local Auratio actor context so existing request/version/assignment audit triggers record the real authenticated user who initiated the command rather than losing actor provenance behind the service-role connection.

## Live verification completed by ChatGPT

Transactional tests were executed directly against the connected production project and rolled back. They covered:

- request creation and Human initial state;
- assignment → accept → begin;
- criterion write + Overall Summary + exact-16 submission;
- first-in-track score 80 requiring moderation;
- Admin approval;
- later score 70 using 80 as latest prior baseline and auto-approving;
- later score 40 using **70**, not 80, as the latest prior baseline and triggering the `>15` anomaly;
- deterministic baseline tie resolution inside one database transaction;
- pre-submission reassignment and removal of partial prior-Volunteer draft content;
- Volunteer decline;
- Volunteer return;
- pre-submission Admin cancellation;
- formal reopen creating v2 and preserving v1;
- post-submission direct reassignment creating v2;
- rejection during an assigned re-review;
- prevention of direct authenticated execution of privileged service RPCs;
- removal of direct authenticated Submission/video-metadata INSERT policies.

After rollback:

- Auth users: 0
- Profiles: 0
- Submissions: 0
- Evaluation requests: 0
- Human assignments: 0
- Audit test rows: 0

Supabase Security Advisor after VI-B: **0 security lints**.

## Deferred to later Step VI batches

VI-B does not implement:

- live Gemini invocation/finalisation beyond the shared AI request primitive;
- progress/mastery/ALR/leaderboard query services;
- deterministic DOCX rendering/persistence;
- actual video-deletion worker/retry execution;
- client integration.

Those remain in VI-C through VI-F and Step VII as defined by the Step VI handoff.

## Acceptance gate

This record does not self-accept VI-B. Antigravity must first commit/push the exact ChatGPT-authored source package. ChatGPT then independently audits the GitHub commit against this package and the already-deployed Supabase state.
