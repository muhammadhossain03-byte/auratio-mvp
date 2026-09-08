import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AdminLayout } from '../components/AdminLayout'
import {
  approvePersistedAdminModeration,
  loadPersistedAdminActiveVolunteers,
  loadPersistedAdminModerationItem,
  reassignPersistedAdminModeration,
  rejectPersistedAdminModeration,
  reopenPersistedAdminModeration,
  type PersistedAdminModerationItem,
} from '../integration/persistedAdminCompletion'
import type { PersistedAdminVolunteerOption } from '../integration/persistedAdminHumanLifecycle'

export function PersistedAdminModerationReviewPage() {
  const navigate = useNavigate()
  const { submissionId } = useParams<{ submissionId?: string }>()
  const persistedSubmissionId = submissionId ? decodeURIComponent(submissionId) : ''
  const [item, setItem] = useState<PersistedAdminModerationItem | null>(null)
  const [volunteers, setVolunteers] = useState<PersistedAdminVolunteerOption[]>([])
  const [selectedVolunteer, setSelectedVolunteer] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!persistedSubmissionId) {
      setLoading(false)
      return
    }

    let active = true
    void Promise.all([
      loadPersistedAdminModerationItem(persistedSubmissionId),
      loadPersistedAdminActiveVolunteers(),
    ])
      .then(([loadedItem, loadedVolunteers]) => {
        if (!active) return
        setItem(loadedItem)
        setVolunteers(loadedVolunteers)
      })
      .catch((cause: unknown) => {
        if (active) setMessage(cause instanceof Error ? cause.message : 'Unable to load moderation.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [persistedSubmissionId])

  if (!persistedSubmissionId) {
    return <Navigate to={portalRoutePaths.admin.moderation} replace />
  }

  if (loading) {
    return (
      <AdminLayout ariaLabel="Persisted Moderation Review" topbarTitle="Moderation Review" activeNav="moderation" topbarRightVariant="pill">
        <h2 className="auratio-admin-page-title" style={{ top: '34px' }}>Loading moderation…</h2>
      </AdminLayout>
    )
  }

  if (!item) {
    return <Navigate to={portalRoutePaths.admin.moderation} replace />
  }

  const activeItem = item

  async function approve() {
    setBusy(true)
    setMessage(null)
    try {
      await approvePersistedAdminModeration(activeItem.requestId)
      navigate(portalRoutePaths.admin.evaluations, { replace: true })
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Approval failed.')
      setBusy(false)
    }
  }

  async function reject() {
    if (!reason.trim()) return
    setBusy(true)
    setMessage(null)
    try {
      await rejectPersistedAdminModeration(activeItem.requestId, reason)
      navigate(portalRoutePaths.admin.evaluations, { replace: true })
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Rejection failed.')
      setBusy(false)
    }
  }

  async function reopen() {
    if (!reason.trim()) return
    setBusy(true)
    setMessage(null)
    try {
      await reopenPersistedAdminModeration(activeItem.requestId, reason)
      navigate(`/admin/requests/${encodeURIComponent(activeItem.requestId)}`, { replace: true })
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Re-review failed.')
      setBusy(false)
    }
  }

  async function reassign() {
    if (!selectedVolunteer || !reason.trim()) return
    setBusy(true)
    setMessage(null)
    try {
      await reassignPersistedAdminModeration(
        activeItem.requestId,
        selectedVolunteer,
        reason,
      )
      navigate(`/admin/requests/${encodeURIComponent(activeItem.requestId)}`, { replace: true })
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Reassignment failed.')
      setBusy(false)
    }
  }

  return (
    <AdminLayout
      ariaLabel="Persisted Moderation Review"
      topbarTitle="Moderation Review"
      activeNav="moderation"
      topbarRightVariant="pill"
    >
      <h2 className="auratio-admin-page-title" style={{ top: '34px', fontSize: '30px', fontWeight: 700 }}>
        {activeItem.submissionRef} — Moderation Review
      </h2>
      <p className="auratio-admin-page-subtitle" style={{ top: '78px' }}>
        {activeItem.trackName} • evaluator version {activeItem.versionNumber} • {activeItem.requestStatus}
      </p>

      <div
        className="auratio-admin-panel"
        style={{ position: 'absolute', left: '30px', top: '122px', width: '520px', height: '430px', padding: '20px', boxSizing: 'border-box' }}
      >
        <h3 style={{ marginTop: 0 }}>Submitted evaluator version</h3>
        <p><strong>Evaluator:</strong> {activeItem.evaluatorName}</p>
        <p><strong>Requested method:</strong> {activeItem.requestedMode === 'ai' ? 'AI' : 'Human'}</p>
        <p><strong>Effective route:</strong> Human</p>
        <p><strong>Universal Delivery:</strong> {activeItem.universalScore} / 40</p>
        <p><strong>Structural Flow:</strong> {activeItem.structuralScore} / 20</p>
        <p><strong>Track Specialisation:</strong> {activeItem.trackScore} / 40</p>
        <p><strong>Final score:</strong> {activeItem.finalScore} / 100</p>
        <p><strong>Overall Summary:</strong> {activeItem.overallSummary}</p>
        <p style={{ color: '#925F12' }}>
          This submitted version is read-only. Admin actions never edit evaluator-authored scores.
        </p>
      </div>

      <div
        className="auratio-admin-panel"
        style={{ position: 'absolute', left: '578px', top: '122px', width: '528px', height: '430px', padding: '20px', boxSizing: 'border-box' }}
      >
        <h3 style={{ marginTop: 0 }}>Moderation context</h3>
        <p><strong>Trigger:</strong> {activeItem.triggerLabel}</p>
        <p><strong>Human baseline:</strong> {activeItem.baselineScore === null ? 'No prior approved Human baseline' : `${activeItem.baselineScore} / 100`}</p>

        <label htmlFor="persisted-moderation-volunteer" style={{ display: 'block', marginTop: '18px', fontWeight: 600 }}>
          Reassignment target
        </label>
        <select
          id="persisted-moderation-volunteer"
          value={selectedVolunteer}
          disabled={busy}
          onChange={(event) => setSelectedVolunteer(event.target.value)}
          style={{ width: '100%', height: '40px', marginTop: '6px' }}
        >
          <option value="">Select Volunteer…</option>
          {volunteers.map((volunteer) => (
            <option key={volunteer.userId} value={volunteer.userId}>{volunteer.displayName}</option>
          ))}
        </select>

        <label htmlFor="persisted-moderation-reason" style={{ display: 'block', marginTop: '16px', fontWeight: 600 }}>
          Internal reason
        </label>
        <textarea
          id="persisted-moderation-reason"
          value={reason}
          disabled={busy}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Required for reject, re-review, or reassign"
          style={{ width: '100%', height: '78px', marginTop: '6px', boxSizing: 'border-box' }}
        />
      </div>

      <div
        className="auratio-admin-panel"
        style={{ position: 'absolute', left: '30px', top: '578px', width: '1076px', minHeight: '170px', padding: '18px', boxSizing: 'border-box' }}
      >
        <h3 style={{ marginTop: 0 }}>Lifecycle actions</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" disabled={busy} onClick={() => void approve()} className="auratio-admin-btn auratio-admin-btn--primary" style={{ width: '120px', height: '42px' }}>
            Approve
          </button>
          <button type="button" disabled={busy || !reason.trim()} onClick={() => void reject()} className="auratio-admin-btn auratio-admin-btn--secondary" style={{ width: '140px', height: '42px' }}>
            Reject
          </button>
          <button type="button" disabled={busy || !reason.trim()} onClick={() => void reopen()} className="auratio-admin-btn auratio-admin-btn--secondary" style={{ width: '170px', height: '42px' }}>
            Request Re-review
          </button>
          <button type="button" disabled={busy || !selectedVolunteer || !reason.trim()} onClick={() => void reassign()} className="auratio-admin-btn auratio-admin-btn--secondary" style={{ width: '180px', height: '42px' }}>
            Reassign Human
          </button>
        </div>
        <p style={{ marginTop: '14px', fontSize: '12px', lineHeight: '18px', color: '#4E5968' }}>
          Re-review preserves this submitted version and creates a new draft with no owner until assigned. Reassign preserves this submitted version and atomically creates the new draft ownership through the backend.
        </p>
        {message && <p role="status">{message}</p>}
      </div>
    </AdminLayout>
  )
}
