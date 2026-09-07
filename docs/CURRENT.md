# Auratio Current Documentation Index

**Date:** 2026-09-07
**Status:** Steps I-VI CLOSED / APPROVED; VII-A CLOSED / APPROVED; Step VII overall IN PROGRESS; VII-B reserved for a new chat

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
10. `Project-Status-2026-09-07-v15.md`
11. `Auratio_Step_VII_Implementation_Handoff_v1.1.md`
12. `Auratio_Step_VII_A_Closeout_Record_v1.0.md` and the accepted VII-A1/A2 implementation records
13. `Auratio_Step_VI_Closeout_Record_v1.0.md`
14. `Auratio_Step_VI_Implementation_Handoff_v1.0.md`
15. Step-VI batch implementation records `Auratio_Step_VI_A_Implementation_Record_v1.0.md` through `Auratio_Step_VI_F_Implementation_Record_v1.0.md`
16. `Auratio_Step_V_Implementation_Record_v1.0.md`
17. `Auratio_Development_Operating_Model_v1.0.md`
18. `Auratio_Step_IV_Visual_QA_Protocol_v1.2.md`
19. `Auratio_Step_IV_Zero_Known_Defects_Reclose_Strategy_Addendum_v1.2.md`


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
- Production Supabase project: `Auratio` (`czkbljnzcfsztfrwndsb`).

- VI-G closeout accepted: `dbdbef671cb0916f6657d678191eecc27d5056ee`.
- VII-A1 accepted: `715e92ca71a309358740f26f779e45edabd045cc`.
- VII-A2 accepted implementation: `02354879b9fda65ea9bf3c66d404e9a12a06b77c`.
- Current branch: `step-vii/api-client-ai-integration` (already created from VI-G).

## Resume checkpoint and chat boundary

The documentation closeout package is based exactly on A2. Its eventual commit SHA is not embedded in its own contents. After that commit is pushed and independently accepted, use its actual full SHA as the current documentation/branch HEAD and retain A2 as the accepted implementation checkpoint.

Read `AGENTS.md`, this index, Status v15, VII-A Closeout v1.0, and Step-VII Handoff v1.1. Verify GitHub branch HEAD and ancestry before any new change. Do not recreate the branch, use an old Step-VI starting state, or treat the historic A1/A2 package retries as open failures.

**This chat ends after VII-A closeout. VII-B starts only in a fresh chat.** Next scope: persisted End-User upload, evaluation request, status, report, progress, leaderboard, and event integration. VII-C/D/E and Steps VIII/IX remain later gates.

## Backend checkpoint and evidence freshness

- 24 production migrations through `20260907133302_step_vi_f_video_deletion_worker`.
- 9 ACTIVE Edge Functions, all with JWT verification enabled.
- 28 privileged `svc_*` RPCs; authenticated direct execution: 0; service-role execution missing: 0.
- At VI-G: public authenticated `SECURITY DEFINER` execution surfaces: 0 (historical audit result).
- 19 RLS-enabled public application tables.
- 2 private MIME-restricted Storage buckets.
- Accepted canonical registry baseline: 3 Paths / 13 Tracks / 64 criteria / 192 anchors; not recounted in this closeout.
- Supabase Security Advisor at VII-A closeout read-only recheck: 0 security lints.
- At VI-G: Performance Advisor showed unused-index INFO notices only; not rerun in this closeout.
- At VI-G: fixture residue was zero; this closeout did not inspect current user/submission rows or create fixtures. Do not describe that historic count as a fresh live-data check.

The migration/function counts, privileged-RPC grant counts, RLS table count, private bucket count and Security Advisor above were rechecked read-only on 2026-09-07 during VII-A acceptance. No backend state was changed.

## Historical files

Execution Specification v1.11 and earlier, Project Status v14 and earlier, Step-VII Handoff v1.0, Step-V handoff material, older clarifications/scoring/deployment/Step-IV files, and previous QA protocols are historical wherever they conflict with the current authority set. A1/A2 implementation records retain retry history, but their acceptance entries and the VII-A closeout now control current status.

Brand assets, the Path Selection Addendum, evaluator requirement note, and historical concept/overview material remain useful where they do not conflict with current specifications.
