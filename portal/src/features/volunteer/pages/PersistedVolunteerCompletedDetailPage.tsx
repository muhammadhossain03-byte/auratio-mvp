import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { portalRoutePaths } from '../../../app/routes/routePaths'
import { VolunteerLayout } from '../components/VolunteerLayout'
import {
  loadPersistedVolunteerCompletedRecord,
  type PersistedVolunteerCompletedRecord,
} from '../integration/persistedVolunteerHistory'

export function PersistedVolunteerCompletedDetailPage() {
  const { submissionId, versionId } = useParams<{
    submissionId?: string
    versionId?: string
  }>()
  const persistedSubmissionId = submissionId ? decodeURIComponent(submissionId) : ''
  const persistedVersionId = versionId ? decodeURIComponent(versionId) : undefined
  const [record, setRecord] = useState<PersistedVolunteerCompletedRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!persistedSubmissionId) {
      setLoading(false)
      return
    }

    let active = true
    void loadPersistedVolunteerCompletedRecord(persistedSubmissionId, persistedVersionId)
      .then((loaded) => {
        if (active) setRecord(loaded)
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load completed version.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [persistedSubmissionId, persistedVersionId])

  if (!persistedSubmissionId) {
    return <Navigate to={portalRoutePaths.volunteer.completedHistory} replace />
  }

  if (loading) {
    return (
      <VolunteerLayout ariaLabel="Persisted Completed Evaluation" topbarTitle="Submitted Evaluation" activeNav="completed">
        <h2 className="auratio-volunteer-page-title">Loading completed evaluator version…</h2>
      </VolunteerLayout>
    )
  }

  if (!record) {
    return <Navigate to={portalRoutePaths.volunteer.completedHistory} replace />
  }

  return (
    <VolunteerLayout
      ariaLabel="Persisted Completed Evaluation"
      topbarTitle="Submitted Evaluation"
      activeNav="completed"
    >
      <h2 className="auratio-volunteer-page-title" style={{ top: '34px' }}>
        {record.submissionRef} — Version {record.versionNumber}
      </h2>
      <p className="auratio-volunteer-page-subtitle" style={{ top: '78px' }}>
        {record.trackName} • preserved evaluator-authored submission
      </p>

      <div
        className="auratio-volunteer-panel"
        style={{ left: '30px', top: '122px', width: '520px', height: '430px', padding: '20px', boxSizing: 'border-box' }}
      >
        <h3 style={{ marginTop: 0 }}>Evaluator version</h3>
        <p><strong>Assignment:</strong> Completed — no active ownership</p>
        <p><strong>Publication:</strong> {record.publicationStatus}</p>
        <p><strong>Current request state:</strong> {record.currentRequestStatus}</p>
        <p><strong>Universal Delivery:</strong> {record.universalScore} / 40</p>
        <p><strong>Structural Flow:</strong> {record.structuralScore} / 20</p>
        <p><strong>Track Specialisation:</strong> {record.trackScore} / 40</p>
        <p><strong>Final score:</strong> {record.finalScore} / 100</p>
        <p><strong>Editability:</strong> Locked / read-only</p>
      </div>

      <div
        className="auratio-volunteer-panel"
        style={{ left: '578px', top: '122px', width: '528px', height: '430px', padding: '20px', boxSizing: 'border-box' }}
      >
        <h3 style={{ marginTop: 0 }}>Overall Summary</h3>
        <p style={{ lineHeight: '22px' }}>{record.overallSummary}</p>
        <div
          style={{
            marginTop: '24px',
            padding: '14px',
            borderRadius: '12px',
            backgroundColor:
              record.publicationStatus === 'Approved'
                ? '#ECFDF3'
                : record.publicationStatus === 'Rejected'
                  ? '#FEF2F2'
                  : '#FFF7E8',
          }}
        >
          {record.versionStatus === 'reopened'
            ? 'A later re-review workflow exists. This historical submitted version remains preserved and is never the editable draft.'
            : 'This completed evaluator version remains preserved regardless of the request’s later lifecycle.'}
        </div>
        {error && <p role="alert">{error}</p>}
      </div>
    </VolunteerLayout>
  )
}
