# Auratio MVP Concepts & Requirements v1.9

**Date:** 2026-09-07  
**Status:** Current implementation-oriented requirements

## Product
Auratio — Where Greats Orate — serves Public Speakers, Professional Presenters, and Content Creators across 13 specialized tracks. MVP features: video submission, AI/Human standardized evaluation, private progress, separate AI/Human public leaderboards, Admin-curated Bangladesh events, user report access, and role-governed portal operations.

## Clients
- Flutter end-user app.
- React/TypeScript/Vite portal shared by Volunteer, Admin, and Super Admin with role-aware authentication/authorization.

## Backend
Supabase/PostgreSQL, Supabase Auth, Storage, Edge Functions, and related platform services. Server-side authorization/RLS is mandatory; client hiding is not security.

## Evaluation
- Existing speaker-visible `.mp4`.
- Track duration gate server-side.
- One active request per user.
- AI or Human mode; mode redirection requires end-user consent.
- 100 points = 40 Universal + 20 Structural + 40 Track.
- Anchor-first compatible score bands.
- Per-criterion timestamp/evidence/strength/weakness/actionable improvement + Overall Summary.
- Human summary is manual; AI summary is generated.
- Approved-only product effects/report.

## AI
Gemini direct-video, strict JSON, no transcript, no external fact-checking, no identity/history context, one attempt, no retry, valid result auto-approves, failure/unassessable/invalid → Rejected.

## Human portal
Admin-controlled assignment/reassignment; Volunteer accept/decline/return; embedded original-video player with seek/volume/fullscreen; same canonical anchors as AI; immutable submitted versions; conditional moderation; formal re-review/versioning.

## Admin governance
Super Admin → Admin → Volunteer. Protected root Super Admin: Muhammad Rafid Hossain / muhammad.hossain03@northsouth.edu. Admin can manage Volunteers/events/evaluations. Before Approved, Admin can reassign Human work or terminate requests/evaluations under the lifecycle rules. Approved is terminal.

## Progress/rankings
Private mastery combines Approved AI + Human. Public leaderboards keep AI/Human separate. Existing ALR sliding-window, decay, monthly, qualification, and tie-break rules apply.

## Reports
Approved-only deterministic DOCX; one immutable report, unlimited re-download; no full transcript; user-facing details per report specification.

## Deployment
Portal on Vercel at `https://auratio.cloud`; Hostinger provides domain/DNS. Backend on Supabase. Academic mobile release is a direct Android APK.
