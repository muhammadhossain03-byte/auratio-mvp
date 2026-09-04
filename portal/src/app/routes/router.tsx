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
  VolunteerCompletedApprovedPage,
  VolunteerCompletedHistoryPage,
  VolunteerCompletedPendingModerationPage,
  VolunteerCompletedProcessingPage,
  VolunteerCompletedRejectedPage,
  VolunteerCriterionFeedbackEditorPage,
  VolunteerDeclineAssignmentPage,
  VolunteerEvaluationSubmittedPage,
  VolunteerFinalSubmissionPage,
  VolunteerReopenedEvaluationPage,
  VolunteerScoringWorkspacePage,
} from '../../features/volunteer'
import {
  AdminAssignmentPickerPage,
  AdminAuditLogPage,
  AdminAvailabilityOverridePage,
  AdminConfirmModerationApprovalPage,
  AdminConfirmModerationRejectionPage,
  AdminConfirmReassignmentPage,
  AdminEvaluationApprovedAiPage,
  AdminEvaluationProcessingHumanPage,
  AdminEvaluationRecordsPage,
  AdminEvaluationRequestQueuePage,
  AdminEventEditorPage,
  AdminEventManagementPage,
  AdminInviteVolunteerPage,
  AdminModerationQueuePage,
  AdminModerationReviewPage,
  AdminOperationsDashboardPage,
  AdminRequestAssignedAiPage,
  AdminRequestAssignedHumanPage,
  AdminRequestDetailsRoutingPage,
  AdminRequestRedirectedHumanPage,
  AdminRequestReReviewPage,
  AdminVolunteerAccountPage,
  AdminVolunteerEvaluatorsPage,
  AdminVolunteerTrackEligibilityPage,
} from '../../features/admin'
import {
  SuperAdminAccountPage,
  SuperAdminAccountsPage,
  SuperAdminConfirmDeactivationPage,
  SuperAdminInviteAdminPage,
  SuperAdminProtectedRootPage,
} from '../../features/superAdmin'
import { portalRoutePaths } from './routePaths'

// Journey route groups are reserved in routePaths and are registered here only
// as their corresponding Step IV screens are implemented.
export const router = createBrowserRouter([
  {
    path: portalRoutePaths.foundation,
    element: <Navigate to={portalRoutePaths.authentication.signIn} replace />,
  },
  {
    path: '/foundation',
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
  {
    path: portalRoutePaths.volunteer.criterionFeedback,
    element: <VolunteerCriterionFeedbackEditorPage />,
  },
  {
    path: portalRoutePaths.volunteer.finalSubmission,
    element: <VolunteerFinalSubmissionPage />,
  },
  {
    path: portalRoutePaths.volunteer.evaluationSubmitted,
    element: <VolunteerEvaluationSubmittedPage />,
  },
  {
    path: portalRoutePaths.volunteer.completedHistory,
    element: <VolunteerCompletedHistoryPage />,
  },
  {
    path: portalRoutePaths.volunteer.completedPendingModeration,
    element: <VolunteerCompletedPendingModerationPage />,
  },
  {
    path: portalRoutePaths.volunteer.completedApproved,
    element: <VolunteerCompletedApprovedPage />,
  },
  {
    path: portalRoutePaths.volunteer.completedRejected,
    element: <VolunteerCompletedRejectedPage />,
  },
  {
    path: portalRoutePaths.volunteer.completedProcessing,
    element: <VolunteerCompletedProcessingPage />,
  },
  {
    path: portalRoutePaths.volunteer.reopenedEvaluation,
    element: <VolunteerReopenedEvaluationPage />,
  },
  {
    path: portalRoutePaths.admin.root,
    element: <Navigate to={portalRoutePaths.admin.dashboard} replace />,
  },
  {
    path: portalRoutePaths.admin.dashboard,
    element: <AdminOperationsDashboardPage />,
  },
  {
    path: portalRoutePaths.admin.requests,
    element: <AdminEvaluationRequestQueuePage />,
  },
  {
    path: portalRoutePaths.admin.requestDetailsRouting,
    element: <AdminRequestDetailsRoutingPage />,
  },
  {
    path: portalRoutePaths.admin.assignmentPicker,
    element: <AdminAssignmentPickerPage />,
  },
  {
    path: portalRoutePaths.admin.confirmReassignment,
    element: <AdminConfirmReassignmentPage />,
  },
  {
    path: portalRoutePaths.admin.requestAssignedAi,
    element: <AdminRequestAssignedAiPage />,
  },
  {
    path: '/admin/requests/req-1038',
    element: <AdminRequestAssignedHumanPage />,
  },
  {
    path: portalRoutePaths.admin.requestRedirectedHuman,
    element: <AdminRequestRedirectedHumanPage />,
  },
  {
    path: portalRoutePaths.admin.evaluations,
    element: <AdminEvaluationRecordsPage />,
  },
  {
    path: portalRoutePaths.admin.evaluationProcessingHuman,
    element: <AdminEvaluationProcessingHumanPage />,
  },
  {
    path: portalRoutePaths.admin.evaluationApprovedAi,
    element: <AdminEvaluationApprovedAiPage />,
  },
  {
    path: portalRoutePaths.admin.moderation,
    element: <AdminModerationQueuePage />,
  },
  {
    path: portalRoutePaths.admin.moderationReview,
    element: <AdminModerationReviewPage />,
  },
  {
    path: '/admin/moderation/:submissionId',
    element: <AdminModerationReviewPage />,
  },
  {
    path: portalRoutePaths.admin.confirmModerationApproval,
    element: <AdminConfirmModerationApprovalPage />,
  },
  {
    path: '/admin/moderation/:submissionId/approve',
    element: <AdminConfirmModerationApprovalPage />,
  },
  {
    path: portalRoutePaths.admin.confirmModerationRejection,
    element: <AdminConfirmModerationRejectionPage />,
  },
  {
    path: '/admin/moderation/:submissionId/reject',
    element: <AdminConfirmModerationRejectionPage />,
  },
  {
    path: portalRoutePaths.admin.requestReReview,
    element: <AdminRequestReReviewPage />,
  },
  {
    path: '/admin/moderation/:submissionId/re-review',
    element: <AdminRequestReReviewPage />,
  },
  {
    path: portalRoutePaths.admin.volunteers,
    element: <AdminVolunteerEvaluatorsPage />,
  },
  {
    path: portalRoutePaths.admin.inviteVolunteer,
    element: <AdminInviteVolunteerPage />,
  },
  {
    path: portalRoutePaths.admin.volunteerAccount,
    element: <AdminVolunteerAccountPage />,
  },
  {
    path: portalRoutePaths.admin.availabilityOverride,
    element: <AdminAvailabilityOverridePage />,
  },
  {
    path: portalRoutePaths.admin.volunteerTrackEligibility,
    element: <AdminVolunteerTrackEligibilityPage />,
  },
  {
    path: '/admin/volunteers/:volunteerId',
    element: <AdminVolunteerAccountPage />,
  },
  {
    path: '/admin/volunteers/:volunteerId/tracks',
    element: <AdminVolunteerTrackEligibilityPage />,
  },
  {
    path: '/admin/volunteers/:volunteerId/availability',
    element: <AdminAvailabilityOverridePage />,
  },
  {
    path: portalRoutePaths.admin.events,
    element: <AdminEventManagementPage />,
  },
  {
    path: portalRoutePaths.admin.eventEditor,
    element: <AdminEventEditorPage />,
  },
  {
    path: '/admin/events/:eventId',
    element: <AdminEventEditorPage />,
  },
  {
    path: portalRoutePaths.admin.audit,
    element: <AdminAuditLogPage />,
  },
  {
    path: portalRoutePaths.superAdmin.root,
    element: <Navigate to={portalRoutePaths.superAdmin.adminAccounts} replace />,
  },
  {
    path: portalRoutePaths.superAdmin.adminAccounts,
    element: <SuperAdminAccountsPage />,
  },
  {
    path: portalRoutePaths.superAdmin.inviteAdmin,
    element: <SuperAdminInviteAdminPage />,
  },
  {
    path: portalRoutePaths.superAdmin.adminAccount,
    element: <SuperAdminAccountPage />,
  },
  {
    path: '/super-admin/admin-accounts/:adminId',
    element: <SuperAdminAccountPage />,
  },
  {
    path: portalRoutePaths.superAdmin.confirmAdminDeactivation,
    element: <SuperAdminConfirmDeactivationPage />,
  },
  {
    path: '/super-admin/admin-accounts/:adminId/deactivate',
    element: <SuperAdminConfirmDeactivationPage />,
  },
  {
    path: portalRoutePaths.superAdmin.protectedRootAccount,
    element: <SuperAdminProtectedRootPage />,
  },
])

