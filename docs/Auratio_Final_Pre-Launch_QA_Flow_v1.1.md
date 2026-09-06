# Auratio Final Pre-Launch QA Flow v1.1

**Date:** 2026-09-07  
**Status:** Authoritative pre-launch QA; updates deployment target

Locked sequence: **Local Integration QA → Production-like/Staging QA → Production Smoke QA → Final Launch Gate**.

## Production targets
- Android release APK; real Android-device test before final acceptance.
- React/Vite portal on **Vercel** at `https://auratio.cloud`.
- Hostinger manages domain/DNS only.
- Supabase/PostgreSQL/Auth/Storage/Edge Functions.
- Gemini direct-video AI evaluation.
- Deterministic Approved-only DOCX generation.

## Local integration
Test Auth, Paths/13 tracks, duration/upload gate, AI success/failure/no-retry, Human assignment/decline/reassign/video-player/scoring/moderation/re-review, progress/ALR/leaderboards, reports, events, roles/RLS behavior, terminal video deletion, and frontend regression.

## Production-like/staging
Use isolated data/config. Test real HTTPS, Auth redirects/email links, Storage/RLS, Edge Functions, Gemini, report generation, Android release networking, portal SPA direct routes, and complete AI/Human journeys. Fix and redeploy until zero known release-blocking defects.

## Production smoke
At `https://auratio.cloud`: HTTPS, direct route refresh, Auth, one valid submission, one AI evaluation, report access, deletion trigger, portal role Auth, one representative Human/Admin operation, forbidden route/action rejection, and no unexpected runtime errors.

## Launch gate
No open P0/P1; local/staging/production layers passed; AI/Human/moderation/report/video/Auth/RLS/progress/leaderboard/events passed; APK installs/launches on real device; final production smoke passed.
