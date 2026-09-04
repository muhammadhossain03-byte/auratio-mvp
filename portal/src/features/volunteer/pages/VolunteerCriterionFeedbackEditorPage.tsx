import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams, Navigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { VolunteerLayout } from '../components/VolunteerLayout'
import {
  getVolunteerAssignment,
  getScoringDraft,
  saveCriterionScoreData,
  getCriteriaForTrack,
  isValidTimestamp,
  isEvaluationSubmitted,
  getCompletedRouteForSubmission,
  type QualitativeAnchor,
} from '../data/mockVolunteerData'

export function VolunteerCriterionFeedbackEditorPage() {
  const navigate = useNavigate()
  const { submissionId: routeSubmissionId, criterionId: pathCriterionId } = useParams<{
    submissionId?: string
    criterionId?: string
  }>()
  const [searchParams] = useSearchParams()
  const queryCriterionId = searchParams.get('criterionId')
  const requestedCriterionId = pathCriterionId || queryCriterionId

  const submissionId = (routeSubmissionId || 'SUB-8821').toUpperCase()
  const assignment = getVolunteerAssignment(submissionId)
  const isSubmitted = isEvaluationSubmitted(submissionId)

  const trackSlug = assignment?.trackSlug || 'business-pitch'
  const allCriteria = getCriteriaForTrack(trackSlug)

  const activeCriterion =
    allCriteria.find((c) => c.id === requestedCriterionId) ||
    allCriteria[0] || {
      id: 'ud-pacing',
      name: 'Pacing, WPM calibration, and pause placement',
      category: 'Universal Delivery',
      maxPoints: 5,
    }

  const draft = getScoringDraft(submissionId)
  const initialData = draft?.criteria[activeCriterion.id]

  const [anchor, setAnchor] = useState<QualitativeAnchor | null>(initialData?.anchor || null)
  const [exactScore, setExactScore] = useState<string>(
    initialData?.exactScore !== null && initialData?.exactScore !== undefined
      ? String(initialData.exactScore)
      : ''
  )
  const [evidenceTimestamp, setEvidenceTimestamp] = useState<string>(
    initialData?.evidenceTimestamp || ''
  )
  const [evidence, setEvidence] = useState<string>(initialData?.evidence || '')
  const [strength, setStrength] = useState<string>(initialData?.strength || '')
  const [weakness, setWeakness] = useState<string>(initialData?.weakness || '')
  const [advice, setAdvice] = useState<string>(initialData?.advice || '')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const currentKey = `${submissionId}_${activeCriterion.id}`
  const [prevKey, setPrevKey] = useState(currentKey)

  useEffect(() => {
    if (isSubmitted) {
      navigate(getCompletedRouteForSubmission(submissionId), { replace: true })
    } else if (!assignment) {
      navigate(portalRoutePaths.volunteer.assignments, { replace: true })
    }
  }, [isSubmitted, assignment, navigate, submissionId])

  if (isSubmitted) {
    return <Navigate to={getCompletedRouteForSubmission(submissionId)} replace />
  }

  if (!assignment) {
    return <Navigate to={portalRoutePaths.volunteer.assignments} replace />
  }

  if (prevKey !== currentKey) {
    setPrevKey(currentKey)
    const currentDraft = getScoringDraft(submissionId)
    const cData = currentDraft?.criteria[activeCriterion.id]
    if (cData) {
      setAnchor(cData.anchor)
      setExactScore(cData.exactScore !== null && cData.exactScore !== undefined ? String(cData.exactScore) : '')
      setEvidenceTimestamp(cData.evidenceTimestamp || '')
      setEvidence(cData.evidence || '')
      setStrength(cData.strength || '')
      setWeakness(cData.weakness || '')
      setAdvice(cData.advice || '')
    } else {
      setAnchor(null)
      setExactScore('')
      setEvidenceTimestamp('')
      setEvidence('')
      setStrength('')
      setWeakness('')
      setAdvice('')
    }
    setErrorMessage('')
  }

  if (!assignment) {
    return null
  }

  const parsedScore = exactScore === '' ? null : Number(exactScore)
  const isScoreValid =
    anchor !== null &&
    parsedScore !== null &&
    !isNaN(parsedScore) &&
    Number.isInteger(parsedScore) &&
    parsedScore >= 0 &&
    parsedScore <= activeCriterion.maxPoints

  const isTimestampValid = isValidTimestamp(evidenceTimestamp)
  const isEvidenceTextValid = evidence.trim().length > 0
  const isTimestampedEvidenceComplete = isTimestampValid && isEvidenceTextValid
  const strengthComplete = strength.trim().length > 0
  const weaknessComplete = weakness.trim().length > 0
  const adviceComplete = advice.trim().length > 0

  const handleAnchorChange = (newAnchor: QualitativeAnchor) => {
    setAnchor(newAnchor)
    setErrorMessage('')
  }

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (!anchor) return

    if (val === '') {
      setExactScore('')
      setErrorMessage('')
      return
    }

    const num = Number(val)
    if (isNaN(num)) return

    if (!Number.isInteger(num)) {
      setErrorMessage('Score must be a whole number (integer).')
    } else if (num < 0 || num > activeCriterion.maxPoints) {
      setErrorMessage(
        `Score cannot exceed ${activeCriterion.maxPoints} pts.`
      )
    } else {
      setErrorMessage('')
    }

    setExactScore(val)
  }

  const handleBackToScores = () => {
    navigate(`/volunteer/evaluation/${submissionId.toLowerCase()}`)
  }

  const handleSave = () => {
    if (!anchor) {
      setErrorMessage('Please select an anchor level first.')
      return
    }

    if (!isScoreValid || parsedScore === null) {
      if (parsedScore !== null && (parsedScore < 0 || parsedScore > activeCriterion.maxPoints || !Number.isInteger(parsedScore))) {
        setErrorMessage(
          `Score must be a whole number between 0 and ${activeCriterion.maxPoints} pts.`
        )
      } else {
        setErrorMessage('Please enter a valid numeric score.')
      }
      return
    }

    if (!isTimestampValid) {
      setErrorMessage('A valid timestamp in mm:ss format is required (e.g. 01:24).')
      return
    }

    if (!isEvidenceTextValid) {
      setErrorMessage('Timestamped evidence narrative observation is required.')
      return
    }

    if (!strengthComplete) {
      setErrorMessage('Strength observation is required.')
      return
    }

    if (!weaknessComplete) {
      setErrorMessage('Weakness observation is required.')
      return
    }

    if (!adviceComplete) {
      setErrorMessage('Actionable improvement advice is required.')
      return
    }

    // Save to draft - never manufacture '01:00' or any fallback!
    setErrorMessage('')
    saveCriterionScoreData(submissionId, activeCriterion.id, {
      anchor,
      exactScore: parsedScore,
      evidenceTimestamp: evidenceTimestamp.trim(),
      evidence: evidence.trim(),
      strength: strength.trim(),
      weakness: weakness.trim(),
      advice: advice.trim(),
    })

    navigate(`/volunteer/evaluation/${submissionId.toLowerCase()}`)
  }

  return (
    <VolunteerLayout
      ariaLabel="Criterion Feedback Editor"
      topbarTitle="Human Evaluation Workspace"
      topbarRightVariant="scoring"
      activeNav="assignments"
    >
      <h2 className="auratio-volunteer-page-title" style={{ top: '32px' }}>
        Criterion Feedback — {activeCriterion.name}
      </h2>
      <p className="auratio-volunteer-page-subtitle" style={{ top: '74px' }}>
        {assignment.track} • {activeCriterion.category} • {activeCriterion.maxPoints} points
      </p>

      {/* Header Status Pill */}
      <div
        className="auratio-volunteer-pill auratio-volunteer-pill--in-evaluation-header"
        style={{
          position: 'absolute',
          left: '920px',
          top: '34px',
          width: '150px',
          height: '36px',
        }}
      >
        In Evaluation
      </div>

      {/* Scoring Context Panel */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '118px',
          width: '1076px',
          height: '130px',
          borderRadius: '14px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Scoring context</h3>

        {/* Criterion Selector Dropdown */}
        <div style={{ position: 'absolute', right: '18px', top: '16px' }}>
          <label
            htmlFor="criterion-select"
            style={{
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--auratio-neutral-600)',
              marginRight: '8px',
            }}
          >
            Criterion:
          </label>
          <select
            id="criterion-select"
            aria-label="Select criterion"
            value={activeCriterion.id}
            onChange={(e) =>
              navigate(
                `/volunteer/evaluation/${submissionId.toLowerCase()}/criterion?criterionId=${encodeURIComponent(
                  e.target.value
                )}`
              )
            }
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--auratio-neutral-300)',
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '12px',
              color: 'var(--auratio-neutral-800)',
            }}
          >
            {allCriteria.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category}: {c.name} ({c.maxPoints} pts)
              </option>
            ))}
          </select>
        </div>

        {/* Anchor options */}
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '52px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Anchor Level
        </span>
        <div
          style={{
            position: 'absolute',
            left: '110px',
            top: '48px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--auratio-neutral-900)',
            }}
          >
            <input
              type="radio"
              name="anchor"
              value="Low"
              checked={anchor === 'Low'}
              onChange={() => handleAnchorChange('Low')}
            />
            Low
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--auratio-neutral-900)',
            }}
          >
            <input
              type="radio"
              name="anchor"
              value="Competent"
              checked={anchor === 'Competent'}
              onChange={() => handleAnchorChange('Competent')}
            />
            Competent
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--auratio-neutral-900)',
            }}
          >
            <input
              type="radio"
              name="anchor"
              value="Excellent"
              checked={anchor === 'Excellent'}
              onChange={() => handleAnchorChange('Excellent')}
            />
            Excellent
          </label>
        </div>

        {/* Exact score input */}
        <span
          style={{
            position: 'absolute',
            left: '560px',
            top: '52px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Exact score
        </span>
        <input
          type="number"
          aria-label="Exact score"
          disabled={!anchor}
          value={exactScore}
          onChange={handleScoreChange}
          placeholder={anchor ? `0–${activeCriterion.maxPoints}` : 'Select anchor'}
          min={0}
          max={activeCriterion.maxPoints}
          style={{
            position: 'absolute',
            left: '640px',
            top: '44px',
            width: '100px',
            height: '32px',
            boxSizing: 'border-box',
            padding: '4px 8px',
            border: '1px solid var(--auratio-neutral-300)',
            borderRadius: '6px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--auratio-neutral-900)',
            backgroundColor: anchor ? 'var(--auratio-surface-default)' : 'var(--auratio-neutral-100)',
            cursor: anchor ? 'text' : 'not-allowed',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: '748px',
            top: '50px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--auratio-neutral-600)',
          }}
        >
          / {activeCriterion.maxPoints} pts
        </span>

        {/* Evidence timestamp input */}
        <span
          style={{
            position: 'absolute',
            left: '840px',
            top: '52px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Timestamp
        </span>
        <input
          type="text"
          aria-label="Evidence timestamp"
          value={evidenceTimestamp}
          onChange={(e) => setEvidenceTimestamp(e.target.value)}
          placeholder="e.g. 01:24"
          style={{
            position: 'absolute',
            left: '920px',
            top: '44px',
            width: '120px',
            height: '32px',
            boxSizing: 'border-box',
            padding: '4px 8px',
            border: '1px solid var(--auratio-neutral-300)',
            borderRadius: '6px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            color: 'var(--auratio-neutral-900)',
          }}
        />

        <p
          style={{
            position: 'absolute',
            left: '18px',
            top: '92px',
            width: '1000px',
            margin: 0,
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Anchor must be selected before the exact numeric score. Exact score is disabled until an anchor level is selected.
        </p>
      </div>

      {/* Required Structured Feedback Section Title */}
      <h3
        style={{
          position: 'absolute',
          left: '30px',
          top: '262px',
          margin: 0,
          fontFamily: 'var(--auratio-font-family-inter), sans-serif',
          fontSize: '24px',
          fontWeight: 700,
          lineHeight: '32px',
          letterSpacing: '-0.0125em',
          color: 'var(--auratio-neutral-900)',
        }}
      >
        Required structured feedback
      </h3>
      <p
        style={{
          position: 'absolute',
          left: '30px',
          top: '300px',
          margin: 0,
          fontFamily: 'var(--auratio-font-family-inter), sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: '20px',
          color: 'var(--auratio-neutral-600)',
        }}
      >
        All four fields are required and stored separately for this criterion.
      </p>

      {/* 4 Feedback Cards (2x2 Grid) */}
      {/* 1. Timestamped Evidence */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '338px',
          width: '520px',
          height: '154px',
          borderRadius: '14px',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '16px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Timestamped evidence
        </span>
        <textarea
          aria-label="Timestamped evidence"
          className="auratio-volunteer-feedback-textarea auratio-volunteer-feedback-textarea--evidence"
          value={evidence}
          onChange={(e) => {
            setEvidence(e.target.value)
            setErrorMessage('')
          }}
          placeholder="e.g. At 01:24, speaker provides clear problem framing..."
          style={{
            position: 'absolute',
            left: '16px',
            top: '46px',
            width: '488px',
            height: '70px',
            boxSizing: 'border-box',
            padding: '10px 14px',
            border: '1px solid var(--auratio-neutral-300)',
            borderRadius: '10px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-800)',
            backgroundColor: 'var(--auratio-surface-default)',
            resize: 'none',
            outline: 'none',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '122px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Observable, judging-relevant moment tied to the submitted video.
        </span>
      </div>

      {/* 2. Strength */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '586px',
          top: '338px',
          width: '520px',
          height: '154px',
          borderRadius: '14px',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '16px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Strength
        </span>
        <textarea
          aria-label="Strength"
          className="auratio-volunteer-feedback-textarea auratio-volunteer-feedback-textarea--strength"
          value={strength}
          onChange={(e) => {
            setStrength(e.target.value)
            setErrorMessage('')
          }}
          placeholder="What the speaker did effectively for this criterion..."
          style={{
            position: 'absolute',
            left: '16px',
            top: '46px',
            width: '488px',
            height: '70px',
            boxSizing: 'border-box',
            padding: '10px 14px',
            border: '1px solid var(--auratio-neutral-300)',
            borderRadius: '10px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-800)',
            backgroundColor: 'var(--auratio-surface-default)',
            resize: 'none',
            outline: 'none',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '122px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          What the speaker did effectively for this criterion.
        </span>
      </div>

      {/* 3. Weakness */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '512px',
          width: '520px',
          height: '154px',
          borderRadius: '14px',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '16px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Weakness
        </span>
        <textarea
          aria-label="Weakness"
          className="auratio-volunteer-feedback-textarea auratio-volunteer-feedback-textarea--weakness"
          value={weakness}
          onChange={(e) => {
            setWeakness(e.target.value)
            setErrorMessage('')
          }}
          placeholder="Specific limitation or gap; avoid generic criticism..."
          style={{
            position: 'absolute',
            left: '16px',
            top: '46px',
            width: '488px',
            height: '70px',
            boxSizing: 'border-box',
            padding: '10px 14px',
            border: '1px solid var(--auratio-neutral-300)',
            borderRadius: '10px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-800)',
            backgroundColor: 'var(--auratio-surface-default)',
            resize: 'none',
            outline: 'none',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '122px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Specific limitation or gap; avoid generic criticism.
        </span>
      </div>

      {/* 4. Actionable Improvement Advice */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '586px',
          top: '512px',
          width: '520px',
          height: '154px',
          borderRadius: '14px',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '16px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Actionable improvement advice
        </span>
        <textarea
          aria-label="Actionable improvement advice"
          className="auratio-volunteer-feedback-textarea auratio-volunteer-feedback-textarea--advice"
          value={advice}
          onChange={(e) => {
            setAdvice(e.target.value)
            setErrorMessage('')
          }}
          placeholder="Concrete next action the speaker can apply on the next attempt..."
          style={{
            position: 'absolute',
            left: '16px',
            top: '46px',
            width: '488px',
            height: '70px',
            boxSizing: 'border-box',
            padding: '10px 14px',
            border: '1px solid var(--auratio-neutral-300)',
            borderRadius: '10px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-800)',
            backgroundColor: 'var(--auratio-surface-default)',
            resize: 'none',
            outline: 'none',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '122px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Concrete next action the speaker can apply on the next attempt.
        </span>
      </div>

      {/* Criterion Completeness Panel */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '696px',
          width: '1076px',
          height: '64px',
          backgroundColor: 'var(--auratio-amber-50)',
          borderColor: 'var(--auratio-neutral-200)',
          borderRadius: '10px',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '20px',
            width: '180px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-amber-700)',
          }}
        >
          Criterion completeness
        </span>
        <span
          className="auratio-volunteer-criterion-completeness-row"
          style={{
            position: 'absolute',
            left: '220px',
            top: '20px',
            width: '820px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-amber-700)',
          }}
        >
          Anchor {anchor ? '✓' : '—'}&nbsp;&nbsp;&nbsp;Exact score {isScoreValid ? '✓' : '—'}&nbsp;&nbsp;&nbsp;Timestamped evidence {isTimestampedEvidenceComplete ? '✓' : '—'}&nbsp;&nbsp;&nbsp;Strength {strengthComplete ? '✓' : '—'}&nbsp;&nbsp;&nbsp;Weakness {weaknessComplete ? '✓' : '—'}&nbsp;&nbsp;&nbsp;Actionable advice {adviceComplete ? '✓' : '—'}
        </span>
      </div>

      {/* Buttons & Error Message */}
      <button
        type="button"
        onClick={handleBackToScores}
        className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
        style={{
          position: 'absolute',
          left: '30px',
          top: '774px',
          width: '160px',
          height: '40px',
          borderRadius: '8px',
        }}
      >
        Back to Scores
      </button>

      <button
        type="button"
        onClick={handleSave}
        className="auratio-volunteer-btn auratio-volunteer-btn--primary"
        style={{
          position: 'absolute',
          left: '208px',
          top: '774px',
          width: '220px',
          height: '40px',
          borderRadius: '8px',
        }}
      >
        Save Criterion Feedback
      </button>

      {errorMessage && (
        <span
          role="alert"
          style={{
            position: 'absolute',
            left: '450px',
            top: '784px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            color: '#b91c1c',
          }}
        >
          {errorMessage}
        </span>
      )}
    </VolunteerLayout>
  )
}
