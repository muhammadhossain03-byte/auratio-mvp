import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { portalRoutePaths } from '../../../app/routes/routePaths'
import { VolunteerLayout } from '../components/VolunteerLayout'
import {
  loadPersistedVolunteerCompletedEvaluation,
  type PersistedVolunteerCompletedEvaluation,
} from '../integration/persistedVolunteerScoring'

export function PersistedVolunteerEvaluationSubmittedPage() {
  const navigate = useNavigate()
  const { submissionId } = useParams<{ submissionId?: string }>()
  const persistedSubmissionId = submissionId ? decodeURIComponent(submissionId) : ''
  const [evaluation, setEvaluation] = useState<PersistedVolunteerCompletedEvaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!persistedSubmissionId) {
      setLoading(false)
      return
    }

    let active = true
    void loadPersistedVolunteerCompletedEvaluation(persistedSubmissionId)
      .then((loaded) => {
        if (active) setEvaluation(loaded)
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load submitted evaluation.')
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

  if (loading) {
    return (
      <VolunteerLayout ariaLabel="Evaluation Submitted" topbarTitle="Human Evaluation Workspace" activeNav="completed">
        <h2 className="auratio-volunteer-page-title">Loading submitted evaluation…</h2>
      </VolunteerLayout>
    )
  }

  if (!evaluation) {
    return <Navigate to={portalRoutePaths.volunteer.assignments} replace />
  }

  const publicationLabel =
    evaluation.requestStatus === 'pending_moderation'
      ? 'Pending Moderation'
      : evaluation.requestStatus === 'approved'
        ? 'Approved'
        : 'Rejected'

  return (
    <VolunteerLayout
      ariaLabel="Evaluation Submitted"
      topbarTitle="Human Evaluation Workspace"
      activeNav="completed"
    >
      <h2 className="auratio-volunteer-page-title">Evaluation submitted</h2>
      <p className="auratio-volunteer-page-subtitle">
        {evaluation.submissionRef} • evaluator version {evaluation.versionNumber} is closed
      </p>

      <div
        className="auratio-volunteer-panel"
        style={{ left: '30px', top: '124px', width: '1076px', height: '320px', padding: '24px', boxSizing: 'border-box' }}
      >
        <h3 className="auratio-volunteer-panel-title" style={{ position: 'static' }}>
          Persisted submission state
        </h3>
        <p><strong>Assignment Status:</strong> Completed — no active evaluator ownership</p>
        <p><strong>Publication Status:</strong> {publicationLabel}</p>
        <p><strong>Final evaluator score:</strong> {evaluation.finalScore} / 100</p>
        <p>
          This submitted evaluator version is no longer editable. Any Admin-requested re-review creates a new evaluator version.
        </p>
        {error && <p role="alert">{error}</p>}
      </div>

      <button
        type="button"
        onClick={() => navigate(portalRoutePaths.volunteer.assignments, { replace: true })}
        className="auratio-volunteer-btn auratio-volunteer-btn--primary"
        style={{ position: 'absolute', left: '30px', top: '478px', width: '220px', height: '44px' }}
      >
        View Active Assignments
      </button>
    </VolunteerLayout>
  )
}
