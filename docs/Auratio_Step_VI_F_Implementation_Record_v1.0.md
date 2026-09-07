# Auratio Step VI-F Implementation Record v1.0

**Date:** 2026-09-07
**Status:** Supabase implementation complete; repository commit pending ChatGPT audit

## Accepted starting checkpoint

- Repository: `muhammadhossain03-byte/auratio-mvp`
- Branch: `step-vi/backend-orchestration`
- Accepted Step VI-E HEAD: `b51aa3feb544aa9cb57d0b07fdb61ef517c548a4`
- Production Supabase project: `Auratio` (`czkbljnzcfsztfrwndsb`)

## Purpose

VI-F implements the terminal video-deletion worker/retry behavior required by the Step-VI handoff and adds the final cross-batch backend adversarial guard suite before VI-G closeout.

The worker operates only on the primary `evaluation-videos` object associated with a terminal Approved, Rejected, or Cancelled evaluation. It preserves submission/video metadata, structured evaluation data, audit history, and any Approved DOCX report.

## Applied production migration

`20260907133302_step_vi_f_video_deletion_worker.sql`

Production migration source:

- bytes: `8918`
- SHA-256: `67d7e7b0f638d0dbc45ec6607677277b94572ea22212c0da2b03a9ad18e981cb`

The repository migration in this package is byte-for-byte identical to the statement recorded by production Supabase.

## Deployed Edge Function

`video-cleanup`

- Status: ACTIVE
- Version: 1
- `verify_jwt=true`
- Purpose: bounded terminal-video cleanup worker
- Invocation authorization: Supabase service-role JWT for internal/operational calls, or an authenticated active Admin/Super Admin
- Client-provided role/user identity is not trusted

The function claims only due deletion jobs, uses the Supabase Storage API to remove exactly the `evaluation-videos` object returned by the service-only claim RPC, then records success or retry through service-only database RPCs.

It never targets `evaluation-reports`.

## Database worker model

VI-F extends `video_deletion_jobs` with:

- `claim_token`
- `claimed_at`
- a claim-shape constraint
- a unique partial claim-token index

This prevents normal duplicate processing while allowing stale claims older than 10 minutes to be reclaimed.

### Claim

`svc_claim_video_deletion_jobs(limit)`:

- service-role only;
- bounded to 1–25 jobs;
- selects due `pending`/`retry` rows;
- requires a terminal Approved/Rejected/Cancelled request;
- skips actively claimed rows;
- uses `FOR UPDATE ... SKIP LOCKED`;
- increments `attempt_count`;
- sets `last_attempt_at`;
- returns the video bucket/path plus an opaque claim token;
- returns video lifecycle to `deletion_pending` during retry processing.

### Success

`svc_complete_video_deletion(claim_token, already_missing)`:

- service-role only;
- verifies the Storage object no longer exists;
- marks `submission_videos.lifecycle_status='deleted'`;
- persists `deleted_at`;
- preserves bucket/object metadata;
- marks the job `succeeded`;
- writes a `video.deleted` audit event.

An already-missing object is considered successful cleanup because the desired terminal state has already been achieved.

### Failure / retry

`svc_fail_video_deletion(claim_token,error)`:

- service-role only;
- marks video metadata `deletion_failed`;
- marks the job `retry`;
- records the error and attempt number;
- clears the active claim;
- schedules deterministic backoff:
  - attempt 1: +5 minutes
  - attempt 2: +15 minutes
  - attempt 3: +1 hour
  - attempt 4: +6 hours
  - attempt 5+: +24 hours
- writes a `video.deletion_failed` audit event.

There is no destructive deletion of metadata, evaluation data, audit data, or DOCX reports.

## Terminal queue behavior

The accepted terminal-status trigger remains authoritative and is hardened to clear stale claim state when a terminal transition queues cleanup.

Terminal request states:

- Approved
- Rejected
- Cancelled

Each transition marks retained video metadata `deletion_pending` and upserts one deletion job for the submission.

## Verification completed by ChatGPT

### Transactional worker verification

The production-safe test suite was executed and rolled back. It verified:

- authenticated clients cannot execute worker RPCs directly;
- service role can execute the worker RPCs;
- terminal AI cancellation queues video deletion;
- lifecycle moves to `deletion_pending`;
- fresh claims cannot be concurrently claimed again;
- missing-object completion reaches `succeeded`;
- video metadata is retained and marked `deleted`;
- `deleted_at` is recorded;
- report-bucket objects remain untouched;
- successful deletion creates an audit event;
- simulated Storage failure enters `retry`;
- retry attempt count increments;
- retry time is scheduled into the future;
- failure changes lifecycle to `deletion_failed`;
- failure audit is recorded;
- due retry is reclaimable;
- retry processing returns lifecycle to `deletion_pending`;
- successful retry reaches `succeeded`.

Supabase protects direct SQL deletion from `storage.objects`, so the SQL harness deliberately validates the already-missing/idempotent completion path instead of bypassing Storage protections. The deployed Edge Function performs real object removal through the supported Supabase Storage API.

### Cross-batch backend adversarial guards

`step_vi_f_backend_adversarial_verification.sql` passed and verifies:

- every public `svc_*` privileged RPC is inaccessible to `authenticated`;
- every public `svc_*` privileged RPC remains executable by `service_role`;
- no public `SECURITY DEFINER` function is directly executable by authenticated users;
- all 19 accepted public application tables remain RLS-enabled;
- sensitive lifecycle tables have no direct authenticated mutation policy;
- one-active-request invariant remains present;
- one-active-Human-owner invariant remains present;
- one-Approved-version invariant remains present;
- both Auratio Storage buckets remain private;
- private AI/report orchestration tables remain hidden from authenticated users;
- canonical registries remain 3 Paths / 13 Tracks / 64 criteria / 192 anchors.

### Advisor and residue checks

- Supabase Security Advisor: **0 security lints**.
- Performance Advisor: only expected `unused_index` INFO notices on the empty MVP database; no release-blocking performance warning was introduced.
- Transactional fixture residue after testing:
  - Auth users: 0
  - submissions: 0
  - evaluation requests: 0
  - video-deletion jobs: 0
  - audit rows: 0

## Deferred to VI-G

VI-F does not close Step VI. VI-G must still perform the final Step-VI repository/database/Edge Function security and performance review, reproducibility audit, documentation/current-status update, and formal handoff to Step VII.

## Acceptance gate

This record does not self-accept VI-F.

Antigravity must commit/push the exact ChatGPT-authored repository package. ChatGPT then independently audits the pushed GitHub commit and deployed Supabase state before VI-F is accepted.
