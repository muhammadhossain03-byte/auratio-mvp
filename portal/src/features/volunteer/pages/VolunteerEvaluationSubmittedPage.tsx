import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { VolunteerLayout } from '../components/VolunteerLayout'

export function VolunteerEvaluationSubmittedPage() {
  const navigate = useNavigate()

  return (
    <VolunteerLayout
      ariaLabel="Evaluation Submitted"
      topbarTitle="Human Evaluation Workspace"
      activeNav="completed"
    >
      <h2 className="auratio-volunteer-page-title" style={{ top: '34px' }}>
        Evaluation submitted
      </h2>
      <p className="auratio-volunteer-page-subtitle" style={{ top: '78px' }}>
        SUB-8821 • evaluator work complete
      </p>

      {/* Header Status Pill */}
      <div
        className="auratio-volunteer-pill auratio-volunteer-pill--assigned"
        style={{
          position: 'absolute',
          left: '918px',
          top: '36px',
          width: '150px',
          height: '34px',
        }}
      >
        Submitted
      </div>

      {/* Top Panel: Assignment transition complete */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '122px',
          width: '1076px',
          height: '300px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Assignment transition complete</h3>

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
          Assignment Status
        </span>
        <span
          style={{
            position: 'absolute',
            left: '244px',
            top: '72px',
            width: '300px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Submitted
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
          Active evaluator ownership
        </span>
        <span
          style={{
            position: 'absolute',
            left: '244px',
            top: '122px',
            width: '500px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          None — evaluator work is closed
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
          Queue consequence
        </span>
        <span
          style={{
            position: 'absolute',
            left: '244px',
            top: '172px',
            width: '500px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Removed from Active Assignments
        </span>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '222px',
            width: '210px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Provenance
        </span>
        <span
          style={{
            position: 'absolute',
            left: '244px',
            top: '222px',
            width: '600px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Evaluator identity and submitted version retained
        </span>
      </div>

      {/* Middle Panel: Publication remains independent */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '454px',
          width: '1076px',
          height: '140px',
          backgroundColor: 'var(--auratio-brand-blue-50)',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Publication remains independent</h3>
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
          Submitted is not an approval decision. Human publication/moderation now resolves under the locked conditional rules; the final Publication Status may differ by case.
        </p>
      </div>

      {/* Bottom Section: Next workspace & Go to Completed / History */}
      <h3
        style={{
          position: 'absolute',
          left: '30px',
          top: '636px',
          margin: 0,
          fontFamily: 'var(--auratio-font-family-inter), sans-serif',
          fontSize: '18px',
          fontWeight: 600,
          lineHeight: '26px',
          color: 'var(--auratio-neutral-900)',
        }}
      >
        Next workspace
      </h3>
      <p
        style={{
          position: 'absolute',
          left: '30px',
          top: '672px',
          margin: 0,
          fontFamily: 'var(--auratio-font-family-inter), sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: '20px',
          color: 'var(--auratio-neutral-600)',
        }}
      >
        The task is now available in Completed / History.
      </p>

      <button
        type="button"
        onClick={() => navigate(portalRoutePaths.volunteer.completedHistory)}
        className="auratio-volunteer-btn auratio-volunteer-btn--primary"
        style={{
          position: 'absolute',
          left: '830px',
          top: '652px',
          width: '276px',
          height: '44px',
          borderRadius: '10px',
        }}
      >
        Go to Completed / History
      </button>
    </VolunteerLayout>
  )
}
