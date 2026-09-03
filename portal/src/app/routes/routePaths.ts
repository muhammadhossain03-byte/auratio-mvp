export const portalRoutePaths = {
  foundation: '/',
  authentication: {
    root: '/auth',
    signIn: '/auth/sign-in',
    roleAuthorization: '/auth/role-authorization',
    emailVerification: '/auth/email-verification',
    accessUnavailable: '/auth/access-unavailable',
  },
  volunteer: {
    root: '/volunteer',
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
