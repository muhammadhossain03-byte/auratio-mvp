import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { VolunteerLayout } from '../components/VolunteerLayout'
import { getVolunteerAssignment, updateAssignmentStatus } from '../data/mockVolunteerData'

export function VolunteerAssignedTaskPage() {
  const navigate = useNavigate()
  const { submissionId: paramId } = useParams<{ submissionId?: string }>()
  const submissionId = (paramId || 'SUB-8821').toUpperCase()
  const assignment = getVolunteerAssignment(submissionId)

  // Unknown submission IDs must redirect safely to /volunteer/assignments
  if (!assignment) {
    return <Navigate to={portalRoutePaths.volunteer.assignments} replace />
  }

  // IN EVALUATION: should resume the scoring workspace directly
  // must not return to assignment-response controls
  if (assignment.assignmentStatus === 'In Evaluation') {
    return <Navigate to={`/volunteer/evaluation/${assignment.id.toLowerCase()}`} replace />
  }

  function handleAccept() {
    if (!assignment) return
    if (assignment.assignmentStatus === 'Assigned') {
      updateAssignmentStatus(assignment.id, 'In Evaluation')
    }
    navigate(`/volunteer/evaluation/${assignment.id.toLowerCase()}`)
  }

  function handleContinue() {
    if (!assignment) return
    updateAssignmentStatus(assignment.id, 'In Evaluation')
    navigate(`/volunteer/evaluation/${assignment.id.toLowerCase()}`)
  }

  function handleDecline() {
    if (!assignment) return
    navigate(`/volunteer/assignments/${assignment.id.toLowerCase()}/decline`)
  }

  return (
    <VolunteerLayout
      ariaLabel="Assigned Task"
      topbarTitle="Human Evaluation Assignment"
      activeNav="assignments"
    >
      <h2 className="auratio-volunteer-page-title">{assignment.id}</h2>
      <p className="auratio-volunteer-page-subtitle">
        {assignment.assignmentStatus === 'Accepted'
          ? 'Accepted Human Evaluation task • Evaluation ready to begin'
          : 'Assigned Human Evaluation task • Accept or Decline required'}
      </p>

      {/* Header Status Pill */}
      <div
        className={`auratio-volunteer-pill ${
          assignment.assignmentStatus === 'Accepted'
            ? 'auratio-volunteer-pill--accepted'
            : 'auratio-volunteer-pill--assigned'
        }`}
        style={{
          position: 'absolute',
          left: '920px',
          top: '36px',
          width: '150px',
          height: '34px',
        }}
      >
        {assignment.assignmentStatus}
      </div>

      {/* Left Column: Assignment context */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '124px',
          width: '620px',
          height: '430px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Assignment context</h3>

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
          Submission ID
        </span>
        <span
          style={{
            position: 'absolute',
            left: '224px',
            top: '76px',
            width: '280px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          {assignment.id}
        </span>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '140px',
            width: '180px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Selected track
        </span>
        <span
          style={{
            position: 'absolute',
            left: '214px',
            top: '140px',
            width: '350px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          {assignment.track}
        </span>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '204px',
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
            top: '204px',
            width: '280px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          {assignment.assignmentStatus}
        </span>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '268px',
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
        <span
          style={{
            position: 'absolute',
            left: '224px',
            top: '268px',
            width: '280px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          {assignment.publicationStatus}
        </span>
      </div>

      {/* Right Column: Ownership */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '680px',
          top: '124px',
          width: '426px',
          height: '430px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Ownership</h3>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '76px',
            width: '180px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Active evaluator owner
        </span>
        <span
          style={{
            position: 'absolute',
            left: '214px',
            top: '76px',
            width: '140px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          You
        </span>

        {/* Amber Callout Box */}
        <div
          style={{
            position: 'absolute',
            left: '18px',
            top: '132px',
            width: '390px',
            height: '128px',
            backgroundColor: 'var(--auratio-amber-50)',
            border: '1px solid var(--auratio-neutral-200)',
            borderRadius: '16px',
            boxSizing: 'border-box',
            padding: '16px 18px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '18px',
              fontWeight: 600,
              lineHeight: '26px',
              color: 'var(--auratio-amber-700)',
            }}
          >
            {assignment.assignmentStatus === 'Accepted' ? 'Assignment accepted' : 'Respond to assignment'}
          </div>
          <div
            style={{
              marginTop: '10px',
              width: '350px',
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '12px',
              fontWeight: 400,
              lineHeight: '18px',
              color: 'var(--auratio-amber-700)',
            }}
          >
            {assignment.assignmentStatus === 'Accepted'
              ? 'This assignment has been accepted. Continue to the scoring workspace to evaluate the submission.'
              : 'Accept to take the task forward, or Decline with a short reason. No scoring begins until the assignment is accepted.'}
          </div>
        </div>

        {/* Action Buttons */}
        {assignment.assignmentStatus === 'Accepted' ? (
          <button
            type="button"
            onClick={handleContinue}
            className="auratio-volunteer-btn auratio-volunteer-btn--primary"
            style={{
              position: 'absolute',
              left: '18px',
              top: '280px',
              width: '220px',
              height: '44px',
            }}
          >
            Continue to Evaluation
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleAccept}
              className="auratio-volunteer-btn auratio-volunteer-btn--primary"
              style={{
                position: 'absolute',
                left: '18px',
                top: '280px',
                width: '170px',
                height: '44px',
              }}
            >
              Accept
            </button>

            <button
              type="button"
              onClick={handleDecline}
              className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
              style={{
                position: 'absolute',
                left: '202px',
                top: '280px',
                width: '170px',
                height: '44px',
              }}
            >
              Decline
            </button>
          </>
        )}

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '354px',
            width: '370px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Exactly one active evaluator owner. Publication Status remains independent.
        </span>
      </div>

      {/* Bottom Panel: Response boundary */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '588px',
          width: '1076px',
          height: '160px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Response boundary</h3>
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
          {assignment.assignmentStatus === 'Accepted'
            ? 'Assignment has been accepted and is owned by you. Continuation opens the active scoring workspace and transitions the task to In Evaluation.'
            : 'Accept changes Assignment Status to Accepted. Decline requires a short reason, closes this attempt, removes the task from Active Assignments, and returns the request to the Admin Unassigned queue.'}
        </p>
      </div>
    </VolunteerLayout>
  )
}
