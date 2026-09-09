import { getPortalSupabaseClient } from '../../../foundation/integration/supabaseClient'

export type PersistedAdminRequestedMode = 'ai' | 'human'
export type PersistedAdminHumanRequestStatus =
  | 'unassigned'
  | 'assigned'
  | 'accepted'
  | 'in_evaluation'
  | 'reopened'

export interface PersistedAdminVolunteerOption {
  userId: string
  displayName: string
}

export interface PersistedAdminHumanQueueItem {
  requestId: string
  requestRef: string
  submissionId: string
  submissionRef: string
  userId: string
  userName: string
  trackId: string
  trackName: string
  requestedMode: PersistedAdminRequestedMode
  effectiveMode: 'human'
  status: PersistedAdminHumanRequestStatus
  activeAssignmentId: string | null
  activeVersionId: string | null
  activeVolunteerUserId: string | null
  activeVolunteerName: string | null
  createdAt: string
}

export interface PersistedAdminHumanRequestContext extends PersistedAdminHumanQueueItem {
  versionId: string
  versionNumber: number
  versionStatus: 'draft'
  volunteers: PersistedAdminVolunteerOption[]
}

export class PersistedAdminHumanLifecycleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PersistedAdminHumanLifecycleError'
  }
}

type RecordLike = Record<string, unknown>

const queueStatuses = [
  'unassigned',
  'assigned',
  'accepted',
  'in_evaluation',
  'reopened',
] as const

const activeAssignmentStatuses = ['assigned', 'accepted', 'in_evaluation'] as const

function requireString(row: RecordLike, key: string): string {
  const value = row[key]
  if (typeof value !== 'string' || value.length === 0) {
    throw new PersistedAdminHumanLifecycleError(`Persisted Admin payload is missing ${key}.`)
  }
  return value
}

function requireInteger(row: RecordLike, key: string): number {
  const value = row[key]
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (!Number.isInteger(parsed)) {
    throw new PersistedAdminHumanLifecycleError(`Persisted Admin payload has invalid ${key}.`)
  }
  return parsed
}

function parseRequestedMode(value: unknown): PersistedAdminRequestedMode {
  if (value === 'ai' || value === 'human') return value
  throw new PersistedAdminHumanLifecycleError('Persisted requested evaluation method is invalid.')
}

function parseHumanStatus(value: unknown): PersistedAdminHumanRequestStatus {
  if (
    value === 'unassigned' ||
    value === 'assigned' ||
    value === 'accepted' ||
    value === 'in_evaluation' ||
    value === 'reopened'
  ) {
    return value
  }
  throw new PersistedAdminHumanLifecycleError(`Unexpected Human request status: ${String(value)}`)
}

function formatRequestRef(requestId: string): string {
  return `REQ-${requestId.replace(/-/g, '').slice(0, 8).toUpperCase()}`
}

function formatSubmissionRef(submissionId: string): string {
  return `SUB-${submissionId.replace(/-/g, '').slice(0, 8).toUpperCase()}`
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export async function loadPersistedAdminHumanQueue(): Promise<PersistedAdminHumanQueueItem[]> {
  const client = getPortalSupabaseClient()

  const { data: requestData, error: requestError } = await client
    .from('evaluation_requests')
    .select('id,submission_id,user_id,requested_mode,mode,status,created_at')
    .eq('mode', 'human')
    .in('status', [...queueStatuses])
    .order('created_at', { ascending: false })

  if (requestError) {
    throw new PersistedAdminHumanLifecycleError('Unable to load persisted Human request queue.')
  }
  if (!Array.isArray(requestData) || requestData.length === 0) return []

  const requestRows = requestData as unknown as RecordLike[]
  const requestIds = requestRows.map((row) => requireString(row, 'id'))
  const submissionIds = requestRows.map((row) => requireString(row, 'submission_id'))

  const [
    { data: submissionData, error: submissionError },
    { data: trackData, error: trackError },
    { data: profileData, error: profileError },
    { data: assignmentData, error: assignmentError },
  ] = await Promise.all([
    client
      .from('submissions')
      .select('id,track_id')
      .in('id', submissionIds),
    client
      .from('tracks')
      .select('id,name'),
    client
      .from('profiles')
      .select('user_id,display_name,role,account_status'),
    client
      .from('human_assignments')
      .select('id,request_id,evaluation_version_id,volunteer_user_id,status,assigned_at')
      .in('request_id', requestIds)
      .in('status', [...activeAssignmentStatuses]),
  ])

  if (submissionError || trackError || profileError || assignmentError) {
    throw new PersistedAdminHumanLifecycleError('Unable to resolve persisted Human request context.')
  }

  const submissions = new Map<string, RecordLike>()
  for (const raw of Array.isArray(submissionData) ? submissionData : []) {
    const row = raw as unknown as RecordLike
    submissions.set(requireString(row, 'id'), row)
  }

  const tracks = new Map<string, string>()
  for (const raw of Array.isArray(trackData) ? trackData : []) {
    const row = raw as unknown as RecordLike
    tracks.set(requireString(row, 'id'), requireString(row, 'name'))
  }

  const profiles = new Map<string, RecordLike>()
  for (const raw of Array.isArray(profileData) ? profileData : []) {
    const row = raw as unknown as RecordLike
    profiles.set(requireString(row, 'user_id'), row)
  }

  const activeAssignments = new Map<string, RecordLike>()
  for (const raw of Array.isArray(assignmentData) ? assignmentData : []) {
    const row = raw as unknown as RecordLike
    const requestId = requireString(row, 'request_id')
    if (activeAssignments.has(requestId)) {
      throw new PersistedAdminHumanLifecycleError(
        `Persisted Human request ${requestId} has more than one active Volunteer owner.`,
      )
    }
    activeAssignments.set(requestId, row)
  }

  return requestRows.map((request) => {
    const requestId = requireString(request, 'id')
    const submissionId = requireString(request, 'submission_id')
    const userId = requireString(request, 'user_id')
    const effectiveMode = requireString(request, 'mode')
    if (effectiveMode !== 'human') {
      throw new PersistedAdminHumanLifecycleError('Human Admin queue received a non-Human route.')
    }

    const submission = submissions.get(submissionId)
    const user = profiles.get(userId)
    if (!submission || !user) {
      throw new PersistedAdminHumanLifecycleError('Persisted request relationships are incomplete.')
    }

    const trackId = requireString(submission, 'track_id')
    const trackName = tracks.get(trackId)
    if (!trackName) {
      throw new PersistedAdminHumanLifecycleError(`Track ${trackId} is unavailable.`)
    }

    const assignment = activeAssignments.get(requestId) ?? null
    const status = parseHumanStatus(request.status)

    if (
      (status === 'assigned' || status === 'accepted' || status === 'in_evaluation') &&
      !assignment
    ) {
      throw new PersistedAdminHumanLifecycleError(
        `Persisted Human request ${requestId} is ${status} without an active Volunteer owner.`,
      )
    }
    if ((status === 'unassigned' || status === 'reopened') && assignment) {
      throw new PersistedAdminHumanLifecycleError(
        `Persisted Human request ${requestId} has active ownership while ${status}.`,
      )
    }

    const activeVolunteerUserId = assignment
      ? requireString(assignment, 'volunteer_user_id')
      : null
    const volunteerProfile = activeVolunteerUserId
      ? profiles.get(activeVolunteerUserId) ?? null
      : null

    return {
      requestId,
      requestRef: formatRequestRef(requestId),
      submissionId,
      submissionRef: formatSubmissionRef(submissionId),
      userId,
      userName: requireString(user, 'display_name'),
      trackId,
      trackName,
      requestedMode: parseRequestedMode(request.requested_mode),
      effectiveMode: 'human',
      status,
      activeAssignmentId: assignment ? requireString(assignment, 'id') : null,
      activeVersionId: assignment ? requireString(assignment, 'evaluation_version_id') : null,
      activeVolunteerUserId,
      activeVolunteerName: volunteerProfile
        ? requireString(volunteerProfile, 'display_name')
        : null,
      createdAt: requireString(request, 'created_at'),
    }
  })
}

export async function loadPersistedAdminHumanRequest(
  requestId: string,
): Promise<PersistedAdminHumanRequestContext | null> {
  if (!isUuid(requestId)) return null

  const queue = await loadPersistedAdminHumanQueue()
  const request = queue.find((item) => item.requestId === requestId) ?? null
  if (!request) return null

  const client = getPortalSupabaseClient()
  const [
    { data: versionData, error: versionError },
    { data: volunteerData, error: volunteerError },
    { data: eligibilityData, error: eligibilityError },
  ] = await Promise.all([
    client
      .from('evaluation_versions')
      .select('id,version_number,status')
      .eq('request_id', requestId)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle(),
    client
      .from('profiles')
      .select('user_id,display_name')
      .eq('role', 'volunteer')
      .eq('account_status', 'active')
      .order('display_name', { ascending: true }),
    client
      .from('volunteer_track_eligibility')
      .select('volunteer_user_id')
      .eq('track_id', request.trackId),
  ])

  if (versionError || !versionData) {
    throw new PersistedAdminHumanLifecycleError('Latest Human evaluator version is unavailable.')
  }
  if (volunteerError || eligibilityError) {
    throw new PersistedAdminHumanLifecycleError('Eligible active Volunteer list is unavailable.')
  }

  const eligibleVolunteerIds = new Set(
    (Array.isArray(eligibilityData) ? eligibilityData : []).map((raw) =>
      requireString(raw as unknown as RecordLike, 'volunteer_user_id'),
    ),
  )

  const version = versionData as unknown as RecordLike
  const versionId = requireString(version, 'id')
  const versionStatus = requireString(version, 'status')
  if (versionStatus !== 'draft') {
    throw new PersistedAdminHumanLifecycleError(
      `Pre-submission Human request points at non-editable version status ${versionStatus}.`,
    )
  }

  if (request.activeVersionId && request.activeVersionId !== versionId) {
    throw new PersistedAdminHumanLifecycleError(
      'Active assignment and latest Human evaluator version are incoherent.',
    )
  }

  const volunteers: PersistedAdminVolunteerOption[] = []
  for (const raw of Array.isArray(volunteerData) ? volunteerData : []) {
    const row = raw as unknown as RecordLike
    const userId = requireString(row, 'user_id')
    if (!eligibleVolunteerIds.has(userId)) continue
    volunteers.push({
      userId,
      displayName: requireString(row, 'display_name'),
    })
  }

  return {
    ...request,
    versionId,
    versionNumber: requireInteger(version, 'version_number'),
    versionStatus: 'draft',
    volunteers,
  }
}

async function invokeAdminHumanMutation(body: Record<string, unknown>): Promise<void> {
  const client = getPortalSupabaseClient()
  const { error } = await client.functions.invoke('human-admin', { body })
  if (error) {
    throw new PersistedAdminHumanLifecycleError(
      error.message || 'Admin Human lifecycle operation was rejected.',
    )
  }
}

export async function assignPersistedAdminHumanRequest(
  requestId: string,
  volunteerUserId: string,
): Promise<PersistedAdminHumanRequestContext> {
  if (!isUuid(volunteerUserId)) {
    throw new PersistedAdminHumanLifecycleError('Select a valid Volunteer.')
  }

  await invokeAdminHumanMutation({
    action: 'assign',
    request_id: requestId,
    volunteer_user_id: volunteerUserId,
  })

  const updated = await loadPersistedAdminHumanRequest(requestId)
  if (
    !updated ||
    updated.status !== 'assigned' ||
    updated.activeVolunteerUserId !== volunteerUserId
  ) {
    throw new PersistedAdminHumanLifecycleError(
      'Admin assignment did not persist coherently.',
    )
  }
  return updated
}

export async function reassignPersistedAdminHumanRequest(
  requestId: string,
  volunteerUserId: string,
  reason: string,
): Promise<PersistedAdminHumanRequestContext> {
  const why = reason.trim()
  if (!isUuid(volunteerUserId)) {
    throw new PersistedAdminHumanLifecycleError('Select a valid Volunteer.')
  }
  if (!why) {
    throw new PersistedAdminHumanLifecycleError('Reassignment reason is required.')
  }

  await invokeAdminHumanMutation({
    action: 'reassign',
    request_id: requestId,
    volunteer_user_id: volunteerUserId,
    reason: why,
  })

  const updated = await loadPersistedAdminHumanRequest(requestId)
  if (
    !updated ||
    updated.status !== 'assigned' ||
    updated.activeVolunteerUserId !== volunteerUserId
  ) {
    throw new PersistedAdminHumanLifecycleError(
      'Admin reassignment did not persist coherently.',
    )
  }
  return updated
}

export async function cancelPersistedAdminHumanRequest(
  requestId: string,
  reason: string,
): Promise<void> {
  const why = reason.trim()
  if (!why) {
    throw new PersistedAdminHumanLifecycleError('Cancellation reason is required.')
  }

  await invokeAdminHumanMutation({
    action: 'cancel',
    request_id: requestId,
    reason: why,
  })

  const remaining = await loadPersistedAdminHumanRequest(requestId)
  if (remaining) {
    throw new PersistedAdminHumanLifecycleError(
      'Cancelled Human request still appears in the active Admin queue.',
    )
  }
}
