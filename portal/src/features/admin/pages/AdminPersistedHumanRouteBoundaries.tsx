import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { portalRoutePaths } from '../../../app/routes/routePaths'
import { portalSupabaseRuntimeMode } from '../../../foundation/integration/supabaseConfig'
import { AdminEvaluationRequestQueuePage } from './AdminEvaluationRequestQueuePage'
import { PersistedAdminEvaluationRequestQueuePage } from './PersistedAdminEvaluationRequestQueuePage'
import { PersistedAdminHumanRequestPage } from './PersistedAdminHumanRequestPage'

export function AdminEvaluationRequestQueueBoundary() {
  if (portalSupabaseRuntimeMode() === 'configured') {
    return <PersistedAdminEvaluationRequestQueuePage />
  }

  return <AdminEvaluationRequestQueuePage />
}

export function AdminHumanRequestRouteBoundary() {
  if (portalSupabaseRuntimeMode() === 'configured') {
    return <PersistedAdminHumanRequestPage />
  }

  return <Navigate to={portalRoutePaths.admin.requests} replace />
}

interface AdminPrototypeFixtureBoundaryProps {
  children: ReactNode
  fallbackTo: string
}

export function AdminPrototypeFixtureBoundary({
  children,
  fallbackTo,
}: AdminPrototypeFixtureBoundaryProps) {
  if (portalSupabaseRuntimeMode() === 'configured') {
    return <Navigate to={fallbackTo} replace />
  }

  return <>{children}</>
}
