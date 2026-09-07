import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AdminLayout } from '../components/AdminLayout'
import { getSUB8834LifecycleState } from '../data/mockAdminData'

export function AdminEvaluationProcessingHumanPage() {
  const navigate = useNavigate()
  const lifecycle = getSUB8834LifecycleState()
  const cancelled = lifecycle.status === 'Cancelled'

  return (
    <AdminLayout ariaLabel="Evaluation Record Processing Human" topbarTitle="Evaluation Record" activeNav="evaluations" topbarRightVariant="pill">
      <h2 className="auratio-admin-page-title" style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}>SUB-8834 — Evaluation Record</h2>
      <div
        className={cancelled ? 'auratio-admin-status-pill' : 'auratio-admin-status-pill auratio-admin-status-pill--processing'}
        style={{ position: 'absolute', left: '900px', top: '36px', width: '190px', height: '34px', ...(cancelled ? { backgroundColor: '#FEE2E2', color: '#991B1B' } : {}) }}
      >
        {cancelled ? 'Cancelled' : 'Processing'}
      </div>
      <p className="auratio-admin-page-subtitle" style={{ top: '78px', fontSize: '16px', lineHeight: '24px' }}>
        Human Evaluation • {cancelled ? 'terminal request history' : 'evaluator work in progress'}
      </p>

      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '30px', top: '124px', width: '520px', height: '430px', padding: '18px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>{cancelled ? 'Cancelled Human evaluation' : 'In-progress Human evaluation'}</div>
        {[
          ['Assigned evaluator', lifecycle.activeOwner || 'None — request cancelled'],
          ['Prior superseded evaluator', lifecycle.supersededOwner || 'None'],
          ['Assignment Status', lifecycle.status],
          ['Evaluator version', `v${lifecycle.version}`],
          ['Submission Score', '—'],
          ['Official .docx report', cancelled ? 'Not generated for Cancelled request' : 'Not generated while processing'],
        ].map(([label, value], index) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', minHeight: '24px', marginTop: index === 0 ? '26px' : '24px' }}>
            <div style={{ width: '206px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>{label}</div>
            <div style={{ width: '270px', fontSize: '14px', fontWeight: label === 'Assigned evaluator' ? 700 : 400, color: '#111827' }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '580px', top: '124px', width: '526px', height: '430px', padding: '18px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Evaluation lifecycle</div>
        <div style={{ marginTop: '24px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>PUBLICATION STATUS</div>
        <div style={{ marginTop: '6px', fontSize: '14px', fontWeight: 700 }}>{cancelled ? 'Cancelled' : 'Processing'}</div>
        <div style={{ marginTop: '28px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>CURRENT STATE</div>
        <div style={{ marginTop: '6px', fontSize: '14px', fontWeight: 600 }}>{cancelled ? 'Terminal — no evaluation result' : 'Evaluation in progress'}</div>
        {cancelled ? (
          <div data-testid="sub8834-cancelled-state" style={{ marginTop: '28px', padding: '16px', borderRadius: '12px', backgroundColor: '#FEE2E2', color: '#991B1B' }}>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>Internal cancellation reason</div>
            <div style={{ marginTop: '8px', fontSize: '12px', lineHeight: '18px' }}>{lifecycle.terminationReason}</div>
            <div style={{ marginTop: '8px', fontSize: '12px', lineHeight: '18px' }}>No score or DOCX is produced. The record remains in Admin history.</div>
          </div>
        ) : (
          <div style={{ marginTop: '28px', padding: '16px', borderRadius: '12px', backgroundColor: '#FFF7E8', color: '#925F12' }}>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>One active evaluator owner</div>
            <div style={{ marginTop: '8px', fontSize: '12px', lineHeight: '18px' }}>Reassignment is permitted before approval. It requires candidate selection plus confirmation and preserves superseded-owner audit history.</div>
          </div>
        )}
      </div>

      <div className="auratio-admin-panel" data-testid="sub8834-lifecycle-actions" style={{ position: 'absolute', left: '30px', top: '584px', width: '1076px', height: '164px', padding: '16px 18px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>{cancelled ? 'Navigation' : 'Lifecycle actions'}</div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '18px' }}>
          {!cancelled && (
            <>
              <button type="button" onClick={() => navigate(portalRoutePaths.admin.evaluationReassignmentPicker)} className="auratio-admin-btn auratio-admin-btn--primary" style={{ width: '180px', height: '44px' }}>Reassign Human</button>
              <button type="button" onClick={() => navigate(portalRoutePaths.admin.cancelEvaluationRequest)} className="auratio-admin-btn auratio-admin-btn--secondary" style={{ width: '170px', height: '44px' }}>Cancel Request</button>
            </>
          )}
          <button type="button" onClick={() => navigate(portalRoutePaths.admin.evaluations)} className="auratio-admin-btn auratio-admin-btn--secondary" style={{ width: '180px', height: '44px' }}>Back to Evaluations</button>
        </div>
      </div>
    </AdminLayout>
  )
}
