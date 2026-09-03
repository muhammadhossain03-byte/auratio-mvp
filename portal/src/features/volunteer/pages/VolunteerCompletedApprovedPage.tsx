import { VolunteerLayout } from '../components/VolunteerLayout'

export function VolunteerCompletedApprovedPage() {
  return (
    <VolunteerLayout
      ariaLabel="Completed Detail • Approved"
      topbarTitle="Submitted Evaluation"
      activeNav="completed"
    >
      <h2 className="auratio-volunteer-page-title" style={{ top: '34px' }}>
        SUB-8792 — Completed Evaluator Work
      </h2>
      <p className="auratio-volunteer-page-subtitle" style={{ top: '78px' }}>
        Evaluator task complete • publication approved
      </p>

      {/* Header Pill */}
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

      {/* Left Panel: Evaluator record */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '124px',
          width: '520px',
          height: '400px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Evaluator record</h3>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '76px',
            width: '190px',
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
            left: '224px',
            top: '76px',
            width: '240px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Submitted
        </span>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '134px',
            width: '190px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Evaluator ownership
        </span>
        <span
          style={{
            position: 'absolute',
            left: '224px',
            top: '134px',
            width: '240px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          None
        </span>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '192px',
            width: '190px',
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
            left: '224px',
            top: '192px',
            width: '240px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Approved score on record
        </span>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '250px',
            width: '190px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Official .docx report
        </span>
        <span
          style={{
            position: 'absolute',
            left: '224px',
            top: '250px',
            width: '250px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Generated on approval
        </span>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '308px',
            width: '190px',
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
            left: '224px',
            top: '308px',
            width: '240px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Locked / read-only
        </span>
      </div>

      {/* Right Panel: Publication Status */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '580px',
          top: '124px',
          width: '526px',
          height: '400px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Publication Status</h3>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '76px',
            width: '190px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Publication Status
        </span>
        <div
          className="auratio-volunteer-pill"
          style={{
            position: 'absolute',
            left: '220px',
            top: '68px',
            width: '220px',
            height: '34px',
            backgroundColor: 'var(--auratio-green-50)',
            color: 'var(--auratio-green-700)',
          }}
        >
          Approved
        </div>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '138px',
            width: '190px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Product impact
        </span>
        <span
          style={{
            position: 'absolute',
            left: '224px',
            top: '138px',
            width: '240px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Counts toward approved progress and Human leaderboard eligibility
        </span>

        {/* Success Callout Card */}
        <div
          style={{
            position: 'absolute',
            left: '18px',
            top: '196px',
            width: '470px',
            height: '118px',
            backgroundColor: 'var(--auratio-green-50)',
            border: '1px solid var(--auratio-neutral-200)',
            borderRadius: '12px',
            boxSizing: 'border-box',
          }}
        >
          <h4
            style={{
              position: 'absolute',
              left: '18px',
              top: '16px',
              margin: 0,
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '18px',
              fontWeight: 600,
              lineHeight: '26px',
              color: 'var(--auratio-green-700)',
            }}
          >
            Approved result
          </h4>
          <p
            style={{
              position: 'absolute',
              left: '18px',
              top: '54px',
              width: '420px',
              margin: 0,
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '12px',
              fontWeight: 400,
              lineHeight: '18px',
              color: 'var(--auratio-green-700)',
            }}
          >
            The approved Human score can now affect private progress and leaderboard eligibility under the normal qualification rules.
          </p>
        </div>
      </div>

      {/* Bottom Panel: Workspace consequence */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '558px',
          width: '1076px',
          height: '190px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Workspace consequence</h3>
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
          This record remains locked in Completed / History. Its approved evaluator-authored score is preserved; no score-edit controls are exposed.
        </p>
      </div>
    </VolunteerLayout>
  )
}
