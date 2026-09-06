# Auratio DOCX Report Generation Specification v1.0

**Date:** 2026-09-07  
**Status:** Authoritative report contract

## Eligibility and generation
- Generate only when Publication Status = Approved.
- AI and Human use the same deterministic renderer.
- Generate once at approval; store as immutable file.
- Unlimited re-download returns the same file.
- No report for Processing, Pending Moderation, Re-review/Reopened, Rejected, or Cancelled.
- For Human versioning, only the final/latest Approved evaluator version produces the user report.

## Filename
`Auratio_<TrackSlug>_<Mode>_Submission-<ID>_v<version>.docx`

Do not include speaker name, email, or report-generation date in the filename. Version remains in filename for deterministic identity.

## Report body — include
- Auratio — Where Greats Orate
- Evaluation Report
- speaker/user display name
- selected track
- evaluation mode (AI Evaluation / Human Evaluation)
- submission ID
- submission date
- report generation date
- measured video duration
- Universal Delivery subtotal /40
- Structural Flow subtotal /20
- Track Specialisation subtotal /40
- Final Score /100
- all 16 criteria: criterion name, anchor, score/max, primary timestamp (plain text), Evidence/Observation, Strength, Weakness, Actionable Improvement
- Overall Evaluation Summary

## Report body — exclude
- user email
- internal evaluation version number
- evaluator/Volunteer identity
- Gemini/model identity
- prompt/rubric/schema versions
- leaderboard rank
- mastery/progress
- internal moderation history
- internal Admin notes/reasons
- full transcript
- submission title/topic unless a later explicit product decision adds it

## Summary authorship
- Human: Volunteer writes summary manually.
- AI: Gemini generates summary from criterion findings.

## Video/report separation
Timestamps are plain text and do not deep-link to the temporary video. Video deletion after terminal Approved does not delete the stored Approved report.

## Pre-generation validation
Require Approved state, required report metadata, exactly 16 valid criteria, compatible anchors/scores, valid timestamps, all feedback fields, calculable subtotals/total, and non-empty overall summary. Never fabricate missing values.
