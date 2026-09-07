# Auratio Execution Specification v1.12

**Date:** 2026-09-07
**Status:** Steps I-VI CLOSED / APPROVED; VII-A CLOSED / APPROVED; VII-B next in a fresh chat

## Technical ownership

ChatGPT is the sole technical lead and developer. ChatGPT authors the actual implementation code, patches, complete replacement files, migrations, tests, prompts, specifications, and technical fixes.

Antigravity is execution-only for local/repository writes, explicit validation, commit, and push. It must not implement Auratio from broad tasks or acceptance criteria. If validation fails, Antigravity reports the failure and stops; ChatGPT authors the correction. Every pushed commit requires independent ChatGPT audit before acceptance.

## Accepted completed phases

1. Step I — Concepts and Requirements: complete.
2. Step II — Wireframing: complete.
3. Step III — UI/UX Design: complete.
4. Step IV — Frontend Implementation & QA: closed / approved.
5. Step V — Supabase database foundation: closed / approved.
6. Step VI — Backend & Orchestration: CLOSED / APPROVED at `dbdbef671cb0916f6657d678191eecc27d5056ee`.
7. VII-A1 — Supabase integration foundation: CLOSED / APPROVED at `715e92ca71a309358740f26f779e45edabd045cc`.
8. VII-A2 — persisted Auth/profile/role routing: CLOSED / APPROVED at `02354879b9fda65ea9bf3c66d404e9a12a06b77c`.

VII-A is complete; Step VII overall is not. The current branch is `step-vii/api-client-ai-integration`. The documentation closeout commit that follows A2 must be independently accepted before becoming the new-chat HEAD.

## Step-VI implementation delivered

Step VI has implemented and verified:
- protected staff/Admin/Volunteer invitation and management operations;
- authoritative submission/request creation;
- atomic Human assignment/accept/decline/return/begin/save/submit/moderate/reassign/reopen/reject/cancel lifecycle;
- latest-prior-Approved-Human same-track moderation baseline and >15 anomaly rule;
- AI one-attempt/no-retry lifecycle and strict structured-result finalisation boundary;
- private AI provenance;
- Approved-only progress/mastery/history;
- Track+mode+period-separated ALR leaderboards with qualification, sliding-window, decay, monthly attribution, and tie-break rules;
- deterministic Approved-only DOCX generation and immutable private report persistence;
- terminal video deletion/retry worker with audit;
- privileged RPC/RLS/Storage security boundaries and cross-batch adversarial tests.

Production Supabase project: `Auratio` (`czkbljnzcfsztfrwndsb`).

## Current sequence

The user has reserved VII-B onward for a fresh chat. Finish only the VII-A documentation closeout in this chat. The current Step-VII handoff is v1.1; the current status is v15.

Completed VII-A includes the pinned SDK/configuration foundation, persisted profile/role models, sign-in/sign-up/verification resend wiring, and protected mobile/portal routing. Production configuration failure is fail-closed. Unconfigured development/loopback prototype behavior is preserved for regression tests.

Deferred Auth completion remains VII-E: callbacks/app links, password recovery, staff invitation/email completion, final Auth redirect allowlists, live role/session/sign-out behavior and cross-client E2E. Persisted onboarding/profile/path-selection surfaces must be inspected during VII-B; Auth profile primitives do not imply all profile features are wired.


1. **Step VII — API/Client/AI Integration**
   - Flutter + portal ↔ Supabase integration;
   - Supabase Auth/profile/invitation/email flows;
   - persisted End-User submission/video/request/report/progress/leaderboard/event flows;
   - persisted Volunteer/Admin Human evaluation operations;
   - live Gemini direct-video orchestration using the accepted Step-VI AI boundaries;
   - resolution of `SUB-8821` through one persisted lifecycle source;
   - integration-level cross-role and client/backend tests.
2. **Step VIII — Full-System QA**
   - local integration, staging/production-like QA, adversarial lifecycle/role verification, visual/regression QA, and blocker closure.
3. **Step IX — Deployment & Demo Distribution**
   - deploy portal to Vercel;
   - point Hostinger DNS for `auratio.cloud`;
   - configure HTTPS/origins/Auth callbacks;
   - build/test Android release APK;
   - production smoke, freeze, and launch/demo gate.

## Step-VII Gemini credential contract

For the MVP, exactly one Gemini API key is sufficient and is the locked default unless explicitly changed later.

The key must:
- exist server-side only as a Supabase secret/environment secret;
- never be committed to Git;
- never appear in Flutter/React/Vercel client bundles;
- never be returned in API responses/logs;
- be used for the single direct-video AI attempt per AI request.

Multiple keys, quota splitting, and failover rotation are optional future operational enhancements, not MVP requirements.

## Persisted lifecycle integration invariant

`SUB-8821` is no longer a mock-data bug-fix task. Step VII must make every relevant client surface derive state from the same persisted Supabase request/version/assignment records.

Required invariant:
- exactly one active Volunteer owner for active Human work;
- decline/return removes ownership;
- reassignment changes ownership atomically;
- submitted evaluator versions remain immutable history;
- post-submission reassignment/re-review creates a new version;
- Pending Moderation/Re-review may remain user-facing Processing;
- Approved is terminal.

## Permanent repository-change workflow

1. ChatGPT reads the accepted GitHub/Supabase source of truth.
2. ChatGPT interprets the current authoritative specifications.
3. ChatGPT designs and authors the finished implementation.
4. ChatGPT provides Antigravity exact branch/HEAD, exact files/patch, scope, validations, commit message, and push target.
5. Antigravity applies only that deterministic change.
6. Antigravity runs the specified validations.
7. On failure, Antigravity stops; ChatGPT authors the correction.
8. On success, Antigravity commits/pushes and returns evidence.
9. ChatGPT independently audits GitHub and connected backend state.
10. Only ChatGPT accepts the change and authorizes the next batch.

## Gate

VI-G, VII-A1 and VII-A2 have been accepted. Independently audit the documentation closeout before resuming VII-B in a new chat. Step VIII remains blocked until VII-B/C/D/E and all Step-VII exit criteria are explicitly accepted. No production deployment, DNS change, final release APK, or Gemini secret configuration belongs to this closeout.
