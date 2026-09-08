import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { portalRoutePaths } from '../../../app/routes/routePaths'
import { VolunteerLayout } from '../components/VolunteerLayout'
import { PersistedVolunteerVideoPlayer } from '../components/PersistedVolunteerVideoPlayer'
import {
  beginPersistedVolunteerEvaluation,
  loadPersistedVolunteerAssignment,
  type PersistedVolunteerAssignment,
} from '../integration/persistedVolunteerLifecycle'
import {
  loadPersistedVolunteerScoringDraft,
  savePersistedOverallSummary,
  type PersistedVolunteerScoringDraft,
} from '../integration/persistedVolunteerScoring'

export function PersistedVolunteerScoringPendingPage() {
  const navigate = useNavigate()
  const { submissionId } = useParams<{ submissionId?: string }>()
  const persistedSubmissionId = submissionId ? decodeURIComponent(submissionId) : ''
  const [assignment, setAssignment] = useState<PersistedVolunteerAssignment | null>(null)
  const [draft, setDraft] = useState<PersistedVolunteerScoringDraft | null>(null)
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function loadWorkspace() {
    if (!persistedSubmissionId) return
    const currentAssignment = await loadPersistedVolunteerAssignment(persistedSubmissionId)
    setAssignment(currentAssignment)

    if (currentAssignment?.assignmentStatus === 'In Evaluation') {
      const currentDraft = await loadPersistedVolunteerScoringDraft(persistedSubmissionId)
      setDraft(currentDraft)
      setSummary(currentDraft?.overallSummary ?? '')
    } else {
      setDraft(null)
      setSummary('')
    }
  }

  useEffect(() => {
    if (!persistedSubmissionId) {
      setLoading(false)
      return
    }

    let active = true
    void loadWorkspace()
      .catch((cause: unknown) => {
        if (active) setMessage(cause instanceof Error ? cause.message : 'Unable to load evaluation.')
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
    setMessage(null)
    try {
      await beginPersistedVolunteerEvaluation(assignment.requestId)
      await loadWorkspace()
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Unable to begin evaluation.')
    } finally {
      setBusy(false)
    }
  }

  async function saveSummary() {
    if (!draft) return
    setBusy(true)
    setMessage(null)
    try {
      await savePersistedOverallSummary(draft.assignment.requestId, summary)
      await loadWorkspace()
      setMessage('Overall Summary saved.')
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Unable to save Overall Summary.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <VolunteerLayout
        ariaLabel="Human Evaluation Workspace"
        topbarTitle="Human Evaluation Workspace"
        activeNav="assignments"
      >
        <h2 className="auratio-volunteer-page-title">Loading persisted evaluation…</h2>
      </VolunteerLayout>
    )
  }

  if (!assignment) {
    return <Navigate to={portalRoutePaths.volunteer.assignments} replace />
  }

  const encodedSubmissionId = encodeURIComponent(assignment.submissionId)

  if (assignment.assignmentStatus === 'Assigned') {
    return <Navigate to={`/volunteer/assignments/${encodedSubmissionId}`} replace />
  }

  if (assignment.assignmentStatus === 'Accepted') {
    return (
      <VolunteerLayout
        ariaLabel="Human Evaluation Workspace"
        topbarTitle="Human Evaluation Workspace"
        activeNav="assignments"
      >
        <h2 className="auratio-volunteer-page-title">{assignment.submissionRef}</h2>
        <p className="auratio-volunteer-page-subtitle">
          Accepted Human evaluation • version {assignment.versionNumber}
        </p>
        <div
          className="auratio-volunteer-panel"
          style={{
            left: '30px',
            top: '124px',
            width: '1076px',
            height: '260px',
            padding: '24px',
            boxSizing: 'border-box',
          }}
        >
          <h3 className="auratio-volunteer-panel-title" style={{ position: 'static' }}>
            Begin persisted evaluation
          </h3>
          <p>
            Begin Evaluation persists the In Evaluation transition before any criterion data can be edited.
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
          {message && <p role="alert">{message}</p>}
        </div>
      </VolunteerLayout>
    )
  }

  if (!draft) {
    return <Navigate to={portalRoutePaths.volunteer.assignments} replace />
  }

  const { totals } = draft

  return (
    <VolunteerLayout
      ariaLabel="Evaluator Scoring Workspace"
      topbarTitle="Human Evaluation Workspace"
      topbarRightVariant="scoring"
      activeNav="assignments"
    >
      <h2 className="auratio-volunteer-page-title" style={{ top: '32px' }}>
        {assignment.submissionRef}
      </h2>
      <p className="auratio-volunteer-page-subtitle" style={{ top: '74px' }}>
        {assignment.track} • persisted Human Evaluation • version {assignment.versionNumber}
      </p>

      <PersistedVolunteerVideoPlayer submissionId={assignment.submissionId} />

      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '474px',
          width: '1076px',
          minHeight: '720px',
          padding: '24px',
          boxSizing: 'border-box',
        }}
      >
        <h3 className="auratio-volunteer-panel-title" style={{ position: 'static' }}>
          Criterion scoring
        </h3>
        <p style={{ color: 'var(--auratio-neutral-600)' }}>
          {totals.criterionScoresCount} / 16 criteria saved • score {totals.submissionScore} / 100
        </p>

        <div style={{ marginTop: '22px' }}>
          {draft.criteria.map((criterion) => (
            <div
              key={criterion.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 150px 110px 160px',
                gap: '16px',
                alignItems: 'center',
                minHeight: '50px',
                borderTop: '1px solid var(--auratio-neutral-200)',
              }}
            >
              <span>{criterion.name}</span>
              <span>{criterion.category}</span>
              <span>
                {criterion.feedback
                  ? `${criterion.feedback.score} / ${criterion.maxPoints}`
                  : `— / ${criterion.maxPoints}`}
              </span>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/volunteer/evaluation/${encodedSubmissionId}/criterion/${encodeURIComponent(criterion.id)}`,
                  )
                }
                className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
                style={{ width: '150px', height: '36px' }}
              >
                {criterion.feedback ? 'Edit Feedback' : 'Score Criterion'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '1218px',
          width: '1076px',
          height: '240px',
          padding: '24px',
          boxSizing: 'border-box',
        }}
      >
        <h3 className="auratio-volunteer-panel-title" style={{ position: 'static' }}>
          Overall Summary
        </h3>
        <textarea
          value={summary}
          disabled={busy}
          onChange={(event) => setSummary(event.target.value)}
          aria-label="Overall evaluation summary"
          style={{ width: '100%', height: '90px', marginTop: '16px', boxSizing: 'border-box' }}
        />
        <button
          type="button"
          disabled={busy || !summary.trim()}
          onClick={() => void saveSummary()}
          className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
          style={{ width: '180px', height: '40px', marginTop: '12px' }}
        >
          Save Summary
        </button>
        {message && <span role="status" style={{ marginLeft: '16px' }}>{message}</span>}
      </div>

      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '1480px',
          width: '1076px',
          height: '170px',
          padding: '24px',
          boxSizing: 'border-box',
        }}
      >
        <h3 className="auratio-volunteer-panel-title" style={{ position: 'static' }}>
          Review readiness
        </h3>
        <p>
          Universal {totals.universalDelivery}/40 • Structural {totals.structuralFlow}/20 • Track {totals.trackSpecialisation}/40
        </p>
        <button
          type="button"
          disabled={!totals.isReady}
          onClick={() => navigate(`/volunteer/evaluation/${encodedSubmissionId}/review`)}
          className="auratio-volunteer-btn auratio-volunteer-btn--primary"
          style={{ width: '190px', height: '44px', opacity: totals.isReady ? 1 : 0.45 }}
        >
          Review & Submit
        </button>
      </div>
    </VolunteerLayout>
  )
}
