import { getPortalSupabaseClient } from '../../../foundation/integration/supabaseClient'

export type PersistedSuperAdminAccountKind = 'profile' | 'invitation'

export interface PersistedSuperAdminAccount {
  id: string
  kind: PersistedSuperAdminAccountKind
  displayName: string
  email: string
  accountType: 'Super Admin' | 'Admin'
  status: 'Active' | 'Deactivated' | 'Invited'
  isRoot: boolean
  createdAt: string | null
}

export class PersistedSuperAdminLifecycleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PersistedSuperAdminLifecycleError'
  }
}

function parseAccount(raw: unknown): PersistedSuperAdminAccount {
  if (!raw || typeof raw !== 'object') {
    throw new PersistedSuperAdminLifecycleError('Invalid staff-account response.')
  }

  const row = raw as Record<string, unknown>
  const id = typeof row.id === 'string' ? row.id : ''
  const kind = row.kind
  const displayName =
    typeof row.display_name === 'string' ? row.display_name.trim() : ''
  const email = typeof row.email === 'string' ? row.email.trim() : ''
  const accountType = row.account_type
  const status = row.status
  const isRoot = row.is_root === true
  const createdAt = typeof row.created_at === 'string' ? row.created_at : null

  if (
    !id ||
    (kind !== 'profile' && kind !== 'invitation') ||
    !displayName ||
    !email ||
    (accountType !== 'Admin' && accountType !== 'Super Admin') ||
    (status !== 'Active' && status !== 'Deactivated' && status !== 'Invited')
  ) {
    throw new PersistedSuperAdminLifecycleError('Invalid staff-account response.')
  }

  return {
    id,
    kind,
    displayName,
    email,
    accountType,
    status,
    isRoot,
    createdAt,
  }
}

async function invokeStaffAdmin(
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const client = getPortalSupabaseClient()
  const { data, error } = await client.functions.invoke('staff-admin', { body })

  if (error || !data || typeof data !== 'object') {
    throw new PersistedSuperAdminLifecycleError(
      'Staff account service is unavailable.',
    )
  }

  return data as Record<string, unknown>
}

export async function listPersistedAdminAccounts(): Promise<
  PersistedSuperAdminAccount[]
> {
  const data = await invokeStaffAdmin({ action: 'list_admin_accounts' })
  if (data.ok !== true || !Array.isArray(data.accounts)) {
    throw new PersistedSuperAdminLifecycleError(
      'Unable to load persisted Admin accounts.',
    )
  }

  return data.accounts.map(parseAccount)
}

export async function getPersistedAdminAccount(
  accountId: string,
): Promise<PersistedSuperAdminAccount | null> {
  const normalized = accountId.trim()
  if (!normalized) return null

  const data = await invokeStaffAdmin({
    action: 'get_admin_account',
    account_id: normalized,
  })

  if (data.ok !== true) {
    if (data.error === 'account_not_found') return null
    throw new PersistedSuperAdminLifecycleError(
      'Unable to load the persisted Admin account.',
    )
  }

  return parseAccount(data.account)
}

export async function updatePersistedAdminDisplayName(
  accountId: string,
  displayName: string,
): Promise<void> {
  const normalizedId = accountId.trim()
  const normalizedName = displayName.trim()

  if (!normalizedId) {
    throw new PersistedSuperAdminLifecycleError('Admin account ID is required.')
  }
  if (normalizedName.length < 2 || normalizedName.length > 80) {
    throw new PersistedSuperAdminLifecycleError(
      'Display name must be between 2 and 80 characters.',
    )
  }

  const data = await invokeStaffAdmin({
    action: 'update_admin_display_name',
    account_id: normalizedId,
    display_name: normalizedName,
  })

  if (data.ok !== true) {
    throw new PersistedSuperAdminLifecycleError(
      'Unable to update the Admin display name.',
    )
  }
}

export async function deactivatePersistedAdminAccount(
  account: PersistedSuperAdminAccount,
): Promise<void> {
  if (account.isRoot) {
    throw new PersistedSuperAdminLifecycleError(
      'The protected root account cannot be deactivated.',
    )
  }

  const body =
    account.kind === 'invitation'
      ? {
          action: 'revoke_invitation',
          invitation_id: account.id.replace(/^invite_/, ''),
        }
      : {
          action: 'set_account_status',
          user_id: account.id,
          status: 'disabled',
        }

  const data = await invokeStaffAdmin(body)
  if (data.ok !== true) {
    throw new PersistedSuperAdminLifecycleError(
      account.kind === 'invitation'
        ? 'Unable to revoke the pending Admin invitation.'
        : 'Unable to deactivate the Admin account.',
    )
  }
}
