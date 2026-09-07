# Auratio Current Documentation Index

**Date:** 2026-09-07
**Status:** Step VI implementation complete; Step VII authorized after VI-G closeout acceptance

Use the documents below in this order when implementing or reviewing Auratio. Where an older file conflicts, the newer/current file wins.

## Current authority order

1. `Auratio_Authoritative_Clarifications_MVP_v1.9.0.md`
2. `Auratio_Scoring_and_Leaderboard_System_Specification_v3.8.md`
3. `ai/Auratio_AI_Evaluation_Specification_v1.0.md` + its prompt/schema/rubric assets
4. `Auratio_DOCX_Report_Generation_Specification_v1.0.md`
5. `Auratio_MVP_Deployment_and_Demo_Distribution_Addendum_v1.2.md`
6. `Auratio_MVP_Concepts_and_Requirements_v1.9.md`
7. `Auratio_Execution_Specification_v1.11.md`
8. `Auratio_MVP_Path_Selection_Addendum_v1.0.txt`
9. `Auratio_Final_Pre-Launch_QA_Flow_v1.1.md`
10. `Project-Status-2026-09-07-v14.md`
11. `Auratio_Step_VII_Implementation_Handoff_v1.0.md`
12. `Auratio_Step_VI_Closeout_Record_v1.0.md`
13. `Auratio_Step_VI_Implementation_Handoff_v1.0.md`
14. Step-VI batch implementation records `Auratio_Step_VI_A_Implementation_Record_v1.0.md` through `Auratio_Step_VI_F_Implementation_Record_v1.0.md`
15. `Auratio_Step_V_Implementation_Record_v1.0.md`
16. `Auratio_Development_Operating_Model_v1.0.md`
17. `Auratio_Step_IV_Visual_QA_Protocol_v1.2.md`
18. `Auratio_Step_IV_Zero_Known_Defects_Reclose_Strategy_Addendum_v1.2.md`

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

The VI-G closeout commit itself must be independently accepted by ChatGPT before Step VI is formally closed. The accepted VI-G HEAD then becomes the exact base for `step-vii/api-client-ai-integration`.

## Step-VI production checkpoint

- 24 production migrations through `20260907133302_step_vi_f_video_deletion_worker`.
- 9 ACTIVE Edge Functions, all with JWT verification enabled.
- 28 privileged `svc_*` RPCs; authenticated direct execution: 0; service-role execution missing: 0.
- Public authenticated `SECURITY DEFINER` execution surfaces: 0.
- 19 RLS-enabled public application tables.
- 2 private MIME-restricted Storage buckets.
- Canonical registries remain 3 Paths / 13 Tracks / 64 criteria / 192 anchors.
- Supabase Security Advisor at VI-G review: 0 security lints.
- Performance Advisor: unused-index INFO notices only on the empty MVP database; no release-blocking performance warning.
- Current database fixture residue after testing: 0 Auth users, profiles, submissions, evaluation requests, reports, video-deletion jobs, and audit rows.

## Historical files

Execution Specification v1.10 and earlier, Project Status v13 and earlier, Step-V handoff material, older clarifications/scoring/deployment/Step-IV files, and previous QA protocols are historical wherever they conflict with the current authority set.

Brand assets, the Path Selection Addendum, evaluator requirement note, and historical concept/overview material remain useful where they do not conflict with current specifications.
