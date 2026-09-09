import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { portalSupabaseRuntimeMode } from '../supabaseConfig'
import {
  canProfileAccessPortalPath,
  isProtectedPortalPath,
  portalLandingPath,
} from './portalAccess'
import {
  currentPortalSession,
  isTransientPortalAuthenticationError,
  subscribeToPortalAuth,
} from './portalAuthService'

interface AccessDecision {
  pathname: string
  redirectTo: string | null
}

export function PortalRouteAccessBoundary() {
  const location = useLocation()
  const runtimeMode = portalSupabaseRuntimeMode()
  const protectedPath = isProtectedPortalPath(location.pathname)
  const [decision, setDecision] = useState<AccessDecision | null>(null)
  const [refreshRevision, setRefreshRevision] = useState(0)

  useEffect(() => {
    if (runtimeMode !== 'configured') return

    let active = true
    const requestRefresh = () => {
      if (active) setRefreshRevision((value) => value + 1)
    }
    const unsubscribeAuth = subscribeToPortalAuth(() => requestRefresh())
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === null ||
        (event.key.startsWith('sb-') && event.key.endsWith('-auth-token'))
      ) {
        requestRefresh()
      }
    }
    const handleFocus = () => requestRefresh()
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') requestRefresh()
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)
    const interval = window.setInterval(requestRefresh, 60_000)

    return () => {
      active = false
      window.clearInterval(interval)
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
      unsubscribeAuth()
    }
  }, [runtimeMode])

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
      .catch((error: unknown) => {
        if (!active) return

        if (isTransientPortalAuthenticationError(error)) {
          setDecision((current) =>
            current?.pathname === location.pathname
              ? current
              : {
                  pathname: location.pathname,
                  redirectTo: '/auth/access-unavailable',
                },
          )
          return
        }

        setDecision({
          pathname: location.pathname,
          redirectTo: '/auth/access-unavailable',
        })
      })

    return () => {
      active = false
    }
  }, [location.pathname, protectedPath, refreshRevision, runtimeMode])

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
