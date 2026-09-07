import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AdminLayout } from '../components/AdminLayout'
import { getREQ1042RoutingState } from '../data/mockAdminData'

export function AdminRequestDetailsRoutingPage() {
  const navigate = useNavigate()
  const routingState = getREQ1042RoutingState()
  const declineRecord = routingState.declineRecord
  const routingStatus = routingState.routing
  const isAssigned = routingStatus === 'Assigned Human'
  const isCancelled = routingStatus === 'Cancelled'

  const subtitleText =
    routingStatus === 'Unassigned'
      ? 'Eligible recording returned to Unassigned queue after evaluator decline'
      : isAssigned
        ? 'Eligible recording assigned to Human Evaluation'
        : isCancelled
          ? 'Human Evaluation request cancelled by Admin'
          : 'Eligible recording awaiting routing decision'

  return (
    <AdminLayout
      ariaLabel="Request Details Routing"
      topbarTitle="Request Details"
      activeNav="requests"
      topbarRightVariant="avatar"
    >
      <h2 className="auratio-admin-page-title" style={{ top: '32px', fontSize: '26px', lineHeight: '34px', fontWeight: 700 }}>
        REQ-1042
      </h2>
      <div
        className="auratio-admin-status-pill auratio-admin-status-pill--eligible"
        style={{ position: 'absolute', left: '938px', top: '36px', width: '88px', height: '28px' }}
      >
        Eligible
      </div>
      <p className="auratio-admin-page-subtitle" style={{ top: '72px', fontSize: '12px', lineHeight: '18px', fontWeight: 400 }}>
        {subtitleText}
      </p>

      <div
        className="auratio-admin-panel"
        style={{ position: 'absolute', left: '30px', top: '112px', width: '500px', height: '472px', padding: '20px', boxSizing: 'border-box' }}
      >
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Submission</h3>
        {[
          ['USER', 'Alex Morgan'],
          ['TRACK', 'Business Pitch / Sales Pitch'],
          ['SUBMISSION ID', 'SUB-8821'],
          ['MEASURED DURATION', '4:12 • Accepted 2:30–5:30'],
          ['REQUESTED METHOD', 'Human Evaluation'],
          ['ROUTING STATUS', routingStatus],
          ['PUBLICATION STATUS', isCancelled ? 'Cancelled' : 'Not started'],
        ].map(([label, value], index) => (
          <div key={label} style={{ marginTop: index === 0 ? '20px' : '15px' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#6B788A' }}>{label}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827', marginTop: '3px' }}>{value}</div>
          </div>
        ))}
        {declineRecord && (
          <div style={{ marginTop: '15px' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#6B788A' }}>DECLINE REASON</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#B42318', marginTop: '3px' }}>{declineRecord.reason}</div>
          </div>
        )}
      </div>

      <div
        className="auratio-admin-panel"
        data-testid="req1042-lifecycle-actions"
        style={{ position: 'absolute', left: '560px', top: '112px', width: '546px', height: '472px', padding: '20px', boxSizing: 'border-box', backgroundColor: '#F3F8FE' }}
      >
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#041B3B' }}>Human Evaluation lifecycle</h3>
        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#6B788A' }}>ACTIVE EVALUATOR OWNER</div>
          <div style={{ marginTop: '4px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>
            {routingState.activeOwner || 'None'}
          </div>
        </div>
        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#6B788A' }}>ROUTING STATE</div>
          <div style={{ marginTop: '4px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>{routingStatus}</div>
        </div>

        {isCancelled ? (
          <div
            data-testid="req1042-cancelled-state"
            style={{ marginTop: '28px', padding: '18px', backgroundColor: '#FEE2E2', borderRadius: '12px', border: '1px solid #FECACA' }}
          >
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#991B1B' }}>Request cancelled</div>
            <div style={{ marginTop: '10px', fontSize: '12px', lineHeight: '18px', color: '#991B1B' }}>
              Internal reason: {routingState.terminationReason || 'Recorded by Admin'}
            </div>
            <div style={{ marginTop: '10px', fontSize: '12px', lineHeight: '18px', color: '#991B1B' }}>
              No score or DOCX report is produced. The terminal record remains in Admin history.
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginTop: '30px', display: 'flex', gap: '14px' }}>
              <button
                type="button"
                onClick={() => navigate(portalRoutePaths.admin.assignmentPicker)}
                className="auratio-admin-btn auratio-admin-btn--primary"
                style={{ width: '200px', height: '42px', fontSize: '13px', fontWeight: 600 }}
              >
                {isAssigned ? 'Reassign Human' : 'Assign Human'}
              </button>
              <button
                type="button"
                onClick={() => navigate(portalRoutePaths.admin.cancelRequest)}
                className="auratio-admin-btn auratio-admin-btn--secondary"
                style={{ width: '170px', height: '42px', fontSize: '13px', fontWeight: 600 }}
              >
                Cancel Request
              </button>
            </div>
            <div style={{ marginTop: '24px', fontSize: '12px', lineHeight: '18px', color: '#4E5968', width: '488px' }}>
              {isAssigned
                ? 'Reassignment requires candidate selection and a separate confirmation. The existing owner remains active until confirmation.'
                : 'Initial assignment selects one active Human evaluator. If the current evaluator has declined, the request remains Unassigned until this action succeeds.'}
            </div>
            <div style={{ marginTop: '22px', fontSize: '11px', lineHeight: '16px', color: '#6B788A' }}>
              Cancel Request requires an internal Admin reason and terminates this request before approval.
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate(portalRoutePaths.admin.requests)}
        className="auratio-admin-btn auratio-admin-btn--secondary"
        style={{ position: 'absolute', left: '30px', top: '628px', width: '170px', height: '42px', fontSize: '13px', fontWeight: 600 }}
      >
        Back to Queue
      </button>
    </AdminLayout>
  )
}
