import { useNavigate, useParams } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AdminLayout } from '../components/AdminLayout'

export function AdminRequestDetailsRoutingPage() {
  const navigate = useNavigate()
  const { requestId } = useParams<{ requestId?: string }>()
  const displayId = requestId ? requestId.toUpperCase() : 'REQ-1042'

  return (
    <AdminLayout
      ariaLabel="Request Details Routing"
      topbarTitle="Request Details"
      activeNav="requests"
      topbarRightVariant="avatar"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '32px', fontSize: '26px', lineHeight: '34px', fontWeight: 700 }}
      >
        {displayId}
      </h2>

      {/* Eligible Status Pill */}
      <div
        className="auratio-admin-status-pill auratio-admin-status-pill--eligible"
        style={{
          position: 'absolute',
          left: '938px',
          top: '36px',
          width: '88px',
          height: '28px',
        }}
      >
        Eligible
      </div>

      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '72px', fontSize: '12px', lineHeight: '18px', fontWeight: 400 }}
      >
        Eligible recording awaiting routing decision
      </p>

      {/* Left Panel: Submission */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '112px',
          width: '500px',
          height: '472px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '20px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Submission
        </div>

        <div style={{ marginTop: '22px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            USER
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: '18px', color: '#111827', marginTop: '3px' }}>
            Alex Morgan
          </div>
        </div>

        <div style={{ marginTop: '21px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            TRACK
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: '18px', color: '#111827', marginTop: '3px' }}>
            Business Pitch / Sales Pitch
          </div>
        </div>

        <div style={{ marginTop: '21px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            MEASURED DURATION
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: '18px', color: '#111827', marginTop: '3px' }}>
            4:12 • Accepted 2:30–5:30
          </div>
        </div>

        <div style={{ marginTop: '21px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            REQUESTED METHOD
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: '18px', color: '#111827', marginTop: '3px' }}>
            Human Evaluation
          </div>
        </div>

        <div style={{ marginTop: '21px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            ROUTING STATUS
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: '18px', color: '#111827', marginTop: '3px' }}>
            Requested
          </div>
        </div>

        <div style={{ marginTop: '21px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            PUBLICATION STATUS
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: '18px', color: '#111827', marginTop: '3px' }}>
            Not started
          </div>
        </div>
      </div>

      {/* Right Panel: Routing Decision */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '560px',
          top: '112px',
          width: '546px',
          height: '472px',
          backgroundColor: '#F3F8FE',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '20px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#041B3B' }}>
          Routing decision
        </div>

        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            REQUESTED METHOD
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, lineHeight: '20px', color: '#111827', marginTop: '4px' }}>
            Human Evaluation
          </div>
        </div>

        <div style={{ marginTop: '26px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            IF AVAILABLE
          </div>
          <button
            type="button"
            onClick={() => navigate(portalRoutePaths.admin.assignmentPicker)}
            className="auratio-admin-btn auratio-admin-btn--primary"
            style={{
              width: '200px',
              height: '42px',
              fontSize: '13px',
              fontWeight: 600,
              marginTop: '6px',
            }}
          >
            Assign Human
          </button>
        </div>

        <div style={{ marginTop: '28px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            IF UNAVAILABLE
          </div>
          <div style={{ fontSize: '12px', fontWeight: 400, lineHeight: '18px', color: '#4E5968', marginTop: '6px', width: '488px' }}>
            An alternate AI Evaluation may be proposed, but it cannot take effect without explicit end-user consent.
          </div>

          <div
            role="presentation"
            aria-hidden="true"
            className="auratio-admin-btn auratio-admin-btn--secondary auratio-admin-btn--presentation"
            style={{
              width: '220px',
              height: '42px',
              fontSize: '13px',
              fontWeight: 600,
              marginTop: '16px',
            }}
          >
            Propose AI Redirect
          </div>

          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A', marginTop: '22px', width: '488px' }}>
            Declining the alternate method cancels the request/session. No evaluation or score is created.
          </div>
        </div>
      </div>

      {/* Back to Queue Button */}
      <button
        type="button"
        onClick={() => navigate(portalRoutePaths.admin.requests)}
        className="auratio-admin-btn auratio-admin-btn--secondary"
        style={{
          position: 'absolute',
          left: '30px',
          top: '628px',
          width: '170px',
          height: '42px',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        Back to Queue
      </button>
    </AdminLayout>
  )
}
