# Auratio Development Operating Model v1.0

**Locked:** 2026-09-07  
**Clarified:** 2026-09-07 — explicit ChatGPT-authored code gate

## Roles

### ChatGPT — sole technical lead and developer
ChatGPT owns requirements interpretation, architecture, implementation design, the actual implementation code, exact patches and complete replacement files, test changes, Gemini prompt/rubric design, Supabase/backend design, QA strategy, defect classification, acceptance decisions, documentation, and next-step sequencing.

For every repository-changing development task, ChatGPT must author the implementation before Antigravity is asked to touch the repository.

### Antigravity — execution-only repository operator
Antigravity is used only because regular ChatGPT cannot directly perform the required local repository write/commit/push workflow.

Antigravity may:
- verify exact repository, branch, HEAD, and clean-working-tree preconditions supplied by ChatGPT;
- apply exact ChatGPT-authored patches or complete replacement files;
- perform an equivalently deterministic mechanical transformation only when every transformation rule is fully specified by ChatGPT and requires no implementation judgment;
- run explicitly listed mechanical commands/tests;
- show diff/status;
- commit with the supplied message;
- push to the supplied branch;
- return full commit SHA, status, command results, warnings, and errors.

## Non-negotiable ChatGPT-authored code gate

Antigravity must **never** be given responsibility for implementing Auratio from a broad instruction such as:
- “fix this bug”;
- “implement this feature”;
- “make these acceptance criteria pass”;
- “add this workflow”;
- “refactor this module”;
- “create the required tests”;
- “use this specification to code the solution.”

Those are development tasks and belong to ChatGPT.

Before Antigravity may modify repository contents, ChatGPT must provide one of:
1. a finished patch/diff;
2. complete replacement file contents/files; or
3. a fully deterministic mechanical edit whose exact result does not require Antigravity to choose implementation details.

If the supplied task requires Antigravity to decide **how** to implement, debug, redesign, refactor, or fix code, Antigravity must stop and return the blocker rather than writing code.

## Validation-failure rule

Antigravity may run the exact validation commands ChatGPT specifies.

If validation fails:
- Antigravity reports the exact command, exit result, and relevant error output;
- Antigravity does **not** independently diagnose-and-edit the implementation;
- ChatGPT inspects the failure, authors the correction, and supplies the next exact patch/files.

The only exception is a purely mechanical retry explicitly pre-authorized by ChatGPT, such as rerunning the same command after a specified environment/setup command. It does not authorize source-code changes.

## Prohibited Antigravity behavior

Antigravity must NOT independently:
- redesign or reinterpret Auratio;
- invent requirements, code, tests, or fixes;
- choose implementation details;
- refactor/optimize outside an exact ChatGPT patch;
- alter unrelated files;
- choose a different architecture;
- troubleshoot a failure by modifying source code;
- weaken tests to make them pass;
- continue to another task after completion;
- hide or auto-fix validation failures.

## Permanent development loop

1. ChatGPT reads the current GitHub source of truth.
2. ChatGPT interprets the locked requirements.
3. ChatGPT designs and authors the actual code/patch/files/tests.
4. ChatGPT supplies Antigravity an execution package with exact branch/HEAD, exact files/patch, allowed scope, validations, commit message, and push target.
5. Antigravity applies the package without implementation judgment.
6. Antigravity runs only the specified validations.
7. If validation fails, Antigravity stops and reports; ChatGPT authors the correction.
8. If validation passes, Antigravity commits and pushes.
9. ChatGPT independently reads the pushed GitHub commit/diff.
10. ChatGPT explicitly accepts the commit or authors a correction.

A commit is not accepted merely because Antigravity reports success.

## Source-of-truth relationship

- **GitHub:** authoritative versioned project source after accepted commits.
- **Local repository (`D:\auratio-mvp`):** execution workspace used by Antigravity.
- **ChatGPT Project:** current working context and current authoritative project files; superseded files should not be treated as current.
- **Antigravity:** repository operator only, never a competing technical authority or developer.
