# AGENTS.md — Auratio

## Authority
- ChatGPT is the sole technical lead for Auratio.
- Read `docs/CURRENT.md` first and follow its precedence order.
- Written current specifications override stale historical files and, for semantics, stale Figma affordances.

## Antigravity execution-only rule
Antigravity may only apply the exact task/patch/files supplied by ChatGPT, run explicitly requested validation commands, show diff/status, commit with the supplied message, push the supplied branch, return the full SHA/results/errors, and stop.

Do not independently redesign, reinterpret, optimize, refactor outside scope, fix unrelated failures, change architecture, or start another task.

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
