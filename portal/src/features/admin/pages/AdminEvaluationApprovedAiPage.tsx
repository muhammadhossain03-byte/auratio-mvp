import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AdminLayout } from '../components/AdminLayout'

export function AdminEvaluationApprovedAiPage() {
  const navigate = useNavigate()

  return (
    <AdminLayout
      ariaLabel="Evaluation Record Approved AI"
      topbarTitle="Evaluation Record"
      activeNav="evaluations"
      topbarRightVariant="pill"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}
      >
        SUB-8798 — Evaluation Record
      </h2>

      {/* Approved Status Pill */}
      <div
        className="auratio-admin-status-pill auratio-admin-status-pill--approved"
        style={{
          position: 'absolute',
          left: '900px',
          top: '36px',
          width: '190px',
          height: '34px',
        }}
      >
        Approved
      </div>

      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}
      >
        AI Evaluation • approved
      </p>

      {/* Left Panel: Validated AI evaluation */}
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
          Validated AI evaluation
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '26px' }}>
          <div style={{ width: '206px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Evaluation source
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            AI evaluator
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '24px' }}>
          <div style={{ width: '206px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Assignment Status
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            Not applicable — AI
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '24px' }}>
          <div style={{ width: '206px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Submission Score
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            91 / 100
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '24px' }}>
          <div style={{ width: '206px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Universal Delivery
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            Included in report
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '24px' }}>
          <div style={{ width: '206px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Structural Flow
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            Included in report
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '24px' }}>
          <div style={{ width: '206px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Track Specialisation
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            Included in report
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '24px' }}>
          <div style={{ width: '206px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Official .docx report
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            Generated on approval
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
            className="auratio-admin-status-pill auratio-admin-status-pill--approved"
            style={{ width: '220px', height: '34px' }}
          >
            Approved
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '24px' }}>
          <div style={{ width: '202px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Approval path
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            Validated AI output
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', height: '24px', marginTop: '28px' }}>
          <div style={{ width: '202px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Human assignment
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            Not applicable — AI
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '28px' }}>
          <div style={{ width: '202px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
            Temporary video
          </div>
          <div style={{ width: '270px', fontSize: '14px', fontWeight: 400, lineHeight: '20px', color: '#111827' }}>
            Deleted after final decision
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
            This approved AI record is read-only. Admin review does not introduce a score editor or Human assignment controls.
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
