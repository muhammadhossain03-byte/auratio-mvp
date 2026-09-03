import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AdminLayout } from '../components/AdminLayout'

export function AdminRequestRedirectedHumanPage() {
  const navigate = useNavigate()

  return (
    <AdminLayout
      ariaLabel="Request Details Redirected Human"
      topbarTitle="Request Details"
      activeNav="requests"
      topbarRightVariant="avatar"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '32px', fontSize: '26px', lineHeight: '34px', fontWeight: 700 }}
      >
        REQ-1034
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
        Eligible recording routed to Human Evaluation after alternate-method consent
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
            Jordan Ray
          </div>
        </div>

        <div style={{ marginTop: '21px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            TRACK
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: '18px', color: '#111827', marginTop: '3px' }}>
            Corporate Report
          </div>
        </div>

        <div style={{ marginTop: '21px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            MEASURED DURATION
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: '18px', color: '#111827', marginTop: '3px' }}>
            Eligible • within the track accepted duration window
          </div>
        </div>

        <div style={{ marginTop: '21px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            REQUESTED METHOD
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: '18px', color: '#111827', marginTop: '3px' }}>
            AI Evaluation
          </div>
        </div>

        <div style={{ marginTop: '21px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            ROUTING STATUS
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: '18px', color: '#111827', marginTop: '3px' }}>
            Redirected Human
          </div>
        </div>

        <div style={{ marginTop: '21px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            PUBLICATION STATUS
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: '18px', color: '#111827', marginTop: '3px' }}>
            Not final
          </div>
        </div>
      </div>

      {/* Right Panel: Routing State */}
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
          Routing state
        </div>

        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            REQUESTED METHOD
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, lineHeight: '20px', color: '#111827', marginTop: '4px' }}>
            AI Evaluation
          </div>
        </div>

        <div style={{ marginTop: '26px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            CURRENT ROUTE
          </div>
          <div
            style={{
              width: '200px',
              height: '42px',
              backgroundColor: '#EDF4FC',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 600,
              color: '#0A2F55',
              marginTop: '6px',
            }}
          >
            Routed to Human Evaluation
          </div>
        </div>

        <div style={{ marginTop: '28px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            ROUTING BOUNDARY
          </div>
          <div style={{ fontSize: '12px', fontWeight: 400, lineHeight: '18px', color: '#4E5968', marginTop: '6px', width: '488px' }}>
            An alternate Human route can take effect only after the explicit end-user consent step required by the routing rules.
          </div>

          <div
            role="presentation"
            aria-hidden="true"
            className="auratio-admin-btn auratio-admin-btn--disabled auratio-admin-btn--presentation"
            style={{
              width: '220px',
              height: '42px',
              fontSize: '13px',
              fontWeight: 600,
              marginTop: '16px',
            }}
          >
            No routing action required
          </div>

          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A', marginTop: '22px', width: '488px' }}>
            Routing state and publication state remain separate; evaluator assignment and later moderation are governed independently.
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
