import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { VolunteerLayout } from '../components/VolunteerLayout'

export function VolunteerCriterionFeedbackEditorPage() {
  const navigate = useNavigate()

  const [evidence, setEvidence] = useState('At 01:38, benefits are concrete and differentiated.')
  const [strength, setStrength] = useState('Value is clear and differentiated.')
  const [weakness, setWeakness] = useState('Pricing proof is not yet quantified.')
  const [advice, setAdvice] = useState('Add one quantified customer or pricing outcome.')

  const evidenceComplete = evidence.trim().length > 0
  const strengthComplete = strength.trim().length > 0
  const weaknessComplete = weakness.trim().length > 0
  const adviceComplete = advice.trim().length > 0

  const feedbackComplete =
    evidenceComplete &&
    strengthComplete &&
    weaknessComplete &&
    adviceComplete

  const handleBackToScores = () => {
    navigate(portalRoutePaths.volunteer.scoringWorkspace)
  }

  const handleSave = () => {
    if (!feedbackComplete) {
      return
    }
    navigate(portalRoutePaths.volunteer.scoringWorkspace)
  }

  return (
    <VolunteerLayout
      ariaLabel="Criterion Feedback Editor"
      topbarTitle="Human Evaluation Workspace"
      topbarRightVariant="scoring"
      activeNav="assignments"
    >
      <h2 className="auratio-volunteer-page-title" style={{ top: '32px' }}>
        Criterion Feedback — Value proposition clarity
      </h2>
      <p className="auratio-volunteer-page-subtitle" style={{ top: '74px' }}>
        Business Pitch / Sales Pitch • Track Specialisation • 10 points
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
          height: '112px',
          borderRadius: '14px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Scoring context</h3>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '54px',
            width: '160px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Anchor
        </span>
        <span
          style={{
            position: 'absolute',
            left: '106px',
            top: '50px',
            width: '140px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Excellent
        </span>

        <span
          style={{
            position: 'absolute',
            left: '288px',
            top: '54px',
            width: '160px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Exact score
        </span>
        <span
          style={{
            position: 'absolute',
            left: '376px',
            top: '50px',
            width: '140px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          9 / 10
        </span>

        <span
          style={{
            position: 'absolute',
            left: '818px',
            top: '54px',
            width: '118px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Evidence timestamp
        </span>
        <span
          style={{
            position: 'absolute',
            left: '938px',
            top: '50px',
            width: '140px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          01:38
        </span>

        <p
          style={{
            position: 'absolute',
            left: '18px',
            top: '84px',
            width: '1000px',
            margin: 0,
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Anchor must be selected before the exact numeric score. These scoring values remain separate from feedback fields.
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
          onChange={(e) => setEvidence(e.target.value)}
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
            color: 'var(--auratio-neutral-600)',
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
          onChange={(e) => setStrength(e.target.value)}
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
            color: 'var(--auratio-neutral-600)',
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
          onChange={(e) => setWeakness(e.target.value)}
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
            color: 'var(--auratio-neutral-600)',
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
          onChange={(e) => setAdvice(e.target.value)}
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
            color: 'var(--auratio-neutral-600)',
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
          Anchor ✓&nbsp;&nbsp;&nbsp;Exact score ✓&nbsp;&nbsp;&nbsp;Timestamped evidence {evidenceComplete ? '✓' : '—'}&nbsp;&nbsp;&nbsp;Strength {strengthComplete ? '✓' : '—'}&nbsp;&nbsp;&nbsp;Weakness {weaknessComplete ? '✓' : '—'}&nbsp;&nbsp;&nbsp;Actionable advice {adviceComplete ? '✓' : '—'}
        </span>
      </div>

      {/* Buttons */}
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
    </VolunteerLayout>
  )
}
