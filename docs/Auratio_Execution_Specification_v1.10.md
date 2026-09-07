# Auratio Execution Specification v1.10

**Date:** 2026-09-07
**Status:** Current execution plan — Step V closed; Step VI next

## Technical ownership

ChatGPT is the sole technical lead and developer. ChatGPT must author the actual implementation code, patches, complete replacement files, migration changes, test changes, prompts, and technical fixes.

Antigravity is execution-only for local/repository writes, explicit validations, commit, and push. It must not implement Auratio from broad tasks or acceptance criteria. A repository-changing Antigravity task is valid only when ChatGPT has already supplied finished files/patches or a fully deterministic mechanical edit requiring no implementation judgment.

If a requested validation fails, Antigravity reports the exact failure and stops rather than independently editing source code. ChatGPT authors the correction. ChatGPT independently audits every pushed commit before acceptance.

## Accepted completed phases

1. Step I — Concepts and Requirements: complete.
2. Step II — Wireframing: complete.
3. Step III — UI/UX Design: complete.
4. Step IV — Frontend Implementation & QA: closed / approved.
5. Step V — Supabase schema, migrations, relational integrity, canonical seed data, Storage foundation, and RLS: closed / approved.

Accepted Step-V implementation commit: `102dc424788e177601fd7683c1c2f54015ae1c78`.

## Current sequence

1. **Step VI — Backend & Orchestration**
   - privileged backend operations and lifecycle transitions;
   - Admin/Volunteer operational commands;
   - AI-request lifecycle primitives without client Gemini integration yet;
   - video-deletion worker/retry execution;
   - scoring/progress/mastery/ALR/leaderboard services;
   - deterministic Approved-only DOCX renderer/service;
   - audit and server-side invariant enforcement;
   - backend tests against the accepted Step-V schema/RLS foundation.
2. **Step VII — API/Client/AI Integration**
   - Flutter + portal ↔ Supabase integration;
   - Supabase Auth/invitation/email flows;
   - Gemini direct-video AI evaluation integration;
   - real Human assignment/evaluation flows;
   - report download/access integration;
   - resolution of the deferred cross-screen mock-state coherence issue through persisted state.
3. **Step VIII — Full-System QA**
   - local integration, adversarial role/lifecycle tests, persisted cross-role state, regression, and release-blocker closure.
4. **Step IX — Deployment & Demo Distribution**
   - deploy React/Vite portal to Vercel;
   - point Hostinger DNS for `auratio.cloud`;
   - configure HTTPS/origins/Auth callbacks;
   - build/test Android release APK;
   - production smoke and release freeze.

## Step-V source of truth

The repository contains nine migrations under `supabase/migrations/` and `supabase/tests/step_v_schema_verification.sql`. The production Supabase project is `Auratio` (`czkbljnzcfsztfrwndsb`). Do not bypass or replace the accepted schema/RLS model during Step VI without an explicit ChatGPT-authored migration and re-verification.

## Step-V persisted lifecycle baseline

Human lifecycle:
`Unassigned → Assigned → Accepted → In Evaluation → Submitted → Pending Moderation → Approved / Reopened / Rejected`, with re-review/reassignment through versioned evaluator records as specified.

AI lifecycle:
`Processing → Approved / Rejected / Cancelled`, one attempt/no retry, with cancellation winning over late output.

Approved remains terminal. Rejected/Cancelled produce no score/report/progress/leaderboard effect. Terminal states queue primary-video deletion while preserving structured/audit/report data as specified.

## Step-V deferred integration invariant

The prior `SUB-8821` mock-data coherence issue must be solved by all Volunteer/Admin/client surfaces reading the same persisted request/version/assignment state. Do not add new distributed mock-state fixes as a substitute for backend integration.

## Permanent repository-change workflow

1. ChatGPT reads the current accepted GitHub/Supabase source of truth.
2. ChatGPT interprets the authoritative specifications.
3. ChatGPT designs and authors the finished implementation.
4. ChatGPT provides Antigravity exact starting branch/HEAD, exact files/patch, allowed scope, validations, commit message, and push target.
5. Antigravity applies only the supplied deterministic change.
6. Antigravity runs only the requested validations.
7. On failure, Antigravity stops and reports; ChatGPT authors the correction.
8. On success, Antigravity commits/pushes and returns evidence.
9. ChatGPT independently audits the pushed GitHub commit and connected Supabase state where applicable.
10. Only ChatGPT accepts the change or authors the next correction.

## Gate

Step VI is authorized after the Step-V closeout documentation commit is independently accepted. Step VII remains blocked until Step VI receives explicit ChatGPT acceptance.
