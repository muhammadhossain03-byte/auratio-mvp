import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { portalRoutePaths } from '../../../app/routes/routePaths'
import { VolunteerLayout } from '../components/VolunteerLayout'
import {
  loadPersistedVolunteerScoringDraft,
  submitPersistedVolunteerEvaluation,
  type PersistedVolunteerScoringDraft,
} from '../integration/persistedVolunteerScoring'

export function PersistedVolunteerFinalSubmissionPage() {
  const navigate = useNavigate()
  const { submissionId } = useParams<{ submissionId?: string }>()
  const persistedSubmissionId = submissionId ? decodeURIComponent(submissionId) : ''
  const [draft, setDraft] = useState<PersistedVolunteerScoringDraft | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!persistedSubmissionId) {
      setLoading(false)
      return
    }

    let active = true
    void loadPersistedVolunteerScoringDraft(persistedSubmissionId)
      .then((loaded) => {
        if (active) setDraft(loaded)
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load final review.')
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
      <VolunteerLayout ariaLabel="Final Evaluator Submission" topbarTitle="Human Evaluation Workspace" activeNav="assignments">
        <h2 className="auratio-volunteer-page-title">Loading final review…</h2>
      </VolunteerLayout>
    )
  }

  if (!draft) {
    return <Navigate to={portalRoutePaths.volunteer.assignments} replace />
  }

  const activeDraft = draft

  async function confirmSubmit() {
    if (!activeDraft.totals.isReady) return

    setBusy(true)
    setError(null)
    try {
      await submitPersistedVolunteerEvaluation(activeDraft.assignment.requestId)
      navigate(
        `/volunteer/evaluation/${encodeURIComponent(activeDraft.assignment.submissionId)}/submitted`,
        { replace: true },
      )
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to submit evaluation.')
      setBusy(false)
    }
  }

  return (
    <VolunteerLayout
      ariaLabel="Final Evaluator Submission"
      topbarTitle="Human Evaluation Workspace"
      activeNav="assignments"
    >
      <h2 className="auratio-volunteer-page-title">Final evaluator submission</h2>
      <p className="auratio-volunteer-page-subtitle">
        {draft.assignment.submissionRef} • version {draft.assignment.versionNumber}
      </p>

      <div
        className="auratio-volunteer-panel"
        style={{ left: '30px', top: '124px', width: '1076px', height: '360px', padding: '24px', boxSizing: 'border-box' }}
      >
        <h3 className="auratio-volunteer-panel-title" style={{ position: 'static' }}>
          Review persisted evaluation
        </h3>
        <p>Universal Delivery: {draft.totals.universalDelivery} / 40</p>
        <p>Structural Flow: {draft.totals.structuralFlow} / 20</p>
        <p>Track Specialisation: {draft.totals.trackSpecialisation} / 40</p>
        <p><strong>Submission Score: {draft.totals.submissionScore} / 100</strong></p>
        <p>Criteria complete: {draft.totals.structuredFeedbackCount} / 16</p>
        <p>Overall Summary: {draft.totals.isOverallSummaryComplete ? 'Complete' : 'Missing'}</p>
        <p>
          Submitted evaluator versions are immutable active work. Re-review creates a new version through the Admin lifecycle.
        </p>
      </div>

      {error && <p role="alert" style={{ position: 'absolute', left: '30px', top: '510px' }}>{error}</p>}

      <button
        type="button"
        disabled={busy || !draft.totals.isReady}
        onClick={() => void confirmSubmit()}
        className="auratio-volunteer-btn auratio-volunteer-btn--primary"
        style={{ position: 'absolute', left: '30px', top: '560px', width: '210px', height: '44px' }}
      >
        {busy ? 'Submitting…' : 'Confirm Submit'}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => navigate(`/volunteer/evaluation/${encodeURIComponent(draft.assignment.submissionId)}`)}
        className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
        style={{ position: 'absolute', left: '258px', top: '560px', width: '130px', height: '44px' }}
      >
        Cancel
      </button>
    </VolunteerLayout>
  )
}
