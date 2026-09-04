import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { VolunteerLayout } from '../components/VolunteerLayout'
import {
  getVolunteerAssignment,
  getScoringDraft,
  saveScoringDraft,
  calculateDraftTotals,
  isCriterionComplete,
  UNIVERSAL_DELIVERY_CRITERIA,
  STRUCTURAL_FLOW_CRITERIA,
  TRACK_SPECIFIC_CRITERIA,
  type VolunteerSubmissionScoringDraft,
  type CriterionDefinition,
} from '../data/mockVolunteerData'

export function VolunteerScoringWorkspacePage() {
  const navigate = useNavigate()
  const { submissionId: routeSubmissionId } = useParams<{ submissionId?: string }>()
  const submissionId = (routeSubmissionId || 'SUB-8821').toUpperCase()

  const assignment = getVolunteerAssignment(submissionId)

  useEffect(() => {
    if (!assignment) {
      navigate(portalRoutePaths.volunteer.assignments, { replace: true })
    }
  }, [assignment, navigate])

  const [prevSubmissionId, setPrevSubmissionId] = useState(submissionId)
  const [draft, setDraft] = useState<VolunteerSubmissionScoringDraft | null>(() => {
    return getScoringDraft(submissionId)
  })

  if (prevSubmissionId !== submissionId) {
    setPrevSubmissionId(submissionId)
    setDraft(getScoringDraft(submissionId))
  }

  if (!assignment || !draft) {
    return null
  }

  const totals = calculateDraftTotals(draft)

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextSummary = e.target.value
    const updated: VolunteerSubmissionScoringDraft = {
      ...draft,
      overallSummary: nextSummary,
    }
    setDraft(updated)
    saveScoringDraft(updated)
  }

  const trackSlug = assignment.trackSlug || 'business-pitch'
  const trackCriteria = TRACK_SPECIFIC_CRITERIA[trackSlug] || TRACK_SPECIFIC_CRITERIA['business-pitch']

  const renderCriterionRow = (c: CriterionDefinition, index: number, topOffset: number) => {
    const cData = draft.criteria[c.id] || {
      id: c.id,
      name: c.name,
      category: c.category,
      maxPoints: c.maxPoints,
      anchor: null,
      exactScore: null,
      evidenceTimestamp: '',
      evidence: '',
      strength: '',
      weakness: '',
      advice: '',
    }
    const complete = isCriterionComplete(cData)
    const rowTop = topOffset + index * 48

    return (
      <div
        key={c.id}
        style={{
          position: 'absolute',
          left: '18px',
          top: `${rowTop}px`,
          width: '1036px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: index < 7 ? '1px solid var(--auratio-neutral-100)' : 'none',
          boxSizing: 'border-box',
        }}
      >
        <span
          style={{
            width: '420px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--auratio-neutral-900)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {c.name}
        </span>
        <span
          style={{
            width: '140px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            color: cData.anchor ? 'var(--auratio-neutral-800)' : 'var(--auratio-neutral-400)',
          }}
        >
          {cData.anchor || 'None'}
        </span>
        <span
          style={{
            width: '140px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            color: cData.exactScore !== null ? 'var(--auratio-neutral-900)' : 'var(--auratio-neutral-400)',
          }}
        >
          {cData.exactScore !== null ? `${cData.exactScore} / ${c.maxPoints}` : `— / ${c.maxPoints}`}
        </span>
        <span
          style={{
            width: '180px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            color: complete ? 'var(--auratio-success-700, #15803d)' : 'var(--auratio-neutral-400)',
          }}
        >
          {complete ? 'Complete ✓' : 'Incomplete'}
        </span>
        <button
          type="button"
          onClick={() =>
            navigate(
              `/volunteer/evaluation/${submissionId.toLowerCase()}/criterion?criterionId=${encodeURIComponent(c.id)}`
            )
          }
          className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
          style={{
            width: '130px',
            height: '32px',
            padding: '0 8px',
            fontSize: '12px',
            borderRadius: '6px',
          }}
        >
          {complete ? 'Edit Feedback' : 'Score Criterion'}
        </button>
      </div>
    )
  }

  return (
    <VolunteerLayout
      ariaLabel="Evaluator Scoring Workspace"
      topbarTitle="Human Evaluation Workspace"
      topbarRightVariant="scoring"
      activeNav="assignments"
    >
      <h2 className="auratio-volunteer-page-title" style={{ top: '32px' }}>
        {submissionId}
      </h2>
      <p className="auratio-volunteer-page-subtitle" style={{ top: '74px' }}>
        {assignment.track} • active Human Evaluation scoring
      </p>

      {/* Header Status Pill */}
      <div
        className="auratio-volunteer-pill auratio-volunteer-pill--in-evaluation-header"
        style={{
          position: 'absolute',
          left: '920px',
          top: '34px',
          width: '150px',
          height: '36px',
        }}
      >
        In Evaluation
      </div>

      {/* Evaluation Progress Card */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '120px',
          width: '1076px',
          height: '128px',
          borderRadius: '14px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Evaluation progress</h3>

        {/* Step 1 */}
        <span
          style={{
            position: 'absolute',
            left: '22px',
            top: '56px',
            width: '220px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          1. Context
        </span>
        <span
          style={{
            position: 'absolute',
            left: '22px',
            top: '82px',
            width: '220px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Complete
        </span>

        {/* Step 2 */}
        <span
          style={{
            position: 'absolute',
            left: '272px',
            top: '56px',
            width: '220px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          2. Anchor-first scoring
        </span>
        <span
          style={{
            position: 'absolute',
            left: '272px',
            top: '82px',
            width: '220px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          {totals.anchorCount === 16 ? 'Complete' : totals.anchorCount > 0 ? 'In progress' : 'Not started'}
        </span>

        {/* Step 3 */}
        <span
          style={{
            position: 'absolute',
            left: '522px',
            top: '56px',
            width: '220px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          3. Evidence + feedback
        </span>
        <span
          style={{
            position: 'absolute',
            left: '522px',
            top: '82px',
            width: '220px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          {totals.structuredFeedbackCount === 16 ? 'Complete' : 'Required'}
        </span>

        {/* Step 4 */}
        <span
          style={{
            position: 'absolute',
            left: '772px',
            top: '56px',
            width: '220px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          4. Review
        </span>
        <span
          style={{
            position: 'absolute',
            left: '772px',
            top: '82px',
            width: '220px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          {totals.isReady ? 'Ready for review' : 'Ready when complete'}
        </span>
      </div>

      {/* Left Column: Calculated score */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '276px',
          width: '360px',
          height: '286px',
          borderRadius: '14px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Calculated score</h3>

        {/* Row 1 */}
        <span
          style={{
            position: 'absolute',
            left: '20px',
            top: '58px',
            width: '180px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Universal Delivery
        </span>
        <span
          style={{
            position: 'absolute',
            left: '238px',
            top: '56px',
            width: '96px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          {totals.universalDelivery} / 40
        </span>

        {/* Row 2 */}
        <span
          style={{
            position: 'absolute',
            left: '20px',
            top: '106px',
            width: '180px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Structural Flow
        </span>
        <span
          style={{
            position: 'absolute',
            left: '238px',
            top: '104px',
            width: '96px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          {totals.structuralFlow} / 20
        </span>

        {/* Row 3 */}
        <span
          style={{
            position: 'absolute',
            left: '20px',
            top: '154px',
            width: '180px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Track Specialisation
        </span>
        <span
          style={{
            position: 'absolute',
            left: '238px',
            top: '152px',
            width: '96px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          {totals.trackSpecialisation} / 40
        </span>

        {/* Row 4 */}
        <span
          style={{
            position: 'absolute',
            left: '20px',
            top: '214px',
            width: '180px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Submission Score
        </span>
        <span
          style={{
            position: 'absolute',
            left: '230px',
            top: '208px',
            width: '110px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '24px',
            fontWeight: 700,
            lineHeight: '32px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          {totals.submissionScore} / 100
        </span>
      </div>

      {/* Right Column: Completeness */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '420px',
          top: '276px',
          width: '686px',
          height: '286px',
          borderRadius: '14px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Completeness</h3>

        {/* Row 1 */}
        <span
          style={{
            position: 'absolute',
            left: '24px',
            top: '58px',
            width: '210px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Criterion scores
        </span>
        <span
          style={{
            position: 'absolute',
            left: '250px',
            top: '56px',
            width: '310px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          {totals.criterionScoresCount} / 16
        </span>

        {/* Row 2 */}
        <span
          style={{
            position: 'absolute',
            left: '24px',
            top: '106px',
            width: '210px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Structured criterion feedback
        </span>
        <span
          style={{
            position: 'absolute',
            left: '250px',
            top: '104px',
            width: '310px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          {totals.structuredFeedbackCount} / 16 criteria complete
        </span>

        {/* Row 3 */}
        <span
          style={{
            position: 'absolute',
            left: '24px',
            top: '154px',
            width: '210px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Anchor selections
        </span>
        <span
          style={{
            position: 'absolute',
            left: '250px',
            top: '152px',
            width: '310px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          {totals.anchorCount} / 16 assessed
        </span>

        {/* Row 4 */}
        <span
          style={{
            position: 'absolute',
            left: '24px',
            top: '202px',
            width: '210px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Review readiness
        </span>
        <span
          style={{
            position: 'absolute',
            left: '250px',
            top: '200px',
            width: '310px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          {totals.isReady ? 'Ready for review' : 'Not ready'}
        </span>

        {/* Batch 3 active navigation buttons */}
        <button
          type="button"
          onClick={() => navigate(`/volunteer/evaluation/${submissionId.toLowerCase()}/criterion`)}
          className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
          style={{
            position: 'absolute',
            left: '24px',
            top: '232px',
            width: '210px',
            height: '40px',
            borderRadius: '8px',
          }}
        >
          Open Universal Delivery
        </button>

        <button
          type="button"
          disabled={!totals.isReady}
          onClick={() => navigate(`/volunteer/evaluation/${submissionId.toLowerCase()}/review`)}
          className="auratio-volunteer-btn auratio-volunteer-btn--primary"
          style={{
            position: 'absolute',
            left: '250px',
            top: '232px',
            width: '188px',
            height: '44px',
            opacity: totals.isReady ? 1 : 0.45,
            cursor: totals.isReady ? 'pointer' : 'not-allowed',
          }}
        >
          Review & Submit
        </button>
      </div>

      {/* Overall Summary Panel */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '580px',
          width: '1076px',
          height: '170px',
          borderRadius: '14px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Overall evaluation summary</h3>
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '50px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Required before submission. Provide a comprehensive summary synthesizing speaker performance across all categories.
        </span>
        <textarea
          aria-label="Overall evaluation summary"
          className="auratio-volunteer-feedback-textarea auratio-volunteer-overall-summary-textarea"
          value={draft.overallSummary}
          onChange={handleSummaryChange}
          placeholder="Enter overall evaluation summary..."
          style={{
            position: 'absolute',
            left: '18px',
            top: '74px',
            width: '1036px',
            height: '76px',
            boxSizing: 'border-box',
            padding: '10px 14px',
            border: '1px solid var(--auratio-neutral-300)',
            borderRadius: '10px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            color: 'var(--auratio-neutral-800)',
            backgroundColor: 'var(--auratio-surface-default)',
            resize: 'none',
            outline: 'none',
          }}
        />
      </div>

      {/* Section A: Universal Delivery (8 criteria, 5 pts each = 40 max) */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '770px',
          width: '1076px',
          height: '460px',
          borderRadius: '14px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">
          Universal Delivery — {totals.universalDelivery} / 40 points
        </h3>
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '48px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--auratio-neutral-500)',
            letterSpacing: '0.02em',
          }}
        >
          CRITERION (5 PTS MAX EACH)
        </span>
        <span
          style={{
            position: 'absolute',
            left: '438px',
            top: '48px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--auratio-neutral-500)',
            letterSpacing: '0.02em',
          }}
        >
          ANCHOR
        </span>
        <span
          style={{
            position: 'absolute',
            left: '578px',
            top: '48px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--auratio-neutral-500)',
            letterSpacing: '0.02em',
          }}
        >
          SCORE
        </span>
        <span
          style={{
            position: 'absolute',
            left: '718px',
            top: '48px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--auratio-neutral-500)',
            letterSpacing: '0.02em',
          }}
        >
          STATUS
        </span>

        {UNIVERSAL_DELIVERY_CRITERIA.map((c, i) => renderCriterionRow(c, i, 74))}
      </div>

      {/* Section B: Structural Flow (4 criteria, 5 pts each = 20 max) */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '1250px',
          width: '1076px',
          height: '270px',
          borderRadius: '14px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">
          Structural Flow — {totals.structuralFlow} / 20 points
        </h3>
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '48px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--auratio-neutral-500)',
            letterSpacing: '0.02em',
          }}
        >
          CRITERION (5 PTS MAX EACH)
        </span>
        <span
          style={{
            position: 'absolute',
            left: '438px',
            top: '48px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--auratio-neutral-500)',
            letterSpacing: '0.02em',
          }}
        >
          ANCHOR
        </span>
        <span
          style={{
            position: 'absolute',
            left: '578px',
            top: '48px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--auratio-neutral-500)',
            letterSpacing: '0.02em',
          }}
        >
          SCORE
        </span>
        <span
          style={{
            position: 'absolute',
            left: '718px',
            top: '48px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--auratio-neutral-500)',
            letterSpacing: '0.02em',
          }}
        >
          STATUS
        </span>

        {STRUCTURAL_FLOW_CRITERIA.map((c, i) => renderCriterionRow(c, i, 74))}
      </div>

      {/* Section C: Track Specialisation (4 criteria, 10 pts each = 40 max) */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '1540px',
          width: '1076px',
          height: '270px',
          borderRadius: '14px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">
          Track Specialisation ({assignment.track}) — {totals.trackSpecialisation} / 40 points
        </h3>
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '48px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--auratio-neutral-500)',
            letterSpacing: '0.02em',
          }}
        >
          CRITERION (10 PTS MAX EACH)
        </span>
        <span
          style={{
            position: 'absolute',
            left: '438px',
            top: '48px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--auratio-neutral-500)',
            letterSpacing: '0.02em',
          }}
        >
          ANCHOR
        </span>
        <span
          style={{
            position: 'absolute',
            left: '578px',
            top: '48px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--auratio-neutral-500)',
            letterSpacing: '0.02em',
          }}
        >
          SCORE
        </span>
        <span
          style={{
            position: 'absolute',
            left: '718px',
            top: '48px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--auratio-neutral-500)',
            letterSpacing: '0.02em',
          }}
        >
          STATUS
        </span>

        {trackCriteria.map((c, i) => renderCriterionRow(c, i, 74))}
      </div>

      {/* Bottom Panel: Integrity boundary */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '1830px',
          width: '1076px',
          height: '156px',
          borderRadius: '14px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Integrity boundary</h3>
        <p
          style={{
            position: 'absolute',
            left: '18px',
            top: '56px',
            width: '1000px',
            margin: 0,
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          The total shown here is derived from criterion inputs. Publication Status remains Processing; scoring completion does not publish the result.
        </p>

        <p
          style={{
            position: 'absolute',
            left: '18px',
            top: '104px',
            width: '1000px',
            margin: 0,
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          No leaderboard position, prior score, Track Mastery, prior feedback, or unnecessary user profile context is exposed.
        </p>
      </div>

      {/* Bottom Spacer */}
      <div
        style={{
          position: 'absolute',
          left: '30px',
          top: '2000px',
          width: '1076px',
          height: '40px',
        }}
      />
    </VolunteerLayout>
  )
}
