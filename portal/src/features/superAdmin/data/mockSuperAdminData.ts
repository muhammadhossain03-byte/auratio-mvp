import { portalRoutePaths } from '../../../app/routes/routePaths'

export interface SuperAdminAccountItem {
  id: string
  name: string
  email: string
  accountType: 'Super Admin' | 'Admin'
  status: 'Active' | 'Deactivated' | 'Invited'
  protection: string
  isRoot: boolean
  actionLabel: 'View' | 'Open'
  destinationPath: string
}

export interface NadiaProfileState {
  displayName: string
  email: string
  status: 'Active' | 'Deactivated'
}

const CANONICAL_NADIA_PROFILE: NadiaProfileState = {
  displayName: 'Nadia Rahman',
  email: 'nadia@auratio.org',
  status: 'Active',
}

let nadiaProfile: NadiaProfileState = { ...CANONICAL_NADIA_PROFILE }

export function getNadiaAdminAccount(): NadiaProfileState {
  return { ...nadiaProfile }
}

export function updateNadiaAdminAccount(updates: { displayName?: string; email?: string }): void {
  if (updates.displayName !== undefined) {
    nadiaProfile.displayName = updates.displayName
  }
  if (updates.email !== undefined) {
    nadiaProfile.email = updates.email
  }
}

export function isNadiaDeactivated(): boolean {
  return nadiaProfile.status === 'Deactivated'
}

export function deactivateNadia(): void {
  nadiaProfile.status = 'Deactivated'
}

let extraAdminAccounts: SuperAdminAccountItem[] = []

export function getAdminAccountsList(): SuperAdminAccountItem[] {
  return [
    {
      id: 'root',
      name: 'Auratio Root',
      email: 'root@auratio.local',
      accountType: 'Super Admin',
      status: 'Active',
      protection: 'Protected',
      isRoot: true,
      actionLabel: 'View',
      destinationPath: portalRoutePaths.superAdmin.protectedRootAccount,
    },
    {
      id: 'nadia',
      name: nadiaProfile.displayName,
      email: nadiaProfile.email,
      accountType: 'Admin',
      status: nadiaProfile.status,
      protection: '—',
      isRoot: false,
      actionLabel: 'Open',
      destinationPath: portalRoutePaths.superAdmin.adminAccount,
    },
    {
      id: 'imran',
      name: 'Imran Ahmed',
      email: 'imran@auratio.org',
      accountType: 'Admin',
      status: 'Deactivated',
      protection: '—',
      isRoot: false,
      actionLabel: 'Open',
      destinationPath: portalRoutePaths.superAdmin.adminAccount,
    },
    ...extraAdminAccounts,
  ]
}

export function getAdminAccountById(id: string): SuperAdminAccountItem | undefined {
  const all = getAdminAccountsList()
  const found = all.find((a) => a.id === id)
  if (found) return found
  if (id === 'nadia') return all.find((a) => a.id === 'nadia')
  if (id && id !== 'root') {
    const formattedName = id
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
    return {
      id,
      name: formattedName || 'Admin User',
      email: `${id}@auratio.org`,
      accountType: 'Admin',
      status: 'Active',
      protection: '—',
      isRoot: false,
      actionLabel: 'Open',
      destinationPath: `/super-admin/admin-accounts/${id}`,
    }
  }
  return undefined
}

export function updateAdminAccount(id: string, updates: { displayName?: string; email?: string }): void {
  if (id === 'root') {
    // Root can never be modified
    return
  }
  if (id === 'nadia') {
    updateNadiaAdminAccount(updates)
    return
  }
  const custom = extraAdminAccounts.find((a) => a.id === id)
  if (custom) {
    if (updates.displayName !== undefined) {
      custom.name = updates.displayName
    }
    if (updates.email !== undefined) {
      custom.email = updates.email
    }
  }
}

export function deactivateAdminAccount(id: string): void {
  if (id === 'root') {
    // Root can never be targeted
    return
  }
  if (id === 'nadia') {
    deactivateNadia()
    return
  }
  const custom = extraAdminAccounts.find((a) => a.id === id)
  if (custom) {
    custom.status = 'Deactivated'
  }
}

export function inviteAdminAccount(params: { fullName: string; email: string }): SuperAdminAccountItem {
  const slug = params.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `admin-${Date.now()}`
  const newAccount: SuperAdminAccountItem = {
    id: slug,
    name: params.fullName,
    email: params.email,
    accountType: 'Admin', // STRICTLY Admin, cannot be Super Admin
    status: 'Invited', // Represented as invited/pending lifecycle state
    protection: '—',
    isRoot: false,
    actionLabel: 'Open',
    destinationPath: `/super-admin/admin-accounts/${slug}`,
  }
  extraAdminAccounts = [...extraAdminAccounts, newAccount]
  return newAccount
}

export function resetSuperAdminState(): void {
  nadiaProfile = { ...CANONICAL_NADIA_PROFILE }
  extraAdminAccounts = []
}

if (typeof window !== 'undefined') {
  const win = window as unknown as {
    __auratioResetSuperAdmin?: () => void
    __getNadiaAdminAccount?: () => NadiaProfileState
    __updateNadiaAdminAccount?: (updates: { displayName?: string; email?: string }) => void
    __inviteAdminAccount?: (params: { fullName: string; email: string }) => SuperAdminAccountItem
    __getAdminAccountsList?: () => SuperAdminAccountItem[]
    __getAdminAccountById?: (id: string) => SuperAdminAccountItem | undefined
    __updateAdminAccount?: (id: string, updates: { displayName?: string; email?: string }) => void
    __deactivateAdminAccount?: (id: string) => void
  }
  win.__auratioResetSuperAdmin = resetSuperAdminState
  win.__getNadiaAdminAccount = getNadiaAdminAccount
  win.__updateNadiaAdminAccount = updateNadiaAdminAccount
  win.__inviteAdminAccount = inviteAdminAccount
  win.__getAdminAccountsList = getAdminAccountsList
  win.__getAdminAccountById = getAdminAccountById
  win.__updateAdminAccount = updateAdminAccount
  win.__deactivateAdminAccount = deactivateAdminAccount
}
