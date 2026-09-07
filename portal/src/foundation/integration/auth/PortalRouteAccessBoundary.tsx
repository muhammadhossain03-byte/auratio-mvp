import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { portalSupabaseRuntimeMode } from '../supabaseConfig'
import {
  canProfileAccessPortalPath,
  isProtectedPortalPath,
  portalLandingPath,
} from './portalAccess'
import { currentPortalSession } from './portalAuthService'

interface AccessDecision {
  pathname: string
  redirectTo: string | null
}

export function PortalRouteAccessBoundary() {
  const location = useLocation()
  const runtimeMode = portalSupabaseRuntimeMode()
  const protectedPath = isProtectedPortalPath(location.pathname)
  const [decision, setDecision] = useState<AccessDecision | null>(null)

  useEffect(() => {
    if (!protectedPath || runtimeMode !== 'configured') return

    let active = true

    void currentPortalSession()
      .then((authenticated) => {
        if (!active) return

        if (!authenticated) {
          setDecision({
            pathname: location.pathname,
            redirectTo: '/auth/sign-in',
          })
          return
        }

        if (!canProfileAccessPortalPath(authenticated.profile, location.pathname)) {
          setDecision({
            pathname: location.pathname,
            redirectTo:
              portalLandingPath(authenticated.profile) ?? '/auth/access-unavailable',
          })
          return
        }

        setDecision({ pathname: location.pathname, redirectTo: null })
      })
      .catch(() => {
        if (!active) return
        setDecision({
          pathname: location.pathname,
          redirectTo: '/auth/access-unavailable',
        })
      })

    return () => {
      active = false
    }
  }, [location.pathname, protectedPath, runtimeMode])

  if (!protectedPath) return <Outlet />
  if (runtimeMode === 'prototype') return <Outlet />

  if (runtimeMode === 'unavailable') {
    return <Navigate to="/auth/access-unavailable" replace />
  }

  if (decision?.pathname !== location.pathname) return null

  if (decision.redirectTo) {
    return (
      <Navigate
        to={decision.redirectTo}
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <Outlet />
}
