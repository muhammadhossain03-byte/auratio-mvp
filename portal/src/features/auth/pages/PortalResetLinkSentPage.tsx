import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AuthButton } from '../components/AuthButton'
import { AuthInfoCard } from '../components/AuthInfoCard'
import { AuthLayout } from '../components/AuthLayout'

export function PortalResetLinkSentPage() {
  const navigate = useNavigate()

  function handleOpenResetLink() {
    navigate(portalRoutePaths.authentication.resetPassword)
  }

  function handleBackToSignIn() {
    navigate(portalRoutePaths.authentication.signIn)
  }

  return (
    <AuthLayout ariaLabel="Portal Reset Link Sent">
      <div className="auratio-auth-header">
        <h1 className="auratio-auth-title">Reset link sent</h1>
        <p className="auratio-auth-subtitle">
          If the address belongs to a provisioned portal account, a password-reset email can be used to continue.
        </p>
      </div>

      <AuthInfoCard
        title="Check your email"
        body="For this prototype, use the button below to simulate opening the secure reset link from the email."
        style={{ marginTop: '70px', height: '124px' }}
      />

      <AuthButton
        onClick={handleOpenResetLink}
        style={{ marginTop: '36px' }}
      >
        Open Reset Link — Prototype
      </AuthButton>

      <AuthButton
        variant="secondary"
        onClick={handleBackToSignIn}
        style={{ marginTop: '18px' }}
      >
        Back to Sign In
      </AuthButton>
    </AuthLayout>
  )
}
