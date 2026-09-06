# Auratio AI Evaluation Specification v1.0

**Status:** Authoritative for AI implementation  
**Date:** 2026-09-07  
**Product:** Auratio — Where Greats Orate

## 1. Architecture

Auratio uses **one shared Gemini evaluator framework**, not 13 independent prompts. Each request contains the stable system prompt, runtime metadata, original video, 8 Universal Delivery criteria, 4 Structural Flow criteria, the selected track’s 4 criteria, their anchors, and the output schema. The other 12 track rubrics are not sent.

The current intended runtime model is **Gemini 3.7 Flash**, consistent with the current MVP decision. The exact API model identifier is configuration, must be logged internally, and may be changed later without changing this scoring contract.

## 2. Scoring

Exactly 16 criteria produce a score /100:
- Universal Delivery: 8 × 5 = 40
- Structural Flow: 4 × 5 = 20
- Track Specialisation: 4 × 10 = 40

Anchor-first score bands are mandatory for both AI and Human evaluation:
- 5-point: Low 0–2; Competent 3–4; Excellent 5
- 10-point: Low 0–4; Competent 5–8; Excellent 9–10

The backend calculates all category subtotals and the final /100. Gemini must not be trusted as the arithmetic authority.

## 3. Criterion output

For each of the 16 usable criteria return: criterion_id, anchor, integer score, one primary_timestamp (mm:ss), evidence, exactly one strength, exactly one weakness, and exactly one actionable_improvement.

The primary timestamp must be within the server-measured duration. Evidence must be tied to what is observable at or around that moment. Additional timestamps may appear in evidence text.

## 4. Summary

Gemini generates the AI Overall Summary. It must synthesize the criterion findings and add no unsupported claims. In Human Evaluation the Volunteer writes the Overall Summary manually.

## 5. Video, language, transcript, fact checking

- Evaluate the original video directly using audio and visuals.
- English-only MVP evaluation.
- No full transcript is generated or stored for this workflow.
- No external fact-checking/browsing.
- Internal contradictions may affect relevant criteria.
- Production quality is ignored unless it affects assessability or a criterion.
- Accent itself is never penalized.

## 6. Identity and bias minimization

Do not send Gemini speaker name, email, prior scores, leaderboard, mastery, past evaluation history, or prior feedback. Do not score personal characteristics.

## 7. One-attempt rule

Exactly **one Gemini attempt per submission**. No automatic retry, no Admin rerun, no hidden second-model validation. A user may create a new submission after a terminal Rejected/Cancelled outcome; duplicate/re-upload is allowed under the MVP duplicate policy.

## 8. Validation and outcomes

Server-side validation is authoritative. Validate schema version, submission ID, track slug, usable/unusable branch, exact expected 16 unique criterion IDs, integer scores, criterion max, anchor-score band, timestamp syntax/duration, required feedback strings, summary, and absence of unexpected fields.

A valid usable AI result auto-approves. An unassessable result, malformed/invalid result, or API failure becomes **Rejected** with no score/product/report effect. User-facing technical failure copy is non-technical; Admin/Super Admin may see the internal failure reason.

If an Admin cancels while AI status is Processing, any later model response is ignored; the request remains **Cancelled**.

## 9. Video lifecycle

Temporary video remains while evaluation/moderation needs it. Delete the primary stored video after terminal **Approved, Rejected, or Cancelled**. Preserve metadata, audit history, structured approved evaluation data, and Approved DOCX report.

## 10. Provenance

Persist internally: prompt_version, rubric_version, output_schema_version, exact model identifier, attempt timestamp, validation outcome, failure code/reason, and request/submission identifiers.

## 11. Secret handling

Gemini API credentials are server-side secrets only. Never expose them in Flutter, React/Vite client code, client-readable environment variables, repository plaintext, screenshots, logs, or report content.

## 12. Acceptance tests

AI integration is incomplete until tests cover all 13 tracks, 8+4+4 assembly, no unrelated track leakage, all anchor-score bands, invalid/missing/duplicate criteria, invalid timestamps, malformed JSON, usable/unassessable branches, no retry, late-result cancellation discard, auto-approval of valid output, and PII/history minimization.
