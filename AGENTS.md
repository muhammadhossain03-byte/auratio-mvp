# AGENTS.md — Auratio

## Authority
- ChatGPT is the sole technical lead and developer for Auratio.
- Read `docs/CURRENT.md` first and follow its precedence order.
- Written current specifications override stale historical files and, for semantics, stale Figma affordances.

## ChatGPT-authored code gate
All Auratio implementation code, patches, complete replacement files, test changes, schema changes, prompts, specifications, and technical fixes must be authored by ChatGPT before Antigravity is asked to change the repository.

Antigravity must never implement Auratio from a broad task description, feature request, bug description, acceptance criteria, or design brief. A repository-changing Antigravity task is valid only when ChatGPT has already supplied the exact finished patch/file contents or an equivalently deterministic mechanical transformation.

If an Antigravity instruction would require Antigravity to decide how to implement, redesign, refactor, troubleshoot, or invent code, Antigravity must stop and report that the task requires a ChatGPT-authored implementation package.

## Antigravity execution-only rule
Antigravity may only:
- verify the exact branch/HEAD and clean working-tree preconditions supplied by ChatGPT;
- apply the exact ChatGPT-authored patch/files or deterministic mechanical transformation;
- run explicitly requested validation commands;
- show diff/status;
- report validation failures without independently changing code to fix them;
- commit with the supplied message;
- push the supplied branch;
- return the full SHA/results/errors;
- stop.

Antigravity must not independently redesign, reinterpret, optimize, refactor, troubleshoot by editing code, fix unrelated failures, change architecture, choose implementation details, invent fixes, or start another task.

## Acceptance rule
An Antigravity commit is never accepted merely because Antigravity reports success. ChatGPT must independently inspect the pushed GitHub commit/diff and explicitly accept it.

## Current branch
`step-iv/ui-foundation`

The next development branch, after the Step-V documentation closeout commit is independently accepted, should be created as `step-vi/backend-orchestration` from that accepted HEAD.

## Local filesystem convention
- `D:\auratio-mvp\` is the actual Auratio Git working repository used by Antigravity.
- `E:\Auratio_<Package_Name>\` is the standard extraction location for ChatGPT-authored transfer/execution packages.
- ChatGPT-authored ZIP/packages must not be extracted directly into `D:\auratio-mvp\` unless ChatGPT explicitly instructs otherwise.
- Antigravity mechanically applies/copies the ChatGPT-authored package from `E:\` into `D:\auratio-mvp\` only through the exact supplied execution instructions.
- Temporary package folders on `E:\` may be deleted only after the corresponding GitHub commit has been independently inspected and accepted by ChatGPT.
- Never delete, replace, or treat `D:\auratio-mvp\` as a temporary extraction folder.

## Step gate
Steps I–V are CLOSED / APPROVED.

Step VI — backend lifecycle/orchestration, privileged operations, scoring/progress/leaderboard/report services, and storage-lifecycle execution — is authorized after this documentation closeout commit is independently accepted by ChatGPT.

Do not begin Step VII client/API/Gemini integration until Step VI is explicitly accepted by ChatGPT. The deferred Volunteer Human-evaluation mock-state coherence issue must be resolved through the single persisted Supabase lifecycle during Step VI/VII integration, not by reopening mock-only frontend patching unless a genuine frontend defect is proven.

## Accepted Step-V foundation
- Production Supabase project: `Auratio` (`czkbljnzcfsztfrwndsb`).
- Accepted Step-V implementation commit: `102dc424788e177601fd7683c1c2f54015ae1c78`.
- Nine reproducible migrations under `supabase/migrations/`.
- Verification suite under `supabase/tests/step_v_schema_verification.sql`.
- Canonical 3 Paths, 13 Tracks, 64 criteria, 192 anchors.
- 19 RLS-enabled Auratio public tables and 2 private Storage buckets.
- Security Advisor: zero security lints at Step-V acceptance.

## Locked stack
- Flutter + Riverpod + go_router
- React + TypeScript + Vite + React Router
- Supabase/PostgreSQL/Auth/Storage/Edge Functions
- Gemini server-side AI evaluator
- Vercel web runtime at `https://auratio.cloud`
- Hostinger domain/DNS
- Android release APK for academic demo

## Secrets
Never commit Gemini keys, Supabase service-role secrets, passwords, or privileged credentials. No privileged secret may be exposed to Flutter/React client code.

## Validation commands
When ChatGPT requests full frontend validation:

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

Backend/Supabase validation is task-specific and must use the exact commands/queries supplied by ChatGPT. Runtime/visual QA remains required after meaningful frontend changes; automated tests do not replace it.
