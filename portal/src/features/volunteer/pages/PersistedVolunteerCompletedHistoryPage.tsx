import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { VolunteerLayout } from '../components/VolunteerLayout'
import {
  loadPersistedVolunteerCompletedHistory,
  type PersistedVolunteerCompletedRecord,
} from '../integration/persistedVolunteerHistory'

export function PersistedVolunteerCompletedHistoryPage() {
  const navigate = useNavigate()
  const [records, setRecords] = useState<PersistedVolunteerCompletedRecord[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void loadPersistedVolunteerCompletedHistory()
      .then((rows) => {
        if (active) setRecords(rows)
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load history.')
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <VolunteerLayout
      ariaLabel="Persisted Completed History"
      topbarTitle="Completed / History"
      activeNav="completed"
    >
      <h2 className="auratio-volunteer-page-title" style={{ top: '34px' }}>
        My Completed / History
      </h2>
      <p className="auratio-volunteer-page-subtitle" style={{ top: '78px' }}>
        Each row is one preserved evaluator version. Submitted work is never reused as editable active work.
      </p>

      <div
        className="auratio-volunteer-panel"
        style={{
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
        ) : records.length === 0 ? (
          <p>No completed Human evaluations yet.</p>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 220px 100px 190px 160px 110px 90px', gap: '10px', fontSize: '11px', fontWeight: 600, color: 'var(--auratio-neutral-500)' }}>
              <span>SUBMISSION</span><span>TRACK</span><span>VERSION</span><span>ASSIGNMENT</span><span>PUBLICATION</span><span>SCORE</span><span>ACTION</span>
            </div>
            {records.map((record) => (
              <div
                key={record.assignmentId}
                data-request-id={record.requestId}
                data-version-id={record.versionId}
                data-current-request-status={record.currentRequestStatus}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '150px 220px 100px 190px 160px 110px 90px',
                  gap: '10px',
                  alignItems: 'center',
                  minHeight: '66px',
                  borderTop: '1px solid var(--auratio-neutral-200)',
                  fontSize: '12px',
                }}
              >
                <span>{record.submissionRef}</span>
                <span>{record.trackName}</span>
                <span>v{record.versionNumber}</span>
                <span>Submitted / Completed</span>
                <span>{record.publicationStatus}</span>
                <span>{record.finalScore} / 100</span>
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/volunteer/completed/${encodeURIComponent(record.submissionId)}/version/${encodeURIComponent(record.versionId)}`,
                    )
                  }
                  className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
                  style={{ width: '82px', height: '32px' }}
                >
                  Open
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </VolunteerLayout>
  )
}
