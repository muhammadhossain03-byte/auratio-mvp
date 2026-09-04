import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { getModerationEntityState, requestReReviewModerationEntity } from '../data/mockAdminData'

export function AdminRequestReReviewPage() {
  const navigate = useNavigate()
  const { submissionId: paramId } = useParams<{ submissionId?: string }>()
  const resolvedId = (paramId || 'sub-8821').toUpperCase()
  const modItem = getModerationEntityState(resolvedId)
  const [adminNote, setAdminNote] = useState('')

  if (!modItem) {
    return <Navigate to={portalRoutePaths.admin.moderation} replace />
  }

  const handleConfirm = () => {
    requestReReviewModerationEntity(resolvedId)
    navigate(portalRoutePaths.volunteer.reopenedEvaluation)
  }

  const cancelPath =
    resolvedId === 'SUB-8821'
      ? portalRoutePaths.admin.moderationReview
      : `/admin/moderation/${resolvedId.toLowerCase()}`

  return (
    <AdminLayout
      ariaLabel="Request Re-review"
      topbarTitle="Moderation Review"
      activeNav="moderation"
      topbarRightVariant="pill"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}
      >
        Request Re-review
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}
      >
        {resolvedId} • submitted evaluator work • publication unresolved
      </p>

      {/* Top right pill */}
      <div
        className="auratio-admin-status-pill auratio-admin-status-pill--pending-moderation"
        style={{
          position: 'absolute',
          left: '905px',
          top: '36px',
          width: '180px',
          height: '34px',
          borderRadius: '17px',
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        Pending Moderation
      </div>

      {/* Card 1: Submitted evaluator record */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '122px',
          width: '1076px',
          height: '180px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Submitted evaluator record
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '28px' }}>
          <div style={{ width: '190px', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Evaluator
          </div>
          <div style={{ width: '280px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            {modItem.evaluator}
          </div>
          <div style={{ width: '180px', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Submitted score
          </div>
          <div style={{ width: '200px', fontSize: '14px', fontWeight: 600, color: '#111827', letterSpacing: '0.0143em' }}>
            {modItem.scoreDisplay}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '28px' }}>
          <div style={{ width: '190px', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Assignment Status
          </div>
          <div style={{ width: '280px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            Submitted
          </div>
          <div style={{ width: '180px', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Editability
          </div>
          <div style={{ width: '260px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            Locked / read-only
          </div>
        </div>
      </div>

      {/* Card 2: Confirm formal reopen */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '330px',
          width: '1076px',
          height: '278px',
          backgroundColor: '#FFF7E8',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#925F12' }}>
          Confirm formal reopen
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, lineHeight: '20px', color: '#925F12', marginTop: '14px' }}>
          After confirmation:
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#925F12',
            marginTop: '10px',
            width: '950px',
            whiteSpace: 'pre-line',
          }}
        >
          {`• prior submitted version remains preserved;\n• ${modItem.evaluator} becomes the relevant active evaluator again;\n• assignment/work state becomes Re-review / Reopened;\n• reopened work returns to Active Assignments;\n• this action does not approve, reject, or rewrite the submitted score.`}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '14px' }}>
          <div style={{ width: '220px', fontSize: '12px', fontWeight: 600, color: '#925F12', letterSpacing: '0.0167em' }}>
            Admin note / reason
          </div>
          <input
            type="text"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Clarify criterion evidence and resubmit."
            className="auratio-admin-input"
            style={{
              width: '660px',
              height: '42px',
              fontSize: '12px',
              padding: '10px 16px',
            }}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div
        style={{
          position: 'absolute',
          left: '30px',
          top: '612px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={handleConfirm}
          className="auratio-admin-btn auratio-admin-btn--primary"
          style={{ width: '190px', height: '44px', fontSize: '14px', fontWeight: 600 }}
        >
          Request Re-review
        </button>
        <button
          type="button"
          onClick={() => navigate(cancelPath)}
          className="auratio-admin-btn auratio-admin-btn--secondary"
          style={{ width: '130px', height: '44px', fontSize: '14px', fontWeight: 600, marginLeft: '18px' }}
        >
          Cancel
        </button>
      </div>

      {/* Footer note */}
      <div
        style={{
          position: 'absolute',
          left: '30px',
          top: '672px',
          fontSize: '12px',
          lineHeight: '18px',
          fontWeight: 400,
          color: '#6B788A',
        }}
      >
        No alternate-evaluator picker is introduced: reopened work returns to the relevant evaluator.
      </div>
    </AdminLayout>
  )
}
