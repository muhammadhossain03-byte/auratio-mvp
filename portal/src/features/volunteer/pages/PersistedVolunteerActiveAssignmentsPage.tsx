import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { VolunteerLayout } from '../components/VolunteerLayout'
import {
  loadPersistedVolunteerAssignments,
  type PersistedVolunteerAssignment,
} from '../integration/persistedVolunteerLifecycle'

export function PersistedVolunteerActiveAssignmentsPage() {
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState<PersistedVolunteerAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    void loadPersistedVolunteerAssignments()
      .then((rows) => {
        if (!active) return
        setAssignments(rows)
        setError(null)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(cause instanceof Error ? cause.message : 'Unable to load assignments.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  function openAssignment(assignment: PersistedVolunteerAssignment) {
    const encoded = encodeURIComponent(assignment.submissionId)
    if (assignment.assignmentStatus === 'In Evaluation') {
      navigate(`/volunteer/evaluation/${encoded}`)
      return
    }
    navigate(`/volunteer/assignments/${encoded}`)
  }

  return (
    <VolunteerLayout
      ariaLabel="Active Assignments"
      topbarTitle="Active Assignments"
      activeNav="assignments"
    >
      <h2 className="auratio-volunteer-page-title">My Active Assignments</h2>
      <p className="auratio-volunteer-page-subtitle">
        Persisted Human Evaluation tasks currently owned by you.
      </p>

      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '122px',
          width: '1076px',
          minHeight: '520px',
          padding: '22px',
          boxSizing: 'border-box',
        }}
      >
        {loading ? (
          <p>Loading persisted assignments…</p>
        ) : error ? (
          <div role="alert">
            <strong>Unable to load assignments.</strong>
            <p>{error}</p>
          </div>
        ) : assignments.length === 0 ? (
          <div>
            <h3 className="auratio-volunteer-panel-title" style={{ position: 'static' }}>
              No active assignments
            </h3>
            <p style={{ color: 'var(--auratio-neutral-600)' }}>
              Unassigned requests never appear here. Declined, returned, and submitted work has no active ownership.
            </p>
          </div>
        ) : (
          <div style={{ width: '100%' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '150px 1fr 180px 180px 110px',
                gap: '16px',
                padding: '0 0 14px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--auratio-neutral-500)',
              }}
            >
              <span>Submission</span>
              <span>Track</span>
              <span>Assignment</span>
              <span>Publication</span>
              <span>Action</span>
            </div>

            {assignments.map((assignment) => (
              <div
                key={assignment.assignmentId}
                data-request-id={assignment.requestId}
                data-version-id={assignment.evaluationVersionId}
                data-assignment-status={assignment.assignmentStatus}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '150px 1fr 180px 180px 110px',
                  gap: '16px',
                  alignItems: 'center',
                  minHeight: '66px',
                  borderTop: '1px solid var(--auratio-neutral-200)',
                }}
              >
                <span>{assignment.submissionRef}</span>
                <span>{assignment.track}</span>
                <span>{assignment.assignmentStatus}</span>
                <span>{assignment.publicationStatus}</span>
                <button
                  type="button"
                  onClick={() => openAssignment(assignment)}
                  className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
                  style={{ width: '104px', height: '40px' }}
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </VolunteerLayout>
  )
}
