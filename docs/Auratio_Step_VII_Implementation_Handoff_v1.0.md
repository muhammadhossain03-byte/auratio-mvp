# Auratio Step VII Implementation Handoff v1.0

**Date:** 2026-09-07
**Status:** Ready after independent acceptance of Step-VI VI-G closeout

## Purpose

Step VII connects the already-built Flutter app and authorized React portal to the accepted Supabase backend and introduces the single live Gemini direct-video evaluation call. Step VII must consume the Step-VI server boundaries rather than reimplementing lifecycle logic in clients.

## Starting checkpoint

- Repository: `muhammadhossain03-byte/auratio-mvp`.
- Step-VI working branch: `step-vi/backend-orchestration`.
- Accepted VI-F implementation HEAD before VI-G closeout: `fa25ccfaad1643b7e5ecac111c972ea40d2abbfe`.
- Step-VII branch: `step-vii/api-client-ai-integration`.
- Step-VII branch base: the ChatGPT-accepted VI-G closeout HEAD.
- Production Supabase project: `Auratio` (`czkbljnzcfsztfrwndsb`).

Do not create the Step-VII branch from VI-F directly. Wait for ChatGPT to accept the VI-G closeout commit and use that exact accepted HEAD.

## Step-VII objective

Replace mock/disconnected frontend data flows with authenticated persisted Supabase-backed flows while preserving the accepted Step-IV UI and all Step-V/VI lifecycle/security rules.

## Required workstreams

### 1. Shared integration foundation
- create typed Supabase clients/configuration for Flutter and portal;
- define environment handling without committing secrets;
- build narrow client wrappers for public/RLS reads and JWT Edge Function calls;
- map backend errors/states to existing UI states without duplicating server rules;
- preserve local development origins and production `https://auratio.cloud` compatibility.

Safe client configuration may include public Supabase URL/anon/publishable values as intended by Supabase. Service-role credentials remain server-only.

### 2. Auth, profiles and staff invitations
- End User sign-up/sign-in/profile session flow;
- shared authorized portal sign-in for Volunteer/Admin/Super Admin;
- persisted role-based routing/authorization;
- staff invitation acceptance and expired/revoked handling;
- Admin/Super Admin staff management screens wired to Step-VI staff operations;
- protected root Super Admin behavior;
- email/invitation UX using Supabase Auth capabilities where applicable.

### 3. End-User submission/evaluation flow
- upload original `.mp4` to the private video bucket through the authorized user path;
- collect authoritative measured duration/metadata as required by the accepted request boundary;
- create AI or Human request through `evaluation-request`;
- display persisted user-facing status;
- prevent a second active request through server response, not client-only assumptions;
- preserve duplicate-submission allowance;
- show Approved score/report/progress results from persisted data;
- handle Rejected/Cancelled without product/report effects.

### 4. Human portal integration
Wire Volunteer/Admin/Super Admin surfaces to the accepted Human lifecycle:
- Admin assignment/reassignment/cancel/reject/approve/reopen;
- Volunteer accept/decline/return/begin/save criterion/save summary/submit;
- canonical anchor-first score-band UI backed by server validation;
- video playback from private signed/authorized access;
- moderation and re-review states;
- audit/admin-only reasons remain inaccessible to End Users/Volunteers where specified.

### 5. Mandatory `SUB-8821` persisted-state invariant
All relevant Volunteer/Admin surfaces must read the same Supabase request/version/assignment state.

Integration acceptance requires proving that:
- exactly one Volunteer owns active Human work;
- decline/return removes active ownership;
- reassignment changes ownership atomically;
- a submitted evaluator version cannot still be edited as active work;
- post-submission reassignment/re-review creates a new version;
- user-facing Pending Moderation/Re-review can remain Processing;
- Approved remains terminal.

Do not solve this by synchronizing mock objects between screens.

### 6. Live Gemini direct-video integration
Use the accepted Step-VI AI boundaries:
1. server starts the one allowed AI attempt;
2. server obtains only the accepted selected-track runtime context;
3. server sends the original video directly to Gemini with audio + visuals and the locked prompt/rubric/schema;
4. server parses JSON response;
5. server calls finalise/fail boundary exactly once;
6. no retry/no Admin rerun;
7. Admin cancellation during Processing wins over late result;
8. valid usable → Approved; invalid/unassessable/API failure → Rejected.

The live model must not receive speaker identity, email, history, prior scores, leaderboard/mastery, or unrelated track rubrics.

### 7. Gemini credential decision
MVP default: **one Gemini API key**.

Requirements:
- store it server-side only as a Supabase Edge Function secret/environment secret;
- never commit the key;
- never expose it to Flutter/React/Vercel clients;
- never echo it to logs/responses;
- multiple keys are not required for the MVP.

If the user later provides/rotates the key, update only server-side secret configuration unless an explicit architecture change is approved.

### 8. Report integration
- call/read the accepted report service for Approved requests;
- display report availability from persisted report metadata;
- download the same immutable `.docx` repeatedly through authorized private Storage access;
- do not regenerate a new report for each download;
- preserve exact filename and report privacy.

### 9. Progress/mastery/leaderboards/events
- private End-User progress/history from accepted RLS services;
- leaderboard through the JWT `leaderboard` Edge Function;
- keep AI/Human and Monthly/All-Time/Track separation;
- display participation without using it in ALR;
- wire Bangladesh event discovery filters to persisted event data.

### 10. Integration observability/error handling
- surface user-safe errors without leaking internal reasons/secrets;
- maintain Admin-only audit/reason visibility;
- do not silently mutate persisted backend state on client retries;
- respect one-attempt AI semantics and idempotent report retrieval;
- ensure expired sessions/role changes are handled safely.

## Suggested Step-VII batches

1. **VII-A — Integration foundation + Auth/profile/role routing.**
2. **VII-B — End-User upload/request/status/report/progress/leaderboard/event integration.**
3. **VII-C — Volunteer/Admin persisted Human lifecycle integration + `SUB-8821` coherence closure.**
4. **VII-D — Live Gemini direct-video integration using one server-side API key.**
5. **VII-E — Cross-client integration QA, Auth/invitation/email completion, regression and Step-VIII handoff.**

ChatGPT may refine the batch boundaries after inspecting the actual current Flutter/portal code and connected service configuration.

## Security rules
- never put `SUPABASE_SERVICE_ROLE_KEY` or Gemini key in client code;
- do not trust client-provided user IDs/roles/status/scores/totals/ownership;
- privileged mutations go through accepted JWT Edge Functions/service RPCs;
- ordinary private reads remain RLS-controlled;
- keep both Storage buckets private;
- internal Admin reasons/audit and AI provenance remain restricted;
- do not bypass server validation because the UI already validates inputs.

## Step-VII non-goals
Do not yet:
- perform final production deployment/freeze;
- change Hostinger DNS to launch production unless explicitly entering Step IX;
- build the final academic release APK as the launch artifact;
- declare full-system QA complete.

Those belong to Steps VIII–IX.

## Required workflow

1. Read `AGENTS.md`, `docs/CURRENT.md`, this handoff, Step-VI closeout, relevant backend implementation records, and current frontend code.
2. Confirm the accepted VI-G closeout HEAD.
3. Create `step-vii/api-client-ai-integration` from that exact HEAD.
4. ChatGPT authors every integration patch/package.
5. Antigravity applies it mechanically and runs exact validations.
6. ChatGPT independently audits every push and connected backend effect.
7. Any failure returns to ChatGPT; Antigravity does not invent a fix.
8. Step VIII remains blocked until Step VII is explicitly accepted.

## Step-VII exit criteria

Step VII closes only when:
- End User app uses real persisted Auth/profile/submission/evaluation/report/progress/leaderboard/event flows;
- Volunteer/Admin/Super Admin portal uses real persisted Auth/role/lifecycle flows;
- `SUB-8821` coherence invariant is demonstrably resolved through one persisted source;
- live Gemini direct-video AI evaluation works through the accepted one-attempt server boundary;
- one server-side Gemini key is configured without client exposure;
- report download retrieves the immutable Approved report;
- all cross-role/client lifecycle transitions remain consistent;
- client/backend error handling does not expose secrets/internal reasons;
- automated integration tests and targeted visual/runtime QA pass;
- ChatGPT independently accepts the final Step-VII GitHub/backend state.
