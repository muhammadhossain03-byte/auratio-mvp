# Auratio Step VII Implementation Handoff v1.2

**Date:** 2026-09-08
**Status:** VII-A + VII-B CLOSED / APPROVED; VII-C next in a fresh chat

## Purpose

Step VII connects the accepted Flutter app and authorized React portal to the accepted Supabase backend and introduces the single live Gemini video-evaluation attempt without duplicating server lifecycle/scoring logic in clients.

This v1.2 handoff supersedes v1.1 where they conflict.

## Current checkpoint

- Repository: `muhammadhossain03-byte/auratio-mvp`.
- Branch: `step-vii/api-client-ai-integration` — already exists; do not recreate or switch.
- VII-A documentation closeout before B: `4e305cc55da5ff02bcb661ab604a20cf0b2b1dba`.
- VII-B1: `710d280551214fd031fa4747c3cbd168611be3e5`.
- VII-B2: `12a6214d767408afa7c55eebeca1a060bd537f14`.
- VII-B3 implementation: `e2d37588e1db6923244c1b2ecbe0899e2dfc287a`.
- Production Supabase project: `Auratio` (`czkbljnzcfsztfrwndsb`).
- Antigravity repository: `D:\auratio-mvp`.

The initial documentation closeout after B3 was pushed as `3aca24842583c8bacb4fbf13affadcdc8fd31610`; a documentation-only audit correction follows it. In the next chat, verify the actual remote branch HEAD and direct ancestry before authoring VII-C.

## VII-B delivered / accepted

Configured End-User flows now consume persisted Supabase/backend boundaries for:

- original `.mp4` selection and private upload;
- MP4 duration extraction and canonical Track duration gates;
- AI/Human `evaluation-request` creation;
- persisted user-facing status;
- Approved result and exactly 16 criterion findings;
- Approved-only immutable DOCX preparation/download;
- private progress/mastery and Approved history;
- JWT leaderboards separated by Track / AI-Human / All-Time-Monthly;
- published Bangladesh events and persisted event detail.

Configured routes use these persisted screens. Unconfigured development/test operation keeps accepted Step-IV prototype screens.

No B implementation migration or backend function deployment was introduced.

## B acceptance limitations

B acceptance is code-integration acceptance, not live production/runtime acceptance.

Not proven by B:
- actual production-configured mobile/browser Supabase E2E;
- device/platform save-dialog behavior;
- network/error/offline behavior;
- final configured visual/runtime QA;
- remaining profile/onboarding/Path persistence.

Inspection at B closeout shows `mobile/lib/features/profile` remains presentation-only. Persisted profile editing, Path selection/Manage Paths and remaining Auth/client gaps are explicitly scheduled to VII-E unless moved by a later accepted package.

## First task in the new chat: VII-C

VII-C is Human portal persisted lifecycle integration and mandatory `SUB-8821` coherence closure.

Before editing:
1. read `AGENTS.md`;
2. read `docs/CURRENT.md`;
3. read Status v16;
4. read VII-B Closeout v1.0;
5. read this handoff;
6. verify branch HEAD and ancestry through B3;
7. inspect current portal Human/Admin/Super Admin screens and accepted `human-admin`, `human-volunteer`, staff and report backend contracts.

Do not begin Gemini implementation in VII-C.

## Critical AI-requested -> Human redirection requirement

The authoritative product rule is: mode redirection requires explicit End-User consent.

The intended portal behavior already includes an AI-requested submission reaching a `Redirected Human` state after alternate-method consent. However, at the current persisted checkpoint:
- `evaluation_requests.mode` is immutable after request creation;
- the current `ai-admin` Edge Function exposes Admin cancellation only;
- no persisted consent-aware redirect boundary has yet been closed.

Therefore:
- Admin must not force AI -> Human redirection without End-User consent;
- do not remove the intended redirect capability just because the current backend mode field is immutable;
- do not treat Gemini/API failure as implicit Human fallback;
- preserve the originally requested method as an auditable fact;
- the persisted solution must represent consent and effective routing without falsifying request history.

VII-C source inspection must explicitly account for this gap while wiring Admin/Human lifecycle behavior. Any remaining End-User consent/client work must be closed before Step VII acceptance.

## VII-C required lifecycle surfaces

### Volunteer
Persisted:
- assigned queue/detail;
- accept;
- decline;
- return;
- begin;
- save criterion;
- save Overall Evaluation Summary;
- submit;
- re-review/new-version work when assigned.

Requirements:
- canonical anchor-first score bands;
- exact persisted request/version/assignment state;
- private authorized video access;
- no access to Admin-only internal reasons or AI provenance;
- submitted version is not editable as active work.

### Admin / Super Admin
Persisted:
- queue/detail;
- assign;
- reassign;
- cancel;
- reject;
- approve;
- reopen/re-review;
- staff/Volunteer context only through accepted authorization boundaries.

Reassignment must not be simulated client-side.

## Mandatory `SUB-8821` invariant

Integration acceptance must prove one persisted source of truth across Volunteer/Admin views:

1. exactly one Volunteer owns active Human work;
2. decline/return removes active ownership;
3. reassignment atomically changes ownership;
4. submitted evaluator version cannot remain editable active work;
5. post-submission reassignment/re-review creates a new version;
6. user-facing nonterminal states may map to Processing;
7. Approved remains terminal;
8. all relevant portal screens resolve the same request/version/assignment state.

Do not solve coherence with shared mock state.

## Locked VII-D Gemini architecture

The user approved this architecture on 2026-09-08.

### Provider/model/API
- Google Gemini API.
- Stable GA model: `gemini-3.8-flash`.
- Interactions API.
- Agentic Video Understanding: `processing: "agentic"`.

### Media flow
1. accepted AI request reaches the existing one-attempt server orchestration boundary;
2. server obtains the private original MP4;
3. server uploads a temporary copy through Gemini Files API;
4. wait until Gemini file is usable;
5. invoke `gemini-3.8-flash` via Interactions API with agentic video processing;
6. prompt requires complete-performance assessment plus criterion-relevant navigation/timestamp evidence;
7. parse strict structured result;
8. finalize or fail through the accepted Step-VI boundary exactly once;
9. manually delete the Gemini Files API temporary file after the attempt;
10. provider automatic file expiry is secondary cleanup, not the primary Auratio policy.

### Evaluation isolation
Gemini receives:
- original video/audio;
- selected Track only;
- locked Auratio prompt;
- selected Track rubric;
- locked schema.

Gemini must not receive:
- speaker identity/email;
- prior submissions/scores;
- mastery;
- leaderboard state;
- unrelated Track rubrics;
- Volunteer/Admin identities or internal moderation notes.

### Failure/attempt policy
- one AI attempt;
- no automatic retry;
- no Admin rerun;
- Admin cancellation while Processing wins over a late result;
- usable valid result → accepted finalize path;
- invalid/unassessable/API/agentic failure → accepted failure/Rejected path;
- no silent downgrade to static video processing;
- no automatic AI-failure -> Human fallback; AI-requested -> Human redirection is a separate explicit-consent product flow.

### Credential
- one Gemini API key for MVP;
- Supabase Edge Function secret/environment secret only;
- never commit or send to Flutter/React/Vercel;
- never log/echo the key.

### Pre-D verification
Google provider capabilities can change. Before VII-D coding, recheck current official Gemini documentation for:
- `gemini-3.8-flash`;
- Agentic Video Understanding support;
- Interactions API request shape;
- Files API upload/delete behavior;
- structured-output behavior;
- quotas/pricing relevant to MVP.

Do not change the locked architecture merely because an older v1.1 handoff described generic “direct-video” behavior.

## VII-E remaining client/integration closure

At minimum:
- persisted profile editing;
- persisted Path selection / Manage Paths;
- password recovery;
- app/deep-link callbacks;
- staff invitation/email acceptance completion;
- sign-out/session expiry/account disable/role change;
- cross-tab/client refresh behavior;
- live provisioned-account cross-client E2E;
- network/error handling;
- configured visual/runtime QA;
- final Step-VII regression and Step-VIII handoff.

## Security rules retained

- never expose `SUPABASE_SERVICE_ROLE_KEY` or Gemini key to clients;
- do not trust client-provided user IDs/roles/status/scores/totals/ownership;
- privileged mutations use accepted JWT Edge Functions/service boundaries;
- ordinary private reads remain RLS-controlled;
- both Storage buckets remain private;
- no client direct invocation of privileged `svc_*` RPCs;
- internal reasons/audit and AI provenance stay restricted;
- UI validation never replaces backend validation.

## Step-VII remaining batch order

1. VII-A — CLOSED / APPROVED.
2. VII-B — CLOSED / APPROVED.
3. VII-C — NEXT: Human persisted lifecycle + `SUB-8821`.
4. VII-D — locked Gemini 3.8 Flash agentic-video integration.
5. VII-E — remaining client/Auth/profile/Path + cross-client/runtime closure.

## Required workflow

1. ChatGPT reads authority docs and current source from GitHub.
2. Verify branch/HEAD/ancestry before each batch.
3. ChatGPT authors bounded exact implementation packages.
4. Antigravity applies mechanically.
5. Any failure returns to ChatGPT; Antigravity does not invent fixes.
6. Antigravity commits/pushes only after package validation passes.
7. ChatGPT independently audits every pushed commit before the next batch.
8. Step VIII remains blocked until Step VII is explicitly accepted.

## Fresh-chat rule

This conversation ends after the VII-B documentation closeout.

The next conversation starts at VII-C only after reading the verified documentation HEAD. Do not recreate the branch and do not begin VII-D/Gemini in the VII-C package.
