import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { VolunteerLayout } from '../components/VolunteerLayout'

export function VolunteerCompletedHistoryPage() {
  const navigate = useNavigate()

  return (
    <VolunteerLayout
      ariaLabel="Completed History"
      topbarTitle="Completed / History"
      activeNav="completed"
    >
      <h2 className="auratio-volunteer-page-title" style={{ top: '34px' }}>
        My Completed / History
      </h2>
      <p className="auratio-volunteer-page-subtitle" style={{ top: '78px' }}>
        Submitted Human Evaluation work remains here regardless of its current publication outcome.
      </p>

      {/* Top Banner Panel */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '122px',
          width: '1076px',
          height: '58px',
          backgroundColor: 'var(--auratio-brand-blue-50)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '18px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Assignment: Submitted
        </span>
        <span
          style={{
            position: 'absolute',
            left: '500px',
            top: '18px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Publication state remains separate
        </span>
      </div>

      {/* Table Panel */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '202px',
          width: '1076px',
          height: '386px',
        }}
      >
        {/* Table Headers */}
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '20px',
            width: '150px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Submission ID
        </span>
        <span
          style={{
            position: 'absolute',
            left: '185px',
            top: '20px',
            width: '250px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Track
        </span>
        <span
          style={{
            position: 'absolute',
            left: '460px',
            top: '20px',
            width: '180px',
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
            left: '660px',
            top: '20px',
            width: '180px',
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
        <span
          style={{
            position: 'absolute',
            left: '900px',
            top: '20px',
            width: '120px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Action
        </span>

        {/* Row 1: SUB-8821 Pending Moderation */}
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '66px',
            width: '145px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          SUB-8821
        </span>
        <span
          style={{
            position: 'absolute',
            left: '185px',
            top: '66px',
            width: '250px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Business Pitch / Sales Pitch
        </span>
        <div
          className="auratio-volunteer-pill auratio-volunteer-pill--assigned"
          style={{
            position: 'absolute',
            left: '460px',
            top: '59px',
            width: '160px',
            height: '34px',
          }}
        >
          Submitted
        </div>
        <div
          className="auratio-volunteer-pill"
          style={{
            position: 'absolute',
            left: '660px',
            top: '59px',
            width: '180px',
            height: '34px',
            backgroundColor: 'var(--auratio-amber-50)',
            color: 'var(--auratio-amber-700)',
          }}
        >
          Pending Moderation
        </div>
        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.volunteer.completedPendingModeration)}
          className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
          style={{
            position: 'absolute',
            left: '900px',
            top: '55px',
            width: '120px',
            height: '44px',
            borderRadius: '10px',
          }}
        >
          Open
        </button>

        {/* Divider 1 */}
        <div
          style={{
            position: 'absolute',
            left: '18px',
            top: '114px',
            width: '1040px',
            height: '1px',
            backgroundColor: 'var(--auratio-neutral-200)',
          }}
        />

        {/* Row 2: SUB-8792 Approved */}
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '142px',
            width: '145px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          SUB-8792
        </span>
        <span
          style={{
            position: 'absolute',
            left: '185px',
            top: '142px',
            width: '250px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Extempore
        </span>
        <div
          className="auratio-volunteer-pill auratio-volunteer-pill--assigned"
          style={{
            position: 'absolute',
            left: '460px',
            top: '135px',
            width: '160px',
            height: '34px',
          }}
        >
          Submitted
        </div>
        <div
          className="auratio-volunteer-pill"
          style={{
            position: 'absolute',
            left: '660px',
            top: '135px',
            width: '180px',
            height: '34px',
            backgroundColor: 'var(--auratio-green-50)',
            color: 'var(--auratio-green-700)',
          }}
        >
          Approved
        </div>
        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.volunteer.completedApproved)}
          className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
          style={{
            position: 'absolute',
            left: '900px',
            top: '131px',
            width: '120px',
            height: '44px',
            borderRadius: '10px',
          }}
        >
          Open
        </button>

        {/* Divider 2 */}
        <div
          style={{
            position: 'absolute',
            left: '18px',
            top: '190px',
            width: '1040px',
            height: '1px',
            backgroundColor: 'var(--auratio-neutral-200)',
          }}
        />

        {/* Row 3: SUB-8755 Rejected */}
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '218px',
            width: '145px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          SUB-8755
        </span>
        <span
          style={{
            position: 'absolute',
            left: '185px',
            top: '218px',
            width: '250px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Informative
        </span>
        <div
          className="auratio-volunteer-pill auratio-volunteer-pill--assigned"
          style={{
            position: 'absolute',
            left: '460px',
            top: '211px',
            width: '160px',
            height: '34px',
          }}
        >
          Submitted
        </div>
        <div
          className="auratio-volunteer-pill"
          style={{
            position: 'absolute',
            left: '660px',
            top: '211px',
            width: '180px',
            height: '34px',
            backgroundColor: 'var(--auratio-red-50)',
            color: 'var(--auratio-red-700)',
          }}
        >
          Rejected
        </div>
        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.volunteer.completedRejected)}
          className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
          style={{
            position: 'absolute',
            left: '900px',
            top: '207px',
            width: '120px',
            height: '44px',
            borderRadius: '10px',
          }}
        >
          Open
        </button>

        {/* Divider 3 */}
        <div
          style={{
            position: 'absolute',
            left: '18px',
            top: '266px',
            width: '1040px',
            height: '1px',
            backgroundColor: 'var(--auratio-neutral-200)',
          }}
        />

        {/* Row 4: SUB-8741 Processing */}
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '294px',
            width: '145px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          SUB-8741
        </span>
        <span
          style={{
            position: 'absolute',
            left: '185px',
            top: '294px',
            width: '250px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Motivational
        </span>
        <div
          className="auratio-volunteer-pill auratio-volunteer-pill--assigned"
          style={{
            position: 'absolute',
            left: '460px',
            top: '287px',
            width: '160px',
            height: '34px',
          }}
        >
          Submitted
        </div>
        <div
          className="auratio-volunteer-pill auratio-volunteer-pill--processing"
          style={{
            position: 'absolute',
            left: '660px',
            top: '287px',
            width: '180px',
            height: '34px',
          }}
        >
          Processing
        </div>
        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.volunteer.completedProcessing)}
          className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
          style={{
            position: 'absolute',
            left: '900px',
            top: '283px',
            width: '120px',
            height: '44px',
            borderRadius: '10px',
          }}
        >
          Open
        </button>
      </div>

      {/* Bottom Panel: History boundary */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '618px',
          width: '1076px',
          height: '130px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">History boundary</h3>
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
          The same evaluator-completed task may move between publication states without becoming active evaluator work. Only formal Re-review / Reopened returns it to Active Assignments.
        </p>
      </div>
    </VolunteerLayout>
  )
}
