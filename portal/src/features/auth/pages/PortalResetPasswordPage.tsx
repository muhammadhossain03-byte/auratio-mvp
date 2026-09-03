import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AuthButton } from '../components/AuthButton'
import { AuthInfoCard } from '../components/AuthInfoCard'
import { AuthInput } from '../components/AuthInput'
import { AuthLayout } from '../components/AuthLayout'

export function PortalResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  function handleUpdatePassword(e?: FormEvent) {
    if (e) e.preventDefault()
    let hasError = false

    const trimmedPassword = password.trim()
    if (!trimmedPassword) {
      setPasswordError('New password is required.')
      hasError = true
    } else if (trimmedPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      hasError = true
    } else {
      setPasswordError('')
    }

    const trimmedConfirm = confirmPassword.trim()
    if (!trimmedConfirm) {
      setConfirmPasswordError('Please confirm your new password.')
      hasError = true
    } else if (trimmedConfirm !== trimmedPassword) {
      setConfirmPasswordError('Passwords do not match.')
      hasError = true
    } else {
      setConfirmPasswordError('')
    }

    if (hasError) return
    navigate(portalRoutePaths.authentication.passwordResetComplete)
  }

  function handleBackToSignIn() {
    navigate(portalRoutePaths.authentication.signIn)
  }

  return (
    <AuthLayout ariaLabel="Portal Reset Password">
      <div className="auratio-auth-header">
        <h1 className="auratio-auth-title">Reset password</h1>
        <p className="auratio-auth-subtitle">
          Choose a new password for your existing provisioned portal account.
        </p>
      </div>

      <form onSubmit={handleUpdatePassword} noValidate>
        <AuthInput
          id="portal-reset-password-new"
          label="NEW PASSWORD"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (passwordError) setPasswordError('')
          }}
          error={passwordError}
          placeholder="Create a new password"
          style={{ marginTop: '72px' }}
        />

        <AuthInput
          id="portal-reset-password-confirm"
          label="CONFIRM NEW PASSWORD"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (confirmPasswordError) setConfirmPasswordError('')
          }}
          error={confirmPasswordError}
          placeholder="Repeat password"
          style={{ marginTop: '24px' }}
        />

        <AuthButton
          type="submit"
          style={{ marginTop: '36px' }}
        >
          Update Password
        </AuthButton>
      </form>

      <div style={{ marginTop: '6px' }}>
        <button
          type="button"
          onClick={handleBackToSignIn}
          className="auratio-auth-link"
          style={{ fontSize: '12px' }}
        >
          Back to Sign In
        </button>
      </div>

      <AuthInfoCard
        title="Role remains unchanged"
        body="Password reset changes authentication credentials only; it never provisions or elevates portal access."
        style={{ marginTop: '6px', height: '108px' }}
      />
    </AuthLayout>
  )
}
