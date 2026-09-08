import { useEffect, useState } from 'react'

import { AdminLayout } from '../components/AdminLayout'
import {
  loadPersistedAdminDashboardMetrics,
  type PersistedAdminDashboardMetrics,
} from '../integration/persistedAdminCompletion'

export function PersistedAdminOperationsDashboardPage() {
  const [metrics, setMetrics] = useState<PersistedAdminDashboardMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void loadPersistedAdminDashboardMetrics()
      .then((value) => {
        if (active) setMetrics(value)
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load dashboard.')
      })
    return () => {
      active = false
    }
  }, [])

  const cards = [
    ['OPEN REQUESTS', metrics?.openRequests ?? '—'],
    ['PENDING MODERATION', metrics?.pendingModeration ?? '—'],
    ['HUMAN ASSIGNMENTS', metrics?.humanAssignments ?? '—'],
    ['PUBLISHED EVENTS', metrics?.publishedEvents ?? '—'],
  ] as const

  const queues = [
    ['Human unassigned / reopened', metrics?.humanUnassigned ?? '—'],
    ['Human active', metrics?.humanActive ?? '—'],
    ['AI processing', metrics?.aiProcessing ?? '—'],
    ['Approved', metrics?.approved ?? '—'],
  ] as const

  return (
    <AdminLayout
      ariaLabel="Persisted Admin Operations Dashboard"
      topbarTitle="Operations Dashboard"
      activeNav="dashboard"
      topbarRightVariant="avatar"
    >
      <h2 className="auratio-admin-page-title" style={{ top: '30px', fontSize: '26px', fontWeight: 700 }}>
        System overview
      </h2>
      <p className="auratio-admin-page-subtitle" style={{ top: '70px' }}>
        Live persisted operational state.
      </p>

      {error && <p role="alert" style={{ position: 'absolute', left: '30px', top: '102px' }}>{error}</p>}

      <div style={{ position: 'absolute', left: '30px', top: '132px', display: 'flex', gap: '20px' }}>
        {cards.map(([label, value]) => (
          <div
            key={label}
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
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#6B788A' }}>{label}</div>
            <div style={{ fontSize: '30px', fontWeight: 700, color: '#041B3B', marginTop: '10px' }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '278px',
          width: '1076px',
          minHeight: '300px',
          padding: '22px',
          boxSizing: 'border-box',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Operational queues</h3>
        {queues.map(([label, value]) => (
          <div
            key={label}
            style={{
              display: 'grid',
              gridTemplateColumns: '320px 100px 1fr',
              minHeight: '52px',
              alignItems: 'center',
              borderTop: '1px solid #DCE3ED',
            }}
          >
            <strong>{label}</strong>
            <span>{value}</span>
            <span style={{ color: '#4E5968' }}>Persisted backend state</span>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
