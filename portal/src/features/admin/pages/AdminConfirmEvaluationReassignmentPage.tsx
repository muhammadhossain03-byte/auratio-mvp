import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AdminLayout } from '../components/AdminLayout'
import {
  clearSUB8834PendingReassignment,
  confirmSUB8834Reassignment,
  getSUB8834LifecycleState,
} from '../data/mockAdminData'

export function AdminConfirmEvaluationReassignmentPage() {
  const navigate = useNavigate()
  const lifecycle = getSUB8834LifecycleState()
  const [reason, setReason] = useState('')

  if (lifecycle.status === 'Cancelled') return <Navigate to={portalRoutePaths.admin.evaluationProcessingHuman} replace />
  if (!lifecycle.pendingCandidate || !lifecycle.activeOwner) return <Navigate to={portalRoutePaths.admin.evaluationReassignmentPicker} replace />

  function confirm() {
    if (reason.trim().length === 0) return
    confirmSUB8834Reassignment(reason.trim())
    navigate(portalRoutePaths.admin.evaluationProcessingHuman)
  }

  function cancel() {
    clearSUB8834PendingReassignment()
    navigate(portalRoutePaths.admin.evaluationProcessingHuman)
  }

  return (
    <AdminLayout ariaLabel="Confirm SUB-8834 Reassignment" topbarTitle="Reassign Human Evaluation" activeNav="evaluations" topbarRightVariant="pill">
      <h2 className="auratio-admin-page-title" style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}>Confirm Reassignment</h2>
      <p className="auratio-admin-page-subtitle" style={{ top: '78px', fontSize: '16px' }}>SUB-8834 • current v{lifecycle.version} → new editable v{lifecycle.version + 1}</p>
      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '30px', top: '122px', width: '510px', height: '230px', padding: '18px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Current owner</div>
        <div style={{ marginTop: '18px', fontSize: '20px', fontWeight: 700 }}>{lifecycle.activeOwner}</div>
        <div style={{ marginTop: '20px', fontSize: '14px', lineHeight: '20px', color: '#4E5968' }}>Remains active until confirmation. Afterwards access is revoked and the old draft becomes non-actionable.</div>
      </div>
      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '570px', top: '122px', width: '536px', height: '230px', padding: '18px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Replacement owner</div>
        <div style={{ marginTop: '18px', fontSize: '20px', fontWeight: 700 }}>{lifecycle.pendingCandidate}</div>
        <div style={{ marginTop: '20px', fontSize: '14px', lineHeight: '20px', color: '#4E5968' }}>Becomes the sole active assignee for evaluator version v{lifecycle.version + 1}.</div>
      </div>
      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '30px', top: '382px', width: '1076px', height: '210px', padding: '18px', boxSizing: 'border-box', backgroundColor: '#FFF7E8' }}>
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#925F12' }}>Internal reassignment reason</div>
        <input aria-label="SUB-8834 reassignment reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Operational coverage / scheduling reason" className="auratio-admin-input" style={{ marginTop: '16px', width: '760px', height: '42px' }} />
        <div style={{ marginTop: '14px', fontSize: '12px', lineHeight: '18px', color: '#925F12' }}>Audit provenance retains the superseded owner, reason, and version transition.</div>
      </div>
      <div style={{ position: 'absolute', left: '30px', top: '624px', display: 'flex', gap: '16px' }}>
        <button type="button" disabled={reason.trim().length === 0} onClick={confirm} className="auratio-admin-btn auratio-admin-btn--primary" style={{ width: '220px', height: '44px' }}>Confirm Reassignment</button>
        <button type="button" onClick={cancel} className="auratio-admin-btn auratio-admin-btn--secondary" style={{ width: '130px', height: '44px' }}>Cancel</button>
      </div>
    </AdminLayout>
  )
}
