import { createBrowserRouter, Navigate } from 'react-router-dom'

import { FoundationPage } from '../../features/foundation/FoundationPage'
import {
  PortalAccessUnavailablePage,
  PortalEmailVerificationPage,
  PortalForgotPasswordPage,
  PortalPasswordResetCompletePage,
  PortalResetLinkSentPage,
  PortalResetPasswordPage,
  PortalRoleAuthorizationPage,
  PortalSignInPage,
} from '../../features/auth'
import {
  VolunteerActiveAssignmentsAfterDeclinePage,
  VolunteerActiveAssignmentsPage,
  VolunteerAssignedTaskPage,
  VolunteerAvailabilityPage,
  VolunteerAvailabilityUnavailablePage,
  VolunteerDeclineAssignmentPage,
  VolunteerScoringWorkspacePage,
} from '../../features/volunteer'
import { portalRoutePaths } from './routePaths'

// Journey route groups are reserved in routePaths and are registered here only
// as their corresponding Step IV screens are implemented.
export const router = createBrowserRouter([
  {
    path: portalRoutePaths.foundation,
    element: <FoundationPage />,
  },
  {
    path: portalRoutePaths.authentication.root,
    element: <Navigate to={portalRoutePaths.authentication.signIn} replace />,
  },
  {
    path: portalRoutePaths.authentication.signIn,
    element: <PortalSignInPage />,
  },
  {
    path: portalRoutePaths.authentication.roleAuthorization,
    element: <PortalRoleAuthorizationPage />,
  },
  {
    path: portalRoutePaths.authentication.emailVerification,
    element: <PortalEmailVerificationPage />,
  },
  {
    path: portalRoutePaths.authentication.accessUnavailable,
    element: <PortalAccessUnavailablePage />,
  },
  {
    path: portalRoutePaths.authentication.forgotPassword,
    element: <PortalForgotPasswordPage />,
  },
  {
    path: portalRoutePaths.authentication.resetLinkSent,
    element: <PortalResetLinkSentPage />,
  },
  {
    path: portalRoutePaths.authentication.resetPassword,
    element: <PortalResetPasswordPage />,
  },
  {
    path: portalRoutePaths.authentication.passwordResetComplete,
    element: <PortalPasswordResetCompletePage />,
  },
  {
    path: portalRoutePaths.volunteer.root,
    element: <Navigate to={portalRoutePaths.volunteer.assignments} replace />,
  },
  {
    path: portalRoutePaths.volunteer.assignments,
    element: <VolunteerActiveAssignmentsPage />,
  },
  {
    path: portalRoutePaths.volunteer.assignedTask,
    element: <VolunteerAssignedTaskPage />,
  },
  {
    path: portalRoutePaths.volunteer.declineAssignment,
    element: <VolunteerDeclineAssignmentPage />,
  },
  {
    path: portalRoutePaths.volunteer.activeAssignmentsAfterDecline,
    element: <VolunteerActiveAssignmentsAfterDeclinePage />,
  },
  {
    path: portalRoutePaths.volunteer.availability,
    element: <VolunteerAvailabilityPage />,
  },
  {
    path: portalRoutePaths.volunteer.availabilityUnavailable,
    element: <VolunteerAvailabilityUnavailablePage />,
  },
  {
    path: portalRoutePaths.volunteer.scoringWorkspace,
    element: <VolunteerScoringWorkspacePage />,
  },
])

