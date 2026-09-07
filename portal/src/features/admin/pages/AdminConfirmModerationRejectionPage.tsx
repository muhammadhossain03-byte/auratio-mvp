import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { getModerationEntityState, rejectModerationEntity } from '../data/mockAdminData'

export function AdminConfirmModerationRejectionPage() {
  const navigate = useNavigate()
  const { submissionId: paramId } = useParams<{ submissionId?: string }>()
  const resolvedId = (paramId || 'sub-8821').toUpperCase()
  const modItem = getModerationEntityState(resolvedId)
  const [reason, setReason] = useState('')

  if (!modItem) return <Navigate to={portalRoutePaths.admin.moderation} replace />

  const cancelPath = resolvedId === 'SUB-8821' ? portalRoutePaths.admin.moderationReview : `/admin/moderation/${resolvedId.toLowerCase()}`

  function handleConfirm() {
    if (reason.trim().length === 0) return
    rejectModerationEntity(resolvedId, reason.trim())
    navigate(portalRoutePaths.admin.evaluations)
  }

  return (
    <AdminLayout ariaLabel="Confirm Evaluation Rejection" topbarTitle="Moderation Review" activeNav="moderation" topbarRightVariant="pill">
      <h2 className="auratio-admin-page-title" style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}>Reject Evaluation</h2>
      <p className="auratio-admin-page-subtitle" style={{ top: '78px', fontSize: '16px', lineHeight: '24px' }}>{resolvedId} • terminal moderation decision</p>
      <div className="auratio-admin-status-pill auratio-admin-status-pill--pending-moderation" style={{ position: 'absolute', left: '900px', top: '36px', width: '190px', height: '34px' }}>Pending Moderation</div>

      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '30px', top: '122px', width: '1076px', height: '154px', padding: '18px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Decision consequence</div>
        <div style={{ marginTop: '16px', fontSize: '20px', fontWeight: 600 }}>Pending Moderation → Rejected</div>
        <div style={{ marginTop: '16px', fontSize: '14px', lineHeight: '20px', color: '#4E5968' }}>Rejected remains in Admin history, receives no score/DOCX/progress/leaderboard effect, and permits temporary-video deletion after terminal handling.</div>
      </div>

      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '30px', top: '306px', width: '1076px', height: '250px', padding: '18px', boxSizing: 'border-box', backgroundColor: '#FFF7E8' }}>
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#925F12' }}>Internal rejection reason</div>
        <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: 600, color: '#925F12' }}>A non-empty reason is mandatory.</div>
        <textarea aria-label="Internal rejection reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Evaluation cannot be published because…" className="auratio-admin-textarea" style={{ marginTop: '14px', width: '1040px', height: '88px' }} />
        <div style={{ marginTop: '10px', fontSize: '12px', lineHeight: '18px', color: '#925F12' }}>Internal Admin/Super Admin audit information only. It is not shown to the speaker or Volunteer evaluator and never overwrites evaluator scores.</div>
      </div>

      <div style={{ position: 'absolute', left: '30px', top: '590px', display: 'flex', gap: '18px' }}>
        <button type="button" disabled={reason.trim().length === 0} onClick={handleConfirm} className="auratio-admin-btn auratio-admin-btn--primary" style={{ width: '190px', height: '44px' }}>Reject Evaluation</button>
        <button type="button" onClick={() => navigate(cancelPath)} className="auratio-admin-btn auratio-admin-btn--secondary" style={{ width: '130px', height: '44px' }}>Cancel</button>
      </div>
    </AdminLayout>
  )
}
