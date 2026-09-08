import { getPortalSupabaseClient } from '../../../foundation/integration/supabaseClient'

export type PersistedAssignmentStatus = 'Assigned' | 'Accepted' | 'In Evaluation'

export interface PersistedVolunteerAssignment {
  assignmentId: string
  requestId: string
  evaluationVersionId: string
  submissionId: string
  submissionRef: string
  trackId: string
  track: string
  assignmentStatus: PersistedAssignmentStatus
  publicationStatus: 'Processing'
  versionNumber: number
  versionStatus: 'draft' | 'reopened'
}

export class PersistedVolunteerLifecycleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PersistedVolunteerLifecycleError'
  }
}

type RecordLike = Record<string, unknown>

const activeAssignmentStatuses = ['assigned', 'accepted', 'in_evaluation'] as const

function asObject(value: unknown): RecordLike | null {
  if (Array.isArray(value)) {
    const first = value[0]
    return first && typeof first === 'object' ? (first as RecordLike) : null
  }
  return value && typeof value === 'object' ? (value as RecordLike) : null
}

function requireString(row: RecordLike, key: string): string {
  const value = row[key]
  if (typeof value !== 'string' || value.length === 0) {
    throw new PersistedVolunteerLifecycleError(`Persisted assignment payload is missing ${key}.`)
  }
  return value
}

function assignmentLabel(status: string): PersistedAssignmentStatus {
  switch (status) {
    case 'assigned':
      return 'Assigned'
    case 'accepted':
      return 'Accepted'
    case 'in_evaluation':
      return 'In Evaluation'
    default:
      throw new PersistedVolunteerLifecycleError(`Unexpected active assignment status: ${status}`)
  }
}

function assertRequestCoherence(assignmentStatus: string, requestStatus: string): void {
  const expected = new Map<string, string>([
    ['assigned', 'assigned'],
    ['accepted', 'accepted'],
    ['in_evaluation', 'in_evaluation'],
  ])

  if (expected.get(assignmentStatus) !== requestStatus) {
    throw new PersistedVolunteerLifecycleError(
      `Persisted Human lifecycle is incoherent: assignment=${assignmentStatus}, request=${requestStatus}.`,
    )
  }
}

export function formatPersistedSubmissionRef(submissionId: string): string {
  const compact = submissionId.replace(/-/g, '').slice(0, 8).toUpperCase()
  return `SUB-${compact}`
}

function parseAssignment(row: RecordLike): PersistedVolunteerAssignment {
  const request = asObject(row.evaluation_requests)
  const version = asObject(row.evaluation_versions)
  if (!request || !version) {
    throw new PersistedVolunteerLifecycleError('Persisted assignment relationships are incomplete.')
  }

  const submission = asObject(request.submissions)
  if (!submission) {
    throw new PersistedVolunteerLifecycleError('Persisted submission relationship is missing.')
  }

  const track = asObject(submission.tracks)
  if (!track) {
    throw new PersistedVolunteerLifecycleError('Persisted track relationship is missing.')
  }

  const rawAssignmentStatus = requireString(row, 'status')
  const requestStatus = requireString(request, 'status')
  const effectiveMode = requireString(request, 'mode')
  const versionStatus = requireString(version, 'status')
  const versionNumber = version.version_number

  if (effectiveMode !== 'human') {
    throw new PersistedVolunteerLifecycleError('Volunteer workspace received a non-Human request.')
  }
  if (versionStatus !== 'draft' && versionStatus !== 'reopened') {
    throw new PersistedVolunteerLifecycleError(
      `Active assignment points at a non-editable evaluator version: ${versionStatus}.`,
    )
  }
  if (typeof versionNumber !== 'number' || !Number.isInteger(versionNumber)) {
    throw new PersistedVolunteerLifecycleError('Persisted evaluator version number is invalid.')
  }

  assertRequestCoherence(rawAssignmentStatus, requestStatus)

  const submissionId = requireString(submission, 'id')

  return {
    assignmentId: requireString(row, 'id'),
    requestId: requireString(row, 'request_id'),
    evaluationVersionId: requireString(row, 'evaluation_version_id'),
    submissionId,
    submissionRef: formatPersistedSubmissionRef(submissionId),
    trackId: requireString(submission, 'track_id'),
    track: requireString(track, 'name'),
    assignmentStatus: assignmentLabel(rawAssignmentStatus),
    publicationStatus: 'Processing',
    versionNumber,
    versionStatus,
  }
}

export async function loadPersistedVolunteerAssignments(): Promise<PersistedVolunteerAssignment[]> {
  const client = getPortalSupabaseClient()
  const { data, error } = await client
    .from('human_assignments')
    .select(`
      id,
      request_id,
      evaluation_version_id,
      status,
      assigned_at,
      evaluation_requests!inner(
        id,
        submission_id,
        status,
        mode,
        submissions!inner(
          id,
          track_id,
          tracks!inner(id,name)
        )
      ),
      evaluation_versions!inner(
        id,
        version_number,
        status
      )
    `)
    .in('status', [...activeAssignmentStatuses])
    .order('assigned_at', { ascending: false })

  if (error) {
    throw new PersistedVolunteerLifecycleError('Unable to load persisted Volunteer assignments.')
  }

  if (!Array.isArray(data)) return []
  return data.map((row) => parseAssignment(row as RecordLike))
}

export async function loadPersistedVolunteerAssignment(
  submissionId: string,
): Promise<PersistedVolunteerAssignment | null> {
  const assignments = await loadPersistedVolunteerAssignments()
  return assignments.find((assignment) => assignment.submissionId === submissionId) ?? null
}

export async function loadPersistedVolunteerAssignmentByRequestId(
  requestId: string,
): Promise<PersistedVolunteerAssignment | null> {
  const assignments = await loadPersistedVolunteerAssignments()
  return assignments.find((assignment) => assignment.requestId === requestId) ?? null
}

async function invokeVolunteerMutation(
  body: Record<string, unknown>,
): Promise<RecordLike | null> {
  const client = getPortalSupabaseClient()
  const { data, error } = await client.functions.invoke('human-volunteer', { body })

  if (error) {
    throw new PersistedVolunteerLifecycleError(error.message || 'Volunteer operation was rejected.')
  }

  return asObject(data)
}

export async function acceptPersistedVolunteerAssignment(
  requestId: string,
): Promise<PersistedVolunteerAssignment> {
  await invokeVolunteerMutation({ action: 'accept', request_id: requestId })
  const assignment = await loadPersistedVolunteerAssignmentByRequestId(requestId)
  if (!assignment || assignment.assignmentStatus !== 'Accepted') {
    throw new PersistedVolunteerLifecycleError('Accepted assignment did not persist coherently.')
  }
  return assignment
}

export async function beginPersistedVolunteerEvaluation(
  requestId: string,
): Promise<PersistedVolunteerAssignment> {
  await invokeVolunteerMutation({ action: 'begin', request_id: requestId })
  const assignment = await loadPersistedVolunteerAssignmentByRequestId(requestId)
  if (!assignment || assignment.assignmentStatus !== 'In Evaluation') {
    throw new PersistedVolunteerLifecycleError('Evaluation start did not persist coherently.')
  }
  return assignment
}

export async function declinePersistedVolunteerAssignment(
  requestId: string,
  reason: string,
): Promise<void> {
  const trimmed = reason.trim()
  if (!trimmed) {
    throw new PersistedVolunteerLifecycleError('A decline reason is required.')
  }

  await invokeVolunteerMutation({
    action: 'decline',
    request_id: requestId,
    reason: trimmed,
  })

  const assignment = await loadPersistedVolunteerAssignmentByRequestId(requestId)
  if (assignment) {
    throw new PersistedVolunteerLifecycleError('Declined assignment still has active Volunteer ownership.')
  }
}

export async function returnPersistedVolunteerAssignment(
  requestId: string,
  reason: string,
): Promise<void> {
  const trimmed = reason.trim()
  if (!trimmed) {
    throw new PersistedVolunteerLifecycleError('A return reason is required.')
  }

  await invokeVolunteerMutation({
    action: 'return',
    request_id: requestId,
    reason: trimmed,
  })

  const assignment = await loadPersistedVolunteerAssignmentByRequestId(requestId)
  if (assignment) {
    throw new PersistedVolunteerLifecycleError('Returned assignment still has active Volunteer ownership.')
  }
}
