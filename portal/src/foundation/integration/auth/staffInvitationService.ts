import { getPortalSupabaseClient } from '../supabaseClient'

export type StaffInvitationRole = 'admin' | 'volunteer'

export class StaffInvitationError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'StaffInvitationError'
    this.code = code
  }
}

export interface CreateStaffInvitationInput {
  email: string
  displayName: string
  targetRole: StaffInvitationRole
  trackIds: string[]
}

export async function createStaffInvitation(
  input: CreateStaffInvitationInput,
): Promise<void> {
  const email = input.email.trim().toLowerCase()
  const displayName = input.displayName.trim()

  if (!email || !email.includes('@')) {
    throw new StaffInvitationError('invalid_email', 'Enter a valid email address.')
  }
  if (displayName.length < 2 || displayName.length > 80) {
    throw new StaffInvitationError(
      'invalid_display_name',
      'Display name must be between 2 and 80 characters.',
    )
  }
  if (input.targetRole === 'volunteer' && input.trackIds.length < 1) {
    throw new StaffInvitationError(
      'tracks_required',
      'Select at least one Volunteer Track.',
    )
  }
  if (input.targetRole === 'admin' && input.trackIds.length !== 0) {
    throw new StaffInvitationError(
      'admin_tracks_invalid',
      'Admin invitations cannot include Volunteer Tracks.',
    )
  }

  const client = getPortalSupabaseClient()
  const { data, error } = await client.functions.invoke('staff-admin', {
    body: {
      action: 'create_invitation',
      email,
      display_name: displayName,
      target_role: input.targetRole,
      track_ids: input.trackIds,
    },
  })

  if (error || !data?.ok || data?.email_sent !== true) {
    throw new StaffInvitationError(
      'invitation_send_failed',
      'Unable to send the staff invitation email.',
    )
  }
}

export async function acceptStaffInvitation(
  token: string,
): Promise<StaffInvitationRole> {
  const normalized = token.trim().toLowerCase()
  if (!/^[0-9a-f]{64}$/.test(normalized)) {
    throw new StaffInvitationError(
      'invalid_invitation_token',
      'This invitation link is invalid.',
    )
  }

  const client = getPortalSupabaseClient()
  const {
    data: { session },
    error: sessionError,
  } = await client.auth.getSession()

  if (sessionError || !session) {
    throw new StaffInvitationError(
      'invitation_session_missing',
      'Open the secure invitation link from the email to continue.',
    )
  }

  const { data, error } = await client.functions.invoke(
    'staff-accept-invitation',
    { body: { token: normalized } },
  )

  if (error || data?.ok !== true) {
    throw new StaffInvitationError(
      'invitation_accept_failed',
      'This invitation could not be accepted. It may be expired or no longer valid.',
    )
  }

  if (data.role !== 'admin' && data.role !== 'volunteer') {
    throw new StaffInvitationError(
      'invitation_role_invalid',
      'The accepted invitation returned an invalid portal role.',
    )
  }

  return data.role
}

export async function setAcceptedStaffPassword(password: string): Promise<void> {
  if (password.length < 8) {
    throw new StaffInvitationError(
      'password_too_short',
      'Use at least 8 characters.',
    )
  }

  const client = getPortalSupabaseClient()
  const { error } = await client.auth.updateUser({ password })
  if (error) {
    throw new StaffInvitationError(
      'password_update_failed',
      'Unable to set the portal password.',
    )
  }
}
