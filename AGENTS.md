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

## Step gate
Step IV is reopened. Do not start production Supabase/backend/API/Gemini/report/deployment implementation until the Step-IV zero-known-defects gate is explicitly re-closed by ChatGPT.

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
