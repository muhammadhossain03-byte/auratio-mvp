import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { getInviteVolunteerTrackDraft, addAdminVolunteer } from '../data/mockAdminData'

export function AdminInviteVolunteerPage() {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [trackError, setTrackError] = useState('')
  const inviteTracks = getInviteVolunteerTrackDraft()

  function handleSendInvite() {
    let hasError = false
    const trimmedName = displayName.trim()
    if (!trimmedName) {
      setNameError('Display name is required.')
      hasError = true
    } else {
      setNameError('')
    }

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setEmailError('Email is required.')
      hasError = true
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address.')
      hasError = true
    } else {
      setEmailError('')
    }

    if (inviteTracks.length < 1) {
      setTrackError('Send Invite is unavailable if zero tracks are selected.')
      hasError = true
    } else {
      setTrackError('')
    }

    if (hasError) return

    addAdminVolunteer({
      name: trimmedName,
      email: trimmedEmail,
      trackCount: inviteTracks.length,
    })

    navigate(portalRoutePaths.admin.volunteers)
  }

  function handleCancel() {
    navigate(portalRoutePaths.admin.volunteers)
  }

  const publicSpeakingSelected = inviteTracks.filter((t) =>
    [
      'Informative',
      'Extempore',
      'Persuasive',
      'Argumentative / Debate',
      'Explanatory',
    ].includes(t),
  )

  const professionalPresentingSelected = inviteTracks.filter((t) =>
    [
      'News Delivery',
      'Business Pitch / Sales Pitch',
      'General Presentation / Multimedia',
      'Academic — Poster / Project / Thesis',
      'Corporate Report',
    ].includes(t),
  )

  const contentCreationSelected = inviteTracks.filter((t) =>
    [
      'Infotainment-Oriented',
      'Academic — Lecture / Course',
      'Marketing / Promotional',
    ].includes(t),
  )

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
            onChange={(e) => {
              setDisplayName(e.target.value)
              if (nameError) setNameError('')
            }}
            placeholder="Volunteer full name"
            className="auratio-admin-input"
            style={{ width: '614px', height: '48px' }}
          />
          {nameError && (
            <div style={{ color: '#B42318', fontSize: '11px', marginTop: '4px' }}>
              {nameError}
            </div>
          )}
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
            onChange={(e) => {
              setEmail(e.target.value)
              if (emailError) setEmailError('')
            }}
            placeholder="volunteer@example.com"
            className="auratio-admin-input"
            style={{ width: '614px', height: '48px' }}
          />
          {emailError && (
            <div style={{ color: '#B42318', fontSize: '11px', marginTop: '4px' }}>
              {emailError}
            </div>
          )}
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
          {`${inviteTracks.length} selected • minimum 1`}
        </div>

        {publicSpeakingSelected.length > 0 && (
          <div style={{ marginTop: '26px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
              Public Speaking
            </div>
            <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827', marginTop: '8px', lineHeight: '20px' }}>
              {publicSpeakingSelected.map((t) => (
                <div key={t}>{t}</div>
              ))}
            </div>
          </div>
        )}

        {professionalPresentingSelected.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
              Professional Presenting
            </div>
            <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827', marginTop: '8px', lineHeight: '20px' }}>
              {professionalPresentingSelected.map((t) => (
                <div key={t}>{t}</div>
              ))}
            </div>
          </div>
        )}

        {contentCreationSelected.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
              Content Creation
            </div>
            <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827', marginTop: '8px', lineHeight: '20px' }}>
              {contentCreationSelected.map((t) => (
                <div key={t}>{t}</div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            navigate(portalRoutePaths.admin.volunteerTrackEligibility, {
              state: { mode: 'invite' },
            })
          }
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
            {trackError ? (
              <span style={{ color: '#B42318', fontWeight: 600 }}>{trackError}</span>
            ) : (
              'Send Invite is unavailable if zero tracks are selected.'
            )}
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
          onClick={handleSendInvite}
          className="auratio-admin-btn auratio-admin-btn--primary"
          style={{ width: '220px', height: '44px', fontSize: '14px', fontWeight: 600 }}
        >
          Send Volunteer Invite
        </button>
        <button
          type="button"
          onClick={handleCancel}
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
