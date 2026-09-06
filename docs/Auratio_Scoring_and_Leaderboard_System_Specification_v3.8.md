# Auratio Scoring & Leaderboard System Specification v3.8

**Date:** 2026-09-07  
**Status:** Authoritative scoring/evaluation update; supersedes v3.7 where changed

## 1. Submission score

Every Approved evaluation uses one 0–100 score:
- Universal Delivery — 40
- Structural Flow — 20
- Track Specialisation — 40

Exactly 16 criteria are scored: 8 + 4 + selected track 4.

## 2. Canonical criteria

Universal Delivery (5 each): Pacing/WPM/pause placement; Tone/modulation/energy; Vocal variety; Filler-word/silence control; Eye contact/gaze stability; Posture/body positioning; Purposeful gestures; Framing/movement control.

Structural Flow (5 each): Hook strength; Logical transitions; Central thesis clarity; Track-appropriate conclusion.

Track Specialisation (10 each):
- Informative — Objective clarity; Audience comprehension; Neutrality and factual accuracy; Complex concept breakdown.
- Extempore — Rapid time-to-thesis; Spontaneous structure; Narrative continuity; Composure and hesitation control.
- Persuasive — Ethos/Pathos/Logos balance; Audience emotional resonance; Urgency and conviction; Objection anticipation and resistance handling.
- Argumentative / Debate — Premise-claim alignment; Evidence rigour; Logical validity and signposting; Counterarguments and rebuttals.
- Explanatory — Pedagogical simplification; Analogies and mental models; Jargon control; Step-by-step deconstruction.
- News Delivery — Teleprompter-style cadence; Objective authoritative tone; Headline-shift signposting; Accuracy and composure.
- Business Pitch / Sales Pitch — Problem-solution fit; Value proposition clarity; Traction and investor appeal; Competitive differentiation.
- General Presentation / Multimedia — Slide-to-speech synchronisation; Narrative continuity across media; Visual support without reading; Media pacing and accessibility.
- Academic — Poster / Project / Thesis — Specialised terminology precision; Methodology defensibility; Citation and evidence rigour; Findings and claim support.
- Corporate Report — Bottom-Line Up Front orientation; Complex data translation; Actionable business insight; Decision-oriented recommendation.
- Infotainment-Oriented — Information-entertainment balance; Fast-paced narrative progression; Engagement triggers; Personality and visual energy.
- Academic — Lecture / Course — Structured learning outcomes; Instructional sequence; Concept check-in pacing; Instructional takeaway clarity.
- Marketing / Promotional — Audience pain-point positioning; Product/service payoff clarity; Conversion drivers; Brand-message alignment.

Canonical criterion IDs and all 192 anchor descriptions live in `docs/ai/rubrics-and-anchors-v1.json` and must also drive the Human UI.

## 3. Anchor-first scoring — v3.8 locked calibration

Anchors are no longer merely loose reference labels. The selected anchor constrains the valid integer score band:

| Criterion max | Low | Competent | Excellent |
|---|---:|---:|---:|
| 5 | 0–2 | 3–4 | 5 |
| 10 | 0–4 | 5–8 | 9–10 |

Human UI must restrict entry accordingly. Server/backend validation must reject incompatible pairs. Gemini must return compatible pairs.

## 4. Required structured feedback

Each criterion: anchor, exact integer score, one primary timestamp (mm:ss), evidence tied to that moment, exactly one strength, exactly one weakness, exactly one actionable improvement. One Overall Summary per evaluation. Human writes the Human summary; AI generates the AI summary.

## 5. AI path

One direct-video Gemini attempt. Strict JSON. No full transcript. Selected track is authoritative. No retry. Server validates complete 16-criterion structure, score bands, timestamps, fields, and IDs. Valid usable result → Approved automatically. API failure/unassessable/invalid output → Rejected. Admin may cancel while Processing; late AI output is discarded.

## 6. Human path

One active Volunteer owner at a time. Admin can reassign at any point before Approved. Submitted evaluator versions are immutable; re-review creates a new version. First Human evaluation in-track is moderated; later evaluations may auto-approve unless the >15-point prior-approved-Human anomaly or another validity rule triggers moderation. Admin cannot silently rewrite evaluator scores/feedback.

## 7. Publication effects

Only Approved results affect private mastery, qualification, ALR/public rank, and official DOCX generation. Rejected/Cancelled/Pending/Processing have no such effect.

## 8. Leaderboards / ALR retained from v3.7

- Public boards are separate by track, evaluation mode, and period.
- Qualification: 3 Approved evaluations in the same scope.
- 3 scores: average 3; 4 scores: average 4; 5+: five most recent, discard single lowest, average remaining four.
- All-Time: apply activity decay D; Monthly: D=1.00.
- Monthly membership uses submission date but counts only after Approved.
- Participation count is displayed but not an ALR input.
- Tie break: higher unrounded ALR → higher complete-window average → higher single best score → earlier qualification timestamp.
- Exact/near duplicates are allowed; no dedup gate.

## 9. Duration gates retained from v3.7

Server-side accepted windows remain:

| Track | Accepted window |
|---|---|
| Informative | 4:30–7:30 |
| Extempore | 1:30–3:30 |
| Persuasive | 4:30–7:30 |
| Argumentative / Debate | 3:30–6:30 |
| Explanatory | 4:30–7:30 |
| News Delivery | 0:30–3:30 |
| Business Pitch / Sales Pitch | 2:30–5:30 |
| General Presentation / Multimedia | 5:30–10:30 |
| Academic — Poster / Project / Thesis | 7:30–15:30 |
| Corporate Report | 4:30–10:30 |
| Infotainment-Oriented | 0:30–3:30 |
| Academic — Lecture / Course | 7:30–20:30 |
| Marketing / Promotional | 0:30–2:30 |

Out-of-range video is rejected before evaluation and consumes no AI/evaluator work.
