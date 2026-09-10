import { getPortalSupabaseClient } from '../../../foundation/integration/supabaseClient'

export const BANGLADESH_DIVISIONS = [
  'Barishal',
  'Chattogram',
  'Dhaka',
  'Khulna',
  'Mymensingh',
  'Rajshahi',
  'Rangpur',
  'Sylhet',
] as const

export type BangladeshDivision = (typeof BANGLADESH_DIVISIONS)[number]

export const VALID_PATH_IDS = [
  'public-speaking',
  'professional-presenting',
  'content-creation',
] as const

export type PersistedEventPathId = (typeof VALID_PATH_IDS)[number]

export type PersistedEventStatus = 'draft' | 'published' | 'cancelled'

export interface PersistedAdminEventPaths {
  publicSpeaking: boolean
  professionalPresenting: boolean
  contentCreation: boolean
}

export interface PersistedAdminEvent {
  id: string
  title: string
  description: string | null
  countryCode: string
  division: BangladeshDivision
  organizer: string | null
  startsAt: string
  status: PersistedEventStatus
  paths: PersistedAdminEventPaths
  city?: string | null
  venue?: string | null
  registrationUrl?: string | null
  endsAt?: string | null
  relevantPaths: string
}

export interface PersistedEventInput {
  title: string
  division: BangladeshDivision
  startsAt: string
  organizer?: string | null
  description?: string | null
  paths: PersistedAdminEventPaths | PersistedEventPathId[]
  city?: string | null
  venue?: string | null
  registrationUrl?: string | null
  endsAt?: string | null
}

export function extractPathIds(
  paths: PersistedAdminEventPaths | PersistedEventPathId[],
): PersistedEventPathId[] {
  if (Array.isArray(paths)) {
    return paths.filter((p): p is PersistedEventPathId =>
      VALID_PATH_IDS.includes(p as PersistedEventPathId),
    )
  }
  const result: PersistedEventPathId[] = []
  if (paths.publicSpeaking) result.push('public-speaking')
  if (paths.professionalPresenting) result.push('professional-presenting')
  if (paths.contentCreation) result.push('content-creation')
  return result
}

export function formatEventStatus(status: PersistedEventStatus): string {
  switch (status) {
    case 'draft':
      return 'Draft'
    case 'published':
      return 'Published'
    case 'cancelled':
      return 'Cancelled'
    default:
      return status
  }
}

export function formatDateTimeLocal(isoOrDate: string | Date | null | undefined): string {
  if (!isoOrDate) return ''
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => n.toString().padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const min = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

export function formatDisplayDate(isoOrDate: string | Date | null | undefined): string {
  if (!isoOrDate) return 'Upcoming date'
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  if (isNaN(d.getTime())) return 'Upcoming date'
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function mapDbEventToPersistedEvent(row: Record<string, unknown>): PersistedAdminEvent {
  const rawPaths = Array.isArray(row.event_paths)
    ? (row.event_paths as Array<{ path_id: string }>)
    : []
  const pathIds = rawPaths.map((p) => p.path_id)

  const paths: PersistedAdminEventPaths = {
    publicSpeaking: pathIds.includes('public-speaking'),
    professionalPresenting: pathIds.includes('professional-presenting'),
    contentCreation: pathIds.includes('content-creation'),
  }

  const pathLabels: string[] = []
  if (paths.publicSpeaking) pathLabels.push('Public Speaking')
  if (paths.professionalPresenting) pathLabels.push('Professional Presenting')
  if (paths.contentCreation) pathLabels.push('Content Creation')
  const relevantPaths = pathLabels.join(', ') || 'None selected'

  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    description: typeof row.description === 'string' ? row.description : null,
    countryCode: String(row.country_code ?? 'BD'),
    division: (row.division as BangladeshDivision) ?? 'Dhaka',
    city: typeof row.city === 'string' ? row.city : null,
    venue: typeof row.venue === 'string' ? row.venue : null,
    organizer: typeof row.organizer === 'string' ? row.organizer : null,
    registrationUrl: typeof row.registration_url === 'string' ? row.registration_url : null,
    startsAt: String(row.starts_at ?? ''),
    endsAt: typeof row.ends_at === 'string' ? row.ends_at : null,
    status: (row.status as PersistedEventStatus) ?? 'draft',
    paths,
    relevantPaths,
  }
}

export async function listPersistedAdminEvents(): Promise<PersistedAdminEvent[]> {
  const client = getPortalSupabaseClient()
  const { data, error } = await client
    .from('events')
    .select(`
      id,
      title,
      description,
      country_code,
      division,
      city,
      venue,
      organizer,
      registration_url,
      starts_at,
      ends_at,
      status,
      created_by,
      updated_by,
      created_at,
      updated_at,
      event_paths (
        path_id
      )
    `)
    .order('starts_at', { ascending: false })

  if (error) {
    throw new Error(`Unable to load events: ${error.message}`)
  }

  return ((data as unknown as Array<Record<string, unknown>>) || []).map(mapDbEventToPersistedEvent)
}

export async function getPersistedAdminEvent(eventId: string): Promise<PersistedAdminEvent | null> {
  if (!eventId) return null
  const client = getPortalSupabaseClient()
  const { data, error } = await client
    .from('events')
    .select(`
      id,
      title,
      description,
      country_code,
      division,
      city,
      venue,
      organizer,
      registration_url,
      starts_at,
      ends_at,
      status,
      created_by,
      updated_by,
      created_at,
      updated_at,
      event_paths (
        path_id
      )
    `)
    .eq('id', eventId)
    .maybeSingle()

  if (error) {
    throw new Error(`Unable to fetch event: ${error.message}`)
  }
  if (!data) return null

  return mapDbEventToPersistedEvent(data as unknown as Record<string, unknown>)
}

export async function createPersistedAdminEvent(
  input: PersistedEventInput,
  status: PersistedEventStatus = 'draft',
): Promise<PersistedAdminEvent> {
  const client = getPortalSupabaseClient()
  const { data: userData, error: authError } = await client.auth.getUser()
  if (authError || !userData?.user?.id) {
    throw new Error('Authentication required to create event.')
  }
  const currentUserId = userData.user.id

  const trimmedTitle = input.title.trim()
  if (!trimmedTitle) {
    throw new Error('Event title is required.')
  }

  if (!input.division || !BANGLADESH_DIVISIONS.includes(input.division)) {
    throw new Error('Valid Bangladesh Division is required.')
  }

  const startsAtDate = new Date(input.startsAt)
  if (isNaN(startsAtDate.getTime())) {
    throw new Error('Valid date/time is required.')
  }

  const selectedPathIds = extractPathIds(input.paths)
  if (selectedPathIds.length === 0) {
    throw new Error('At least one Auratio Path is required.')
  }

  const trimmedDescription = input.description?.trim() ? input.description.trim() : null
  const trimmedOrganizer = input.organizer?.trim() ? input.organizer.trim() : null
  const trimmedCity = input.city?.trim() ? input.city.trim() : null
  const trimmedVenue = input.venue?.trim() ? input.venue.trim() : null
  const trimmedRegistrationUrl = input.registrationUrl?.trim() ? input.registrationUrl.trim() : null
  const endsAtIso = input.endsAt && !isNaN(new Date(input.endsAt).getTime())
    ? new Date(input.endsAt).toISOString()
    : null

  const eventPayload = {
    title: trimmedTitle,
    description: trimmedDescription,
    country_code: 'BD',
    division: input.division,
    city: trimmedCity,
    venue: trimmedVenue,
    organizer: trimmedOrganizer,
    registration_url: trimmedRegistrationUrl,
    starts_at: startsAtDate.toISOString(),
    ends_at: endsAtIso,
    status,
    created_by: currentUserId,
    updated_by: currentUserId,
  }

  const { data: createdEvent, error: insertError } = await client
    .from('events')
    .insert(eventPayload)
    .select()
    .single()

  if (insertError || !createdEvent) {
    throw new Error(`Unable to create event: ${insertError?.message || 'Unknown error'}`)
  }

  const eventId = (createdEvent as Record<string, unknown>).id as string

  const pathInserts = selectedPathIds.map((pathId) => ({
    event_id: eventId,
    path_id: pathId,
  }))

  const { error: pathsError } = await client.from('event_paths').insert(pathInserts)
  if (pathsError) {
    try {
      await client.from('events').delete().eq('id', eventId)
    } catch {
      // rollback best-effort
    }
    throw new Error(`Unable to save event paths: ${pathsError.message}`)
  }

  return mapDbEventToPersistedEvent({
    ...(createdEvent as Record<string, unknown>),
    event_paths: pathInserts.map((p) => ({ path_id: p.path_id })),
  })
}

export async function updatePersistedAdminEvent(
  eventId: string,
  input: PersistedEventInput,
  status?: PersistedEventStatus,
): Promise<PersistedAdminEvent> {
  if (!eventId) {
    throw new Error('Event ID is required for update.')
  }

  const client = getPortalSupabaseClient()
  const { data: userData, error: authError } = await client.auth.getUser()
  if (authError || !userData?.user?.id) {
    throw new Error('Authentication required to update event.')
  }
  const currentUserId = userData.user.id

  const trimmedTitle = input.title.trim()
  if (!trimmedTitle) {
    throw new Error('Event title is required.')
  }

  if (!input.division || !BANGLADESH_DIVISIONS.includes(input.division)) {
    throw new Error('Valid Bangladesh Division is required.')
  }

  const startsAtDate = new Date(input.startsAt)
  if (isNaN(startsAtDate.getTime())) {
    throw new Error('Valid date/time is required.')
  }

  const selectedPathIds = extractPathIds(input.paths)
  if (selectedPathIds.length === 0) {
    throw new Error('At least one Auratio Path is required.')
  }

  const trimmedDescription = input.description?.trim() ? input.description.trim() : null
  const trimmedOrganizer = input.organizer?.trim() ? input.organizer.trim() : null
  const trimmedCity = input.city?.trim() ? input.city.trim() : null
  const trimmedVenue = input.venue?.trim() ? input.venue.trim() : null
  const trimmedRegistrationUrl = input.registrationUrl?.trim() ? input.registrationUrl.trim() : null
  const endsAtIso = input.endsAt && !isNaN(new Date(input.endsAt).getTime())
    ? new Date(input.endsAt).toISOString()
    : null

  const updatePayload: Record<string, unknown> = {
    title: trimmedTitle,
    description: trimmedDescription,
    country_code: 'BD',
    division: input.division,
    city: trimmedCity,
    venue: trimmedVenue,
    organizer: trimmedOrganizer,
    registration_url: trimmedRegistrationUrl,
    starts_at: startsAtDate.toISOString(),
    ends_at: endsAtIso,
    updated_by: currentUserId,
  }

  if (status) {
    updatePayload.status = status
  }

  const { data: updatedEvent, error: updateError } = await client
    .from('events')
    .update(updatePayload)
    .eq('id', eventId)
    .select()
    .single()

  if (updateError || !updatedEvent) {
    throw new Error(`Unable to update event: ${updateError?.message || 'Unknown error'}`)
  }

  const { error: deletePathsError } = await client
    .from('event_paths')
    .delete()
    .eq('event_id', eventId)

  if (deletePathsError) {
    throw new Error(`Unable to update event paths: ${deletePathsError.message}`)
  }

  const pathInserts = selectedPathIds.map((pathId) => ({
    event_id: eventId,
    path_id: pathId,
  }))

  const { error: insertPathsError } = await client.from('event_paths').insert(pathInserts)
  if (insertPathsError) {
    throw new Error(`Unable to insert updated event paths: ${insertPathsError.message}`)
  }

  return mapDbEventToPersistedEvent({
    ...(updatedEvent as Record<string, unknown>),
    event_paths: pathInserts.map((p) => ({ path_id: p.path_id })),
  })
}

export async function deletePersistedAdminEvent(eventId: string): Promise<void> {
  if (!eventId) {
    throw new Error('Event ID is required for deletion.')
  }

  const client = getPortalSupabaseClient()
  const { data: userData, error: authError } = await client.auth.getUser()
  if (authError || !userData?.user?.id) {
    throw new Error('Authentication required to delete event.')
  }

  const { error: pathsError } = await client
    .from('event_paths')
    .delete()
    .eq('event_id', eventId)

  if (pathsError) {
    throw new Error(`Unable to delete event paths: ${pathsError.message}`)
  }

  const { error: eventError } = await client
    .from('events')
    .delete()
    .eq('id', eventId)

  if (eventError) {
    throw new Error(`Unable to delete event: ${eventError.message}`)
  }
}
