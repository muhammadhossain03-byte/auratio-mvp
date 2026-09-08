import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AdminLayout } from '../components/AdminLayout'
import {
  loadPersistedAdminEvaluationRecords,
  type PersistedAdminEvaluationRecord,
} from '../integration/persistedAdminCompletion'

export function PersistedAdminEvaluationRecordsPage() {
  const navigate = useNavigate()
  const [records, setRecords] = useState<PersistedAdminEvaluationRecord[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void loadPersistedAdminEvaluationRecords()
      .then((rows) => {
        if (active) setRecords(rows)
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load evaluations.')
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <AdminLayout
      ariaLabel="Persisted Evaluation Records"
      topbarTitle="Evaluations"
      activeNav="evaluations"
      topbarRightVariant="pill"
    >
      <h2 className="auratio-admin-page-title" style={{ top: '34px', fontSize: '32px', fontWeight: 700 }}>
        Evaluation Records
      </h2>
      <p className="auratio-admin-page-subtitle" style={{ top: '78px' }}>
        Persisted method, assignment, publication, and version outcomes.
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
        ) : records.length === 0 ? (
          <p>No persisted evaluation records yet.</p>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '145px 190px 125px 175px 170px 110px 90px', gap: '10px', fontSize: '11px', fontWeight: 600, color: '#6B788A' }}>
              <span>SUBMISSION</span><span>TRACK</span><span>METHOD</span><span>ASSIGNMENT</span><span>PUBLICATION</span><span>SCORE</span><span>ACTION</span>
            </div>
            {records.map((record) => (
              <div
                key={record.requestId}
                data-request-id={record.requestId}
                data-submission-id={record.submissionId}
                data-request-status={record.requestStatus}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '145px 190px 125px 175px 170px 110px 90px',
                  gap: '10px',
                  alignItems: 'center',
                  minHeight: '64px',
                  borderTop: '1px solid #DCE3ED',
                  fontSize: '12px',
                }}
              >
                <span>{record.submissionRef}</span>
                <span>{record.trackName}</span>
                <span>{record.effectiveMode === 'human' ? 'Human' : 'AI'}</span>
                <span>{record.assignmentLabel}</span>
                <span>{record.publicationLabel}</span>
                <span>{record.finalScore === null ? '—' : `${record.finalScore} / 100`}</span>
                {record.destinationPath ? (
                  <button
                    type="button"
                    onClick={() => navigate(record.destinationPath!)}
                    className="auratio-admin-btn--table-open"
                    style={{ width: '82px', height: '28px' }}
                  >
                    Open
                  </button>
                ) : (
                  <span>—</span>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
