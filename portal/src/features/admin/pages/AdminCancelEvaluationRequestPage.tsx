import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AdminLayout } from '../components/AdminLayout'
import { cancelSUB8834Request, getSUB8834LifecycleState } from '../data/mockAdminData'

export function AdminCancelEvaluationRequestPage() {
  const navigate = useNavigate()
  const lifecycle = getSUB8834LifecycleState()
  const [reason, setReason] = useState('')

  if (lifecycle.status === 'Cancelled') return <Navigate to={portalRoutePaths.admin.evaluationProcessingHuman} replace />

  function confirm() {
    if (reason.trim().length === 0) return
    cancelSUB8834Request(reason.trim())
    navigate(portalRoutePaths.admin.evaluations)
  }

  return (
    <AdminLayout ariaLabel="Cancel SUB-8834 Human Request" topbarTitle="Evaluation Record" activeNav="evaluations" topbarRightVariant="pill">
      <h2 className="auratio-admin-page-title" style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}>Cancel Request</h2>
      <p className="auratio-admin-page-subtitle" style={{ top: '78px', fontSize: '16px' }}>SUB-8834 • Human Evaluation • current owner {lifecycle.activeOwner}</p>
      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '30px', top: '122px', width: '1076px', height: '180px', padding: '18px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Termination consequence</div>
        <div style={{ marginTop: '16px', fontSize: '14px', lineHeight: '20px', color: '#4E5968' }}>The active evaluator loses access. No score or DOCX is produced. The Cancelled record remains visible in Admin history, and a new user submission may be made separately.</div>
      </div>
      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '30px', top: '330px', width: '1076px', height: '240px', padding: '18px', boxSizing: 'border-box', backgroundColor: '#FFF7E8' }}>
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#925F12' }}>Internal cancellation reason</div>
        <textarea aria-label="SUB-8834 cancellation reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why this active Human request is being cancelled…" className="auratio-admin-textarea" style={{ marginTop: '16px', width: '1040px', height: '92px' }} />
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#925F12' }}>Required and visible only to Admin/Super Admin audit surfaces.</div>
      </div>
      <div style={{ position: 'absolute', left: '30px', top: '606px', display: 'flex', gap: '16px' }}>
        <button type="button" disabled={reason.trim().length === 0} onClick={confirm} className="auratio-admin-btn auratio-admin-btn--primary" style={{ width: '180px', height: '44px' }}>Cancel Request</button>
        <button type="button" onClick={() => navigate(portalRoutePaths.admin.evaluationProcessingHuman)} className="auratio-admin-btn auratio-admin-btn--secondary" style={{ width: '130px', height: '44px' }}>Back</button>
      </div>
    </AdminLayout>
  )
}
