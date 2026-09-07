# Auratio Current Documentation Index

**Date:** 2026-09-08
**Status:** Steps I-VI CLOSED / APPROVED; VII-A CLOSED / APPROVED; VII-B CLOSED / APPROVED; Step VII overall IN PROGRESS; VII-C next in a fresh chat

Use the documents below in this order when implementing or reviewing Auratio. Where an older file conflicts, the newer/current file wins.

## Current authority order

1. `Auratio_Authoritative_Clarifications_MVP_v1.9.0.md`
2. `Auratio_Scoring_and_Leaderboard_System_Specification_v3.8.md`
3. `ai/Auratio_AI_Evaluation_Specification_v1.0.md` + its prompt/schema/rubric assets
4. `Auratio_DOCX_Report_Generation_Specification_v1.0.md`
5. `Auratio_MVP_Deployment_and_Demo_Distribution_Addendum_v1.2.md`
6. `Auratio_MVP_Concepts_and_Requirements_v1.9.md`
7. `Auratio_Execution_Specification_v1.12.md`
8. `Auratio_MVP_Path_Selection_Addendum_v1.0.txt`
9. `Auratio_Final_Pre-Launch_QA_Flow_v1.1.md`
10. `Project-Status-2026-09-08-v16.md`
11. `Auratio_Step_VII_Implementation_Handoff_v1.2.md`
12. `Auratio_Step_VII_B_Closeout_Record_v1.0.md`
13. `Auratio_Step_VII_A_Closeout_Record_v1.0.md` and the accepted VII-A1/A2 implementation records
14. `Auratio_Step_VI_Closeout_Record_v1.0.md`
15. `Auratio_Step_VI_Implementation_Handoff_v1.0.md`
16. Step-VI batch implementation records `Auratio_Step_VI_A_Implementation_Record_v1.0.md` through `Auratio_Step_VI_F_Implementation_Record_v1.0.md`
17. `Auratio_Step_V_Implementation_Record_v1.0.md`
18. `Auratio_Development_Operating_Model_v1.0.md`
19. `Auratio_Step_IV_Visual_QA_Protocol_v1.2.md`
20. `Auratio_Step_IV_Zero_Known_Defects_Reclose_Strategy_Addendum_v1.2.md`

## Accepted implementation checkpoints

- Step IV closeout documentation commit: `4c7ac816ff72c1a47cfdf8dd167bbdc3cb3b787c`.
- Step V implementation commit: `102dc424788e177601fd7683c1c2f54015ae1c78`.
- Step V closeout branch base accepted before Step VI: `1d13510cdc57c95b9e7ad16f2635733263fd6863`.
- Step VI-A: `6343d0e10d9985a77110230ae94e7d50c5ff5014`.
- Step VI-B: `e9b72af69cce980c15b670beab2440fc2bba2a1e`.
- Step VI-C: `93d69de2217d68315f1cac633e86e0c7f27ac03e`.
- Step VI-D: `c15b5ffce32c5d6c29aeb49b3acddb79df2d7af8`.
- Step VI-E: `b51aa3feb544aa9cb57d0b07fdb61ef517c548a4`.
- Step VI-F: `fa25ccfaad1643b7e5ecac111c972ea40d2abbfe`.
- VI-G / Step-VII branch base: `dbdbef671cb0916f6657d678191eecc27d5056ee`.
- VII-A1: `715e92ca71a309358740f26f779e45edabd045cc`.
- VII-A2 implementation: `02354879b9fda65ea9bf3c66d404e9a12a06b77c`.
- VII-A documentation closeout HEAD accepted before VII-B: `4e305cc55da5ff02bcb661ab604a20cf0b2b1dba`.
- VII-B1 persisted End-User data gateway: `710d280551214fd031fa4747c3cbd168611be3e5`.
- VII-B2 persisted End-User MP4 submission/request/status flow: `12a6214d767408afa7c55eebeca1a060bd537f14`.
- VII-B3 persisted Approved result/report/progress/history/leaderboard/events surfaces: `e2d37588e1db6923244c1b2ecbe0899e2dfc287a`.
- Production Supabase project: `Auratio` (`czkbljnzcfsztfrwndsb`).
- Current branch: `step-vii/api-client-ai-integration`.

## Resume checkpoint and chat boundary

VII-B implementation is CLOSED / APPROVED within its documented scope at implementation SHA `e2d37588e1db6923244c1b2ecbe0899e2dfc287a`.

The initial VII-B documentation closeout was pushed as `3aca24842583c8bacb4fbf13affadcdc8fd31610`. A documentation-only audit correction follows it. In the new chat, use the actual remote branch HEAD after that correction as the resume HEAD while retaining `e2d375...` as the accepted VII-B implementation checkpoint.

Read `AGENTS.md`, this index, Status v16, VII-B Closeout v1.0 and Step-VII Handoff v1.2 before any new change. Verify GitHub branch HEAD and ancestry first. Do not recreate or switch the Step-VII branch.

**This chat ends after VII-B documentation closeout. VII-C starts only in a fresh chat.**

Next scope: persisted Volunteer/Admin/Super Admin Human lifecycle integration and mandatory `SUB-8821` coherence closure. Do not begin Gemini implementation during VII-C.

## VII-B accepted scope

Configured End-User operation now includes:

- canonical Path/Track/mode contracts and persisted repositories;
- real `.mp4` file selection, MP4 duration extraction, canonical duration-gate validation and private upload;
- `evaluation-request` invocation and persisted user-facing status reads;
- Approved result detail with exactly 16 persisted criterion results;
- Approved-only immutable report preparation/download through the accepted `report` Edge Function and private report bucket;
- private progress/mastery and Approved history;
- JWT leaderboard reads separated by Track / AI-Human / All-Time-Monthly;
- published Bangladesh event discovery and persisted event details;
- configured/unconfigured route switching that preserves accepted Step-IV prototype behavior when Supabase is absent.

The B implementation did not add migrations or deploy/modify backend functions.

## Explicit remaining End-User/client gaps

Inspection confirms profile/onboarding persistence is not completed by VII-B: `mobile/lib/features/profile` remains presentation-only at this checkpoint. Persisted profile editing, Path selection/manage-Paths completion, and the remaining Auth/session/callback/network flows are explicitly scheduled for VII-E unless a later accepted package moves them earlier.

VII-B acceptance is not live production/runtime acceptance. Actual configured device/browser Supabase E2E, device save-dialog behavior, network/error behavior and final visual/runtime QA remain later gates.

## AI-requested to Human redirection requirement

The authoritative MVP requirement remains: AI/Human mode redirection requires explicit End-User consent.

- An Admin must not force an AI-requested submission into Human evaluation without that consent.
- The existing Admin prototype already represents an AI-requested submission reaching a `Redirected Human` route after alternate-method consent.
- The currently persisted backend does not yet close this path: `evaluation_requests.mode` is immutable after creation and the current `ai-admin` function supports cancellation, not a persisted redirect operation.
- Treat this as an explicit remaining Step-VII integration gap. Do not delete the capability or reinterpret Gemini failure as automatic Human redirection.
- The eventual persisted design must preserve the originally requested method and auditable consent/routing state.

The upcoming VII-C source inspection must account for this requirement when wiring Admin/Human lifecycle behavior. Any remaining End-User consent UI/client closure must be completed before Step VII is accepted.

## Locked Gemini decision for VII-D

User decision on 2026-09-08:

- Provider: Google Gemini API.
- Model: stable GA `gemini-3.8-flash`.
- API interface: Interactions API.
- Video processing: Agentic Video Understanding (`processing: "agentic"`).
- Input: original submitted MP4, preserving audio + visual information.
- Transport: server uploads the temporary video to the Gemini Files API, waits until usable, invokes the Interactions API, and manually deletes the Gemini temporary file after the attempt; provider automatic expiry remains secondary cleanup.
- Evaluation context: selected Track only, locked Auratio prompt/rubric/schema, no speaker identity/history/prior scores/mastery/leaderboard or unrelated Track rubric.
- Output: strict structured data compatible with the accepted 16-criterion Auratio finalization boundary.
- Credential: one Gemini API key, server-side only as a Supabase Edge Function secret/environment secret.
- Attempt policy: one AI attempt, no automatic retry, no Admin rerun.
- Fallback policy: do not silently switch to static-video evaluation. Agentic/API/unassessable failure follows the accepted failure/Rejected lifecycle.
- Prompt requirement: evaluate the complete performance holistically while using agentic navigation to inspect criterion-relevant moments and produce criterion-specific timestamped evidence.

Provider/API support must still be rechecked against current official Gemini documentation immediately before VII-D implementation.

## Backend evidence freshness

The last accepted read-only backend checkpoint remains the VII-A closeout checkpoint:

- 24 production migrations through `20260907133302_step_vi_f_video_deletion_worker`.
- 9 ACTIVE JWT-verified Edge Functions.
- 28 privileged `svc_*` RPCs; authenticated direct execution: 0; missing service-role grants: 0.
- 19 RLS-enabled public application tables.
- 2 private MIME-restricted Storage buckets.
- Security Advisor: 0 lints.

VII-B added client integration only and did not claim a fresh backend recount. Do not present the above as a 2026-09-08 backend re-query.

## Historical files

Project Status v15 and earlier, Step-VII Handoff v1.1 and earlier, Execution Specification v1.11 and earlier, older Step-V/VI handoffs and older QA/Step-IV documents are historical wherever they conflict with the current authority set.

Brand assets, Path Selection Addendum, evaluator requirement note and historical concept/overview material remain useful where they do not conflict with current specifications.
