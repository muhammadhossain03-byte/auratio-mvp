import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AuthButton } from '../components/AuthButton'
import { AuthInfoCard } from '../components/AuthInfoCard'
import { AuthLayout } from '../components/AuthLayout'

export function PortalPasswordResetCompletePage() {
  const navigate = useNavigate()

  function handleReturnToSignIn() {
    navigate(portalRoutePaths.authentication.signIn)
  }

  return (
    <AuthLayout ariaLabel="Portal Password Reset Complete">
      <div className="auratio-auth-header">
        <h1 className="auratio-auth-title">Password updated</h1>
        <p className="auratio-auth-subtitle">
          Your portal password has been reset successfully.
        </p>
      </div>

      <AuthInfoCard
        title="Credentials updated"
        body="Return to the shared portal sign-in. Backend role authorization still determines which workspace you can access."
        style={{ marginTop: '88px', height: '124px' }}
      />

      <AuthButton
        onClick={handleReturnToSignIn}
        style={{ marginTop: '36px' }}
      >
        Return to Sign In
      </AuthButton>
    </AuthLayout>
  )
}
