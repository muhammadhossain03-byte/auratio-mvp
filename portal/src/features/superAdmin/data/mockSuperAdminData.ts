import { portalRoutePaths } from '../../../app/routes/routePaths'

export interface SuperAdminAccountItem {
  id: string
  name: string
  email: string
  accountType: 'Super Admin' | 'Admin'
  status: 'Active' | 'Deactivated'
  protection: string
  isRoot: boolean
  actionLabel: 'View' | 'Open'
  destinationPath: string
}

let nadiaDeactivated = false

export function isNadiaDeactivated(): boolean {
  return nadiaDeactivated
}

export function deactivateNadia(): void {
  nadiaDeactivated = true
}

export function resetSuperAdminState(): void {
  nadiaDeactivated = false
}

if (typeof window !== 'undefined') {
  ;(window as unknown as { __auratioResetSuperAdmin?: () => void }).__auratioResetSuperAdmin = resetSuperAdminState
}

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
      name: 'Nadia Rahman',
      email: 'nadia@auratio.org',
      accountType: 'Admin',
      status: nadiaDeactivated ? 'Deactivated' : 'Active',
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
  ]
}
