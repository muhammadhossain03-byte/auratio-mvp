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

const CANONICAL_IMRAN_PROFILE: NadiaProfileState = {
  displayName: 'Imran Ahmed',
  email: 'imran@auratio.org',
  status: 'Deactivated',
}

let nadiaProfile: NadiaProfileState = { ...CANONICAL_NADIA_PROFILE }
let imranProfile: NadiaProfileState = { ...CANONICAL_IMRAN_PROFILE }

export function getNadiaAdminAccount(): NadiaProfileState {
  return { ...nadiaProfile }
}

export function getImranAdminAccount(): NadiaProfileState {
  return { ...imranProfile }
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

const SESSION_STORAGE_KEY = 'auratio_extra_admin_accounts'

function loadExtraAdminAccounts(): SuperAdminAccountItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.sessionStorage?.getItem(SESSION_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveExtraAdminAccounts(accounts: SuperAdminAccountItem[]): void {
  extraAdminAccounts = accounts
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage?.setItem(SESSION_STORAGE_KEY, JSON.stringify(accounts))
  } catch {}
}

let extraAdminAccounts: SuperAdminAccountItem[] = loadExtraAdminAccounts()

export function getAdminAccountsList(): SuperAdminAccountItem[] {
  extraAdminAccounts = loadExtraAdminAccounts()
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
      name: imranProfile.displayName,
      email: imranProfile.email,
      accountType: 'Admin',
      status: imranProfile.status,
      protection: '—',
      isRoot: false,
      actionLabel: 'Open',
      destinationPath: '/super-admin/admin-accounts/imran',
    },
    ...extraAdminAccounts,
  ]
}

export function getAdminAccountById(id: string): SuperAdminAccountItem | undefined {
  const all = getAdminAccountsList()
  return all.find((a) => a.id.toLowerCase() === id.toLowerCase())
}

export function updateAdminAccount(id: string, updates: { displayName?: string; email?: string }): void {
  const normId = id.toLowerCase()
  if (normId === 'root') {
    // Root can never be modified
    return
  }
  if (normId === 'nadia') {
    updateNadiaAdminAccount(updates)
    return
  }
  if (normId === 'imran') {
    if (updates.displayName !== undefined) {
      imranProfile.displayName = updates.displayName
    }
    if (updates.email !== undefined) {
      imranProfile.email = updates.email
    }
    return
  }
  const custom = extraAdminAccounts.find((a) => a.id.toLowerCase() === normId)
  if (custom) {
    if (updates.displayName !== undefined) {
      custom.name = updates.displayName
    }
    if (updates.email !== undefined) {
      custom.email = updates.email
    }
    saveExtraAdminAccounts([...extraAdminAccounts])
  }
}

export function deactivateAdminAccount(id: string): void {
  const normId = id.toLowerCase()
  if (normId === 'root') {
    // Root can never be targeted
    return
  }
  if (normId === 'nadia') {
    deactivateNadia()
    return
  }
  if (normId === 'imran') {
    imranProfile.status = 'Deactivated'
    return
  }
  const custom = extraAdminAccounts.find((a) => a.id.toLowerCase() === normId)
  if (custom) {
    custom.status = 'Deactivated'
    saveExtraAdminAccounts([...extraAdminAccounts])
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
  saveExtraAdminAccounts([...extraAdminAccounts, newAccount])
  return newAccount
}

export function resetSuperAdminState(): void {
  nadiaProfile = { ...CANONICAL_NADIA_PROFILE }
  imranProfile = { ...CANONICAL_IMRAN_PROFILE }
  extraAdminAccounts = []
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage?.removeItem(SESSION_STORAGE_KEY)
    } catch {}
  }
}

if (typeof window !== 'undefined') {
  const win = window as unknown as {
    __auratioResetSuperAdmin?: () => void
    __getNadiaAdminAccount?: () => NadiaProfileState
    __getImranAdminAccount?: () => NadiaProfileState
    __updateNadiaAdminAccount?: (updates: { displayName?: string; email?: string }) => void
    __inviteAdminAccount?: (params: { fullName: string; email: string }) => SuperAdminAccountItem
    __getAdminAccountsList?: () => SuperAdminAccountItem[]
    __getAdminAccountById?: (id: string) => SuperAdminAccountItem | undefined
    __updateAdminAccount?: (id: string, updates: { displayName?: string; email?: string }) => void
    __deactivateAdminAccount?: (id: string) => void
  }
  win.__auratioResetSuperAdmin = resetSuperAdminState
  win.__getNadiaAdminAccount = getNadiaAdminAccount
  win.__getImranAdminAccount = getImranAdminAccount
  win.__updateNadiaAdminAccount = updateNadiaAdminAccount
  win.__inviteAdminAccount = inviteAdminAccount
  win.__getAdminAccountsList = getAdminAccountsList
  win.__getAdminAccountById = getAdminAccountById
  win.__updateAdminAccount = updateAdminAccount
  win.__deactivateAdminAccount = deactivateAdminAccount
}
