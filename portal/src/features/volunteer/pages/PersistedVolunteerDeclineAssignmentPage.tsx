import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { portalRoutePaths } from '../../../app/routes/routePaths'
import { VolunteerLayout } from '../components/VolunteerLayout'
import {
  declinePersistedVolunteerAssignment,
  loadPersistedVolunteerAssignment,
  type PersistedVolunteerAssignment,
} from '../integration/persistedVolunteerLifecycle'

export function PersistedVolunteerDeclineAssignmentPage() {
  const navigate = useNavigate()
  const { submissionId } = useParams<{ submissionId?: string }>()
  const persistedSubmissionId = submissionId ? decodeURIComponent(submissionId) : ''
  const [assignment, setAssignment] = useState<PersistedVolunteerAssignment | null>(null)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!persistedSubmissionId) {
      setLoading(false)
      return
    }

    let active = true
    void loadPersistedVolunteerAssignment(persistedSubmissionId)
      .then((row) => {
        if (!active) return
        setAssignment(row)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(cause instanceof Error ? cause.message : 'Unable to load assignment.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [persistedSubmissionId])

  if (!persistedSubmissionId) {
    return <Navigate to={portalRoutePaths.volunteer.assignments} replace />
  }

  async function confirmDecline() {
    if (!assignment || assignment.assignmentStatus !== 'Assigned' || !reason.trim()) return

    setBusy(true)
    setError(null)
    try {
      await declinePersistedVolunteerAssignment(assignment.requestId, reason)
      navigate(portalRoutePaths.volunteer.activeAssignmentsAfterDecline, {
        replace: true,
        state: { declinedSubmissionRef: assignment.submissionRef },
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to decline assignment.')
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <VolunteerLayout ariaLabel="Decline Assignment" topbarTitle="Human Evaluation Assignment" activeNav="assignments">
        <h2 className="auratio-volunteer-page-title">Loading assignment…</h2>
      </VolunteerLayout>
    )
  }

  if (!assignment || assignment.assignmentStatus !== 'Assigned') {
    return <Navigate to={portalRoutePaths.volunteer.assignments} replace />
  }

  return (
    <VolunteerLayout
      ariaLabel="Decline Assignment"
      topbarTitle="Human Evaluation Assignment"
      activeNav="assignments"
    >
      <h2 className="auratio-volunteer-page-title">Decline Human Evaluation assignment</h2>
      <p className="auratio-volunteer-page-subtitle">
        {assignment.submissionRef} • persisted decline reason required
      </p>

      <div
        className="auratio-volunteer-panel"
        style={{ left: '30px', top: '124px', width: '1076px', height: '180px', padding: '22px', boxSizing: 'border-box' }}
      >
        <h3 className="auratio-volunteer-panel-title" style={{ position: 'static' }}>Assignment context</h3>
        <p>{assignment.track} • {assignment.assignmentStatus} • {assignment.publicationStatus}</p>
      </div>

      <div
        className="auratio-volunteer-panel"
        style={{ left: '30px', top: '336px', width: '1076px', height: '224px', padding: '22px', boxSizing: 'border-box' }}
      >
        <label htmlFor="persisted-decline-reason" style={{ display: 'block', fontWeight: 600 }}>
          Short reason
        </label>
        <input
          id="persisted-decline-reason"
          type="text"
          value={reason}
          disabled={busy}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Scheduling conflict / cannot review in time…"
          className="auratio-volunteer-decline-input"
          style={{ marginTop: '16px', width: '100%', height: '48px' }}
        />
        <p style={{ color: 'var(--auratio-neutral-600)' }}>
          Decline closes this assignment attempt and removes active ownership. The request returns to Admin as Unassigned.
        </p>
        {error && <p role="alert">{error}</p>}
      </div>

      <button
        type="button"
        disabled={busy || !reason.trim()}
        onClick={() => void confirmDecline()}
        className="auratio-volunteer-btn auratio-volunteer-btn--primary"
        style={{ position: 'absolute', left: '30px', top: '602px', width: '190px', height: '44px' }}
      >
        {busy ? 'Declining…' : 'Confirm Decline'}
      </button>

      <button
        type="button"
        disabled={busy}
        onClick={() => navigate(`/volunteer/assignments/${encodeURIComponent(assignment.submissionId)}`)}
        className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
        style={{ position: 'absolute', left: '238px', top: '602px', width: '130px', height: '44px' }}
      >
        Cancel
      </button>
    </VolunteerLayout>
  )
}
