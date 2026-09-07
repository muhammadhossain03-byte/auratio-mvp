import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AdminLayout } from '../components/AdminLayout'
import { cancelREQ1042HumanRequest, getREQ1042RoutingState } from '../data/mockAdminData'

export function AdminCancelRequestPage() {
  const navigate = useNavigate()
  const routing = getREQ1042RoutingState()
  const [reason, setReason] = useState('')

  if (routing.routing === 'Cancelled') return <Navigate to={portalRoutePaths.admin.requestDetailsRouting} replace />

  function confirm() {
    if (reason.trim().length === 0) return
    cancelREQ1042HumanRequest(reason.trim())
    navigate(portalRoutePaths.admin.requests)
  }

  return (
    <AdminLayout ariaLabel="Cancel Human Evaluation Request" topbarTitle="Request Details" activeNav="requests" topbarRightVariant="pill">
      <h2 className="auratio-admin-page-title" style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}>Cancel Request</h2>
      <p className="auratio-admin-page-subtitle" style={{ top: '78px', fontSize: '16px' }}>REQ-1042 • SUB-8821 • Human Evaluation</p>
      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '30px', top: '122px', width: '1076px', height: '180px', padding: '18px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Termination consequence</div>
        <div style={{ marginTop: '16px', fontSize: '14px', lineHeight: '20px', color: '#4E5968' }}>Cancel Request terminates this Human request before approval, revokes active evaluator ownership, produces no score or DOCX report, and keeps a terminal Admin history record.</div>
        <div style={{ marginTop: '16px', fontSize: '13px', fontWeight: 600 }}>Current active owner: {routing.activeOwner || 'None'}</div>
      </div>
      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '30px', top: '330px', width: '1076px', height: '240px', padding: '18px', boxSizing: 'border-box', backgroundColor: '#FFF7E8' }}>
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#925F12' }}>Internal cancellation reason</div>
        <textarea aria-label="Internal cancellation reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Operational reason for cancelling this request…" className="auratio-admin-textarea" style={{ marginTop: '16px', width: '1040px', height: '92px' }} />
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#925F12' }}>Required. Admin/Super Admin only; not shown to the speaker or Volunteer evaluator.</div>
      </div>
      <div style={{ position: 'absolute', left: '30px', top: '606px', display: 'flex', gap: '16px' }}>
        <button type="button" disabled={reason.trim().length === 0} onClick={confirm} className="auratio-admin-btn auratio-admin-btn--primary" style={{ width: '180px', height: '44px' }}>Cancel Request</button>
        <button type="button" onClick={() => navigate(portalRoutePaths.admin.requestDetailsRouting)} className="auratio-admin-btn auratio-admin-btn--secondary" style={{ width: '130px', height: '44px' }}>Back</button>
      </div>
    </AdminLayout>
  )
}
