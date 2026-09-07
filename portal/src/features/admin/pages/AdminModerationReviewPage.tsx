import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { getModerationEntityState } from '../data/mockAdminData'

export function AdminModerationReviewPage() {
  const navigate = useNavigate()
  const { submissionId: paramId } = useParams<{ submissionId?: string }>()
  const resolvedId = (paramId || 'sub-8821').toUpperCase()
  const modItem = getModerationEntityState(resolvedId)

  if (!modItem) return <Navigate to={portalRoutePaths.admin.moderation} replace />

  const approvePath = resolvedId === 'SUB-8821' ? portalRoutePaths.admin.confirmModerationApproval : `/admin/moderation/${resolvedId.toLowerCase()}/approve`
  const reReviewPath = resolvedId === 'SUB-8821' ? portalRoutePaths.admin.requestReReview : `/admin/moderation/${resolvedId.toLowerCase()}/re-review`
  const rejectPath = resolvedId === 'SUB-8821' ? portalRoutePaths.admin.confirmModerationRejection : `/admin/moderation/${resolvedId.toLowerCase()}/reject`
  const canReassign = resolvedId === 'SUB-8821' && modItem.publicationStatus !== 'Approved'

  return (
    <AdminLayout ariaLabel="Admin Moderation Review" topbarTitle="Moderation Review" activeNav="moderation" topbarRightVariant="avatar">
      <h2 className="auratio-admin-page-title" style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}>{resolvedId} — Moderation Review</h2>
      <p className="auratio-admin-page-subtitle" style={{ top: '78px', fontSize: '16px', lineHeight: '24px' }}>{modItem.track} • evaluator work submitted</p>
      <div className="auratio-admin-status-pill auratio-admin-status-pill--pending-moderation" style={{ position: 'absolute', left: '900px', top: '36px', width: '190px', height: '34px' }}>{modItem.publicationStatus}</div>

      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '30px', top: '124px', width: '520px', height: '430px', padding: '18px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Evaluator-authored submission</div>
        {[
          ['Evaluator', modItem.evaluator],
          ['Assignment Status', 'Submitted'],
          ['Submission Score', modItem.scoreDisplay],
          ['Universal Delivery', modItem.universalDelivery],
          ['Structural Flow', modItem.structuralFlow],
          ['Track Specialisation', modItem.trackSpecialisation],
          ['Official .docx report', modItem.docxStatus],
        ].map(([label, value], i) => (
          <div key={label} style={{ display: 'flex', marginTop: i === 0 ? '26px' : '25px' }}><div style={{ width: '190px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>{label}</div><div style={{ fontSize: '14px', fontWeight: label === 'Submission Score' ? 600 : 400 }}>{value}</div></div>
        ))}
      </div>

      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '580px', top: '124px', width: '526px', height: '430px', padding: '18px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Moderation context</div>
        <div style={{ marginTop: '24px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>TRIGGER</div>
        <div style={{ marginTop: '6px', fontSize: '14px', fontWeight: 600 }}>{modItem.trigger}</div>
        <div style={{ marginTop: '28px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>HUMAN BASELINE</div>
        <div style={{ marginTop: '6px', fontSize: '14px' }}>{modItem.baseline}</div>
        <div style={{ marginTop: '28px', padding: '16px', borderRadius: '12px', backgroundColor: '#FFF7E8', color: '#925F12' }}>
          <div style={{ fontSize: '14px', fontWeight: 700 }}>Submitted-version immutability</div>
          <div style={{ marginTop: '8px', fontSize: '12px', lineHeight: '18px' }}>Admin can inspect but never edit evaluator-authored scores. Re-review or reassignment creates a new editable evaluator version while preserving the submitted version.</div>
        </div>
      </div>

      <div className="auratio-admin-panel" data-testid="moderation-lifecycle-actions" style={{ position: 'absolute', left: '30px', top: '584px', width: '1076px', height: '178px', padding: '16px 18px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Moderation actions</div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '18px', alignItems: 'center' }}>
          <button type="button" onClick={() => navigate(approvePath)} className="auratio-admin-btn auratio-admin-btn--primary" style={{ width: '120px', height: '44px' }}>Approve</button>
          <button type="button" onClick={() => navigate(reReviewPath)} className="auratio-admin-btn auratio-admin-btn--secondary" style={{ width: '160px', height: '44px' }}>Request Re-review</button>
          {canReassign && <button type="button" onClick={() => navigate(`${portalRoutePaths.admin.assignmentPicker}?source=moderation`)} className="auratio-admin-btn auratio-admin-btn--secondary" style={{ width: '160px', height: '44px' }}>Reassign Human</button>}
          <button type="button" onClick={() => navigate(rejectPath)} className="auratio-admin-btn auratio-admin-btn--secondary" style={{ width: '160px', height: '44px' }}>Reject Evaluation</button>
        </div>
        <div style={{ marginTop: '14px', fontSize: '12px', lineHeight: '18px', color: '#4E5968' }}>Approve is terminal. Before approval, Admin may request re-review, reassign the active evaluator version, or reject the evaluation with a mandatory internal reason.</div>
      </div>
    </AdminLayout>
  )
}
