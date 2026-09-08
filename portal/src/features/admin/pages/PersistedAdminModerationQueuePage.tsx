import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AdminLayout } from '../components/AdminLayout'
import {
  loadPersistedAdminModerationQueue,
  type PersistedAdminModerationItem,
} from '../integration/persistedAdminCompletion'

export function PersistedAdminModerationQueuePage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<PersistedAdminModerationItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void loadPersistedAdminModerationQueue()
      .then((rows) => {
        if (active) setItems(rows)
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load moderation.')
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <AdminLayout
      ariaLabel="Persisted Moderation Queue"
      topbarTitle="Moderation"
      activeNav="moderation"
      topbarRightVariant="pill"
    >
      <h2 className="auratio-admin-page-title" style={{ top: '34px', fontSize: '32px', fontWeight: 700 }}>
        Pending Moderation
      </h2>
      <p className="auratio-admin-page-subtitle" style={{ top: '78px' }}>
        Submitted Human evaluator versions requiring publication review.
      </p>

      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '122px',
          width: '1076px',
          minHeight: '520px',
          padding: '18px',
          boxSizing: 'border-box',
        }}
      >
        {error ? (
          <p role="alert">{error}</p>
        ) : items.length === 0 ? (
          <p>No Human evaluations currently require moderation.</p>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '145px 210px 150px 145px 280px 90px', gap: '10px', fontSize: '11px', fontWeight: 600, color: '#6B788A' }}>
              <span>SUBMISSION</span><span>TRACK</span><span>EVALUATOR</span><span>SCORE</span><span>TRIGGER</span><span>ACTION</span>
            </div>
            {items.map((item) => (
              <div
                key={item.requestId}
                data-request-id={item.requestId}
                data-version-id={item.versionId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '145px 210px 150px 145px 280px 90px',
                  gap: '10px',
                  alignItems: 'center',
                  minHeight: '70px',
                  borderTop: '1px solid #DCE3ED',
                  fontSize: '12px',
                }}
              >
                <span>{item.submissionRef}</span>
                <span>{item.trackName}</span>
                <span>{item.evaluatorName}</span>
                <span>{item.finalScore} / 100</span>
                <span>{item.triggerLabel}</span>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/moderation/${encodeURIComponent(item.submissionId)}`)}
                  className="auratio-admin-btn--table-open"
                  style={{ width: '82px', height: '28px' }}
                >
                  Open
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
