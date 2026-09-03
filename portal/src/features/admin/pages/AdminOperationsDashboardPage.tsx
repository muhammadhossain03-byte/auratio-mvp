import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AdminLayout } from '../components/AdminLayout'

export function AdminOperationsDashboardPage() {
  const navigate = useNavigate()

  return (
    <AdminLayout
      ariaLabel="Admin Operations Dashboard"
      topbarTitle="Operations Dashboard"
      activeNav="dashboard"
      topbarRightVariant="avatar"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '30px', fontSize: '26px', lineHeight: '34px', fontWeight: 700 }}
      >
        System overview
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '70px', fontSize: '12px', lineHeight: '18px', fontWeight: 400 }}
      >
        Live operational queues across routing, evaluation, moderation, and events.
      </p>

      {/* 4 Metric Cards */}
      <div style={{ position: 'absolute', left: '30px', top: '112px', display: 'flex', gap: '20px' }}>
        {/* Open Requests (Interactive Link to Requests Queue) */}
        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.admin.requests)}
          className="auratio-admin-metric-card"
          style={{
            width: '230px',
            height: '104px',
            backgroundColor: '#F3F8FE',
            border: '1px solid #DCE3ED',
            borderRadius: '16px',
            padding: '16px 18px',
            textAlign: 'left',
            cursor: 'pointer',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            OPEN REQUESTS
          </div>
          <div style={{ fontSize: '30px', fontWeight: 700, lineHeight: '38px', color: '#041B3B', marginTop: '10px' }}>
            12
          </div>
        </button>

        {/* Pending Moderation */}
        <div
          className="auratio-admin-metric-card"
          style={{
            width: '230px',
            height: '104px',
            backgroundColor: '#FFF7E8',
            border: '1px solid #DCE3ED',
            borderRadius: '16px',
            padding: '16px 18px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            PENDING MODERATION
          </div>
          <div style={{ fontSize: '30px', fontWeight: 700, lineHeight: '38px', color: '#925F12', marginTop: '10px' }}>
            4
          </div>
        </div>

        {/* Human Assignments */}
        <div
          className="auratio-admin-metric-card"
          style={{
            width: '230px',
            height: '104px',
            backgroundColor: '#F3F8FE',
            border: '1px solid #DCE3ED',
            borderRadius: '16px',
            padding: '16px 18px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            HUMAN ASSIGNMENTS
          </div>
          <div style={{ fontSize: '30px', fontWeight: 700, lineHeight: '38px', color: '#041B3B', marginTop: '10px' }}>
            6
          </div>
        </div>

        {/* Published Events */}
        <div
          className="auratio-admin-metric-card"
          style={{
            width: '230px',
            height: '104px',
            backgroundColor: '#ECFDF3',
            border: '1px solid #DCE3ED',
            borderRadius: '16px',
            padding: '16px 18px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', color: '#6B788A' }}>
            PUBLISHED EVENTS
          </div>
          <div style={{ fontSize: '30px', fontWeight: 700, lineHeight: '38px', color: '#18794E', marginTop: '10px' }}>
            9
          </div>
        </div>
      </div>

      {/* Operational Queues */}
      <h3
        style={{
          position: 'absolute',
          left: '30px',
          top: '260px',
          fontSize: '19px',
          fontWeight: 600,
          lineHeight: '26px',
          color: '#111827',
          margin: 0,
        }}
      >
        Operational queues
      </h3>

      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '298px',
          width: '1076px',
          height: '232px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '22px',
        }}
      >
        {/* Row 1: Requested */}
        <div style={{ display: 'flex', alignItems: 'center', height: '26px' }}>
          <div style={{ width: '258px', fontSize: '12px', fontWeight: 600, color: '#111827' }}>
            Requested
          </div>
          <div style={{ width: '112px', fontSize: '13px', fontWeight: 700, color: '#041B3B' }}>
            5
          </div>
          <div style={{ fontSize: '12px', fontWeight: 400, color: '#4E5968' }}>
            Awaiting routing decision
          </div>
        </div>

        <div style={{ width: '1024px', height: '1px', backgroundColor: '#DCE3ED', margin: '14px 0' }} />

        {/* Row 2: Assigned AI */}
        <div style={{ display: 'flex', alignItems: 'center', height: '26px' }}>
          <div style={{ width: '258px', fontSize: '12px', fontWeight: 600, color: '#111827' }}>
            Assigned AI
          </div>
          <div style={{ width: '112px', fontSize: '13px', fontWeight: 700, color: '#041B3B' }}>
            3
          </div>
          <div style={{ fontSize: '12px', fontWeight: 400, color: '#4E5968' }}>
            Processing under AI route
          </div>
        </div>

        <div style={{ width: '1024px', height: '1px', backgroundColor: '#DCE3ED', margin: '14px 0' }} />

        {/* Row 3: Assigned Human */}
        <div style={{ display: 'flex', alignItems: 'center', height: '26px' }}>
          <div style={{ width: '258px', fontSize: '12px', fontWeight: 600, color: '#111827' }}>
            Assigned Human
          </div>
          <div style={{ width: '112px', fontSize: '13px', fontWeight: 700, color: '#041B3B' }}>
            4
          </div>
          <div style={{ fontSize: '12px', fontWeight: 400, color: '#4E5968' }}>
            Assigned to human evaluator
          </div>
        </div>

        <div style={{ width: '1024px', height: '1px', backgroundColor: '#DCE3ED', margin: '14px 0' }} />

        {/* Row 4: Pending Moderation */}
        <div style={{ display: 'flex', alignItems: 'center', height: '26px' }}>
          <div style={{ width: '258px', fontSize: '12px', fontWeight: 600, color: '#111827' }}>
            Pending Moderation
          </div>
          <div style={{ width: '112px', fontSize: '13px', fontWeight: 700, color: '#041B3B' }}>
            4
          </div>
          <div style={{ fontSize: '12px', fontWeight: 400, color: '#4E5968' }}>
            Publication decision unresolved
          </div>
        </div>
      </div>

      {/* Important separation */}
      <h3
        style={{
          position: 'absolute',
          left: '30px',
          top: '570px',
          fontSize: '19px',
          fontWeight: 600,
          lineHeight: '26px',
          color: '#111827',
          margin: 0,
        }}
      >
        Important separation
      </h3>

      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '606px',
          width: '1076px',
          height: '122px',
          backgroundColor: '#F3F8FE',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '20px',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 500, lineHeight: '18px', color: '#041B3B' }}>
          Routing answers who evaluates: Requested, Assigned AI/Human, Redirected.
        </div>
        <div style={{ fontSize: '12px', fontWeight: 400, lineHeight: '18px', color: '#4E5968', marginTop: '14px' }}>
          Publication/moderation is separate: Processing, Pending Moderation, Approved, Rejected. Only Approved results take effect.
        </div>
      </div>
    </AdminLayout>
  )
}
