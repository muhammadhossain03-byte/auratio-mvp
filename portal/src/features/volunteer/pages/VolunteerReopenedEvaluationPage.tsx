import { useNavigate, useParams } from 'react-router-dom'
import { VolunteerLayout } from '../components/VolunteerLayout'
import {
  getVolunteerAssignment,
  getPreservedLockedSubmission,
  reopenEvaluation,
  calculateDraftTotals,
} from '../data/mockVolunteerData'

export function VolunteerReopenedEvaluationPage() {
  const navigate = useNavigate()
  const { submissionId: routeSubmissionId } = useParams<{ submissionId?: string }>()
  const submissionId = (routeSubmissionId || 'SUB-8821').toUpperCase()

  const assignment = getVolunteerAssignment(submissionId)
  const prior = getPreservedLockedSubmission(submissionId)
  const priorScore = prior ? calculateDraftTotals(prior).submissionScore : 85
  const priorVersion = prior?.version || 1

  const handleContinueCorrection = () => {
    reopenEvaluation(submissionId)
    navigate(`/volunteer/evaluation/${submissionId.toLowerCase()}`)
  }

  return (
    <VolunteerLayout
      ariaLabel="Reopened Evaluation"
      topbarTitle="Human Evaluation Workspace"
      activeNav="assignments"
    >
      <h2 className="auratio-volunteer-page-title" style={{ top: '34px' }}>
        {submissionId} — Reopened Evaluation
      </h2>
      <p className="auratio-volunteer-page-subtitle" style={{ top: '78px' }}>
        {assignment?.track || 'Business Pitch / Sales Pitch'} • formal re-review work (Version {priorVersion + 1})
      </p>

      {/* Header Pill */}
      <div
        className="auratio-volunteer-pill auratio-volunteer-pill--assigned"
        style={{
          position: 'absolute',
          left: '880px',
          top: '36px',
          width: '210px',
          height: '34px',
        }}
      >
        Re-review / Reopened
      </div>

      {/* Left Panel: Preserved prior submission */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '122px',
          width: '520px',
          height: '364px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Preserved prior submission</h3>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '72px',
            width: '180px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          State
        </span>
        <span
          style={{
            position: 'absolute',
            left: '204px',
            top: '72px',
            width: '240px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Submitted / historical
        </span>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '122px',
            width: '180px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Score
        </span>
        <span
          style={{
            position: 'absolute',
            left: '204px',
            top: '122px',
            width: '240px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          {priorScore} / 100
        </span>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '172px',
            width: '180px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Evaluation inputs
        </span>
        <span
          style={{
            position: 'absolute',
            left: '204px',
            top: '172px',
            width: '240px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Retained
        </span>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '222px',
            width: '180px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Editability
        </span>
        <span
          style={{
            position: 'absolute',
            left: '204px',
            top: '222px',
            width: '240px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Read-only
        </span>

        {/* Warning Callout Box */}
        <div
          style={{
            position: 'absolute',
            left: '18px',
            top: '274px',
            width: '484px',
            height: '66px',
            backgroundColor: 'var(--auratio-amber-50)',
            border: '1px solid var(--auratio-neutral-200)',
            borderRadius: '16px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0.0167em',
              color: 'var(--auratio-amber-700)',
            }}
          >
            Prior submitted data is reference/history, not the editable active record.
          </span>
        </div>
      </div>

      {/* Right Panel: Active correction workspace */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '580px',
          top: '122px',
          width: '526px',
          height: '364px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Active correction workspace</h3>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '72px',
            width: '180px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Work state
        </span>
        <span
          style={{
            position: 'absolute',
            left: '204px',
            top: '72px',
            width: '280px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Re-review / Reopened
        </span>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '122px',
            width: '180px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Judging context
        </span>
        <span
          style={{
            position: 'absolute',
            left: '204px',
            top: '122px',
            width: '300px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Normal minimum-necessary context
        </span>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '172px',
            width: '180px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Scores + evidence
        </span>
        <span
          style={{
            position: 'absolute',
            left: '204px',
            top: '172px',
            width: '280px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Editable active work
        </span>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '222px',
            width: '180px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Anchor selections
        </span>
        <span
          style={{
            position: 'absolute',
            left: '204px',
            top: '222px',
            width: '310px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Reopened anchor / scoring / evidence work
        </span>

        {/* Warning Callout Box */}
        <div
          style={{
            position: 'absolute',
            left: '18px',
            top: '274px',
            width: '490px',
            height: '66px',
            backgroundColor: 'var(--auratio-amber-50)',
            border: '1px solid var(--auratio-neutral-200)',
            borderRadius: '16px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '12px',
              fontWeight: 400,
              lineHeight: '18px',
              color: 'var(--auratio-amber-700)',
            }}
          >
            Correction work is separate; resubmission creates a new locked version.
          </span>
        </div>
      </div>

      {/* Bottom Panel: Integrity boundary */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '522px',
          width: '1076px',
          height: '160px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Integrity boundary</h3>
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
            lineHeight: '22px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          The reopened evaluation uses the same rubric, criterion-specific anchor, score, timestamp, and four-field structured feedback requirements as normal Human Evaluation. When resubmitted, the new version locks again; the prior version remains reconstructible. Official .docx is generated only if the resubmitted version becomes Approved.
        </p>
      </div>

      {/* Action Button: Continue Correction */}
      <button
        type="button"
        onClick={handleContinueCorrection}
        className="auratio-volunteer-btn auratio-volunteer-btn--primary"
        style={{
          position: 'absolute',
          left: '870px',
          top: '712px',
          width: '236px',
          height: '44px',
          borderRadius: '10px',
        }}
      >
        Continue Correction
      </button>
    </VolunteerLayout>
  )
}
