import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { approveSub8821 } from '../data/mockAdminData'

export function AdminConfirmModerationApprovalPage() {
  const navigate = useNavigate()

  const handleConfirm = () => {
    approveSub8821()
    navigate(portalRoutePaths.admin.evaluations)
  }

  return (
    <AdminLayout
      ariaLabel="Confirm Moderation Approval"
      topbarTitle="Moderation Review"
      activeNav="moderation"
      topbarRightVariant="pill"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}
      >
        Confirm Approval
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}
      >
        SUB-8821 • publication decision
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

      {/* Card 1: Evaluation summary */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '122px',
          width: '1076px',
          height: '166px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Evaluation summary
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '26px' }}>
          <div style={{ width: '190px', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Evaluator
          </div>
          <div style={{ width: '270px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            Farhana Islam
          </div>
          <div style={{ width: '180px', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Submission Score
          </div>
          <div style={{ width: '180px', fontSize: '14px', fontWeight: 600, color: '#111827', letterSpacing: '0.0143em' }}>
            85 / 100
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
          <div style={{ width: '190px', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Current Publication Status
          </div>
          <div>
            <div
              className="auratio-admin-status-pill auratio-admin-status-pill--pending-moderation"
              style={{ width: '220px', height: '34px' }}
            >
              Pending Moderation
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Approval consequence */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '318px',
          width: '1076px',
          height: '248px',
          backgroundColor: '#EAF7F0',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#1F6B48' }}>
          Approval consequence
        </div>
        <div style={{ fontSize: '20px', fontWeight: 600, lineHeight: '28px', color: '#1F6B48', marginTop: '16px' }}>
          Pending Moderation → Approved
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#1F6B48',
            marginTop: '16px',
            width: '1010px',
            whiteSpace: 'pre-line',
          }}
        >
          {`• The structured evaluator submission becomes an effective published result and may update the applicable product state.\n• Evaluator-authored scores are not changed by approval.\n• Official .docx generation begins after Approved.\n• Approved is terminal in the MVP: there is no withdraw/revoke/republish control.`}
        </div>
      </div>

      {/* Action buttons */}
      <div
        style={{
          position: 'absolute',
          left: '30px',
          top: '606px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={handleConfirm}
          className="auratio-admin-btn auratio-admin-btn--primary"
          style={{ width: '190px', height: '44px', fontSize: '14px', fontWeight: 600 }}
        >
          Confirm Approval
        </button>
        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.admin.moderationReview)}
          className="auratio-admin-btn auratio-admin-btn--secondary"
          style={{ width: '130px', height: '44px', fontSize: '14px', fontWeight: 600, marginLeft: '18px' }}
        >
          Cancel
        </button>
      </div>

      {/* Footer note */}
      <div
        style={{
          position: 'absolute',
          left: '30px',
          top: '670px',
          fontSize: '12px',
          lineHeight: '18px',
          fontWeight: 400,
          color: '#6B788A',
        }}
      >
        The final publication decision ends the temporary-video retention need; deletion begins after the final outcome.
      </div>
    </AdminLayout>
  )
}
