import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { portalRoutePaths } from '../../../app/routes/routePaths'
import { VolunteerLayout } from '../components/VolunteerLayout'
import {
  acceptPersistedVolunteerAssignment,
  loadPersistedVolunteerAssignment,
  type PersistedVolunteerAssignment,
} from '../integration/persistedVolunteerLifecycle'

export function PersistedVolunteerAssignedTaskPage() {
  const navigate = useNavigate()
  const { submissionId } = useParams<{ submissionId?: string }>()
  const persistedSubmissionId = submissionId ? decodeURIComponent(submissionId) : ''
  const [assignment, setAssignment] = useState<PersistedVolunteerAssignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!persistedSubmissionId) {
      setLoading(false)
      return
    }

    let active = true
    void loadPersistedVolunteerAssignment(persistedSubmissionId)
      .then((row) => {
        if (!active) return
        setAssignment(row)
        setError(null)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(cause instanceof Error ? cause.message : 'Unable to load assignment.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [persistedSubmissionId])

  if (!persistedSubmissionId) {
    return <Navigate to={portalRoutePaths.volunteer.assignments} replace />
  }

  async function handleAccept() {
    if (!assignment || assignment.assignmentStatus !== 'Assigned') return
    setBusy(true)
    setError(null)
    try {
      setAssignment(await acceptPersistedVolunteerAssignment(assignment.requestId))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to accept assignment.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <VolunteerLayout ariaLabel="Assigned Task" topbarTitle="Human Evaluation Assignment" activeNav="assignments">
        <h2 className="auratio-volunteer-page-title">Loading assignment…</h2>
      </VolunteerLayout>
    )
  }

  if (!assignment) {
    return <Navigate to={portalRoutePaths.volunteer.assignments} replace />
  }

  const encodedSubmissionId = encodeURIComponent(assignment.submissionId)

  return (
    <VolunteerLayout
      ariaLabel="Assigned Task"
      topbarTitle="Human Evaluation Assignment"
      activeNav="assignments"
    >
      <h2 className="auratio-volunteer-page-title">{assignment.submissionRef}</h2>
      <p className="auratio-volunteer-page-subtitle">
        Persisted Human Evaluation task • version {assignment.versionNumber}
      </p>

      <div
        className="auratio-volunteer-panel"
        style={{ left: '30px', top: '124px', width: '620px', height: '430px' }}
      >
        <h3 className="auratio-volunteer-panel-title">Assignment context</h3>
        <div style={{ position: 'absolute', left: '18px', top: '72px', lineHeight: '34px' }}>
          <div><strong>Submission:</strong> {assignment.submissionRef}</div>
          <div><strong>Track:</strong> {assignment.track}</div>
          <div><strong>Assignment Status:</strong> {assignment.assignmentStatus}</div>
          <div><strong>Publication Status:</strong> {assignment.publicationStatus}</div>
          <div><strong>Evaluator version:</strong> v{assignment.versionNumber}</div>
        </div>
      </div>

      <div
        className="auratio-volunteer-panel"
        style={{ left: '680px', top: '124px', width: '426px', height: '430px' }}
      >
        <h3 className="auratio-volunteer-panel-title">Ownership</h3>
        <p style={{ position: 'absolute', left: '18px', top: '72px', width: '370px' }}>
          Exactly one active Volunteer owns this persisted Human evaluation version.
        </p>

        {error && (
          <p role="alert" style={{ position: 'absolute', left: '18px', top: '126px', width: '370px' }}>
            {error}
          </p>
        )}

        {assignment.assignmentStatus === 'Assigned' && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleAccept()}
              className="auratio-volunteer-btn auratio-volunteer-btn--primary"
              style={{ position: 'absolute', left: '18px', top: '220px', width: '170px', height: '44px' }}
            >
              {busy ? 'Accepting…' : 'Accept'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => navigate(`/volunteer/assignments/${encodedSubmissionId}/decline`)}
              className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
              style={{ position: 'absolute', left: '202px', top: '220px', width: '170px', height: '44px' }}
            >
              Decline
            </button>
          </>
        )}

        {assignment.assignmentStatus === 'Accepted' && (
          <button
            type="button"
            onClick={() => navigate(`/volunteer/evaluation/${encodedSubmissionId}`)}
            className="auratio-volunteer-btn auratio-volunteer-btn--primary"
            style={{ position: 'absolute', left: '18px', top: '220px', width: '240px', height: '44px' }}
          >
            Continue to Evaluation
          </button>
        )}

        {assignment.assignmentStatus === 'In Evaluation' && (
          <button
            type="button"
            onClick={() => navigate(`/volunteer/evaluation/${encodedSubmissionId}`)}
            className="auratio-volunteer-btn auratio-volunteer-btn--primary"
            style={{ position: 'absolute', left: '18px', top: '220px', width: '240px', height: '44px' }}
          >
            Resume Evaluation
          </button>
        )}
      </div>
    </VolunteerLayout>
  )
}
