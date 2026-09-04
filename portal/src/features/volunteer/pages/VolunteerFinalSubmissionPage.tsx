import { useNavigate, useParams } from 'react-router-dom'
import { VolunteerLayout } from '../components/VolunteerLayout'
import {
  getVolunteerAssignment,
  getScoringDraft,
  calculateDraftTotals,
  submitEvaluation,
} from '../data/mockVolunteerData'

export function VolunteerFinalSubmissionPage() {
  const navigate = useNavigate()
  const { submissionId: routeSubmissionId } = useParams<{ submissionId?: string }>()
  const submissionId = (routeSubmissionId || 'SUB-8821').toUpperCase()

  const assignment = getVolunteerAssignment(submissionId)
  const draft = getScoringDraft(submissionId)
  const totals = draft
    ? calculateDraftTotals(draft)
    : {
        universalDelivery: 0,
        structuralFlow: 0,
        trackSpecialisation: 0,
        submissionScore: 0,
      }

  const handleCancel = () => {
    navigate(`/volunteer/evaluation/${submissionId.toLowerCase()}`)
  }

  const handleConfirmSubmit = () => {
    submitEvaluation(submissionId)
    navigate(`/volunteer/evaluation/${submissionId.toLowerCase()}/submitted`)
  }

  return (
    <VolunteerLayout
      ariaLabel="Final Evaluator Submission"
      topbarTitle="Human Evaluation Workspace"
      activeNav="assignments"
    >
      <h2 className="auratio-volunteer-page-title" style={{ top: '34px' }}>
        {submissionId}
      </h2>
      <p className="auratio-volunteer-page-subtitle" style={{ top: '78px' }}>
        {assignment?.track ? `${assignment.track} • ` : ''}Ready for final evaluator submission
      </p>

      {/* Header Status Pill */}
      <div
        className="auratio-volunteer-pill auratio-volunteer-pill--processing"
        style={{
          position: 'absolute',
          left: '910px',
          top: '36px',
          width: '160px',
          height: '34px',
        }}
      >
        In Evaluation
      </div>

      {/* Left Panel: Submission summary */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '122px',
          width: '520px',
          height: '318px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Submission summary</h3>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '72px',
            width: '210px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Universal Delivery
        </span>
        <span
          style={{
            position: 'absolute',
            left: '244px',
            top: '72px',
            width: '220px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          {totals.universalDelivery} / 40
        </span>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '122px',
            width: '210px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Structural Flow
        </span>
        <span
          style={{
            position: 'absolute',
            left: '244px',
            top: '122px',
            width: '220px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          {totals.structuralFlow} / 20
        </span>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '172px',
            width: '210px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Track Specialisation
        </span>
        <span
          style={{
            position: 'absolute',
            left: '244px',
            top: '172px',
            width: '220px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          {totals.trackSpecialisation} / 40
        </span>

        {/* Divider */}
        <div
          style={{
            position: 'absolute',
            left: '18px',
            top: '222px',
            width: '484px',
            height: '1px',
            backgroundColor: 'var(--auratio-neutral-200)',
          }}
        />

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '246px',
            width: '210px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Submission Score
        </span>
        <span
          style={{
            position: 'absolute',
            left: '244px',
            top: '246px',
            width: '220px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          {totals.submissionScore} / 100
        </span>
      </div>

      {/* Right Panel: Confirm final submission */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '580px',
          top: '122px',
          width: '526px',
          height: '318px',
          backgroundColor: 'var(--auratio-brand-blue-50)',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Confirm final submission</h3>

        <h4
          style={{
            position: 'absolute',
            left: '18px',
            top: '58px',
            margin: 0,
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          After confirmation:
        </h4>

        <div
          style={{
            position: 'absolute',
            left: '18px',
            top: '92px',
            width: '470px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '22px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          <div>• this evaluator-authored version becomes locked against silent editing;</div>
          <div>• the task leaves Active Assignments;</div>
          <div>• corrections require the formal Re-review / Reopened workflow;</div>
          <div>• publication/moderation remains separate from evaluator submission.</div>
        </div>
      </div>

      {/* Bottom Panel: Submission boundary */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '472px',
          width: '1076px',
          height: '132px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Submission boundary</h3>

        <p
          style={{
            position: 'absolute',
            left: '18px',
            top: '58px',
            width: '1010px',
            margin: 0,
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Submitted does not mean Approved. Final submission changes Assignment Status to Submitted and closes active evaluator ownership; publication resolves independently.
        </p>
      </div>

      {/* Action Bar */}
      <span
        style={{
          position: 'absolute',
          left: '30px',
          top: '644px',
          width: '650px',
          fontFamily: 'var(--auratio-font-family-inter), sans-serif',
          fontSize: '12px',
          fontWeight: 400,
          lineHeight: '18px',
          color: 'var(--auratio-neutral-500)',
        }}
      >
        Cancel returns to the editable In Evaluation workspace. No submission occurs.
      </span>

      <button
        type="button"
        onClick={handleCancel}
        className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
        style={{
          position: 'absolute',
          left: '750px',
          top: '636px',
          width: '150px',
          height: '44px',
          borderRadius: '10px',
        }}
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={handleConfirmSubmit}
        className="auratio-volunteer-btn auratio-volunteer-btn--primary"
        style={{
          position: 'absolute',
          left: '918px',
          top: '636px',
          width: '188px',
          height: '44px',
          borderRadius: '10px',
        }}
      >
        Confirm & Submit
      </button>
    </VolunteerLayout>
  )
}
