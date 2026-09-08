import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { portalRoutePaths } from '../../../app/routes/routePaths'
import { portalSupabaseRuntimeMode } from '../../../foundation/integration/supabaseConfig'
import { VolunteerCompletedDetailPage } from './VolunteerCompletedDetailPage'
import { VolunteerCompletedHistoryPage } from './VolunteerCompletedHistoryPage'
import { VolunteerReopenedEvaluationPage } from './VolunteerReopenedEvaluationPage'
import { PersistedVolunteerCompletedDetailPage } from './PersistedVolunteerCompletedDetailPage'
import { PersistedVolunteerCompletedHistoryPage } from './PersistedVolunteerCompletedHistoryPage'
import { PersistedVolunteerReopenedEvaluationRoutePage } from './PersistedVolunteerReopenedEvaluationRoutePage'

export function VolunteerCompletedHistoryBoundary() {
  if (portalSupabaseRuntimeMode() === 'configured') {
    return <PersistedVolunteerCompletedHistoryPage />
  }
  return <VolunteerCompletedHistoryPage />
}

export function VolunteerCompletedDetailBoundary() {
  if (portalSupabaseRuntimeMode() === 'configured') {
    return <PersistedVolunteerCompletedDetailPage />
  }
  return <VolunteerCompletedDetailPage />
}

export function VolunteerReopenedEvaluationBoundary() {
  if (portalSupabaseRuntimeMode() === 'configured') {
    return <PersistedVolunteerReopenedEvaluationRoutePage />
  }
  return <VolunteerReopenedEvaluationPage />
}

interface VolunteerPrototypeFixtureBoundaryProps {
  children: ReactNode
  fallbackTo?: string
}

export function VolunteerPrototypeFixtureBoundary({
  children,
  fallbackTo = portalRoutePaths.volunteer.completedHistory,
}: VolunteerPrototypeFixtureBoundaryProps) {
  if (portalSupabaseRuntimeMode() === 'configured') {
    return <Navigate to={fallbackTo} replace />
  }
  return <>{children}</>
}
