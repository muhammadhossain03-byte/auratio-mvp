import { Navigate, useParams } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { VolunteerLayout } from '../components/VolunteerLayout'
import { getCompletedEntity } from '../data/mockVolunteerData'

interface VolunteerCompletedDetailPageProps {
  defaultId?: string
}

export function VolunteerCompletedDetailPage({ defaultId }: VolunteerCompletedDetailPageProps) {
  const { submissionId: routeSubmissionId } = useParams<{ submissionId?: string }>()
  const rawId = routeSubmissionId || defaultId

  if (!rawId) {
    return <Navigate to={portalRoutePaths.volunteer.completedHistory} replace />
  }

  const normalizedId = rawId.toUpperCase()
  const record = getCompletedEntity(normalizedId)

  // Invariant V-02: Unknown IDs must fail safely and redirect to /volunteer/completed.
  // Never substitute another known submission as fallback data.
  if (!record) {
    return <Navigate to={portalRoutePaths.volunteer.completedHistory} replace />
  }

  // Publication state specific visual configuration
  let ariaLabel = 'Completed Detail • Pending Moderation'
  let subtitle = 'Evaluator task complete • publication decision unresolved'
  let docxText = 'Not generated — awaiting approval'
  let scoreText = record.score !== undefined ? `${record.score} / 100` : '85 / 100'
  let pillBg = 'var(--auratio-amber-50)'
  let pillColor = 'var(--auratio-amber-700)'
  let productImpactText = 'None while pending'
  let calloutBg = 'var(--auratio-amber-50)'
  let calloutTitleColor = 'var(--auratio-amber-700)'
  let calloutTextColor = 'var(--auratio-amber-700)'
  let calloutTitle = 'Completed ≠ Approved'
  let calloutDescription =
    'Your evaluator work is complete, but the score has not been approved to affect progress or rankings.'
  let workspaceConsequence =
    'This record stays in Completed / History while moderation resolves. No score-edit controls are exposed. If an Admin later requests Re-review, the relevant work returns to Active Assignments under the formal reopen workflow.'

  if (record.publicationStatus === 'Approved') {
    ariaLabel = 'Completed Detail • Approved'
    subtitle = 'Evaluator task complete • publication approved'
    docxText = 'Generated on approval'
    scoreText = record.score !== undefined ? `${record.score} / 100` : 'Approved score on record'
    pillBg = 'var(--auratio-green-50)'
    pillColor = 'var(--auratio-green-700)'
    productImpactText = 'Counts toward approved progress and Human leaderboard eligibility'
    calloutBg = 'var(--auratio-green-50)'
    calloutTitleColor = 'var(--auratio-green-700)'
    calloutTextColor = 'var(--auratio-green-700)'
    calloutTitle = 'Approved result'
    calloutDescription =
      'The approved Human score can now affect private progress and leaderboard eligibility under the normal qualification rules.'
    workspaceConsequence =
      'This record remains locked in Completed / History. Its approved evaluator-authored score is preserved; no score-edit controls are exposed.'
  } else if (record.publicationStatus === 'Rejected') {
    ariaLabel = 'Completed Detail • Rejected'
    subtitle = 'Evaluator task complete • publication rejected'
    docxText = 'Not generated — publication rejected'
    scoreText = record.score !== undefined ? `${record.score} / 100` : 'Stored with rejected record'
    pillBg = 'var(--auratio-red-50)'
    pillColor = 'var(--auratio-red-700)'
    productImpactText = 'Does not affect progress or rankings'
    calloutBg = 'var(--auratio-red-50)'
    calloutTitleColor = 'var(--auratio-red-700)'
    calloutTextColor = 'var(--auratio-red-700)'
    calloutTitle = 'Rejected evaluation'
    calloutDescription =
      'This evaluation record was rejected during moderation and does not count toward qualification or leaderboard ranking.'
    workspaceConsequence =
      'This record remains locked in Completed / History. The rejected evaluation is preserved for auditability; no score-edit controls are exposed.'
  } else if (record.publicationStatus === 'Processing') {
    ariaLabel = 'Completed Detail • Processing'
    subtitle = 'Evaluator task complete • publication decision processing'
    docxText = 'Not generated — awaiting publication decision'
    scoreText = record.score !== undefined ? `${record.score} / 100` : 'Not final'
    pillBg = 'var(--auratio-brand-blue-50)'
    pillColor = 'var(--auratio-brand-blue-700)'
    productImpactText = 'None while processing'
    calloutBg = 'var(--auratio-brand-blue-50)'
    calloutTitleColor = 'var(--auratio-brand-blue-700)'
    calloutTextColor = 'var(--auratio-brand-blue-700)'
    calloutTitle = 'Processing status'
    calloutDescription =
      'Evaluation submitted and awaiting publication routing or automated moderation check.'
    workspaceConsequence =
      'This record remains locked in Completed / History while automated routing or initial moderation checks complete. No score-edit controls are exposed.'
  }

  return (
    <VolunteerLayout
      ariaLabel={ariaLabel}
      topbarTitle="Submitted Evaluation"
      activeNav="completed"
    >
      <div
        data-testid="completed-detail-entity"
        data-submission-id={record.id}
        data-track={record.track}
        data-score={record.score}
        data-publication-status={record.publicationStatus}
      >
        <h2 className="auratio-volunteer-page-title" style={{ top: '34px' }}>
          {record.id} — Completed Evaluator Work
        </h2>
        <p className="auratio-volunteer-page-subtitle" style={{ top: '78px' }}>
          {subtitle}
        </p>

        {/* Hidden metadata element for entity and track assertions */}
        <span style={{ display: 'none' }} data-testid="completed-track">
          {record.track}
        </span>

        {/* Header Pill */}
        <div
          className="auratio-volunteer-pill auratio-volunteer-pill--assigned"
          style={{
            position: 'absolute',
            left: '918px',
            top: '36px',
            width: '150px',
            height: '34px',
          }}
        >
          Submitted
        </div>

        {/* Left Panel: Evaluator record */}
        <div
          className="auratio-volunteer-panel"
          style={{
            left: '30px',
            top: '124px',
            width: '520px',
            height: '400px',
          }}
        >
          <h3 className="auratio-volunteer-panel-title">Evaluator record</h3>

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
            Assignment Status
          </span>
          <span
            style={{
              position: 'absolute',
              left: '224px',
              top: '76px',
              width: '240px',
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '20px',
              color: 'var(--auratio-neutral-900)',
            }}
          >
            Submitted
          </span>

          <span
            style={{
              position: 'absolute',
              left: '18px',
              top: '134px',
              width: '190px',
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0.0167em',
              color: 'var(--auratio-neutral-500)',
            }}
          >
            Evaluator ownership
          </span>
          <span
            style={{
              position: 'absolute',
              left: '224px',
              top: '134px',
              width: '240px',
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '20px',
              color: 'var(--auratio-neutral-900)',
            }}
          >
            None
          </span>

          <span
            style={{
              position: 'absolute',
              left: '18px',
              top: '192px',
              width: '190px',
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0.0167em',
              color: 'var(--auratio-neutral-500)',
            }}
          >
            Submission Score
          </span>
          <span
            style={{
              position: 'absolute',
              left: '224px',
              top: '192px',
              width: '240px',
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '20px',
              letterSpacing: '0.0143em',
              color: 'var(--auratio-neutral-900)',
            }}
          >
            {scoreText}
          </span>

          <span
            style={{
              position: 'absolute',
              left: '18px',
              top: '250px',
              width: '190px',
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0.0167em',
              color: 'var(--auratio-neutral-500)',
            }}
          >
            Official .docx report
          </span>
          <span
            style={{
              position: 'absolute',
              left: '224px',
              top: '250px',
              width: '250px',
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '20px',
              color: 'var(--auratio-neutral-900)',
            }}
          >
            {docxText}
          </span>

          <span
            style={{
              position: 'absolute',
              left: '18px',
              top: '308px',
              width: '190px',
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0.0167em',
              color: 'var(--auratio-neutral-500)',
            }}
          >
            Editability
          </span>
          <span
            style={{
              position: 'absolute',
              left: '224px',
              top: '308px',
              width: '240px',
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '20px',
              color: 'var(--auratio-neutral-900)',
            }}
          >
            Locked / read-only
          </span>
        </div>

        {/* Right Panel: Publication Status */}
        <div
          className="auratio-volunteer-panel"
          style={{
            left: '580px',
            top: '124px',
            width: '526px',
            height: '400px',
          }}
        >
          <h3 className="auratio-volunteer-panel-title">Publication Status</h3>

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
            Publication Status
          </span>
          <div
            className="auratio-volunteer-pill"
            style={{
              position: 'absolute',
              left: '220px',
              top: '68px',
              width: '220px',
              height: '34px',
              backgroundColor: pillBg,
              color: pillColor,
            }}
          >
            {record.publicationStatus}
          </div>

          <span
            style={{
              position: 'absolute',
              left: '18px',
              top: '138px',
              width: '190px',
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0.0167em',
              color: 'var(--auratio-neutral-500)',
            }}
          >
            Product impact
          </span>
          <span
            style={{
              position: 'absolute',
              left: '224px',
              top: '138px',
              width: '240px',
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '20px',
              letterSpacing: '0.0143em',
              color: 'var(--auratio-neutral-900)',
            }}
          >
            {productImpactText}
          </span>

          {/* Callout Card */}
          <div
            style={{
              position: 'absolute',
              left: '18px',
              top: '196px',
              width: '470px',
              height: '118px',
              backgroundColor: calloutBg,
              border: '1px solid var(--auratio-neutral-200)',
              borderRadius: '12px',
              boxSizing: 'border-box',
            }}
          >
            <h4
              style={{
                position: 'absolute',
                left: '18px',
                top: '16px',
                margin: 0,
                fontFamily: 'var(--auratio-font-family-inter), sans-serif',
                fontSize: '18px',
                fontWeight: 600,
                lineHeight: '26px',
                color: calloutTitleColor,
              }}
            >
              {calloutTitle}
            </h4>
            <p
              style={{
                position: 'absolute',
                left: '18px',
                top: '54px',
                width: '420px',
                margin: 0,
                fontFamily: 'var(--auratio-font-family-inter), sans-serif',
                fontSize: '12px',
                fontWeight: 400,
                lineHeight: '18px',
                color: calloutTextColor,
              }}
            >
              {calloutDescription}
            </p>
          </div>
        </div>

        {/* Bottom Panel: Workspace consequence */}
        <div
          className="auratio-volunteer-panel"
          style={{
            left: '30px',
            top: '558px',
            width: '1076px',
            height: '190px',
          }}
        >
          <h3 className="auratio-volunteer-panel-title">Workspace consequence</h3>
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
            {workspaceConsequence}
          </p>
        </div>
      </div>
    </VolunteerLayout>
  )
}
