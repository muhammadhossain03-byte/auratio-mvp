import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AuthButton } from '../components/AuthButton'
import { AuthInfoCard } from '../components/AuthInfoCard'
import { AuthInput } from '../components/AuthInput'
import { AuthLayout } from '../components/AuthLayout'

export function PortalEmailVerificationPage() {
  const navigate = useNavigate()

  function handleReturnToSignIn() {
    navigate(portalRoutePaths.authentication.signIn)
  }

  return (
    <AuthLayout ariaLabel="Portal Email Verification Required">
      <div className="auratio-auth-header">
        <h1 className="auratio-auth-title">Verify your email</h1>
        <p className="auratio-auth-subtitle">
          Your provisioned portal account is not usable yet.
        </p>
      </div>

      <AuthInput
        id="portal-verification-email"
        label="ACCOUNT EMAIL"
        type="email"
        value="name@example.com"
        readOnly
        style={{ marginTop: '84px' }}
      />

      <AuthInfoCard
        title="Verification required"
        body="Complete the email verification associated with your provisioned account before portal access can continue."
        style={{ marginTop: '32px', height: '120px' }}
      />

      <AuthButton
        onClick={handleReturnToSignIn}
        style={{ marginTop: '32px' }}
      >
        Return to Sign In
      </AuthButton>
    </AuthLayout>
  )
}
