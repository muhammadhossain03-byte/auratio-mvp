import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'

export function AdminModerationReviewPage() {
  const navigate = useNavigate()

  return (
    <AdminLayout
      ariaLabel="Moderation Review"
      topbarTitle="Moderation Review"
      activeNav="moderation"
      topbarRightVariant="pill"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}
      >
        SUB-8821 — Moderation Review
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}
      >
        Business Pitch / Sales Pitch • evaluator work submitted
      </p>

      {/* Top right pill */}
      <div
        className="auratio-admin-status-pill auratio-admin-status-pill--pending-moderation"
        style={{
          position: 'absolute',
          left: '900px',
          top: '36px',
          width: '190px',
          height: '34px',
          borderRadius: '17px',
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        Pending Moderation
      </div>

      {/* Card 1: Evaluator-authored submission */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '124px',
          width: '520px',
          height: '430px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Evaluator-authored submission
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '26px' }}>
          <div style={{ width: '190px', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Evaluator
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            Farhana Islam
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '28px' }}>
          <div style={{ width: '190px', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Assignment Status
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            Submitted
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '28px' }}>
          <div style={{ width: '190px', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Submission Score
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', letterSpacing: '0.0143em' }}>
            85 / 100
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '28px' }}>
          <div style={{ width: '190px', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Universal Delivery
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            34 / 40
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '28px' }}>
          <div style={{ width: '190px', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Structural Flow
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            17 / 20
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '28px' }}>
          <div style={{ width: '190px', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Track Specialisation
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            34 / 40
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '28px' }}>
          <div style={{ width: '190px', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Official .docx report
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            Not generated while pending
          </div>
        </div>
      </div>

      {/* Card 2: Moderation context */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '580px',
          top: '124px',
          width: '526px',
          height: '430px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Moderation context
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '22px' }}>
          <div style={{ width: '196px', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Publication Status
          </div>
          <div
            className="auratio-admin-status-pill auratio-admin-status-pill--pending-moderation"
            style={{ width: '220px', height: '34px' }}
          >
            Pending Moderation
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '28px' }}>
          <div style={{ width: '196px', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Trigger
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', letterSpacing: '0.0143em' }}>
            First Human Evaluation in this track
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '28px' }}>
          <div style={{ width: '196px', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Human baseline
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            None yet
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '28px' }}>
          <div style={{ width: '196px', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Temporary video
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            Available for moderation inspection
          </div>
        </div>

        {/* Read-only callout */}
        <div
          style={{
            marginTop: '24px',
            width: '470px',
            height: '88px',
            backgroundColor: '#FFF7E8',
            border: '1px solid #DCE3ED',
            borderRadius: '16px',
            boxSizing: 'border-box',
            padding: '12px 18px',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 600, lineHeight: '20px', color: '#925F12' }}>
            Read-only score boundary
          </div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 400,
              lineHeight: '18px',
              color: '#925F12',
              marginTop: '4px',
            }}
          >
            Admin can inspect the evaluator record, but no criterion-score or total-score editor is exposed.
          </div>
        </div>
      </div>

      {/* Card 3: Moderation actions */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '584px',
          width: '1076px',
          height: '164px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '16px 18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Moderation actions
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '18px' }}>
          <button
            type="button"
            onClick={() => navigate(portalRoutePaths.admin.confirmModerationApproval)}
            className="auratio-admin-btn auratio-admin-btn--primary"
            style={{ width: '150px', height: '44px', fontSize: '14px', fontWeight: 600 }}
          >
            Approve
          </button>

          <button
            type="button"
            onClick={() => navigate(portalRoutePaths.admin.requestReReview)}
            className="auratio-admin-btn auratio-admin-btn--secondary"
            style={{ width: '190px', height: '44px', fontSize: '14px', fontWeight: 600, marginLeft: '18px' }}
          >
            Request Re-review
          </button>

          <button
            type="button"
            onClick={() => navigate(portalRoutePaths.admin.confirmModerationRejection)}
            className="auratio-admin-btn auratio-admin-btn--secondary"
            style={{ width: '150px', height: '44px', fontSize: '14px', fontWeight: 600, marginLeft: '18px' }}
          >
            Reject
          </button>

          <div
            style={{
              marginLeft: '26px',
              width: '470px',
              fontSize: '12px',
              lineHeight: '18px',
              fontWeight: 400,
              color: '#4E5968',
            }}
          >
            All three operate on publication/review workflow state; none directly alters the evaluator-authored score.
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
