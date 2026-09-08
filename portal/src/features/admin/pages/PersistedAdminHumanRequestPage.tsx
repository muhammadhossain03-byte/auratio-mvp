import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AdminLayout } from '../components/AdminLayout'
import {
  assignPersistedAdminHumanRequest,
  cancelPersistedAdminHumanRequest,
  loadPersistedAdminHumanRequest,
  reassignPersistedAdminHumanRequest,
  type PersistedAdminHumanRequestContext,
} from '../integration/persistedAdminHumanLifecycle'

function titleCase(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function PersistedAdminHumanRequestPage() {
  const navigate = useNavigate()
  const { requestId } = useParams<{ requestId?: string }>()
  const persistedRequestId = requestId ? decodeURIComponent(requestId) : ''
  const [context, setContext] = useState<PersistedAdminHumanRequestContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [selectedVolunteer, setSelectedVolunteer] = useState('')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!persistedRequestId) {
      setLoading(false)
      return
    }

    let active = true
    void loadPersistedAdminHumanRequest(persistedRequestId)
      .then((loaded) => {
        if (!active) return
        setContext(loaded)
        setSelectedVolunteer(loaded?.activeVolunteerUserId ?? '')
      })
      .catch((cause: unknown) => {
        if (!active) return
        setMessage(cause instanceof Error ? cause.message : 'Unable to load request.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [persistedRequestId])

  const canAssign = useMemo(
    () => context?.status === 'unassigned' || context?.status === 'reopened',
    [context?.status],
  )
  const canReassign = useMemo(
    () =>
      context?.status === 'assigned' ||
      context?.status === 'accepted' ||
      context?.status === 'in_evaluation',
    [context?.status],
  )
  const canCancel = useMemo(
    () =>
      context?.status === 'unassigned' ||
      context?.status === 'assigned' ||
      context?.status === 'accepted' ||
      context?.status === 'in_evaluation',
    [context?.status],
  )

  if (!persistedRequestId) {
    return <Navigate to={portalRoutePaths.admin.requests} replace />
  }

  if (loading) {
    return (
      <AdminLayout
        ariaLabel="Persisted Human Request"
        topbarTitle="Human Evaluation Request"
        activeNav="requests"
        topbarRightVariant="pill"
      >
        <h2 className="auratio-admin-page-title" style={{ top: '32px' }}>Loading request…</h2>
      </AdminLayout>
    )
  }

  if (!context) {
    return <Navigate to={portalRoutePaths.admin.requests} replace />
  }

  const activeContext = context

  async function assign() {
    if (!selectedVolunteer || !canAssign) return
    setBusy(true)
    setMessage(null)
    try {
      setContext(
        await assignPersistedAdminHumanRequest(activeContext.requestId, selectedVolunteer),
      )
      setReason('')
      setMessage('Volunteer assignment persisted.')
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Assignment failed.')
    } finally {
      setBusy(false)
    }
  }

  async function reassign() {
    if (!selectedVolunteer || !reason.trim() || !canReassign) return
    setBusy(true)
    setMessage(null)
    try {
      setContext(
        await reassignPersistedAdminHumanRequest(
          activeContext.requestId,
          selectedVolunteer,
          reason,
        ),
      )
      setReason('')
      setMessage('Volunteer reassignment persisted atomically.')
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Reassignment failed.')
    } finally {
      setBusy(false)
    }
  }

  async function cancelRequest() {
    if (!reason.trim() || !canCancel) return
    setBusy(true)
    setMessage(null)
    try {
      await cancelPersistedAdminHumanRequest(activeContext.requestId, reason)
      navigate(portalRoutePaths.admin.requests, { replace: true })
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Cancellation failed.')
      setBusy(false)
    }
  }

  return (
    <AdminLayout
      ariaLabel="Persisted Human Request"
      topbarTitle="Human Evaluation Request"
      activeNav="requests"
      topbarRightVariant="pill"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '32px', fontSize: '26px', lineHeight: '34px', fontWeight: 700 }}
      >
        {context.requestRef}
      </h2>
      <p className="auratio-admin-page-subtitle" style={{ top: '72px' }}>
        {context.submissionRef} • authoritative persisted Human lifecycle
      </p>

      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '116px',
          width: '520px',
          height: '410px',
          padding: '22px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Request state</h3>
        <p><strong>User:</strong> {context.userName}</p>
        <p><strong>Track:</strong> {context.trackName}</p>
        <p><strong>Originally requested:</strong> {context.requestedMode === 'ai' ? 'AI' : 'Human'}</p>
        <p><strong>Effective route:</strong> Human</p>
        <p><strong>Request status:</strong> {titleCase(context.status)}</p>
        <p><strong>Evaluator version:</strong> v{context.versionNumber} · Draft</p>
        <p><strong>Active owner:</strong> {context.activeVolunteerName ?? 'None'}</p>

        {context.requestedMode === 'ai' && (
          <div
            style={{
              marginTop: '18px',
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: '#F3F8FE',
              fontSize: '12px',
              lineHeight: '18px',
            }}
          >
            Requested AI → effective Human is already a persisted consent-aware redirect. This Admin surface does not expose any mode-switch action.
          </div>
        )}
      </div>

      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '578px',
          top: '116px',
          width: '528px',
          height: '410px',
          padding: '22px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Volunteer ownership</h3>
        <label htmlFor="persisted-admin-volunteer" style={{ display: 'block', fontWeight: 600 }}>
          Active Volunteer
        </label>
        <select
          id="persisted-admin-volunteer"
          value={selectedVolunteer}
          disabled={busy}
          onChange={(event) => setSelectedVolunteer(event.target.value)}
          style={{ width: '100%', height: '42px', marginTop: '8px' }}
        >
          <option value="">Select Volunteer…</option>
          {context.volunteers.map((volunteer) => (
            <option key={volunteer.userId} value={volunteer.userId}>
              {volunteer.displayName}
            </option>
          ))}
        </select>

        <label htmlFor="persisted-admin-reason" style={{ display: 'block', marginTop: '18px', fontWeight: 600 }}>
          Reason
        </label>
        <textarea
          id="persisted-admin-reason"
          value={reason}
          disabled={busy}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Required for reassignment or cancellation"
          style={{ width: '100%', height: '80px', marginTop: '8px', boxSizing: 'border-box' }}
        />

        <div style={{ marginTop: '18px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {canAssign && (
            <button
              type="button"
              disabled={busy || !selectedVolunteer}
              onClick={() => void assign()}
              className="auratio-admin-btn auratio-admin-btn--primary"
              style={{ width: '150px', height: '42px' }}
            >
              Assign
            </button>
          )}

          {canReassign && (
            <button
              type="button"
              disabled={
                busy ||
                !selectedVolunteer ||
                !reason.trim() ||
                selectedVolunteer === context.activeVolunteerUserId
              }
              onClick={() => void reassign()}
              className="auratio-admin-btn auratio-admin-btn--primary"
              style={{ width: '150px', height: '42px' }}
            >
              Reassign
            </button>
          )}

          {canCancel && (
            <button
              type="button"
              disabled={busy || !reason.trim()}
              onClick={() => void cancelRequest()}
              className="auratio-admin-btn auratio-admin-btn--secondary"
              style={{ width: '150px', height: '42px' }}
            >
              Cancel Request
            </button>
          )}
        </div>

        {message && <p role="status" style={{ marginTop: '16px', fontSize: '12px' }}>{message}</p>}
      </div>

      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '554px',
          width: '1076px',
          height: '106px',
          padding: '18px 20px',
          backgroundColor: '#F8FAFC',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          fontSize: '12px',
          lineHeight: '20px',
        }}
      >
        Reassignment is server-authoritative: the prior active ownership is revoked and the new ownership is created by the Human Admin Edge Function. Submitted evaluator versions are not editable here; post-submission re-review is handled in the moderation sub-batch.
      </div>
    </AdminLayout>
  )
}
