import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AdminLayout } from '../components/AdminLayout'

export function AdminEvaluationProcessingHumanPage() {
  const navigate = useNavigate()

  return (
    <AdminLayout
      ariaLabel="Evaluation Record Processing Human"
      topbarTitle="Evaluation Record"
      activeNav="evaluations"
      topbarRightVariant="pill"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}
      >
        SUB-8834 — Evaluation Record
      </h2>

      {/* Processing Status Pill */}
      <div
        className="auratio-admin-status-pill auratio-admin-status-pill--processing"
        style={{
          position: 'absolute',
          left: '900px',
          top: '36px',
          width: '190px',
          height: '34px',
        }}
      >
        Processing
      </div>

      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}
      >
        Human Evaluation • evaluator work in progress
      </p>

      {/* Left Panel: In-progress Human evaluation */}
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
          In-progress Human evaluation
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '26px' }}>
          <div style={{ width: '206px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Assigned evaluator
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            Assigned volunteer
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '24px' }}>
          <div style={{ width: '206px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Assignment Status
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            In Evaluation
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '24px' }}>
          <div style={{ width: '206px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Submission Score
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            —
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '24px' }}>
          <div style={{ width: '206px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Universal Delivery
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            —
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '24px' }}>
          <div style={{ width: '206px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Structural Flow
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            —
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '24px' }}>
          <div style={{ width: '206px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Track Specialisation
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            —
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '24px' }}>
          <div style={{ width: '206px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Official .docx report
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            Not generated while processing
          </div>
        </div>
      </div>

      {/* Right Panel: Evaluation context */}
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
          Evaluation context
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '34px', marginTop: '22px' }}>
          <div style={{ width: '202px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Publication Status
          </div>
          <div
            className="auratio-admin-status-pill auratio-admin-status-pill--processing"
            style={{ width: '220px', height: '34px' }}
          >
            Processing
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '24px' }}>
          <div style={{ width: '202px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Current state
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            Evaluation in progress
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '28px' }}>
          <div style={{ width: '202px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Final score
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            Not available yet
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '28px' }}>
          <div style={{ width: '202px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Temporary video
          </div>
          <div style={{ width: '270px', fontSize: '14px', fontWeight: 400, lineHeight: '20px', color: '#111827' }}>
            Available to the assigned evaluator and authorized Admin
          </div>
        </div>

        {/* Read-only record boundary warning */}
        <div
          style={{
            marginTop: '24px',
            width: '470px',
            height: '88px',
            backgroundColor: '#FFF7E8',
            border: '1px solid #DCE3ED',
            borderRadius: '16px',
            padding: '12px 18px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 600, lineHeight: '20px', color: '#925F12' }}>
            Read-only record boundary
          </div>
          <div style={{ fontSize: '12px', fontWeight: 400, lineHeight: '18px', color: '#925F12', marginTop: '6px' }}>
            This is an operational read-only view. No score editor is exposed while the Human evaluation is in progress.
          </div>
        </div>
      </div>

      {/* Bottom Panel: Navigation */}
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
          Navigation
        </div>

        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.admin.evaluations)}
          className="auratio-admin-btn auratio-admin-btn--primary"
          style={{
            width: '180px',
            height: '44px',
            fontSize: '14px',
            fontWeight: 600,
            marginTop: '18px',
          }}
        >
          Back to Evaluations
        </button>
      </div>
    </AdminLayout>
  )
}
