# Auratio Step VI-D Implementation Record v1.0

**Date:** 2026-09-07
**Status:** Supabase implementation complete; repository commit pending ChatGPT audit

## Accepted starting checkpoint

- Repository: `muhammadhossain03-byte/auratio-mvp`
- Branch: `step-vi/backend-orchestration`
- Accepted Step VI-C HEAD: `93d69de2217d68315f1cac633e86e0c7f27ac03e`
- Production Supabase project: `Auratio` (`czkbljnzcfsztfrwndsb`)

## Authoritative progress and ranking contract used

VI-D implements the private mastery and public leaderboard rules retained by the current Auratio specifications:

- only Approved evaluations have progress/ranking effects;
- private Track Mastery combines Approved AI + Human scores in the selected track;
- Overall Auratio Mastery is the mean of represented Track Mastery values;
- public AI and Human leaderboards remain separate;
- public leaderboard scope is Track + evaluation mode + period;
- qualification requires 3 Approved evaluations in scope;
- 3 Approved scores: average all 3;
- 4 Approved scores: average all 4;
- 5 or more: use the five most recent Approved scores, discard the single lowest, and average the remaining four;
- participation count is displayed but is not an ALR input;
- All-Time uses activity decay; Monthly uses `D = 1.00`;
- Monthly membership is determined by submission date, but the result counts only after approval;
- tie-break order is unrounded ALR, complete-window average, best single score, then earlier qualification timestamp.

For recency, Approved results are ordered by approval timestamp; when timestamps are identical, the lower submission UUID is treated as earlier, matching the retained submission-ID tie rule.

## Applied production migrations

1. `20260907115248_step_vi_d_progress_mastery_and_leaderboard_services.sql`
2. `20260907115624_step_vi_d_leaderboard_qualification_rank_fix.sql`
3. `20260907115827_step_vi_d_security_boundary_fix.sql`
4. `20260907115852_step_vi_d_security_boundary_fix.sql`

The first three migrations implement and harden VI-D. The fourth migration is an intentional repository mirror of an already-recorded production migration-history entry whose source is exactly `select 1;`. It has no schema or data effect. It is retained in the repository solely so the checked-in migration sequence remains byte-for-byte aligned with the production migration history.

Production migration source hashes:

- `20260907115248`: `ba344b0aef60b4d98c654799b8e8cd36903ac31f57bcecf843a9d6e95a1c82b7`
- `20260907115624`: `7069a0874df9191220f95da3b5614569a14b7f232d08925140d3b2372a298795`
- `20260907115827`: `97517ffd3496781009a74830b6a1f9268c18280849d441f801b475920a9c8076`
- `20260907115852`: `354b7196c9ba5fb4b21cf615bb6ec4cd5c07503c34229feef033fc081a8c03f4`

The four migration files in this package are byte-for-byte identical to the statement text stored by production Supabase.

## Private progress services

### `get_my_progress()`

This authenticated, `SECURITY INVOKER` read service uses the caller's Supabase identity and the accepted RLS model. It returns only the current End User's Approved progress:

- Overall Auratio Mastery;
- represented-track count;
- total Approved evaluation count;
- Approved AI/Human counts;
- per-track Track Mastery;
- per-track Approved AI/Human participation;
- latest Approved time per represented track.

Track Mastery is the arithmetic mean of every Approved AI + Human score in that track. Overall Auratio Mastery is the arithmetic mean of represented Track Mastery values, so each represented track contributes equally regardless of evaluation count.

### `get_my_approved_history(limit, offset)`

This authenticated, `SECURITY INVOKER` read service returns the caller's Approved evaluation history under RLS. It includes the user-facing track/mode, submission/approval dates, score breakdown, final score, and whether the immutable report is available.

It does not return email, Volunteer/evaluator identity, internal version number, moderation reasons, AI model/prompt provenance, leaderboard state, or audit details.

## Public leaderboard service

### Formula

`ALR = Sform × D`

`Sform`:

- 0–2 Approved evaluations: not qualified;
- 3: average all 3;
- 4: average all 4;
- 5+: among the five most recent Approved scores, discard exactly one lowest and average the remaining four.

All-Time activity decay:

- 0–30 days since latest Approved in Track+mode: `1.00`;
- 31–44: `0.95`;
- 45–58: `0.90`;
- 59–72: `0.85`;
- 73+: `0.80`.

Monthly uses `D = 1.00` and filters by the calendar month of `submissions.submitted_at` while retaining Approved-only publication gating.

The service retains four-decimal ALR precision in its response and also returns the one-decimal display value.

### Ranking and tie-breaks

Only qualified users enter the rank window. VI-D explicitly ranks the qualified set rather than assigning window ranks before qualification filtering.

Order:

1. higher unrounded ALR;
2. higher complete active score-window average, including the otherwise discarded fifth score;
3. higher best single Approved score in scope;
4. earlier qualification timestamp.

Participation is returned separately and never contributes to ALR.

## Security boundary

An initial direct authenticated `SECURITY DEFINER` leaderboard RPC was rejected by Supabase Security Advisor. VI-D was hardened before acceptance testing:

- the direct elevated authenticated leaderboard function was removed;
- the final database service is `svc_get_leaderboard(...)`;
- it is executable only by `service_role`;
- authenticated/anonymous clients cannot execute it directly;
- the caller's user ID is supplied only by the JWT-authenticated server boundary;
- private progress/history use `SECURITY INVOKER` so ordinary RLS remains authoritative.

## Deployed Edge Function

`leaderboard`

- Status: ACTIVE
- Version: 1
- `verify_jwt=true`
- Purpose: authenticated leaderboard query boundary

The function authenticates the JWT, derives the caller user ID from that session, validates Track/mode/period/month/limit inputs, and invokes the service-role-only leaderboard RPC. It never trusts a client-provided user ID or role.

## Live verification completed by ChatGPT

Production-safe transactional tests were executed directly against the connected Supabase project and rolled back. Verification covered:

- authenticated/anonymous/service-role execute boundaries;
- private progress/history `SECURITY INVOKER` behavior under actual authenticated RLS;
- exact activity-decay boundaries;
- 3-score average;
- 4-score average;
- five-most-recent sliding window;
- single-lowest discard;
- full-window-average tie-break;
- best-single-score tie-break;
- qualification-time tie-break;
- fewer-than-3 qualification exclusion;
- Monthly submission-date membership;
- Monthly `D = 1.00`;
- AI/Human mode separation;
- Track Mastery combining Approved AI + Human;
- Overall Mastery across represented tracks;
- Approved history pagination and private-field exclusion.

During live verification, a rank-gap defect caused by ranking unqualified NULL-ALR rows before filtering was detected and corrected in the second migration. The final test suite verifies qualification-only ranking.

A security review also detected the initial direct authenticated `SECURITY DEFINER` query surface. The third migration moved that elevation behind the JWT Edge Function and service-role-only RPC. The final Supabase Security Advisor result is **0 security lints**.

After all transactional fixtures rolled back:

- Auth users: 0
- Profiles: 0
- Submissions: 0
- Evaluation requests: 0
- Audit test rows: 0

## Deferred to later Step VI batches

VI-D does not implement:

- deterministic DOCX rendering/persistence;
- terminal video deletion/retry worker;
- final Step-VI adversarial/security/performance closeout;
- Flutter/portal integration.

Those remain VI-E through VI-G and Step VII.

## Acceptance gate

This record does not self-accept VI-D. Antigravity must commit/push the exact ChatGPT-authored source package. ChatGPT then independently audits the pushed GitHub commit against this package and the already-deployed Supabase state before VI-D is accepted.
