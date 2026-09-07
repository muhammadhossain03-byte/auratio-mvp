# Auratio Step V Implementation Handoff v1.0

**Date:** 2026-09-07  
**Status:** Step IV closed; Step V authorized

## Purpose
This is the starting handoff for **Step V — Supabase schema, migrations, relational integrity, and Row Level Security**.

Do not reopen Step IV unless a real integration defect proves that a frontend behavior cannot be implemented correctly against the locked product semantics.

## Starting repository checkpoint
- repo: `muhammadhossain03-byte/auratio-mvp`
- branch at Step-IV closeout: `step-iv/ui-foundation`
- accepted pre-closeout code HEAD: `257ac4d3b23572fe0eaf516bdf8b28567ee589a8`
- commit: `test(step-iv): stabilize canonical evaluation captures`

After the documentation-closeout commit is accepted, Step V should branch from that final accepted HEAD.

## Step IV accepted baseline
- 41 canonical mobile screens.
- 52 canonical portal/auth screens.
- 4 supplemental v1.9 Admin lifecycle screens.
- Flutter: 316/316 PASS.
- final mobile re-close: 2/2 PASS.
- Playwright: 85/85 PASS.
- final visual audit accepted.
- final short human acceptance smoke accepted.

## Important deferred integration verification
Frontend mock data showed a non-blocking coherence issue around `SUB-8821`: active-assignment ownership/status and submitted-history/moderation status can diverge across mock-driven screens.

Do **not** patch that with more frontend mock-state logic.

Step V/VI must instead establish one authoritative persisted lifecycle that every role reads from.

Mandatory persisted lifecycle:
`Assigned → Accepted → In Evaluation → Submitted → Pending Moderation → Approved / Reopened / Rejected`

Also support:
- Unassigned;
- Declined/returned-to-Admin queue;
- Cancelled;
- versioned re-review/reassignment;
- AI Processing → Approved/Rejected/Cancelled.

## Step V objective
Design and implement the production Supabase database foundation so later backend/client integration can enforce all locked Auratio semantics without duplicating state in clients.

Step V is primarily:
- PostgreSQL schema;
- enums/domains where appropriate;
- tables and relationships;
- keys and unique constraints;
- check constraints;
- indexes;
- timestamp/version/audit fields;
- Row Level Security enablement and policies;
- seed/reference data required for stable canonical track/criterion identifiers;
- migrations;
- schema/RLS tests or verification queries.

Step V is **not** the phase for completing Gemini orchestration, DOCX generation, final email flows, Vercel deployment, or full client integration.

## Core entities the schema must support
At minimum, the Step-V design must account for:
- user/profile identity;
- role model: End User, Volunteer, Admin, Super Admin;
- Admin invitations and Volunteer invitations;
- user-selected Paths;
- 13 canonical Tracks and Path↔Track classification;
- submissions;
- uploaded-video metadata/storage reference;
- evaluation requests;
- evaluation mode: AI/Human;
- Human assignment ownership and assignment state;
- evaluator versions;
- criterion-level evaluation results;
- Overall Summary;
- moderation/re-review lifecycle;
- internal Admin/Super reasons for reassignment/rejection/cancellation;
- immutable Approved evaluation result;
- report metadata/reference;
- events;
- audit trail;
- progress/leaderboard source records or sufficient normalized data to compute them deterministically.

## Human lifecycle invariants
Schema and policies must make these states representable and enforceable:

### Before submission
- Unassigned → Assigned → Accepted → In Evaluation.
- one active Volunteer owner only;
- Volunteer may Accept or Decline;
- Decline reason returns request to Admin Unassigned;
- Admin may assign/reassign before Approved;
- Admin may Cancel before submission.

### Submitted / moderation
- Submitted evaluator version is immutable;
- first Human evaluation in a track goes to Admin review;
- later Human evaluation may auto-approve unless moderation trigger applies;
- Pending Moderation may be Approved, Reopened/Re-review, Reassigned through a new version, or Rejected;
- re-review/reassignment after submission creates `vN+1`; prior submitted version remains immutable;
- Approved is terminal.

### Visibility/product effect
- Pending Moderation / Re-review / Reopened are user-facing Processing states where specified;
- Rejected/Cancelled remain history records;
- Rejected/Cancelled produce no score, DOCX, mastery/progress, or leaderboard impact;
- final Human user-facing result is the final Approved evaluator version.

## AI lifecycle invariants
- one Gemini attempt only;
- no retry;
- Processing can be Cancelled by Admin;
- late result after cancellation is ignored;
- valid usable structured result → Approved;
- unassessable/API/malformed/incomplete/invalid result → Rejected;
- provenance is internal;
- only selected-track rubric is evaluated.

## Video-retention invariant
Video is temporary.
After a terminal Approved/Rejected/Cancelled decision:
- delete the primary video object;
- preserve metadata/audit/assignment history/internal reasons;
- preserve structured evaluation result where applicable;
- preserve Approved DOCX;
- deletion failures must be retryable/logged later in backend work.

Step V must model the data so Step VI can implement this safely.

## Scoring data model requirements
Each Approved evaluation must support exactly 16 criterion records:
- 8 universal × max 5;
- 4 structural × max 5;
- 4 selected-track × max 10.

Each criterion result must persist:
- criterion stable ID;
- anchor: Low / Competent / Excellent;
- integer score;
- primary timestamp;
- evidence;
- strength;
- weakness;
- actionable improvement.

Human and AI share criterion identifiers and canonical anchor descriptions.

Backend arithmetic will remain authoritative.

## Progress/leaderboard requirements to preserve
Public leaderboards are separate by:
- track;
- AI/Human mode;
- All-Time/Monthly period.

Qualification:
- 3 Approved evaluations.

Window:
- 3 → average all 3;
- 4 → average all 4;
- 5+ → latest 5, discard one lowest, average remaining 4.

Only Approved evaluations contribute.

Private mastery can combine Approved AI and Human data but remains user-only.

The database should retain enough normalized timestamps, mode, track, status, score, and ownership data to reproduce these calculations deterministically.

## RLS principles
- Clients never receive Supabase service-role or Gemini secrets.
- End Users can access only their own private submission/evaluation/report/progress data plus intentionally public leaderboard/event data.
- Volunteers can access only assignments they are authorized to evaluate plus their own allowed history.
- Admins can manage operational evaluation/event/Volunteer data according to locked product semantics.
- Super Admin has Admin capabilities plus Admin-account management.
- Internal moderation/reassignment/cancellation reasons must never be exposed to End Users or Volunteers unless a specification explicitly allows it.
- RLS must not rely on client-supplied role claims that users can forge.

Exact policies must be authored and audited in Step V.

## Canonical reference data
The schema should preserve stable canonical identifiers for:
- 3 Paths;
- 13 Tracks;
- 64 criteria;
- 192 anchor descriptions.

Use the authoritative current documents and `docs/ai/rubrics-and-anchors-v1.json`; do not invent alternate criterion IDs or prose.

## Required Step-V workflow
1. ChatGPT reads `docs/CURRENT.md` and this handoff.
2. Inspect repository/Supabase current state read-only.
3. ChatGPT designs the schema and migration plan.
4. ChatGPT authors exact SQL/migrations/tests/policies.
5. Antigravity only applies finished ChatGPT-authored repository changes and runs exact validation commands.
6. Any validation failure returns to ChatGPT; Antigravity must not fix it independently.
7. ChatGPT audits the pushed GitHub commit.
8. Supabase changes must be verified against the exact migration source and expected schema.
9. Do not begin Step VI until Step V has explicit ChatGPT acceptance.

## Step V exit criteria
Step V closes only when:
- migration files are committed and reproducible from a clean database;
- required tables/enums/constraints/indexes are present;
- canonical reference data loads deterministically;
- RLS is enabled where required;
- policies pass role/ownership boundary tests;
- one-active-owner and version/lifecycle relational invariants are represented/enforced at the database layer where appropriate;
- no secrets are committed;
- schema verification is clean;
- ChatGPT independently accepts the GitHub and Supabase state.

## Execution model
ChatGPT remains sole technical lead and developer.

Antigravity remains an execution-only repository/Git operator:
- exact branch/HEAD verification;
- apply ChatGPT-authored package;
- run supplied commands;
- report failures;
- commit/push supplied changes;
- stop.

Antigravity must not design the Step-V schema or RLS policies.
