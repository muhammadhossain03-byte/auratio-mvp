export const portalRoutePaths = {
  foundation: '/',
  authentication: {
    root: '/auth',
    signIn: '/auth/sign-in',
    roleAuthorization: '/auth/role-authorization',
    emailVerification: '/auth/email-verification',
    accessUnavailable: '/auth/access-unavailable',
    forgotPassword: '/auth/forgot-password',
    resetLinkSent: '/auth/reset-link-sent',
    resetPassword: '/auth/reset-password',
    passwordResetComplete: '/auth/password-reset-complete',
  },
  volunteer: {
    root: '/volunteer',
    assignments: '/volunteer/assignments',
    assignedTask: '/volunteer/assignments/sub-8821',
    declineAssignment: '/volunteer/assignments/sub-8821/decline',
    activeAssignmentsAfterDecline: '/volunteer/assignments/after-decline',
    availability: '/volunteer/availability',
    availabilityUnavailable: '/volunteer/availability/unavailable',
    scoringWorkspace: '/volunteer/evaluation/sub-8821',
    criterionFeedback: '/volunteer/evaluation/sub-8821/criterion',
    finalSubmission: '/volunteer/evaluation/sub-8821/review',
    evaluationSubmitted: '/volunteer/evaluation/sub-8821/submitted',
    completedHistory: '/volunteer/completed',
    completedPendingModeration: '/volunteer/completed/sub-8821',
    completedApproved: '/volunteer/completed/sub-8792',
    completedRejected: '/volunteer/completed/sub-8755',
    completedProcessing: '/volunteer/completed/sub-8741',
    reopenedEvaluation: '/volunteer/evaluation/sub-8821/reopened',
  },
  admin: {
    root: '/admin',
  },
  superAdmin: {
    root: '/super-admin',
  },
} as const

export type PortalJourney =
  | 'authentication'
  | 'volunteer'
  | 'admin'
  | 'superAdmin'
