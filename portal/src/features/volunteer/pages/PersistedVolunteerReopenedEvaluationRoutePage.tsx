import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { portalRoutePaths } from '../../../app/routes/routePaths'
import {
  loadPersistedVolunteerAssignment,
  type PersistedVolunteerAssignment,
} from '../integration/persistedVolunteerLifecycle'

export function PersistedVolunteerReopenedEvaluationRoutePage() {
  const { submissionId } = useParams<{ submissionId?: string }>()
  const persistedSubmissionId = submissionId ? decodeURIComponent(submissionId) : ''
  const [assignment, setAssignment] = useState<PersistedVolunteerAssignment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!persistedSubmissionId) {
      setLoading(false)
      return
    }

    let active = true
    void loadPersistedVolunteerAssignment(persistedSubmissionId)
      .then((loaded) => {
        if (active) setAssignment(loaded)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [persistedSubmissionId])

  if (loading) return null
  if (!assignment) {
    return <Navigate to={portalRoutePaths.volunteer.assignments} replace />
  }

  if (assignment.assignmentStatus === 'Assigned') {
    return (
      <Navigate
        to={`/volunteer/assignments/${encodeURIComponent(assignment.submissionId)}`}
        replace
      />
    )
  }

  return (
    <Navigate
      to={`/volunteer/evaluation/${encodeURIComponent(assignment.submissionId)}`}
      replace
    />
  )
}
