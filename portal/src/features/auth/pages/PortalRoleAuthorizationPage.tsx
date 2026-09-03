import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AuthButton } from '../components/AuthButton'
import { AuthInfoCard } from '../components/AuthInfoCard'
import { AuthLayout } from '../components/AuthLayout'

export function PortalRoleAuthorizationPage() {
  const navigate = useNavigate()

  function handlePreviewUnauthorized() {
    navigate(portalRoutePaths.authentication.accessUnavailable)
  }

  return (
    <AuthLayout ariaLabel="Portal Role Authorization">
      <div className="auratio-auth-header">
        <h1 className="auratio-auth-title">Portal access verified</h1>
        <p className="auratio-auth-subtitle">
          Authentication succeeded. Auratio is checking your provisioned backend role.
        </p>
      </div>

      <AuthInfoCard
        title="Automatic role routing"
        body="Production routing is automatic. Users cannot choose or elevate their own portal role."
        style={{ marginTop: '22px', height: '96px' }}
      />

      <div style={{ marginTop: '18px' }}>
        <span className="auratio-auth-section-title">
          PROTOTYPE ROUTE SIMULATION
        </span>
      </div>

      <AuthButton
        onClick={() => navigate(portalRoutePaths.volunteer.assignments)}
        style={{ marginTop: '10px' }}
      >
        Open resolved Volunteer Evaluator workspace
      </AuthButton>

      <AuthButton
        presentationOnly
        style={{ marginTop: '16px' }}
      >
        Open resolved Admin workspace
      </AuthButton>

      <AuthButton
        presentationOnly
        style={{ marginTop: '16px' }}
      >
        Open resolved Super Admin workspace
      </AuthButton>

      <div style={{ marginTop: '24px' }}>
        <button
          type="button"
          onClick={handlePreviewUnauthorized}
          className="auratio-auth-link"
          style={{ fontSize: '12px' }}
        >
          Preview unauthorized-access outcome
        </button>
      </div>
    </AuthLayout>
  )
}
