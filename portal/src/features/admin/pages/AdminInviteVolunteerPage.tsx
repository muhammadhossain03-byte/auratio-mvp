import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'

export function AdminInviteVolunteerPage() {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')

  return (
    <AdminLayout
      ariaLabel="Invite Volunteer"
      topbarTitle="Invite Volunteer"
      activeNav="volunteers"
      topbarRightVariant="pill"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}
      >
        Create / invite Volunteer Evaluator
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}
      >
        Provision account identity and at least one authorized track before sending the invite.
      </p>

      {/* Left Card: Volunteer account */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '124px',
          width: '650px',
          height: '520px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Volunteer account
        </div>

        <div style={{ marginTop: '20px' }}>
          <label
            htmlFor="invite-display-name"
            style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em', marginBottom: '8px' }}
          >
            Display name
          </label>
          <input
            id="invite-display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Volunteer full name"
            className="auratio-admin-input"
            style={{ width: '614px', height: '48px' }}
          />
        </div>

        <div style={{ marginTop: '18px' }}>
          <label
            htmlFor="invite-email"
            style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em', marginBottom: '8px' }}
          >
            Email
          </label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="volunteer@example.com"
            className="auratio-admin-input"
            style={{ width: '614px', height: '48px' }}
          />
        </div>

        <div style={{ marginTop: '18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em', marginBottom: '8px' }}>
            Assigned role
          </div>
          <div
            style={{
              width: '614px',
              height: '48px',
              backgroundColor: '#EEF2F7',
              border: '1px solid #C8D2E0',
              borderRadius: '10px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
              fontSize: '14px',
              color: '#6B788A',
            }}
          >
            Volunteer Evaluator
          </div>
        </div>

        <div
          style={{
            marginTop: '38px',
            width: '614px',
            height: '112px',
            backgroundColor: '#F3F8FE',
            border: '1px solid #DCE3ED',
            borderRadius: '16px',
            boxSizing: 'border-box',
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
            Role is provisioned
          </div>
          <div
            style={{
              fontSize: '12px',
              lineHeight: '18px',
              fontWeight: 400,
              color: '#4E5968',
              marginTop: '12px',
            }}
          >
            The invited person cannot select Admin/Super Admin or change their own portal role.
          </div>
        </div>
      </div>

      {/* Right Card: Track eligibility • required */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '710px',
          top: '124px',
          width: '396px',
          height: '520px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Track eligibility • required
        </div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em', marginTop: '10px' }}>
          3 selected • minimum 1
        </div>

        <div style={{ marginTop: '26px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Public Speaking
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827', marginTop: '8px', lineHeight: '20px' }}>
            Informative<br />Persuasive
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Professional Presenting
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827', marginTop: '8px', lineHeight: '20px' }}>
            Business Pitch / Sales Pitch
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.admin.volunteerTrackEligibility)}
          className="auratio-admin-btn auratio-admin-btn--primary"
          style={{ width: '220px', height: '44px', fontSize: '14px', fontWeight: 600, marginTop: '30px' }}
        >
          Choose / Edit Tracks
        </button>

        <div
          style={{
            marginTop: '20px',
            width: '360px',
            height: '116px',
            backgroundColor: '#FFF7E8',
            border: '1px solid #DCE3ED',
            borderRadius: '16px',
            boxSizing: 'border-box',
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#925F12' }}>
            Provisioning guard
          </div>
          <div
            style={{
              fontSize: '12px',
              lineHeight: '18px',
              fontWeight: 400,
              color: '#925F12',
              marginTop: '12px',
            }}
          >
            Send Invite is unavailable if zero tracks are selected.
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div
        style={{
          position: 'absolute',
          left: '30px',
          top: '676px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.admin.volunteers)}
          className="auratio-admin-btn auratio-admin-btn--primary"
          style={{ width: '220px', height: '44px', fontSize: '14px', fontWeight: 600 }}
        >
          Send Volunteer Invite
        </button>
        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.admin.volunteers)}
          className="auratio-admin-btn auratio-admin-btn--secondary"
          style={{ width: '120px', height: '44px', fontSize: '14px', fontWeight: 600, marginLeft: '16px' }}
        >
          Cancel
        </button>

        <div
          style={{
            marginLeft: '24px',
            width: '650px',
            fontSize: '12px',
            lineHeight: '18px',
            fontWeight: 400,
            color: '#6B788A',
          }}
        >
          After invitation, the volunteer activates the account through the secure invite flow. Track eligibility changes are auditable.
        </div>
      </div>
    </AdminLayout>
  )
}
