import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AdminLayout } from '../components/AdminLayout'
import {
  loadPersistedAdminHumanQueue,
  type PersistedAdminHumanQueueItem,
} from '../integration/persistedAdminHumanLifecycle'

function methodLabel(value: 'ai' | 'human'): string {
  return value === 'ai' ? 'AI' : 'Human'
}

function statusLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function PersistedAdminEvaluationRequestQueuePage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<PersistedAdminHumanQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void loadPersistedAdminHumanQueue()
      .then((rows) => {
        if (!active) return
        setItems(rows)
        setError(null)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(cause instanceof Error ? cause.message : 'Unable to load request queue.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <AdminLayout
      ariaLabel="Persisted Human Evaluation Request Queue"
      topbarTitle="Evaluation Request Queue"
      activeNav="requests"
      topbarRightVariant="avatar"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '32px', fontSize: '26px', lineHeight: '34px', fontWeight: 700 }}
      >
        Persisted Human requests
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '72px', fontSize: '12px', lineHeight: '18px' }}
      >
        Admin and Super Admin see the same authoritative request, version, and active-owner state.
      </p>

      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '116px',
          width: '1076px',
          minHeight: '540px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '20px',
        }}
      >
        {loading ? (
          <p>Loading persisted Human requests…</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : items.length === 0 ? (
          <p>No active Human requests are waiting for Admin lifecycle action.</p>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '118px 150px 190px 120px 120px 150px 100px',
                gap: '12px',
                padding: '0 8px 12px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#6B788A',
              }}
            >
              <span>REQUEST</span>
              <span>USER</span>
              <span>TRACK</span>
              <span>REQUESTED</span>
              <span>ROUTING</span>
              <span>OWNER</span>
              <span>ACTION</span>
            </div>

            {items.map((item) => (
              <div
                key={item.requestId}
                data-request-id={item.requestId}
                data-request-status={item.status}
                data-requested-mode={item.requestedMode}
                data-effective-mode={item.effectiveMode}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '118px 150px 190px 120px 120px 150px 100px',
                  gap: '12px',
                  alignItems: 'center',
                  minHeight: '58px',
                  borderTop: '1px solid #DCE3ED',
                  padding: '0 8px',
                  fontSize: '11px',
                }}
              >
                <span>{item.requestRef}</span>
                <span>{item.userName}</span>
                <span>{item.trackName}</span>
                <span>{methodLabel(item.requestedMode)}</span>
                <span>Human · {statusLabel(item.status)}</span>
                <span>{item.activeVolunteerName ?? 'Unassigned'}</span>
                <button
                  type="button"
                  className="auratio-admin-btn--table-open"
                  style={{ width: '88px', height: '28px' }}
                  onClick={() => navigate(`/admin/requests/${encodeURIComponent(item.requestId)}`)}
                >
                  Open
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '684px',
          width: '1076px',
          height: '82px',
          backgroundColor: '#F3F8FE',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px 20px',
          fontSize: '12px',
          lineHeight: '20px',
          color: '#041B3B',
        }}
      >
        Originally requested AI requests may appear here only when their effective route is already Human through the persisted explicit-consent workflow. Admins cannot switch evaluation mode from this queue.
      </div>
    </AdminLayout>
  )
}
