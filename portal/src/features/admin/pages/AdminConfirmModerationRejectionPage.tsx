import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { rejectModerationEntity } from '../data/mockAdminData'

export function AdminConfirmModerationRejectionPage() {
  const navigate = useNavigate()
  const { submissionId: paramId } = useParams<{ submissionId?: string }>()
  const resolvedId = (paramId || 'sub-8821').toUpperCase()
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    if (reason.trim().length === 0) {
      return
    }
    rejectModerationEntity(resolvedId, reason.trim())
    navigate(portalRoutePaths.admin.evaluations)
  }

  const cancelPath =
    resolvedId === 'SUB-8821'
      ? portalRoutePaths.admin.moderationReview
      : `/admin/moderation/${resolvedId.toLowerCase()}`

  return (
    <AdminLayout
      ariaLabel="Confirm Moderation Rejection"
      topbarTitle="Moderation Review"
      activeNav="moderation"
      topbarRightVariant="pill"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}
      >
        Confirm Rejection
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}
      >
        {resolvedId} • publication decision
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

      {/* Card 1: Decision consequence */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '122px',
          width: '1076px',
          height: '154px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Decision consequence
        </div>
        <div style={{ fontSize: '20px', fontWeight: 600, lineHeight: '28px', color: '#111827', marginTop: '16px' }}>
          Pending Moderation → Rejected
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#4E5968',
            marginTop: '16px',
            width: '1010px',
          }}
        >
          Rejected receives no progress, qualification, rating-window, or leaderboard effect. Evaluator and structured-submission provenance remain retained.
        </div>
      </div>

      {/* Card 2: Recorded rejection reason */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '306px',
          width: '1076px',
          height: '232px',
          backgroundColor: '#FFF7E8',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#925F12' }}>
          Recorded rejection reason
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, lineHeight: '20px', color: '#925F12', marginTop: '14px' }}>
          Reason is required for this rejection decision.
        </div>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Evaluation cannot be published because…"
          className="auratio-admin-textarea"
          style={{
            marginTop: '14px',
            width: '1040px',
            height: '82px',
          }}
        />

        <div
          style={{
            fontSize: '12px',
            lineHeight: '18px',
            fontWeight: 400,
            color: '#925F12',
            marginTop: '10px',
          }}
        >
          This records the moderation reason; it does not overwrite the evaluator’s scores.
        </div>
      </div>

      {/* Action buttons */}
      <div
        style={{
          position: 'absolute',
          left: '30px',
          top: '574px',
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
          Confirm Rejection
        </button>
        <button
          type="button"
          onClick={() => navigate(cancelPath)}
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
          top: '636px',
          fontSize: '12px',
          lineHeight: '18px',
          fontWeight: 400,
          color: '#6B788A',
        }}
      >
        A final Rejected decision has no product-state effect and permits the temporary-video lifecycle to proceed to deletion.
      </div>
    </AdminLayout>
  )
}
