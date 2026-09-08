import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { portalRoutePaths } from '../../../app/routes/routePaths'
import { VolunteerLayout } from '../components/VolunteerLayout'
import { PersistedVolunteerVideoPlayer } from '../components/PersistedVolunteerVideoPlayer'
import {
  formatAnchorScoreRange,
  getAnchorScoreValidationMessage,
  getCriterionAnchorDescriptions,
  isAnchorScoreCompatible,
  type QualitativeAnchor,
} from '../data/generatedRubricAnchors'
import {
  loadPersistedVolunteerScoringDraft,
  savePersistedCriterionFeedback,
  secondsToTimestamp,
  timestampToSeconds,
  type PersistedVolunteerScoringDraft,
} from '../integration/persistedVolunteerScoring'

export function PersistedVolunteerCriterionFeedbackEditorPage() {
  const navigate = useNavigate()
  const { submissionId, criterionId: pathCriterionId } = useParams<{
    submissionId?: string
    criterionId?: string
  }>()
  const [searchParams] = useSearchParams()
  const persistedSubmissionId = submissionId ? decodeURIComponent(submissionId) : ''
  const requestedCriterionId = pathCriterionId
    ? decodeURIComponent(pathCriterionId)
    : searchParams.get('criterionId')

  const [draft, setDraft] = useState<PersistedVolunteerScoringDraft | null>(null)
  const [loading, setLoading] = useState(true)
  const [anchor, setAnchor] = useState<QualitativeAnchor | null>(null)
  const [score, setScore] = useState('')
  const [timestamp, setTimestamp] = useState('')
  const [evidence, setEvidence] = useState('')
  const [strength, setStrength] = useState('')
  const [weakness, setWeakness] = useState('')
  const [improvement, setImprovement] = useState('')
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
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load criterion.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [persistedSubmissionId])

  const criterion = useMemo(() => {
    if (!draft) return null
    if (requestedCriterionId) {
      return draft.criteria.find((item) => item.id === requestedCriterionId) ?? null
    }
    return draft.criteria[0] ?? null
  }, [draft, requestedCriterionId])

  useEffect(() => {
    if (!criterion) return
    const feedback = criterion.feedback
    setAnchor(feedback?.anchor ?? null)
    setScore(feedback ? String(feedback.score) : '')
    setTimestamp(feedback ? secondsToTimestamp(feedback.primaryTimestampSeconds) : '')
    setEvidence(feedback?.evidence ?? '')
    setStrength(feedback?.strength ?? '')
    setWeakness(feedback?.weakness ?? '')
    setImprovement(feedback?.actionableImprovement ?? '')
    setError(null)
  }, [criterion?.id])

  if (!persistedSubmissionId) {
    return <Navigate to={portalRoutePaths.volunteer.assignments} replace />
  }

  if (loading) {
    return (
      <VolunteerLayout ariaLabel="Criterion Feedback Editor" topbarTitle="Human Evaluation Workspace" activeNav="assignments">
        <h2 className="auratio-volunteer-page-title">Loading criterion…</h2>
      </VolunteerLayout>
    )
  }

  if (!draft || !criterion) {
    return <Navigate to={portalRoutePaths.volunteer.assignments} replace />
  }

  const parsedScore = score === '' ? null : Number(score)
  const timestampSeconds = timestampToSeconds(timestamp)
  const scoreValid =
    anchor !== null &&
    parsedScore !== null &&
    Number.isInteger(parsedScore) &&
    isAnchorScoreCompatible(criterion.maxPoints, anchor, parsedScore)

  const activeDraft = draft
  const activeCriterion = criterion

  async function saveCriterion() {
    if (!anchor) {
      setError('Select Low, Competent, or Excellent first.')
      return
    }
    if (parsedScore === null || !scoreValid) {
      setError(getAnchorScoreValidationMessage(activeCriterion.maxPoints, anchor))
      return
    }
    if (timestampSeconds === null) {
      setError('A valid mm:ss timestamp is required.')
      return
    }
    if (!evidence.trim() || !strength.trim() || !weakness.trim() || !improvement.trim()) {
      setError('Evidence, strength, weakness, and actionable improvement are all required.')
      return
    }

    setBusy(true)
    setError(null)
    try {
      await savePersistedCriterionFeedback(activeDraft.assignment.requestId, activeCriterion, {
        criterionId: activeCriterion.id,
        anchor,
        score: parsedScore,
        primaryTimestampSeconds: timestampSeconds,
        evidence,
        strength,
        weakness,
        actionableImprovement: improvement,
      })
      navigate(`/volunteer/evaluation/${encodeURIComponent(activeDraft.assignment.submissionId)}`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save criterion.')
      setBusy(false)
    }
  }

  const descriptions = getCriterionAnchorDescriptions(criterion.id)

  return (
    <VolunteerLayout
      ariaLabel="Criterion Feedback Editor"
      topbarTitle="Human Evaluation Workspace"
      topbarRightVariant="scoring"
      activeNav="assignments"
    >
      <h2 className="auratio-volunteer-page-title" style={{ top: '32px', maxWidth: '880px' }}>
        Criterion Feedback — {criterion.name}
      </h2>
      <p className="auratio-volunteer-page-subtitle" style={{ top: '74px' }}>
        {draft.assignment.track} • {criterion.category} • {criterion.maxPoints} points
      </p>

      <PersistedVolunteerVideoPlayer submissionId={draft.assignment.submissionId} />

      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '474px',
          width: '1076px',
          minHeight: '690px',
          padding: '24px',
          boxSizing: 'border-box',
        }}
      >
        <label style={{ display: 'block', fontWeight: 600 }}>Criterion</label>
        <select
          value={criterion.id}
          disabled={busy}
          onChange={(event) =>
            navigate(
              `/volunteer/evaluation/${encodeURIComponent(draft.assignment.submissionId)}/criterion/${encodeURIComponent(event.target.value)}`,
            )
          }
          style={{ width: '100%', height: '42px', margin: '8px 0 20px' }}
        >
          {draft.criteria.map((item) => (
            <option key={item.id} value={item.id}>
              {item.category}: {item.name} ({item.maxPoints} pts)
            </option>
          ))}
        </select>

        <fieldset disabled={busy} style={{ border: 0, padding: 0 }}>
          <legend style={{ fontWeight: 600 }}>Anchor-first scoring</legend>
          {(['Low', 'Competent', 'Excellent'] as const).map((level) => (
            <label key={level} style={{ marginRight: '24px' }}>
              <input
                type="radio"
                name="persisted-anchor"
                checked={anchor === level}
                onChange={() => {
                  setAnchor(level)
                  setScore('')
                  setError(null)
                }}
              />
              {' '}{level} ({formatAnchorScoreRange(criterion.maxPoints, level)})
            </label>
          ))}
        </fieldset>

        {anchor && descriptions && (
          <p style={{ color: 'var(--auratio-neutral-600)' }}>
            {anchor}: {descriptions[anchor]}
          </p>
        )}

        <label style={{ display: 'block', marginTop: '18px', fontWeight: 600 }}>
          Exact score
        </label>
        <input
          type="number"
          value={score}
          disabled={busy || !anchor}
          onChange={(event) => setScore(event.target.value)}
          style={{ width: '180px', height: '40px' }}
        />

        <label style={{ display: 'block', marginTop: '18px', fontWeight: 600 }}>
          Primary evidence timestamp (mm:ss)
        </label>
        <input
          type="text"
          value={timestamp}
          disabled={busy}
          onChange={(event) => setTimestamp(event.target.value)}
          placeholder="01:24"
          style={{ width: '180px', height: '40px' }}
        />

        {[
          ['Evidence', evidence, setEvidence],
          ['Strength', strength, setStrength],
          ['Weakness', weakness, setWeakness],
          ['Actionable improvement', improvement, setImprovement],
        ].map(([label, value, setter]) => (
          <label key={label as string} style={{ display: 'block', marginTop: '16px', fontWeight: 600 }}>
            {label as string}
            <textarea
              value={value as string}
              disabled={busy}
              onChange={(event) => (setter as React.Dispatch<React.SetStateAction<string>>)(event.target.value)}
              style={{ width: '100%', height: '58px', display: 'block', marginTop: '6px', boxSizing: 'border-box' }}
            />
          </label>
        ))}

        {error && <p role="alert">{error}</p>}

        <button
          type="button"
          disabled={busy}
          onClick={() => void saveCriterion()}
          className="auratio-volunteer-btn auratio-volunteer-btn--primary"
          style={{ width: '190px', height: '44px', marginTop: '18px' }}
        >
          {busy ? 'Saving…' : 'Save Criterion'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => navigate(`/volunteer/evaluation/${encodeURIComponent(draft.assignment.submissionId)}`)}
          className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
          style={{ width: '170px', height: '44px', marginTop: '18px', marginLeft: '12px' }}
        >
          Back to Scores
        </button>
      </div>
    </VolunteerLayout>
  )
}
