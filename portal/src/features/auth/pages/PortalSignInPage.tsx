import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AuthButton } from '../components/AuthButton'
import { AuthInfoCard } from '../components/AuthInfoCard'
import { AuthInput } from '../components/AuthInput'
import { AuthLayout } from '../components/AuthLayout'

export function PortalSignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('name@example.com')
  const [password, setPassword] = useState('••••••••')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  function handleSignIn(e?: FormEvent) {
    if (e) e.preventDefault()
    let hasError = false

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

    const trimmedPassword = password.trim()
    if (!trimmedPassword) {
      setPasswordError('Password is required.')
      hasError = true
    } else {
      setPasswordError('')
    }

    if (hasError) return
    navigate(portalRoutePaths.authentication.roleAuthorization)
  }

  function handlePreviewEmailVerification() {
    navigate(portalRoutePaths.authentication.emailVerification)
  }

  return (
    <AuthLayout ariaLabel="Portal Sign In">
      <div className="auratio-auth-header">
        <h1 className="auratio-auth-title">Auratio Portal</h1>
        <p className="auratio-auth-subtitle">
          Shared sign-in for Volunteer Evaluators, Admins, and the Super Admin.
        </p>
      </div>

      <form onSubmit={handleSignIn} noValidate>
        <AuthInput
          id="portal-sign-in-email"
          label="EMAIL"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (emailError) setEmailError('')
          }}
          error={emailError}
          placeholder="name@example.com"
          style={{ marginTop: '96px' }}
        />

        <AuthInput
          id="portal-sign-in-password"
          label="PASSWORD"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (passwordError) setPasswordError('')
          }}
          error={passwordError}
          placeholder="••••••••"
          style={{ marginTop: '30px' }}
        />

        <div style={{ marginTop: '14px', textAlign: 'right' }}>
          <button
            type="button"
            onClick={() => navigate(portalRoutePaths.authentication.forgotPassword)}
            className="auratio-auth-link"
            style={{ fontSize: '12px' }}
          >
            Forgot password?
          </button>
        </div>

        <AuthButton
          type="submit"
          style={{ marginTop: '16px' }}
        >
          Sign In
        </AuthButton>
      </form>

      <AuthInfoCard
        title="Role-controlled access"
        body="No public registration. Your portal role is provisioned and enforced by backend RBAC."
        style={{ marginTop: '24px', height: '82px' }}
      />

      <div style={{ marginTop: '6px', marginLeft: '16px' }}>
        <button
          type="button"
          onClick={handlePreviewEmailVerification}
          className="auratio-auth-link"
          style={{ fontSize: '12px' }}
        >
          Prototype: preview email-verification requirement
        </button>
      </div>
    </AuthLayout>
  )
}
