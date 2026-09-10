import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import {
  formatDisplayDate,
  formatEventStatus,
  listPersistedAdminEvents,
  type PersistedAdminEvent,
} from '../integration/persistedAdminEvents'

export function AdminEventManagementPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'published'>('all')
  const [events, setEvents] = useState<PersistedAdminEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listPersistedAdminEvents()
      setEvents(data)
    } catch {
      setError('Unable to load events.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const filteredEvents =
    filter === 'published' ? events.filter((ev) => ev.status === 'published') : events

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
          data-testid="admin-events-filter-all"
          aria-pressed={filter === 'all'}
          onClick={() => setFilter('all')}
          className={`auratio-admin-btn ${filter === 'all' ? 'auratio-admin-btn--filter-active' : 'auratio-admin-btn--secondary'}`}
          style={{ width: '120px', height: '42px', fontSize: '13px', fontWeight: 600, marginLeft: '12px' }}
        >
          All Events
        </button>

        <button
          type="button"
          data-testid="admin-events-filter-published"
          aria-pressed={filter === 'published'}
          onClick={() => setFilter('published')}
          className={`auratio-admin-btn ${filter === 'published' ? 'auratio-admin-btn--filter-active' : 'auratio-admin-btn--secondary'}`}
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

        {/* Rows or State */}
        {loading ? (
          <div
            data-testid="admin-events-loading"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '180px',
              fontSize: '12px',
              color: '#6B788A',
            }}
          >
            Loading events…
          </div>
        ) : error ? (
          <div
            data-testid="admin-events-error"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '180px',
              fontSize: '12px',
              color: '#B42318',
              gap: '10px',
            }}
          >
            <span>Unable to load events.</span>
            <button
              type="button"
              onClick={loadEvents}
              className="auratio-admin-btn auratio-admin-btn--secondary"
              style={{ height: '32px', fontSize: '11px', padding: '0 16px' }}
            >
              Retry
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div
            data-testid="admin-events-empty"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '180px',
              fontSize: '12px',
              color: '#6B788A',
            }}
          >
            No events found for this filter.
          </div>
        ) : (
          filteredEvents.map((ev, idx) => {
            const statusLabel = formatEventStatus(ev.status)
            const locationDisplay = ev.division.includes('Division')
              ? ev.division
              : `${ev.division} Division`

            return (
              <div key={ev.id} data-event-id={ev.id} data-testid={`admin-event-row-${ev.id}`}>
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
                    {formatDisplayDate(ev.startsAt)}
                  </div>
                  <div style={{ width: '190px', fontSize: '11px', fontWeight: 400, color: '#111827' }}>
                    {locationDisplay}
                  </div>
                  <div style={{ width: '250px', fontSize: '11px', fontWeight: 400, color: '#111827' }}>
                    {ev.relevantPaths}
                  </div>
                  <div style={{ width: '100px' }}>
                    <div
                      className={`auratio-admin-status-pill ${
                        ev.status === 'published'
                          ? 'auratio-admin-status-pill--published'
                          : 'auratio-admin-status-pill--draft'
                      }`}
                      style={{ width: '88px', height: '28px' }}
                    >
                      {statusLabel}
                    </div>
                  </div>
                  <div style={{ width: '40px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => navigate(`${portalRoutePaths.admin.eventEditor}?id=${ev.id}`)}
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
                      Edit
                    </button>
                  </div>
                </div>

                {idx < filteredEvents.length - 1 && (
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
            )
          })
        )}
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
