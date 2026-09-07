import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import {
  clearHE0142PendingReassignment,
  confirmHE0142Reassignment,
  getHE0142AssignmentState,
  getHE0142PendingReassignment,
  requestReReviewModerationEntity,
} from '../data/mockAdminData'
import { AdminLayout } from '../components/AdminLayout'

export function AdminConfirmReassignmentPage() {
  const navigate = useNavigate()
  const current = getHE0142AssignmentState()
  const pending = getHE0142PendingReassignment()
  const [reason, setReason] = useState('')

  if (!pending || !current.activeOwner) {
    return <Navigate to={portalRoutePaths.admin.requestDetailsRouting} replace />
  }

  const returnPath = pending.source === 'moderation'
    ? portalRoutePaths.admin.moderationReview
    : portalRoutePaths.admin.requestDetailsRouting

  function handleConfirm() {
    if (!pending || reason.trim().length === 0) return
    confirmHE0142Reassignment(reason.trim())
    if (pending.source === 'moderation') {
      requestReReviewModerationEntity('SUB-8821')
      navigate(portalRoutePaths.admin.evaluations)
    } else {
      navigate(portalRoutePaths.admin.requestDetailsRouting)
    }
  }

  function handleCancel() {
    clearHE0142PendingReassignment()
    navigate(returnPath)
  }

  return (
    <AdminLayout ariaLabel="Confirm Reassignment" topbarTitle="Reassign Human Evaluation" activeNav={pending.source === 'moderation' ? 'moderation' : 'requests'} topbarRightVariant="pill">
      <h2 className="auratio-admin-page-title" style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}>Confirm Reassignment</h2>
      <p className="auratio-admin-page-subtitle" style={{ top: '78px', fontSize: '16px', lineHeight: '24px' }}>
        HE-0142 • staged replacement • ownership has not changed yet
      </p>

      <div className="auratio-admin-panel" data-testid="previous-assignment-card" style={{ position: 'absolute', left: '30px', top: '122px', width: '510px', height: '248px', padding: '18px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Current assignment</div>
        <div style={{ marginTop: '18px', fontSize: '20px', fontWeight: 700 }}>{current.activeOwner}</div>
        <div style={{ marginTop: '18px', fontSize: '14px', color: '#4E5968' }}>Active ownership remains unchanged until confirmation.</div>
        <div style={{ marginTop: '24px', fontSize: '14px', fontWeight: 600 }}>On confirmation: Reassigned / Superseded</div>
      </div>

      <div className="auratio-admin-panel" data-testid="new-assignment-card" style={{ position: 'absolute', left: '570px', top: '122px', width: '536px', height: '248px', padding: '18px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Proposed new assignment</div>
        <div style={{ marginTop: '18px', fontSize: '20px', fontWeight: 700 }}>{pending.candidate}</div>
        <div style={{ marginTop: '18px', fontSize: '14px', color: '#4E5968' }}>Track eligible: Yes • Effective availability: Available</div>
        <div style={{ marginTop: '24px', fontSize: '14px', fontWeight: 600 }}>On confirmation: sole active assignee</div>
      </div>

      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '30px', top: '400px', width: '1076px', height: '208px', padding: '18px', boxSizing: 'border-box', backgroundColor: '#FFF7E8' }}>
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#925F12' }}>Reassignment consequence</div>
        <div style={{ marginTop: '12px', fontSize: '13px', lineHeight: '19px', color: '#925F12' }}>
          The old owner loses active access and any old draft becomes non-actionable. Audit provenance remains retained.
          {pending.source === 'moderation' ? ' The previously submitted evaluator version remains immutable and the reassignment opens a new editable re-review version.' : ''}
        </div>
        <label htmlFor="reassignment-reason" style={{ display: 'block', marginTop: '16px', fontSize: '12px', fontWeight: 700, color: '#925F12' }}>
          Internal reassignment reason (required)
        </label>
        <input
          id="reassignment-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Operational coverage / scheduling reason"
          className="auratio-admin-input"
          style={{ marginTop: '8px', width: '760px', height: '40px' }}
        />
      </div>

      <div style={{ position: 'absolute', left: '30px', top: '634px', display: 'flex', gap: '16px' }}>
        <button type="button" onClick={handleConfirm} disabled={reason.trim().length === 0} className="auratio-admin-btn auratio-admin-btn--primary" style={{ width: '230px', height: '44px' }}>
          Confirm Reassignment
        </button>
        <button type="button" onClick={handleCancel} className="auratio-admin-btn auratio-admin-btn--secondary" style={{ width: '150px', height: '44px' }}>Cancel</button>
      </div>
      <div style={{ position: 'absolute', left: '30px', top: '692px', fontSize: '12px', color: '#6B788A' }}>
        Cancel clears the staged candidate and preserves {current.activeOwner} as the sole active owner.
      </div>
    </AdminLayout>
  )
}
