import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { portalRoutePaths } from '../../../app/routes/routePaths'
import {
  acceptStaffInvitation,
  setAcceptedStaffPassword,
  type StaffInvitationRole,
} from '../../../foundation/integration/auth/staffInvitationService'
import { portalSupabaseRuntimeMode } from '../../../foundation/integration/supabaseConfig'
import { AuthButton } from '../components/AuthButton'
import { AuthInfoCard } from '../components/AuthInfoCard'
import { AuthInput } from '../components/AuthInput'
import { AuthLayout } from '../components/AuthLayout'

type AcceptanceState = 'accepting' | 'password' | 'error'

export function PortalStaffInvitationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const runtimeMode = portalSupabaseRuntimeMode()
  const [state, setState] = useState<AcceptanceState>('accepting')
  const [acceptedRole, setAcceptedRole] = useState<StaffInvitationRole | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    if (runtimeMode === 'prototype') {
      setState('password')
      setAcceptedRole('volunteer')
      return
    }
    if (runtimeMode !== 'configured') {
      setErrorMessage('Portal integration is unavailable for this build.')
      setState('error')
      return
    }

    const token = searchParams.get('token') ?? ''
    let active = true

    void acceptStaffInvitation(token)
      .then((role) => {
        if (!active) return
        setAcceptedRole(role)
        setState('password')
      })
      .catch((error: unknown) => {
        if (!active) return
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'This staff invitation could not be accepted.',
        )
        setState('error')
      })

    return () => {
      active = false
    }
  }, [runtimeMode, searchParams])

  async function handleSetPassword(event: FormEvent) {
    event.preventDefault()

    const nextPassword = password.trim()
    const confirmation = confirmPassword.trim()
    let invalid = false

    if (nextPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      invalid = true
    } else {
      setPasswordError('')
    }

    if (!confirmation) {
      setConfirmPasswordError('Please confirm your password.')
      invalid = true
    } else if (confirmation !== nextPassword) {
      setConfirmPasswordError('Passwords do not match.')
      invalid = true
    } else {
      setConfirmPasswordError('')
    }

    if (invalid || savingPassword) return

    if (runtimeMode === 'prototype') {
      navigate(portalRoutePaths.authentication.roleAuthorization, { replace: true })
      return
    }

    setSavingPassword(true)
    try {
      await setAcceptedStaffPassword(nextPassword)
      navigate(portalRoutePaths.authentication.roleAuthorization, { replace: true })
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : 'Unable to set the portal password.',
      )
    } finally {
      setSavingPassword(false)
    }
  }

  if (state === 'accepting') {
    return (
      <AuthLayout ariaLabel="Staff Invitation Acceptance">
        <div className="auratio-auth-header">
          <h1 className="auratio-auth-title">Activating staff access</h1>
          <p className="auratio-auth-subtitle">
            Auratio is verifying this secure invitation against your signed-in email.
          </p>
        </div>
        <AuthInfoCard
          title="Secure invite check"
          body="Your account role is provisioned by the backend. You cannot choose or elevate it here."
          style={{ marginTop: '24px', height: '108px' }}
        />
      </AuthLayout>
    )
  }

  if (state === 'error') {
    return (
      <AuthLayout ariaLabel="Staff Invitation Unavailable">
        <div className="auratio-auth-header">
          <h1 className="auratio-auth-title">Invitation unavailable</h1>
          <p className="auratio-auth-subtitle">{errorMessage}</p>
        </div>
        <AuthButton
          onClick={() =>
            navigate(portalRoutePaths.authentication.signIn, { replace: true })
          }
          style={{ marginTop: '28px' }}
        >
          Back to Sign In
        </AuthButton>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout ariaLabel="Staff Invitation Password Setup">
      <div className="auratio-auth-header">
        <h1 className="auratio-auth-title">Staff invitation accepted</h1>
        <p className="auratio-auth-subtitle">
          {`Your ${acceptedRole === 'admin' ? 'Admin' : 'Volunteer Evaluator'} role is provisioned. Set a portal password to finish activation.`}
        </p>
      </div>

      <form onSubmit={(event) => void handleSetPassword(event)} noValidate>
        <AuthInput
          id="portal-staff-password"
          label="PORTAL PASSWORD"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            if (passwordError) setPasswordError('')
          }}
          error={passwordError}
          placeholder="Create a portal password"
          style={{ marginTop: '52px' }}
        />
        <AuthInput
          id="portal-staff-password-confirm"
          label="CONFIRM PASSWORD"
          type="password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value)
            if (confirmPasswordError) setConfirmPasswordError('')
          }}
          error={confirmPasswordError}
          placeholder="Repeat portal password"
          style={{ marginTop: '22px' }}
        />
        <AuthButton type="submit" disabled={savingPassword} style={{ marginTop: '30px' }}>
          {savingPassword ? 'Finishing activation…' : 'Finish Activation'}
        </AuthButton>
      </form>

      <AuthInfoCard
        title="Role is locked"
        body="This password step changes credentials only. The accepted backend invitation already determined the staff role."
        style={{ marginTop: '18px', height: '108px' }}
      />
    </AuthLayout>
  )
}
