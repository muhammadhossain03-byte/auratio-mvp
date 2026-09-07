# Auratio Step VII Implementation Handoff v1.1

**Date:** 2026-09-07
**Status:** VII-A CLOSED / APPROVED; VII-B onward reserved for a fresh chat

## Purpose

Step VII connects the already-built Flutter app and authorized React portal to the accepted Supabase backend and introduces the single live Gemini direct-video evaluation call. Step VII must consume the Step-VI server boundaries rather than reimplementing lifecycle logic in clients.

## Current checkpoint and new-chat start

- Repository: `muhammadhossain03-byte/auratio-mvp`.
- Current branch: `step-vii/api-client-ai-integration` (already exists; do not recreate).
- Accepted VI-G base: `dbdbef671cb0916f6657d678191eecc27d5056ee`.
- Accepted VII-A1: `715e92ca71a309358740f26f779e45edabd045cc`.
- Accepted VII-A2 implementation: `02354879b9fda65ea9bf3c66d404e9a12a06b77c`.
- Production Supabase project: `Auratio` (`czkbljnzcfsztfrwndsb`).
- Actual Antigravity repository: `D:\auratio-mvp`.
- Package extraction: `E:\Auratio_<Package_Name>\`.

The VII-A documentation closeout directly follows A2. Its actual commit SHA must be obtained from GitHub and independently audited after push; it cannot be self-embedded. Once accepted, that docs commit becomes the new-chat HEAD, with A2 retained as the implementation checkpoint.

The user explicitly requested this chat stop after VII-A closeout. **No VII-B implementation in this chat.** In the new chat, first read `AGENTS.md`, `docs/CURRENT.md`, Status v15, the VII-A Closeout v1.0, and this handoff. Verify branch/HEAD/ancestry and current relevant source before authoring a VII-B package.

## VII-A delivered and accepted

- A1: pinned `@supabase/supabase-js` 2.115.0 and `supabase_flutter` 2.17.2; validated public configuration; typed Auth/profile/role/status primitives; Supabase initialization and repository providers.
- A2: real configured sign-in, End-User sign-up with display-name metadata, verification resend, persisted account-status/role checks, portal role routing, mobile active-End-User route protection, and fail-closed production configuration.
- Portal prototype mode: both public values absent, and Vite DEV or hostname exactly `localhost`/`127.0.0.1`. Invalid/partial configuration is unavailable even on loopback. Configured builds use real Auth.
- Mobile prototype mode: both public values absent in non-release development/test operation. A normal release startup without public configuration throws; public/unconfigured redirects preserve synchronous behavior.
- Backend RLS and JWT Edge Functions remain authoritative. Route guards do not replace backend authorization.

A2 acceptance is an implementation checkpoint, not proof of production readiness. See the closeout record for independent audit vs reported test evidence.

## Explicit remaining Auth and client work

These remain open within Step VII and are not waived by VII-A acceptance:

- production mobile deep-link/app-link callbacks and final portal/Android Auth redirect allowlists;
- password-recovery and staff invitation acceptance/email callbacks;
- complete sign-out/session-expiry/account-disable/role-change UX and cross-tab/client refresh behavior;
- live cross-client Auth E2E using provisioned accounts, including staff denial on mobile and End-User denial on portal;
- network/error cases during sign-up, verification resend and session/profile loading;
- targeted visual/runtime QA of configured Auth states; prototype browser regression results do not cover live Auth;
- persisted onboarding, profile editing and Path selection: inspect coverage in VII-B and explicitly schedule any unwired surface.

## First task in the fresh chat: VII-B

Inspect the accepted backend contracts and current End-User screens, then author a bounded implementation package for original MP4 upload, measured metadata, `evaluation-request`, persisted statuses, immutable Approved reports, private progress/mastery/history, JWT leaderboard reads, and Bangladesh event discovery.

Keep server lifecycle/score rules on the server, duplicate submissions allowed, private buckets private, and Approved-only product effects intact. Use the existing accepted JWT Edge Function boundaries; do not invoke privileged `svc_*` RPCs from clients. Do not implement live Gemini ahead of VII-D or try to fix `SUB-8821` using distributed mock state.

## Backend evidence at VII-A closeout

Read-only checks on 2026-09-07 confirmed 24 migrations (latest `20260907133302_step_vi_f_video_deletion_worker`), 9 ACTIVE JWT-verified functions, 19/19 public tables with RLS, 28 `svc_*` RPCs, zero authenticated direct execution, zero missing service-role grants, 2 private MIME-restricted buckets, and zero Security Advisor lints.

Canonical 3/13/64/192 registries, VI-G performance notices and zero fixture residue are carried historical baseline facts; they were not re-queried for this closeout. VII-A and this docs package introduce no migration, deployment or secret configuration.

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

1. **VII-A — CLOSED / APPROVED (A1 + A2).**
2. **VII-B — NEXT, fresh chat: End-User upload/request/status/report/progress/leaderboard/event integration.**
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
2. Verify the current branch HEAD, the accepted VII-A documentation closeout, and ancestry to the accepted A2/A1/VI-G commits.
3. Keep the existing `step-vii/api-client-ai-integration` branch. In a fresh chat, author the first VII-B package only after that source inspection.
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
