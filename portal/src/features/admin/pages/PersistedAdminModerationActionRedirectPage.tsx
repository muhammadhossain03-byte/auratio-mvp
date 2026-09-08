import { Navigate, useParams } from 'react-router-dom'

import { portalRoutePaths } from '../../../app/routes/routePaths'

export function PersistedAdminModerationActionRedirectPage() {
  const { submissionId } = useParams<{ submissionId?: string }>()

  if (!submissionId) {
    return <Navigate to={portalRoutePaths.admin.moderation} replace />
  }

  return (
    <Navigate
      to={`/admin/moderation/${encodeURIComponent(decodeURIComponent(submissionId))}`}
      replace
    />
  )
}
