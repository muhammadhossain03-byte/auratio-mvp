import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VolunteerLayout } from '../components/VolunteerLayout'
import { getVolunteerAssignments, type ActiveAssignment } from '../data/mockVolunteerData'

export function VolunteerActiveAssignmentsPage() {
  const navigate = useNavigate()
  const [assignments] = useState<ActiveAssignment[]>(() =>
    getVolunteerAssignments().filter((a) => a.assignmentStatus !== 'Submitted')
  )

  function handleOpen(assignment: ActiveAssignment) {
    if (assignment.assignmentStatus === 'In Evaluation') {
      navigate(`/volunteer/evaluation/${assignment.id.toLowerCase()}`)
    } else {
      navigate(`/volunteer/assignments/${assignment.id.toLowerCase()}`)
    }
  }

  const sub8821 = assignments.find((a) => a.id.toUpperCase() === 'SUB-8821')
  const sub8814 = assignments.find((a) => a.id.toUpperCase() === 'SUB-8814')
  const sub8799 = assignments.find((a) => a.id.toUpperCase() === 'SUB-8799')

  return (
    <VolunteerLayout
      ariaLabel="Active Assignments"
      topbarTitle="Active Assignments"
      activeNav="assignments"
    >
      <h2 className="auratio-volunteer-page-title">My Active Assignments</h2>
      <p className="auratio-volunteer-page-subtitle">
        Only Human Evaluation tasks currently owned by you appear here.
      </p>

      {/* Notice Banner */}
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
          Assignment states: Assigned • Accepted • In Evaluation
        </span>

        <span
          style={{
            position: 'absolute',
            left: '760px',
            top: '18px',
            width: '290px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          No Unassigned self-claim queue
        </span>
      </div>

      {/* Assignments Table Panel */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '202px',
          width: '1076px',
          height: '384px',
        }}
      >
        {/* Table Column Headers */}
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '18px',
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
            left: '190px',
            top: '18px',
            width: '260px',
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
            left: '485px',
            top: '18px',
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
            left: '700px',
            top: '18px',
            width: '175px',
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
            left: '920px',
            top: '18px',
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

        {/* Row 1: SUB-8821 */}
        {sub8821 && (
          <>
            <span
              style={{
                position: 'absolute',
                left: '18px',
                top: '68px',
                width: '150px',
                fontFamily: 'var(--auratio-font-family-inter), sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '20px',
                color: 'var(--auratio-neutral-900)',
              }}
            >
              {sub8821.id}
            </span>
            <span
              style={{
                position: 'absolute',
                left: '190px',
                top: '68px',
                width: '260px',
                fontFamily: 'var(--auratio-font-family-inter), sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '20px',
                color: 'var(--auratio-neutral-900)',
              }}
            >
              {sub8821.track}
            </span>
            <div
              className={`auratio-volunteer-pill ${
                sub8821.assignmentStatus === 'Accepted'
                  ? 'auratio-volunteer-pill--accepted'
                  : sub8821.assignmentStatus === 'In Evaluation'
                  ? 'auratio-volunteer-pill--in-evaluation-table'
                  : 'auratio-volunteer-pill--assigned'
              }`}
              style={{
                position: 'absolute',
                left: '485px',
                top: '61px',
                width: '170px',
                height: '34px',
              }}
            >
              {sub8821.assignmentStatus}
            </div>
            <div
              className="auratio-volunteer-pill auratio-volunteer-pill--processing"
              style={{
                position: 'absolute',
                left: '700px',
                top: '61px',
                width: '170px',
                height: '34px',
              }}
            >
              {sub8821.publicationStatus}
            </div>
            <button
              type="button"
              aria-label={`Open ${sub8821.id}`}
              onClick={() => handleOpen(sub8821)}
              className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
              style={{
                position: 'absolute',
                left: '920px',
                top: '57px',
                width: '120px',
                height: '44px',
              }}
            >
              Open
            </button>
          </>
        )}

        {/* Divider 1 */}
        <div
          style={{
            position: 'absolute',
            left: '18px',
            top: '118px',
            width: '1040px',
            height: '1px',
            backgroundColor: 'var(--auratio-neutral-200)',
          }}
        />

        {/* Row 2: SUB-8814 */}
        {sub8814 && (
          <>
            <span
              style={{
                position: 'absolute',
                left: '18px',
                top: '160px',
                width: '150px',
                fontFamily: 'var(--auratio-font-family-inter), sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '20px',
                color: 'var(--auratio-neutral-900)',
              }}
            >
              {sub8814.id}
            </span>
            <span
              style={{
                position: 'absolute',
                left: '190px',
                top: '160px',
                width: '260px',
                fontFamily: 'var(--auratio-font-family-inter), sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '20px',
                color: 'var(--auratio-neutral-900)',
              }}
            >
              {sub8814.track}
            </span>
            <div
              className={`auratio-volunteer-pill ${
                sub8814.assignmentStatus === 'In Evaluation'
                  ? 'auratio-volunteer-pill--in-evaluation-table'
                  : 'auratio-volunteer-pill--accepted'
              }`}
              style={{
                position: 'absolute',
                left: '485px',
                top: '153px',
                width: '170px',
                height: '34px',
              }}
            >
              {sub8814.assignmentStatus}
            </div>
            <div
              className="auratio-volunteer-pill auratio-volunteer-pill--processing"
              style={{
                position: 'absolute',
                left: '700px',
                top: '153px',
                width: '170px',
                height: '34px',
              }}
            >
              {sub8814.publicationStatus}
            </div>
            <button
              type="button"
              aria-label={`Open ${sub8814.id}`}
              onClick={() => handleOpen(sub8814)}
              className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
              style={{
                position: 'absolute',
                left: '920px',
                top: '149px',
                width: '120px',
                height: '44px',
              }}
            >
              Open
            </button>
          </>
        )}

        {/* Divider 2 */}
        <div
          style={{
            position: 'absolute',
            left: '18px',
            top: '210px',
            width: '1040px',
            height: '1px',
            backgroundColor: 'var(--auratio-neutral-200)',
          }}
        />

        {/* Row 3: SUB-8799 */}
        {sub8799 && (
          <>
            <span
              style={{
                position: 'absolute',
                left: '18px',
                top: '252px',
                width: '150px',
                fontFamily: 'var(--auratio-font-family-inter), sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '20px',
                color: 'var(--auratio-neutral-900)',
              }}
            >
              {sub8799.id}
            </span>
            <span
              style={{
                position: 'absolute',
                left: '190px',
                top: '252px',
                width: '260px',
                fontFamily: 'var(--auratio-font-family-inter), sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '20px',
                color: 'var(--auratio-neutral-900)',
              }}
            >
              {sub8799.track}
            </span>
            <div
              className="auratio-volunteer-pill auratio-volunteer-pill--in-evaluation-table"
              style={{
                position: 'absolute',
                left: '485px',
                top: '245px',
                width: '170px',
                height: '34px',
              }}
            >
              {sub8799.assignmentStatus}
            </div>
            <div
              className="auratio-volunteer-pill auratio-volunteer-pill--processing"
              style={{
                position: 'absolute',
                left: '700px',
                top: '245px',
                width: '170px',
                height: '34px',
              }}
            >
              {sub8799.publicationStatus}
            </div>
            <button
              type="button"
              aria-label={`Open ${sub8799.id}`}
              onClick={() => handleOpen(sub8799)}
              className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
              style={{
                position: 'absolute',
                left: '920px',
                top: '241px',
                width: '120px',
                height: '44px',
              }}
            >
              Open
            </button>
          </>
        )}
      </div>

      {/* Queue boundary Panel */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '618px',
          width: '1076px',
          height: '130px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Queue boundary</h3>
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
          Unassigned requests never appear in this evaluator workspace. Submitted tasks leave this list and move to Completed / History; Publication Status remains a separate dimension.
        </p>
      </div>
    </VolunteerLayout>
  )
}
