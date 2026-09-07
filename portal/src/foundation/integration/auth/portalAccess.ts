export type AppRole = 'end_user' | 'volunteer' | 'admin' | 'super_admin'
export type AccountStatus = 'active' | 'disabled'
export type PortalRole = Exclude<AppRole, 'end_user'>

export interface PortalProfile {
  user_id: string
  display_name: string
  role: AppRole
  account_status: AccountStatus
  is_root_super_admin: boolean
}

export function isPortalRole(role: AppRole): role is PortalRole {
  return role === 'volunteer' || role === 'admin' || role === 'super_admin'
}

export function isActivePortalProfile(profile: PortalProfile): boolean {
  return profile.account_status === 'active' && isPortalRole(profile.role)
}

function pathMatchesRoot(pathname: string, root: string): boolean {
  return pathname === root || pathname.startsWith(`${root}/`)
}

export function isProtectedPortalPath(pathname: string): boolean {
  return (
    pathMatchesRoot(pathname, '/volunteer') ||
    pathMatchesRoot(pathname, '/admin') ||
    pathMatchesRoot(pathname, '/super-admin')
  )
}

export function portalLandingPath(profile: PortalProfile): string | null {
  if (!isActivePortalProfile(profile)) return null

  switch (profile.role) {
    case 'volunteer':
      return '/volunteer/assignments'
    case 'admin':
      return '/admin/dashboard'
    case 'super_admin':
      return '/super-admin/admin-accounts'
    case 'end_user':
      return null
  }
}

export function canProfileAccessPortalPath(
  profile: PortalProfile,
  pathname: string,
): boolean {
  if (!isActivePortalProfile(profile)) return false

  if (pathMatchesRoot(pathname, '/super-admin')) {
    return profile.role === 'super_admin'
  }
  if (pathMatchesRoot(pathname, '/admin')) {
    return profile.role === 'admin' || profile.role === 'super_admin'
  }
  if (pathMatchesRoot(pathname, '/volunteer')) {
    return profile.role === 'volunteer'
  }

  return true
}

export function parsePortalProfile(value: unknown): PortalProfile {
  if (!value || typeof value !== 'object') {
    throw new Error('Profile payload is missing.')
  }

  const row = value as Record<string, unknown>
  const role = row.role
  const accountStatus = row.account_status

  if (
    role !== 'end_user' &&
    role !== 'volunteer' &&
    role !== 'admin' &&
    role !== 'super_admin'
  ) {
    throw new Error('Profile role is invalid.')
  }

  if (accountStatus !== 'active' && accountStatus !== 'disabled') {
    throw new Error('Profile account status is invalid.')
  }

  if (
    typeof row.user_id !== 'string' ||
    typeof row.display_name !== 'string' ||
    typeof row.is_root_super_admin !== 'boolean'
  ) {
    throw new Error('Profile payload is incomplete.')
  }

  return {
    user_id: row.user_id,
    display_name: row.display_name,
    role,
    account_status: accountStatus,
    is_root_super_admin: row.is_root_super_admin,
  }
}
