import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AuthButton } from '../components/AuthButton'
import { AuthInfoCard } from '../components/AuthInfoCard'
import { AuthLayout } from '../components/AuthLayout'

export function PortalAccessUnavailablePage() {
  const navigate = useNavigate()

  function handleReturnToSignIn() {
    navigate(portalRoutePaths.authentication.signIn)
  }

  return (
    <AuthLayout ariaLabel="Portal Access Unavailable">
      <div className="auratio-auth-header">
        <h1 className="auratio-auth-title">Portal access unavailable</h1>
        <p className="auratio-auth-subtitle">
          The authenticated account does not resolve to an active authorized portal workspace.
        </p>
      </div>

      <AuthInfoCard
        title="Backend authorization required"
        body="A valid sign-in is not enough by itself. Auratio must resolve an authorized Super Admin, Admin, or Volunteer Evaluator role."
        style={{ marginTop: '70px', height: '154px' }}
      />

      <AuthButton
        onClick={handleReturnToSignIn}
        style={{ marginTop: '38px' }}
      >
        Return to Sign In
      </AuthButton>

      <div style={{ marginTop: '36px', marginLeft: '16px', maxWidth: '398px' }}>
        <p className="auratio-auth-note" style={{ margin: 0 }}>
          Administrative navigation and evaluator work stay hidden when authorization fails.
        </p>
      </div>
    </AuthLayout>
  )
}
