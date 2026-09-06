# Auratio Execution Specification v1.9

**Date:** 2026-09-07  
**Status:** Current execution plan

## Technical ownership

ChatGPT is the sole technical lead **and developer**. ChatGPT must author the actual implementation code, patches, complete replacement files, test changes, and technical fixes.

Antigravity is execution-only for local/repository writes, explicit validations, commit, and push. It must not implement Auratio from broad tasks or acceptance criteria. A repository-changing Antigravity task is valid only when ChatGPT has already supplied a finished patch/files or a fully deterministic mechanical edit requiring no implementation judgment.

If a requested validation fails, Antigravity reports the exact failure and stops rather than independently editing source code. ChatGPT authors the correction.

ChatGPT verifies every pushed commit before acceptance.

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

## Permanent repository-change workflow

For every code or specification change:

1. ChatGPT reads the current accepted GitHub state.
2. ChatGPT interprets the authoritative specifications.
3. ChatGPT designs and **authors the actual finished implementation**.
4. ChatGPT provides Antigravity:
   - exact repository/branch/starting HEAD;
   - exact patch or complete replacement files, or a deterministic mechanical edit;
   - exact allowed file scope;
   - exact validation commands;
   - exact commit message;
   - exact push target.
5. Antigravity applies the supplied change exactly.
6. Antigravity runs only the requested validations.
7. On validation failure, Antigravity stops and reports; it does not independently fix code.
8. On success, Antigravity shows diff/status, commits, pushes, returns the full SHA/results, and stops.
9. ChatGPT reads and audits the pushed GitHub commit.
10. Only ChatGPT can accept the change or author the next correction.

## Git discipline

Each Antigravity task is narrowly scoped, starts from an exact branch/HEAD, modifies only the exact ChatGPT-authored files/patch, runs only requested validations, shows diff/status, commits with the supplied message, pushes, returns full SHA/status/errors, and stops.

**Prohibited:** sending Antigravity a broad development prompt and asking it to determine how to code the solution. Broad development work must be completed by ChatGPT first.
