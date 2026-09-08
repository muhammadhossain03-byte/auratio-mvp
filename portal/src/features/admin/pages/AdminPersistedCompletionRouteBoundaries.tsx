import type { ReactNode } from 'react'

import { portalSupabaseRuntimeMode } from '../../../foundation/integration/supabaseConfig'
import { AdminEvaluationRecordsPage } from './AdminEvaluationRecordsPage'
import { AdminModerationQueuePage } from './AdminModerationQueuePage'
import { AdminModerationReviewPage } from './AdminModerationReviewPage'
import { AdminOperationsDashboardPage } from './AdminOperationsDashboardPage'
import { PersistedAdminEvaluationRecordsPage } from './PersistedAdminEvaluationRecordsPage'
import { PersistedAdminModerationActionRedirectPage } from './PersistedAdminModerationActionRedirectPage'
import { PersistedAdminModerationQueuePage } from './PersistedAdminModerationQueuePage'
import { PersistedAdminModerationReviewPage } from './PersistedAdminModerationReviewPage'
import { PersistedAdminOperationsDashboardPage } from './PersistedAdminOperationsDashboardPage'

export function AdminOperationsDashboardBoundary() {
  if (portalSupabaseRuntimeMode() === 'configured') {
    return <PersistedAdminOperationsDashboardPage />
  }
  return <AdminOperationsDashboardPage />
}

export function AdminEvaluationRecordsBoundary() {
  if (portalSupabaseRuntimeMode() === 'configured') {
    return <PersistedAdminEvaluationRecordsPage />
  }
  return <AdminEvaluationRecordsPage />
}

export function AdminModerationQueueBoundary() {
  if (portalSupabaseRuntimeMode() === 'configured') {
    return <PersistedAdminModerationQueuePage />
  }
  return <AdminModerationQueuePage />
}

export function AdminModerationReviewBoundary() {
  if (portalSupabaseRuntimeMode() === 'configured') {
    return <PersistedAdminModerationReviewPage />
  }
  return <AdminModerationReviewPage />
}

interface AdminModerationLegacyActionBoundaryProps {
  children: ReactNode
}

export function AdminModerationLegacyActionBoundary({
  children,
}: AdminModerationLegacyActionBoundaryProps) {
  if (portalSupabaseRuntimeMode() === 'configured') {
    return <PersistedAdminModerationActionRedirectPage />
  }
  return <>{children}</>
}
