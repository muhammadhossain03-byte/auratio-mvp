# Auratio Step IV Runtime Visual QA Protocol v1.2

**Date:** 2026-09-07  
**Status:** Mandatory for Step-IV re-close; supersedes v1.1 only in execution ownership and newly changed screens

Figma page `03 — Interactive Prototype — MVP v1.8` remains the visual source of truth where written product rules do not supersede it.

## Ownership change
ChatGPT is the technical lead and final independent approver. Antigravity is execution-only: it may implement the exact scoped patch and run the capture/validation commands ChatGPT supplies, but it does not independently define defects, redesign screens, or authorize the next batch.

## Core rule
A frontend batch is incomplete until code/behavior QA **and** real runtime visual QA pass.

### Mobile
- Real Flutter runtime capture for every changed canonical screen/state.
- Standard canonical viewport 390×844 where applicable.
- Save under `/mobile/capture_output/`.
- Compare directly to authoritative Figma frame after each visible change.

### Portal
- Run the real React/Vite app in a browser.
- Capture every changed screen/state at the exact Figma viewport; established standard 1366×900 unless the specific frame differs.
- deviceScaleFactor/pixel ratio 1 where possible.
- Save under `/portal/capture_output/`.
- Capture dialogs/menus/loading/status states deterministically.
- Compare directly with Figma and fix material mismatches.

## Required checks
Typography, spacing, shell/sidebar geometry, panels/cards, tables, forms, status chips, modal overlays, clipping/overflow, scroll behavior, icons, responsive assumptions, and prototype-visible interaction state.

## Interaction fidelity
No misleading enabled no-op controls. Do not enlarge interaction affordances beyond Figma/product requirements without approval. Written v1.9 semantics override stale prototype behavior where necessary (for example newly locked video-player, anchor-band, reassignment/termination requirements).

## Completion evidence
Antigravity returns: exact changed routes/screens, final SHA, validation commands/results, capture filenames/dimensions, known discrepancies, and explicit stop. ChatGPT independently reviews GitHub + captures and accepts/rejects the batch.
