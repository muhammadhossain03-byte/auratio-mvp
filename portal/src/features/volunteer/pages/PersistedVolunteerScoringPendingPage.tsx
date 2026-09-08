import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { portalRoutePaths } from '../../../app/routes/routePaths'
import { VolunteerLayout } from '../components/VolunteerLayout'
import {
  beginPersistedVolunteerEvaluation,
  loadPersistedVolunteerAssignment,
  type PersistedVolunteerAssignment,
} from '../integration/persistedVolunteerLifecycle'

export function PersistedVolunteerScoringPendingPage() {
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
        if (active) setAssignment(row)
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load evaluation.')
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

  async function beginEvaluation() {
    if (!assignment || assignment.assignmentStatus !== 'Accepted') return
    setBusy(true)
    setError(null)
    try {
      setAssignment(await beginPersistedVolunteerEvaluation(assignment.requestId))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to begin evaluation.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <VolunteerLayout ariaLabel="Human Evaluation Workspace" topbarTitle="Human Evaluation Workspace" activeNav="assignments">
        <h2 className="auratio-volunteer-page-title">Loading persisted evaluation…</h2>
      </VolunteerLayout>
    )
  }

  if (!assignment) {
    return <Navigate to={portalRoutePaths.volunteer.assignments} replace />
  }

  return (
    <VolunteerLayout
      ariaLabel="Human Evaluation Workspace"
      topbarTitle="Human Evaluation Workspace"
      activeNav="assignments"
    >
      <h2 className="auratio-volunteer-page-title">{assignment.submissionRef}</h2>
      <p className="auratio-volunteer-page-subtitle">
        Persisted Human evaluator version {assignment.versionNumber}
      </p>

      <div
        className="auratio-volunteer-panel"
        style={{ left: '30px', top: '124px', width: '1076px', height: '300px', padding: '24px', boxSizing: 'border-box' }}
      >
        <h3 className="auratio-volunteer-panel-title" style={{ position: 'static' }}>
          {assignment.assignmentStatus}
        </h3>

        {assignment.assignmentStatus === 'Accepted' ? (
          <>
            <p>
              Begin Evaluation persists the transition to In Evaluation before criterion editing is allowed.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void beginEvaluation()}
              className="auratio-volunteer-btn auratio-volunteer-btn--primary"
              style={{ width: '220px', height: '44px', marginTop: '24px' }}
            >
              {busy ? 'Starting…' : 'Begin Evaluation'}
            </button>
          </>
        ) : (
          <p>
            Evaluation is persisted as In Evaluation. Criterion, summary, timestamp, and final-submit persistence are connected in the next gated VII-C2 sub-batch; this screen deliberately does not fall back to mock draft state.
          </p>
        )}

        {error && <p role="alert">{error}</p>}
      </div>
    </VolunteerLayout>
  )
}
