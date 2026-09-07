# AGENTS.md — Auratio

## Authority
- ChatGPT is the sole technical lead and developer for Auratio.
- Read `docs/CURRENT.md` first and follow its precedence order.
- Written current specifications override stale historical files and, for semantics, stale Figma affordances.

## ChatGPT-authored code gate
All Auratio implementation code, patches, complete replacement files, test changes, schema changes, prompts, specifications, and technical fixes must be authored by ChatGPT before Antigravity is asked to change the repository.

Antigravity must never implement Auratio from a broad task description, feature request, bug description, acceptance criteria, or design brief. A repository-changing Antigravity task is valid only when ChatGPT has already supplied the exact finished patch/file contents or an equivalently deterministic mechanical transformation.

If an Antigravity instruction would require implementation judgment, Antigravity must stop and report that the task requires a ChatGPT-authored package.

## Antigravity execution-only rule
Antigravity may only:
- verify the exact branch/HEAD and clean working-tree preconditions supplied by ChatGPT;
- apply the exact ChatGPT-authored patch/files or deterministic transformation;
- run explicitly requested validations;
- show diff/status;
- report validation failures without independently editing code;
- commit with the supplied message;
- push the supplied branch;
- return the requested evidence/full SHA;
- stop.

Antigravity must not independently redesign, reinterpret, optimize, refactor, troubleshoot by editing, fix unrelated failures, change architecture, choose implementation details, invent fixes, or start another task.

## Acceptance rule
An Antigravity commit is never accepted merely because Antigravity reports success. ChatGPT must independently inspect the pushed GitHub commit/diff and explicitly accept it.

## Current branch and accepted checkpoint
`step-vii/api-client-ai-integration`

The branch already exists. Do not recreate it or switch back to Step VI.

- Accepted Step-VI closeout: `dbdbef671cb0916f6657d678191eecc27d5056ee`.
- Accepted VII-A1: `715e92ca71a309358740f26f779e45edabd045cc`.
- Accepted VII-A2 implementation: `02354879b9fda65ea9bf3c66d404e9a12a06b77c`.
- VII-A1 + VII-A2 = **VII-A CLOSED / APPROVED**.
- Read `docs/Auratio_Step_VII_A_Closeout_Record_v1.0.md` and `docs/Auratio_Step_VII_Implementation_Handoff_v1.1.md` for audit evidence and deferred work.

This documentation closeout is based exactly on the accepted A2 implementation commit. Its own resulting commit must be independently audited. Once accepted, that documentation commit is the new-chat branch HEAD; the A2 SHA above remains the implementation checkpoint. Do not substitute the A2 SHA for a later accepted documentation HEAD.

The user requested that this chat stop after VII-A closeout. **Do not begin VII-B here.** A fresh chat may resume VII-B after verifying the branch and latest accepted documentation commit. No new branch is required.

## Local filesystem convention
- `D:\auratio-mvp\` is the actual Auratio Git working repository used by Antigravity.
- `E:\Auratio_<Package_Name>\` is the standard extraction location for ChatGPT-authored transfer/execution packages.
- ChatGPT-authored ZIP/packages must not be extracted directly into `D:\auratio-mvp\` unless ChatGPT explicitly instructs otherwise.
- Antigravity mechanically copies the package from `E:\` into `D:\auratio-mvp\` only through the supplied instructions.
- Temporary package folders on `E:\` may be deleted only after the corresponding GitHub commit has been independently inspected and accepted by ChatGPT.
- Never delete, replace, or treat `D:\auratio-mvp\` as a temporary extraction folder.

## Step gate
Steps I-VI are CLOSED / APPROVED. VII-A is CLOSED / APPROVED within its documented integration-foundation and Auth/profile/role-routing scope.

Step VII overall remains IN PROGRESS. VII-B through VII-E remain unimplemented in this checkpoint. Step VIII remains blocked until all of Step VII is explicitly accepted; deployment/distribution remains Step IX.

VII-A acceptance does not claim live cross-client Auth/email E2E, production callback configuration, full sign-out/session-change UX, or complete password-recovery/invitation flows. Those remain explicit Step-VII completion gates in the current handoff.

The deferred `SUB-8821` mock-state coherence issue is a mandatory Step-VII persisted-state integration invariant. Do not repair it with new distributed mock state unless a genuine frontend defect is independently proven.

## Accepted Step-V foundation
- Production Supabase project: `Auratio` (`czkbljnzcfsztfrwndsb`).
- Accepted Step-V implementation commit: `102dc424788e177601fd7683c1c2f54015ae1c78`.
- Canonical 3 Paths / 13 Tracks / 64 criteria / 192 anchors.
- 19 RLS-enabled public Auratio tables.
- 2 private Storage buckets.

## Step-VI accepted implementation checkpoints
- VI-A Identity/Staff: `6343d0e10d9985a77110230ae94e7d50c5ff5014`.
- VI-B Human lifecycle: `e9b72af69cce980c15b670beab2440fc2bba2a1e`.
- VI-C AI lifecycle/validation boundary: `93d69de2217d68315f1cac633e86e0c7f27ac03e`.
- VI-D Progress/Mastery/Leaderboard: `c15b5ffce32c5d6c29aeb49b3acddb79df2d7af8`.
- VI-E Deterministic DOCX service: `b51aa3feb544aa9cb57d0b07fdb61ef517c548a4`.
- VI-F Video cleanup/adversarial backend QA: `fa25ccfaad1643b7e5ecac111c972ea40d2abbfe`.

- VI-G accepted closeout: `dbdbef671cb0916f6657d678191eecc27d5056ee`.

At the 2026-09-07 VII-A closeout read-only check: 24 migrations through `20260907133302_step_vi_f_video_deletion_worker`; 9 ACTIVE JWT-verified Edge Functions; 19 RLS tables; 28 privileged `svc_*` RPCs with no authenticated direct execution and no missing service-role grants; 2 private MIME-restricted buckets; Security Advisor: 0 lints. VII-A and this documentation closeout introduce no migration, deployment, or secret change.

## Locked Step-VII Gemini credential decision
For the MVP, use exactly one Gemini API key unless ChatGPT/user explicitly changes the decision later.

The key must be stored server-side only as a Supabase secret/environment secret. Never commit it and never expose it to Flutter, React, Vercel client bundles, logs, or user-visible payloads. Multiple keys are not required for the MVP.

## Locked stack
- Flutter + Riverpod + go_router
- React + TypeScript + Vite + React Router
- Supabase/PostgreSQL/Auth/Storage/Edge Functions
- Gemini server-side AI evaluator
- Vercel web runtime at `https://auratio.cloud`
- Hostinger domain/DNS
- Android release APK for academic demo

## Secrets
Never commit Gemini keys, Supabase service-role secrets, passwords, privileged tokens, or equivalent credentials. No privileged secret may be exposed to Flutter/React client code.

## Validation commands
Use the exact batch-specific commands supplied by ChatGPT. Each native command must be checked independently for its exit code; STOP on the first failure. A semicolon chain does not provide fail-fast behavior in PowerShell.

Documentation-only packages require their supplied content/hash/scope/Git checks; do not reinstall dependencies or rerun frontend/backend suites without a concrete reason.

For a full frontend validation, the baseline commands are below. The formatter path list must be scoped by the current package when a known unrelated formatter mismatch exists. The existing `mobile/test/final_step_iv_reclose_test.dart` mismatch recorded during A1 is not authorization to rewrite that accepted Step-IV file. Formatting in write mode requires an explicitly authored deterministic operation.

Mobile:
```sh
cd mobile
flutter pub get
dart format --output=none --set-exit-if-changed lib test
flutter analyze
flutter test
```

Portal:
```sh
cd portal
npm ci
npm run lint
npm run build
npm run test
npx playwright test
```

Backend/Supabase validation is task-specific and must use the exact queries/commands supplied by ChatGPT. Runtime/visual QA remains required after meaningful frontend changes; automated tests do not replace it.
