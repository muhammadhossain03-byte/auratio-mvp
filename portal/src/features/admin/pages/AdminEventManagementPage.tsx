import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { getAdminEventsList } from '../data/mockAdminData'

export function AdminEventManagementPage() {
  const navigate = useNavigate()
  const events = getAdminEventsList()

  return (
    <AdminLayout
      ariaLabel="Admin Event Management"
      topbarTitle="Event Management"
      activeNav="events"
      topbarRightVariant="avatar"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '32px', fontSize: '26px', lineHeight: '34px', fontWeight: 700 }}
      >
        Admin-curated event directory
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '72px', fontSize: '12px', lineHeight: '18px', fontWeight: 400, color: '#4E5968' }}
      >
        Authorized admins manage event information here. End users view published event information read-only.
      </p>

      {/* Action and Filter Bar */}
      <div
        style={{
          position: 'absolute',
          left: '30px',
          top: '112px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.admin.eventEditor)}
          className="auratio-admin-btn auratio-admin-btn--primary"
          style={{ width: '150px', height: '42px', fontSize: '13px', fontWeight: 600 }}
        >
          Create Event
        </button>

        <button
          type="button"
          className="auratio-admin-btn auratio-admin-btn--secondary"
          style={{ width: '120px', height: '42px', fontSize: '13px', fontWeight: 600, marginLeft: '12px' }}
        >
          All Events
        </button>

        <button
          type="button"
          className="auratio-admin-btn auratio-admin-btn--secondary"
          style={{ width: '120px', height: '42px', fontSize: '13px', fontWeight: 600, marginLeft: '12px' }}
        >
          Published
        </button>
      </div>

      {/* Directory Table */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '174px',
          width: '1060px',
          height: '286px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '16px 20px',
          overflowY: 'auto',
        }}
      >
        {/* Headers */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '20px',
            fontSize: '11px',
            fontWeight: 500,
            color: '#6B788A',
            letterSpacing: '0.02em',
          }}
        >
          <div style={{ width: '280px' }}>EVENT</div>
          <div style={{ width: '160px' }}>DATE</div>
          <div style={{ width: '190px' }}>LOCATION</div>
          <div style={{ width: '250px' }}>RELEVANT PATH(S)</div>
          <div style={{ width: '100px' }}>STATUS</div>
          <div style={{ width: '40px', textAlign: 'right' }}>ACTIONS</div>
        </div>

        {/* Rows */}
        {events.map((ev, idx) => (
          <div key={ev.title}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '46px',
                marginTop: idx === 0 ? '14px' : '18px',
              }}
            >
              <div style={{ width: '280px', fontSize: '11px', fontWeight: 600, color: '#111827' }}>
                {ev.title}
              </div>
              <div style={{ width: '160px', fontSize: '11px', fontWeight: 400, color: '#111827' }}>
                {ev.date}
              </div>
              <div style={{ width: '190px', fontSize: '11px', fontWeight: 400, color: '#111827' }}>
                {ev.location}
              </div>
              <div style={{ width: '250px', fontSize: '11px', fontWeight: 400, color: '#111827' }}>
                {ev.relevantPaths}
              </div>
              <div style={{ width: '100px' }}>
                <div
                  className={`auratio-admin-status-pill ${
                    ev.status === 'Published'
                      ? 'auratio-admin-status-pill--published'
                      : 'auratio-admin-status-pill--draft'
                  }`}
                  style={{ width: '88px', height: '28px' }}
                >
                  {ev.status}
                </div>
              </div>
              <div style={{ width: '40px', textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => navigate(ev.destinationPath)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#041B3B',
                    fontFamily: 'inherit',
                  }}
                >
                  {ev.actionLabel}
                </button>
              </div>
            </div>

            {idx < events.length - 1 && (
              <div
                style={{
                  width: '1020px',
                  height: '1px',
                  backgroundColor: '#DCE3ED',
                  marginTop: '10px',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Locked Bangladesh relevance card */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '500px',
          width: '1060px',
          height: '126px',
          backgroundColor: '#F3F8FE',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px 20px',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 600, lineHeight: '20px', color: '#041B3B' }}>
          Locked Bangladesh relevance
        </div>
        <div
          style={{
            fontSize: '12px',
            lineHeight: '18px',
            fontWeight: 400,
            color: '#4E5968',
            marginTop: '8px',
          }}
        >
          MVP events are Bangladesh-only. End-user discovery is matched and filtered by Division + selected Auratio Path(s) + Date.
        </div>
        <div
          style={{
            fontSize: '11px',
            lineHeight: '16px',
            fontWeight: 600,
            color: '#111827',
            marginTop: '14px',
          }}
        >
          Ordinary users cannot create, edit, delete, host, or manage events.
        </div>
      </div>
    </AdminLayout>
  )
}
