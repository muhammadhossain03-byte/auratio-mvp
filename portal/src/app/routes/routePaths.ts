export const portalRoutePaths = {
  foundation: '/',
  authentication: {
    root: '/auth',
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
