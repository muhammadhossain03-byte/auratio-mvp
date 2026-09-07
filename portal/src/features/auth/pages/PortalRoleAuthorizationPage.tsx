import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { portalLandingPath } from '../../../foundation/integration/auth/portalAccess'
import { currentPortalSession } from '../../../foundation/integration/auth/portalAuthService'
import { portalSupabaseRuntimeMode } from '../../../foundation/integration/supabaseConfig'
import { AuthButton } from '../components/AuthButton'
import { AuthInfoCard } from '../components/AuthInfoCard'
import { AuthLayout } from '../components/AuthLayout'

export function PortalRoleAuthorizationPage() {
  const navigate = useNavigate()
  const runtimeMode = portalSupabaseRuntimeMode()

  useEffect(() => {
    if (runtimeMode === 'prototype') return

    if (runtimeMode === 'unavailable') {
      navigate(portalRoutePaths.authentication.accessUnavailable, { replace: true })
      return
    }

    let active = true

    void currentPortalSession()
      .then((authenticated) => {
        if (!active) return
        if (!authenticated) {
          navigate(portalRoutePaths.authentication.signIn, { replace: true })
          return
        }

        navigate(
          portalLandingPath(authenticated.profile) ??
            portalRoutePaths.authentication.accessUnavailable,
          { replace: true },
        )
      })
      .catch(() => {
        if (!active) return
        navigate(portalRoutePaths.authentication.accessUnavailable, { replace: true })
      })

    return () => {
      active = false
    }
  }, [navigate, runtimeMode])

  function handlePreviewUnauthorized() {
    navigate(portalRoutePaths.authentication.accessUnavailable)
  }

  if (runtimeMode !== 'prototype') {
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
          body="Your persisted Auratio role determines the workspace you can access."
          style={{ marginTop: '22px', height: '96px' }}
        />
      </AuthLayout>
    )
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
        onClick={() => navigate(portalRoutePaths.admin.dashboard)}
        style={{ marginTop: '16px' }}
      >
        Open resolved Admin workspace
      </AuthButton>

      <AuthButton
        onClick={() => navigate(portalRoutePaths.superAdmin.adminAccounts)}
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
