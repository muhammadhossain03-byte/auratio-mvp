import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SuperAdminLayout } from '../components/SuperAdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { createStaffInvitation } from '../../../foundation/integration/auth/staffInvitationService'
import { portalSupabaseRuntimeMode } from '../../../foundation/integration/supabaseConfig'
import { inviteAdminAccount } from '../data/mockSuperAdminData'

export function SuperAdminInviteAdminPage() {
  const navigate = useNavigate()
  const runtimeMode = portalSupabaseRuntimeMode()
  const [fullName, setFullName] = useState('Admin full name')
  const [email, setEmail] = useState('admin@example.com')
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)

  async function handleSendInvite() {
    let hasError = false
    const trimmedName = fullName.trim()
    if (!trimmedName) {
      setNameError('Full name is required.')
      hasError = true
    } else if (trimmedName.length < 2 || trimmedName.length > 80) {
      setNameError('Full name must be between 2 and 80 characters.')
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

    if (hasError || sendingInvite) return

    setSubmitError('')
    setSendingInvite(true)
    try {
      if (runtimeMode === 'configured') {
        await createStaffInvitation({
          email: trimmedEmail,
          displayName: trimmedName,
          targetRole: 'admin',
          trackIds: [],
        })
      } else if (runtimeMode === 'prototype') {
        inviteAdminAccount({
          fullName: trimmedName,
          email: trimmedEmail,
        })
      } else {
        setSubmitError('Portal integration is unavailable for this build.')
        return
      }

      navigate(portalRoutePaths.superAdmin.adminAccounts)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to send the Admin invitation.')
    } finally {
      setSendingInvite(false)
    }
  }

  function handleCancel() {
    navigate(portalRoutePaths.superAdmin.adminAccounts)
  }

  return (
    <SuperAdminLayout
      ariaLabel="Invite Admin"
      topbarTitle="Invite Admin"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}
      >
        Create / invite Admin account
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}
      >
        Provision an ordinary Admin account; activation completes through the secure invite and verification flow.
      </p>

      {/* Main Admin Account Form Card */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '124px',
          width: '720px',
          height: '540px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Admin account
        </div>

        {/* Full Name */}
        <div
          style={{
            marginTop: '20px',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: '#6B788A',
          }}
        >
          Full name
        </div>
        <input
          type="text"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value)
            if (nameError) setNameError('')
          }}
          aria-label="Full name"
          style={{
            marginTop: '8px',
            width: '684px',
            height: '48px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #C8D2E0',
            borderRadius: '10px',
            boxSizing: 'border-box',
            padding: '0 14px',
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#111827',
            outline: 'none',
          }}
        />
        {nameError && (
          <div style={{ color: '#B42318', fontSize: '11px', marginTop: '4px' }}>
            {nameError}
          </div>
        )}

        {/* Email */}
        <div
          style={{
            marginTop: '18px',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: '#6B788A',
          }}
        >
          Email
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (emailError) setEmailError('')
          }}
          aria-label="Email"
          style={{
            marginTop: '8px',
            width: '684px',
            height: '48px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #C8D2E0',
            borderRadius: '10px',
            boxSizing: 'border-box',
            padding: '0 14px',
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#111827',
            outline: 'none',
          }}
        />
        {emailError && (
          <div style={{ color: '#B42318', fontSize: '11px', marginTop: '4px' }}>
            {emailError}
          </div>
        )}

        {/* Assigned Role */}
        <div
          style={{
            marginTop: '18px',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: '#6B788A',
          }}
        >
          Assigned role
        </div>
        <div
          style={{
            marginTop: '8px',
            width: '684px',
            height: '48px',
            backgroundColor: '#EEF2F7',
            border: '1px solid #C8D2E0',
            borderRadius: '10px',
            boxSizing: 'border-box',
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#6B788A',
          }}
        >
          Admin
        </div>

        {/* Role is provisioned Callout */}
        <div
          style={{
            marginTop: '28px',
            width: '684px',
            height: '104px',
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
              marginTop: '8px',
              fontSize: '12px',
              fontWeight: 400,
              lineHeight: '18px',
              color: '#4E5968',
            }}
          >
            The invited person cannot select Super Admin or change their own role during activation.
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '22px', gap: '18px' }}>
          <button
            type="button"
            onClick={() => void handleSendInvite()}
            disabled={sendingInvite}
            className="auratio-admin-btn auratio-admin-btn--primary"
            style={{
              width: '210px',
              height: '44px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {sendingInvite ? 'Sending Invite…' : 'Send Admin Invite'}
          </button>
          {submitError && (
            <div role="alert" style={{ color: '#B42318', fontSize: '12px', maxWidth: '250px' }}>
              {submitError}
            </div>
          )}
          <button
            type="button"
            onClick={handleCancel}
            className="auratio-admin-btn auratio-admin-btn--secondary"
            style={{
              width: '120px',
              height: '44px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Side Card 1: What happens next */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '780px',
          top: '124px',
          width: '326px',
          height: '300px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          What happens next
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 400, lineHeight: '18px', color: '#4E5968' }}>
            1. Account is provisioned as Admin
          </div>
          <div style={{ fontSize: '12px', fontWeight: 400, lineHeight: '18px', color: '#4E5968' }}>
            2. Invite / activation is sent
          </div>
          <div style={{ fontSize: '12px', fontWeight: 400, lineHeight: '18px', color: '#4E5968' }}>
            3. Email verification completes
          </div>
          <div style={{ fontSize: '12px', fontWeight: 400, lineHeight: '18px', color: '#4E5968' }}>
            4. Backend role check resolves Admin
          </div>
          <div style={{ fontSize: '12px', fontWeight: 400, lineHeight: '18px', color: '#4E5968' }}>
            5. Admin shell becomes available
          </div>
        </div>
      </div>

      {/* Side Card 2: Boundary */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '780px',
          top: '448px',
          width: '326px',
          height: '154px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Boundary
        </div>
        <div
          style={{
            marginTop: '12px',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: '#4E5968',
            width: '286px',
          }}
        >
          No Super Admin option appears here. Root Super Admin provisioning remains manual/system-side.
        </div>
      </div>
    </SuperAdminLayout>
  )
}
