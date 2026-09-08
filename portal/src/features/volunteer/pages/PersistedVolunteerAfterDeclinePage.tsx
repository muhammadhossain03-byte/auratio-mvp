import { useLocation, useNavigate } from 'react-router-dom'

import { portalRoutePaths } from '../../../app/routes/routePaths'
import { VolunteerLayout } from '../components/VolunteerLayout'

interface DeclineNavigationState {
  declinedSubmissionRef?: string
}

export function PersistedVolunteerAfterDeclinePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state ?? {}) as DeclineNavigationState
  const declinedRef = state.declinedSubmissionRef ?? 'The assignment'

  return (
    <VolunteerLayout
      ariaLabel="Active Assignments After Decline"
      topbarTitle="Active Assignments"
      activeNav="assignments"
    >
      <h2 className="auratio-volunteer-page-title">Assignment declined</h2>
      <p className="auratio-volunteer-page-subtitle">
        {declinedRef} no longer has active Volunteer ownership.
      </p>

      <div
        className="auratio-volunteer-panel"
        style={{ left: '30px', top: '124px', width: '1076px', height: '230px', padding: '24px', boxSizing: 'border-box' }}
      >
        <h3 className="auratio-volunteer-panel-title" style={{ position: 'static' }}>
          Persisted lifecycle updated
        </h3>
        <p>
          The Human assignment attempt is closed and the request is now available only to Admin/Super Admin for reassignment.
        </p>
        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.volunteer.assignments, { replace: true })}
          className="auratio-volunteer-btn auratio-volunteer-btn--primary"
          style={{ width: '220px', height: '44px', marginTop: '24px' }}
        >
          View Active Assignments
        </button>
      </div>
    </VolunteerLayout>
  )
}
