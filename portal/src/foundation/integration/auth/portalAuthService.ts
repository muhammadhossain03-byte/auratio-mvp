import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

import { getPortalSupabaseClient } from '../supabaseClient'
import {
  isActivePortalProfile,
  parsePortalProfile,
  type PortalProfile,
} from './portalAccess'

export class PortalAuthenticationError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'PortalAuthenticationError'
    this.code = code
  }
}

export interface PortalAuthenticatedSession {
  session: Session
  profile: PortalProfile
}

export function isTransientPortalAuthenticationError(error: unknown): boolean {
  return (
    error instanceof PortalAuthenticationError &&
    (error.code === 'profile_load_failed' || error.code === 'session_load_failed')
  )
}

export function isTerminalPortalAuthenticationError(error: unknown): boolean {
  return (
    error instanceof PortalAuthenticationError &&
    (error.code === 'profile_missing' || error.code === 'portal_access_denied')
  )
}

export async function loadPortalProfile(userId: string): Promise<PortalProfile> {
  const client = getPortalSupabaseClient()
  const { data, error } = await client
    .from('profiles')
    .select('user_id,display_name,role,account_status,is_root_super_admin')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw new PortalAuthenticationError('profile_load_failed', 'Unable to load portal access.')
  }
  if (!data) {
    throw new PortalAuthenticationError('profile_missing', 'Portal access is not provisioned.')
  }

  const profile = parsePortalProfile(data)
  if (!isActivePortalProfile(profile)) {
    throw new PortalAuthenticationError('portal_access_denied', 'This account cannot access the Auratio Portal.')
  }

  return profile
}

export async function signInPortal(
  email: string,
  password: string,
): Promise<PortalAuthenticatedSession> {
  const client = getPortalSupabaseClient()
  const { data, error } = await client.auth.signInWithPassword({ email, password })

  if (error || !data.session || !data.user) {
    throw new PortalAuthenticationError('sign_in_failed', 'Email or password was not accepted.')
  }

  try {
    const profile = await loadPortalProfile(data.user.id)
    return { session: data.session, profile }
  } catch (error) {
    await client.auth.signOut()
    throw error
  }
}

export async function currentPortalSession(): Promise<PortalAuthenticatedSession | null> {
  const client = getPortalSupabaseClient()
  const {
    data: { session },
    error,
  } = await client.auth.getSession()

  if (error) {
    throw new PortalAuthenticationError('session_load_failed', 'Unable to restore the portal session.')
  }
  if (!session) return null

  try {
    const profile = await loadPortalProfile(session.user.id)
    return { session, profile }
  } catch (error) {
    if (isTerminalPortalAuthenticationError(error)) {
      await client.auth.signOut()
    }
    throw error
  }
}

export async function signOutPortal(): Promise<void> {
  const client = getPortalSupabaseClient()
  const { error } = await client.auth.signOut()
  if (error) {
    throw new PortalAuthenticationError('sign_out_failed', 'Unable to sign out safely.')
  }
}

export function subscribeToPortalAuth(
  listener: (event: AuthChangeEvent, session: Session | null) => void,
): () => void {
  const client = getPortalSupabaseClient()
  const { data } = client.auth.onAuthStateChange(listener)
  return () => data.subscription.unsubscribe()
}
