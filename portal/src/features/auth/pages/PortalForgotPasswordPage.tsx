import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AuthButton } from '../components/AuthButton'
import { AuthInfoCard } from '../components/AuthInfoCard'
import { AuthInput } from '../components/AuthInput'
import { AuthLayout } from '../components/AuthLayout'

export function PortalForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('name@example.com')
  const [emailError, setEmailError] = useState('')

  function handleSendResetLink(e?: FormEvent) {
    if (e) e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setEmailError('Email is required.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address.')
      return
    }
    setEmailError('')
    navigate(portalRoutePaths.authentication.resetLinkSent)
  }

  function handleBackToSignIn() {
    navigate(portalRoutePaths.authentication.signIn)
  }

  return (
    <AuthLayout ariaLabel="Portal Forgot Password">
      <div className="auratio-auth-header">
        <h1 className="auratio-auth-title">Forgot password?</h1>
        <p className="auratio-auth-subtitle">
          Request a reset link for an existing provisioned portal account.
        </p>
      </div>

      <form onSubmit={handleSendResetLink} noValidate>
        <AuthInput
          id="portal-forgot-password-email"
          label="EMAIL"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (emailError) setEmailError('')
          }}
          error={emailError}
          placeholder="name@example.com"
          style={{ marginTop: '84px' }}
        />

        <AuthButton
          type="submit"
          style={{ marginTop: '42px' }}
        >
          Send Reset Link
        </AuthButton>
      </form>

      <div style={{ marginTop: '24px' }}>
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
        title="Credential recovery only"
        body="This flow does not create a portal account or change the account’s provisioned role."
        style={{ marginTop: '28px', height: '112px' }}
      />
    </AuthLayout>
  )
}
