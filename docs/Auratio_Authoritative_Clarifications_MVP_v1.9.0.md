# AURATIO — AUTHORITATIVE CLARIFICATIONS & MVP SOURCE OF TRUTH

**Version:** 1.9.0  
**Date:** 2026-09-07  
**Status:** Highest-priority MVP clarification layer

## 1. Product identity and scope

Auratio — **Where Greats Orate** — is an MVP for specialized English communication performance evaluation, progress tracking, mode-separated public leaderboards, and Bangladesh event discovery. Long-term curriculum/organization ambitions remain future vision, not MVP scope.

Core paths: Public Speaking, Professional Presenting, Content Creation. All 13 tracks remain available regardless of selected Path preferences.

## 2. Architecture

- End-user app: cross-platform Flutter (Riverpod + go_router).
- Authorized portal: React + TypeScript + Vite + React Router.
- System of record: Supabase/PostgreSQL.
- Auth/Storage/platform capabilities: Supabase.
- Primary privileged server-side layer: Supabase Edge Functions.
- AI evaluator: Gemini API, invoked only server-side.
- Web portal runtime: **Vercel**.
- Production origin: **https://auratio.cloud**.
- Hostinger remains the domain/DNS provider; DNS points `auratio.cloud` to Vercel. The Hostinger shared hosting plan is not the production portal runtime under the current decision.
- Academic mobile distribution: installable Android release APK; Play Store publication is optional future work.

## 3. Development authority model

ChatGPT is the sole technical lead for Auratio: architecture, code/design decisions, AI prompt/rubric design, backend logic, QA acceptance, documentation, and change approval.

Antigravity is **execution-only** for the limitation that regular ChatGPT cannot directly write/commit/push to GitHub. It may apply exact files/patches/instructions, run explicitly requested mechanical validations, commit, push, and return evidence. It must not independently redesign, refactor, reinterpret requirements, invent fixes, or continue to another task.

After every Antigravity push, ChatGPT independently reads/audits the GitHub commit before accepting it.

## 4. Root Super Admin

Initial protected root account:
- Name: Muhammad Rafid Hossain
- Email: muhammad.hossain03@northsouth.edu

The root account cannot be deleted or demoted through ordinary product flows.

## 5. Submission/video rules

- Existing `.mp4` upload; no in-app recorder.
- Speaker visibility required.
- Server-side track duration gate is authoritative.
- One active evaluation request per user.
- Exact/near duplicate recordings are allowed; no duplicate-prevention gate.
- Video is temporary and retained while evaluation/moderation requires it.
- Delete the primary stored video after terminal **Approved, Rejected, or Cancelled**; deletion failures are retried/logged operationally.

## 6. Evaluation modes and common scoring

AI and Human Evaluation use the same 100-point architecture:
- Universal Delivery: 40 (8 × 5)
- Structural Flow: 20 (4 × 5)
- Track Specialisation: 40 (4 × 10)

Every criterion uses criterion-specific Low / Competent / Excellent anchors. **v1.9 change:** anchors now define mandatory numeric bands:
- 5-point criteria: Low 0–2; Competent 3–4; Excellent 5
- 10-point criteria: Low 0–4; Competent 5–8; Excellent 9–10

Human and AI must use the same canonical anchor prose. Human UI restricts score entry to the selected anchor’s band; backend validation enforces it again.

Every criterion requires one primary timestamp, evidence, exactly one strength, exactly one weakness, and exactly one actionable improvement. Each evaluation has one Overall Summary.

## 7. Human Evaluation

- Volunteer receives minimum necessary context and the original video.
- Volunteer player must support play/pause, seek/scrub, volume, and **fullscreen**.
- Volunteer selects anchor first, then a compatible integer score.
- Volunteer writes the Overall Summary manually.
- Submitted evaluator versions lock and become immutable.
- Formal re-review creates vN+1 while preserving prior versions.
- Admin may reassign to another eligible Volunteer **at any point before Approved**. Reassignment revokes former active ownership and preserves provenance.
- Volunteer may decline/return an assignment with a required reason; an effectively unassessable video may use the same return lifecycle rather than fabricated scoring.

Moderation remains conditional: first Human evaluation in a track requires Admin review; later Human scores may auto-approve unless the >15-point prior-approved-Human baseline anomaly or another validity rule triggers moderation.

## 8. Admin termination controls

Before Approved, Admin may terminate an evaluation with a mandatory internal reason:
- Human Unassigned / Assigned / Accepted / In Evaluation → **Cancel Request**.
- Human Submitted / Pending Moderation / Re-review / Reopened → **Reject Evaluation**.
- AI Processing → **Cancel**.

Approved is terminal in the MVP. Internal Admin cancellation/rejection reasons are visible to Admin/Super Admin audit context, not to the user or Volunteer.

## 9. AI Evaluation

The dedicated `docs/ai/` package is authoritative.

Locked behavior:
- Gemini evaluates the original video directly with audio + visuals.
- User-selected track is authoritative.
- Exactly 16 criteria: 8 + 4 + selected track 4.
- No other track rubrics sent.
- No full transcript generated/stored.
- No speaker name/email/history/prior scores/leaderboard/mastery sent.
- No external fact-checking.
- No unsupported inference.
- Accent/personal characteristics are not scoring factors.
- Unrelated production quality is not scored unless directly relevant/assessability-affecting.
- JSON only.
- One attempt only; **no retry** and no Admin rerun.
- Valid usable output auto-approves after server validation.
- Unassessable/invalid/malformed/API failure → Rejected, no score/report/product effect.
- Admin cancellation during Processing wins; late AI result is ignored.
- AI generates the Overall Summary from criterion findings.

## 10. Reports

Official user report is `.docx`, backend-generated deterministically from Approved structured data only. AI and Human use the same renderer/structure.

Filename:
`Auratio_<TrackSlug>_<Mode>_Submission-<ID>_v<version>.docx`

Filename excludes speaker name and report date. Report body excludes email and internal evaluation version. Speaker display name may appear in body. Timestamps are plain text, not video deep links. Approved report is generated once and can be re-downloaded unlimited times.

## 11. Progress and leaderboards

Only Approved evaluations affect private mastery, public qualification/ranking, or official report state. Public AI/Human leaderboards remain separated. Private mastery combines Approved AI + Human results using the existing formulas. ALR, 3-evaluation qualification, monthly submission-date attribution, sliding window, decay, and tie-break rules remain as in Scoring v3.8.

## 12. Events

Admin-curated, Bangladesh-only event directory. Users are viewers only. Division, Path, and Date filters remain the MVP discovery controls.

## 13. User-facing status simplification

Internal Pending Moderation and Re-review/Reopened can remain user-facing **Processing**. Terminal states visible to user include Approved, Rejected, and Cancelled as applicable.

## 14. Precedence

This v1.9.0 file supersedes Clarifications v1.8.2 wherever they conflict. Dedicated AI, report, scoring, deployment, and QA specifications referenced by `CURRENT.md` govern their domains.
