# Auratio Execution Specification v1.9

**Date:** 2026-09-07  
**Status:** Current execution plan

## Technical ownership
ChatGPT is the sole technical lead. Antigravity is execution-only for local/repository writes, explicit validations, commit, and push. ChatGPT verifies every pushed commit before acceptance.

## Current sequence
1. Finish/re-close Step IV against newly locked frontend requirements.
2. Step V — Supabase database schema + migrations + RLS foundation.
3. Step VI — backend/Edge Function lifecycle operations, role enforcement, storage lifecycle, scoring/progress/ALR/report orchestration.
4. Step VII — API/integration: Flutter + portal ↔ Supabase, Gemini direct-video evaluation, Auth/email flows, report generation.
5. Step VIII — full-system QA.
6. Step IX — deploy React/Vite portal to Vercel; point Hostinger DNS for `auratio.cloud`; configure HTTPS/origins/Auth callbacks.
7. Build/test Android release APK.
8. Production smoke + evaluator/demo release freeze.

## Step-IV re-close changes now required
The current remote branch already contains repairs for the earlier reopened/completed Volunteer entity-integrity defects and the REQ-1042 cross-role decline/reassignment state. The following newly locked frontend requirements still need implementation/verification before Step IV can close:
- enforce anchor-score compatibility bands in Human scoring UI/local validation;
- display the exact canonical criterion-specific Low/Competent/Excellent descriptions;
- provide original-video playback in Volunteer evaluation with seek, volume, and fullscreen;
- ensure Admin pre-Approved reassignment/termination controls and labels match v1.9 lifecycle semantics;
- rerun final portal/mobile regression after the last frontend change.

Do not begin Step V until Step IV passes the zero-known-defects gate.

## Git discipline
Each Antigravity task is narrowly scoped, starts from an exact branch/HEAD, modifies only named files/scope, runs only requested validations, shows diff/status, commits with supplied message, pushes, returns full SHA/status/errors, and stops. ChatGPT audits the resulting commit.
