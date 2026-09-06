# Auratio Development Operating Model v1.0

**Locked:** 2026-09-07

## Roles

### ChatGPT — sole technical lead
Owns requirements interpretation, architecture, implementation design, code/spec generation, Gemini prompt/rubric design, Supabase/backend design, QA strategy, defect classification, acceptance decisions, documentation, and next-step sequencing.

### Antigravity — execution-only repository operator
Used only because regular ChatGPT cannot directly commit/push repository contents. Antigravity may:
- apply exact files/patches/instructions supplied by ChatGPT;
- run explicitly listed mechanical commands/tests;
- show diff/status;
- commit with the supplied message;
- push to the supplied branch;
- return full commit SHA, status, command results, and errors.

Antigravity must NOT independently:
- redesign or reinterpret Auratio;
- invent requirements or fixes;
- refactor/optimize outside scope;
- alter unrelated files;
- choose a different architecture;
- begin another task after completion;
- hide or auto-fix validation failures without ChatGPT instruction.

## Loop
ChatGPT inspects current GitHub → ChatGPT prepares exact change → Antigravity applies/validates/commits/pushes → ChatGPT reads the pushed commit/diff → ChatGPT accepts or issues a correction.

A commit is not accepted merely because Antigravity reports success.
