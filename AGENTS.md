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

## Local filesystem convention
- `D:\\auratio-mvp\\` is the actual Auratio Git working repository used by Antigravity.
- `E:\\Auratio_<Package_Name>\\` is the standard extraction location for ChatGPT-authored transfer/execution packages.
- ChatGPT-authored ZIP/packages must not be extracted directly into `D:\\auratio-mvp\\` unless ChatGPT explicitly instructs otherwise.
- Antigravity mechanically applies/copies the ChatGPT-authored package from `E:\\` into `D:\\auratio-mvp\\` only through the exact supplied execution instructions.
- Temporary package folders on `E:\\` may be deleted only after the corresponding GitHub commit has been independently inspected and accepted by ChatGPT.
- Never delete, replace, or treat `D:\\auratio-mvp\\` as a temporary extraction folder.

## Step gate
Step IV is CLOSED / APPROVED. Step V — Supabase schema, migrations, relational integrity, and RLS — is authorized.

Do not begin Step VI backend/orchestration implementation until Step V is explicitly accepted by ChatGPT. The deferred Volunteer Human-evaluation mock-state coherence issue must be resolved through the real persisted lifecycle during Step V/VI/VII integration, not by reopening mock-only frontend patching unless a genuine frontend defect is proven.

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
When ChatGPT requests full validation:

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

Runtime/visual QA is still required after meaningful frontend changes; automated tests do not replace it.
