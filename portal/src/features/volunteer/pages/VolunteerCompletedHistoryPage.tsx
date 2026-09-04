import { useNavigate } from 'react-router-dom'
import { VolunteerLayout } from '../components/VolunteerLayout'
import { getCompletedHistory } from '../data/mockVolunteerData'

export function VolunteerCompletedHistoryPage() {
  const navigate = useNavigate()
  const historyItems = getCompletedHistory()

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
          height: `${Math.max(386, 76 + historyItems.length * 76)}px`,
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

        {historyItems.map((item, index) => {
          const rowTop = 55 + index * 76
          const dividerTop = 114 + index * 76
          let pubBg = 'var(--auratio-brand-blue-50)'
          let pubColor = 'var(--auratio-brand-blue-700)'
          if (item.publicationStatus === 'Pending Moderation') {
            pubBg = 'var(--auratio-amber-50)'
            pubColor = 'var(--auratio-amber-700)'
          } else if (item.publicationStatus === 'Approved') {
            pubBg = '#f0fdf4'
            pubColor = '#15803d'
          } else if (item.publicationStatus === 'Rejected') {
            pubBg = '#fef2f2'
            pubColor = '#b91c1c'
          }

          return (
            <div key={item.id}>
              <span
                style={{
                  position: 'absolute',
                  left: '18px',
                  top: `${rowTop + 11}px`,
                  width: '145px',
                  fontFamily: 'var(--auratio-font-family-inter), sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                  color: 'var(--auratio-neutral-900)',
                }}
              >
                {item.id}
              </span>
              <span
                style={{
                  position: 'absolute',
                  left: '185px',
                  top: `${rowTop + 11}px`,
                  width: '250px',
                  fontFamily: 'var(--auratio-font-family-inter), sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                  color: 'var(--auratio-neutral-900)',
                }}
              >
                {item.track}
              </span>
              <div
                className="auratio-volunteer-pill auratio-volunteer-pill--assigned"
                style={{
                  position: 'absolute',
                  left: '460px',
                  top: `${rowTop + 4}px`,
                  width: '160px',
                  height: '34px',
                }}
              >
                {item.assignmentStatus}
              </div>
              <div
                className="auratio-volunteer-pill"
                style={{
                  position: 'absolute',
                  left: '660px',
                  top: `${rowTop + 4}px`,
                  width: '180px',
                  height: '34px',
                  backgroundColor: pubBg,
                  color: pubColor,
                }}
              >
                {item.publicationStatus}
              </div>
              <button
                type="button"
                onClick={() => navigate(item.route)}
                className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
                style={{
                  position: 'absolute',
                  left: '900px',
                  top: `${rowTop}px`,
                  width: '120px',
                  height: '44px',
                  borderRadius: '10px',
                }}
              >
                Open
              </button>

              {index < historyItems.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '18px',
                    top: `${dividerTop}px`,
                    width: '1040px',
                    height: '1px',
                    backgroundColor: 'var(--auratio-neutral-200)',
                  }}
                />
              )}
            </div>
          )
        })}
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
