# Auratio Current Documentation Index

**Date:** 2026-09-08
**Status:** Steps I-VI CLOSED / APPROVED; VII-A CLOSED / APPROVED; VII-B CLOSED / APPROVED; VII-C CLOSED / APPROVED; Step VII overall IN PROGRESS; VII-D next

Use the documents below in this order when implementing or reviewing Auratio. Where an older file conflicts, the newer/current file wins.

## Current authority order

1. `Auratio_Authoritative_Clarifications_MVP_v1.9.0.md`
2. `Auratio_Scoring_and_Leaderboard_System_Specification_v3.8.md`
3. `ai/Auratio_AI_Evaluation_Specification_v1.1.md` + `ai/Auratio_Gemini_Provider_Contract_v1.0.md` + its prompt/schema/rubric assets
4. `Auratio_DOCX_Report_Generation_Specification_v1.0.md`
5. `Auratio_MVP_Deployment_and_Demo_Distribution_Addendum_v1.2.md`
6. `Auratio_MVP_Concepts_and_Requirements_v1.9.md`
7. `Auratio_Execution_Specification_v1.12.md`
8. `Auratio_MVP_Path_Selection_Addendum_v1.0.txt`
9. `Auratio_Final_Pre-Launch_QA_Flow_v1.1.md`
10. `Project-Status-2026-09-08-v17.md`
11. `Auratio_Step_VII_C_Closeout_Record_v1.0.md`
12. `Auratio_Step_VII_Implementation_Handoff_v1.2.md`
13. `Auratio_Step_VII_B_Closeout_Record_v1.0.md`
14. `Auratio_Step_VII_A_Closeout_Record_v1.0.md` and the accepted VII-A1/A2 implementation records
15. `Auratio_Step_VI_Closeout_Record_v1.0.md`
16. `Auratio_Step_VI_Implementation_Handoff_v1.0.md`
17. Step-VI batch implementation records `Auratio_Step_VI_A_Implementation_Record_v1.0.md` through `Auratio_Step_VI_F_Implementation_Record_v1.0.md`
18. `Auratio_Step_V_Implementation_Record_v1.0.md`
19. `Auratio_Development_Operating_Model_v1.0.md`
20. `Auratio_Step_IV_Visual_QA_Protocol_v1.2.md`
21. `Auratio_Step_IV_Zero_Known_Defects_Reclose_Strategy_Addendum_v1.2.md`

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
- VII-B1: `710d280551214fd031fa4747c3cbd168611be3e5`.
- VII-B2: `12a6214d767408afa7c55eebeca1a060bd537f14`.
- VII-B3: `e2d37588e1db6923244c1b2ecbe0899e2dfc287a`.
- VII-B documentation correction / VII-C implementation base: `64695479c996d16e121d872fea515cedcba90081`.
- VII-C1 consent-aware routing initial implementation: `ea52872aed2e50c25479816017b85e3b9f07a22b`.
- VII-C1 hardened private-RLS-helper correction: `1547775ad7ed7db682a0ac6d3257e19101876c33`.
- VII-C2A Volunteer ownership lifecycle: `63a542b1ecce2ef1385845d5411d6fdc5e16db4a`.
- VII-C2B Volunteer scoring/submission: `9b85b88b73c477ef247d2e92e06a665ddc359b28`.
- VII-C2B canonical video-lifecycle correction: `fcfe63a9b5c6012b0d8568efa132557f132d7743`.
- VII-C2C1 Admin/Super Admin Human request lifecycle: `59d308ffefd2237ee5d01ffb929daada8baa643b`.
- VII-C2C2 persisted moderation/history/coherence closure: `bdf464c95c22f10f108c5b27b4ba0fd77ac338a4`.
- VII-C3 mobile explicit AI-to-Human consent: `0d616b748be3ac5bc3dd71910564084a826ee939`.
- Production Supabase project: `Auratio` (`czkbljnzcfsztfrwndsb`).
- Persistent development/runtime QA project: `Auratio VII-C Test` (`dboyrlgzifpffnsznvde`).
- Current branch: `step-vii/api-client-ai-integration`.

## Resume checkpoint

VII-C is CLOSED / APPROVED within the scope recorded by `Auratio_Step_VII_C_Closeout_Record_v1.0.md`.

The accepted VII-C implementation endpoint is:

`0d616b748be3ac5bc3dd71910564084a826ee939`

GitHub comparison from the corrected VII-B documentation HEAD `64695479c996d16e121d872fea515cedcba90081` to the accepted VII-C endpoint is exactly eight commits ahead and zero behind, with `64695479...` as the merge base.

Before authoring VII-D, verify the remote branch HEAD and ancestry, read `AGENTS.md`, this index, Status v17, VII-C Closeout v1.0 and Step-VII Handoff v1.2, then recheck current official Google Gemini documentation. Do not recreate or switch the Step-VII branch.

## VII-C accepted scope

Configured Human-evaluation operation now includes:

- explicit-consent AI-requested -> Human effective routing while permanently preserving the originally requested method;
- no Admin-forced redirect and no automatic AI/API-failure -> Human fallback;
- persisted Volunteer assignment queue/detail;
- Accept, Decline, Return and Begin lifecycle;
- persisted canonical 16-criterion scoring;
- canonical anchor bands;
- timestamp/evidence/strength/weakness/actionable-improvement persistence;
- persisted Overall Summary;
- Human submission and read-only submitted evaluator versions;
- private authorized evaluation-video access through signed Storage URLs;
- Admin/Super Admin persisted Human queue/detail;
- assign/reassign/cancel before submission;
- persisted moderation queue/detail;
- approve/reject/reopen/re-review;
- server-authoritative post-submission reassignment/re-review versioning;
- persisted Volunteer Completed/History by exact evaluator version;
- configured dashboard/evaluation records;
- mandatory `SUB-8821` coherence closure across request/version/assignment surfaces;
- mobile explicit AI -> Human consent confirmation and persisted requested/effective route display;
- prototype/unconfigured screens retained where required by the accepted Step-IV visual/routing contract.

## `SUB-8821` coherence invariant — closed

Configured operation now enforces/represents the required invariant:

1. exactly one Volunteer owns active Human work;
2. Decline/Return removes active ownership;
3. reassignment changes ownership through the server-authoritative mutation boundary;
4. a submitted evaluator version is not editable active work;
5. post-submission reassignment/re-review preserves the submitted version and creates the later draft/version lifecycle;
6. user-facing nonterminal states may map to Processing;
7. Approved is terminal;
8. relevant configured portal screens resolve persisted request/version/assignment state rather than shared mock state.

The literal prototype fixture `SUB-8821` is not used as a database identity in configured operation.

## AI-requested -> Human redirection — closed for VII-C

The authoritative MVP rule is now represented end-to-end:

- `evaluation_requests.requested_mode` permanently preserves the original End-User choice;
- `evaluation_requests.mode` represents the effective/current evaluator route;
- only AI-requested -> Human effective routing is allowed;
- a persisted consent record is required;
- only the request owner can provide that consent;
- the mobile UI uses a separate explicit confirmation;
- a failed/rejected redirect leaves the AI route unchanged;
- Admins cannot force the redirect;
- Gemini/API failure must not trigger an implicit Human fallback.

## VII-C backend/runtime QA evidence

Development runtime QA used the separate persistent Supabase project `Auratio VII-C Test` (`dboyrlgzifpffnsznvde`). Docker was not used.

Accepted C1 test-project evidence included:

- exact authoritative pre-C1 migration replay plus C1: 25 migrations total;
- canonical reference counts: 3 Paths, 13 Tracks, 64 criteria, 192 anchor descriptions;
- 20 RLS-enabled public application tables after the C1 consent table;
- routing-consent verification: PASS;
- accepted Step VI-B Human lifecycle regression: PASS;
- Step VI-C behavioral regression: PASS;
- authenticated direct execution of the consent service RPC denied; service-role execution granted;
- consent table RLS enabled and using hardened private helper functions;
- Security Advisor: zero lints;
- `evaluation-request` deployed to the test project with JWT verification enabled.

No runtime-QA write was made to the production/main Supabase project.

## Validation boundary

VII-C is accepted as repository implementation plus development/test-project QA. It is not production deployment acceptance.

Reported final validation includes:

- C2A persistence verifier: PASS;
- C2B scoring/submission/private-video verifier: PASS;
- C2C1 Admin/Super Admin request-lifecycle verifier: PASS;
- C2C2 moderation/history/coherence verifier: PASS;
- portal production build: PASS;
- portal test suite: PASS;
- VII-C3 focused mobile consent tests: 3/3 PASS;
- `flutter analyze`: PASS / no issues;
- preserved Batch-6 geometry regression: 2/2 PASS;
- preserved Batch-6 routing regression: 4/4 PASS;
- preserved Batch-6 visual QA regression: 2/2 PASS;
- full final Flutter suite: 348/348 PASS.

ChatGPT independently audited the accepted C3 GitHub commit and the C implementation ancestry/scope. Command results executed locally by Antigravity remain Antigravity-reported evidence unless separately noted.

## Locked development/user testing responsibility

For Auratio development:

- the user is not expected to run local builds, Docker, local databases, automated suites or development infrastructure;
- ChatGPT owns technical QA planning/audit and authors deterministic changes;
- Antigravity performs explicit execution/validation tasks;
- backend runtime QA uses the separate Supabase test project where needed;
- the user's personal acceptance testing occurs after deployment, using the real deployed `auratio.cloud` portal and the real mobile APK.

Do not shift local-development testing responsibility back to the user unless they explicitly change this rule.

## Remaining Step VII

### VII-D — next

Implement the locked live Gemini evaluation architecture through the accepted server-side AI boundary.

The required pre-D provider verification was completed against current official Google Gemini and Supabase documentation on 2026-09-08. The verified provider contract is recorded in `ai/Auratio_Gemini_Provider_Contract_v1.0.md`.

Verified implementation decisions include:

- stable GA `gemini-3.8-flash`;
- Gemini Thinking explicitly enabled at `thinking_level: "medium"` with `thinking_summaries: "none"`;
- Interactions API;
- Agentic Video Understanding with `processing: "agentic"`;
- Gemini Files API;
- one background Interaction persisted and polled rather than one long synchronous Edge request;
- provider-compatible structured-output transport schema plus authoritative Auratio server validation;
- explicit deletion of the temporary Gemini file and stored Interaction;
- Paid Tier required before real participant video unless different data-use terms are explicitly accepted.

Core constraints remain:

- server-side Gemini credential only;
- original temporary MP4 with audio + visuals;
- selected Track prompt/rubric/schema only;
- strict structured output compatible with the accepted 16-criterion finalization boundary;
- one AI attempt;
- no automatic retry;
- no Admin rerun;
- no silent static-video fallback;
- no automatic AI-failure -> Human fallback;
- explicit user consent remains the only AI-requested -> Human product path.

### VII-E

Complete remaining Auth/profile/Path/client gaps, including:

- persisted profile editing;
- onboarding Path selection and Manage Paths persistence;
- sign-out/session expiry/account disable/role-change behavior;
- password recovery, invitations/email callbacks and app/deep links;
- cross-client configured integration E2E;
- error/network handling;
- configured visual/runtime QA;
- final Step-VII regression and Step-VIII handoff.

## Historical files

Project Status v16 and earlier, Step-VII B-closeout-era "VII-C next" wording, older Step-VII handoffs, and `ai/Auratio_AI_Evaluation_Specification_v1.0.md` are historical wherever they conflict with Status v17, VII-C Closeout v1.0, `ai/Auratio_AI_Evaluation_Specification_v1.1.md`, or the current Gemini provider contract.

Brand assets, evaluator requirements, Path Selection Addendum and earlier concept/overview material remain useful where they do not conflict with current authoritative specifications.
