import { getPortalSupabaseClient } from '../../../foundation/integration/supabaseClient'
import { formatPersistedSubmissionRef } from './persistedVolunteerLifecycle'

export type PersistedVolunteerPublicationStatus =
  | 'Processing'
  | 'Pending Moderation'
  | 'Approved'
  | 'Rejected'
  | 'Re-review Requested'

export interface PersistedVolunteerCompletedRecord {
  assignmentId: string
  requestId: string
  submissionId: string
  submissionRef: string
  trackId: string
  trackName: string
  versionId: string
  versionNumber: number
  versionStatus: 'submitted' | 'pending_moderation' | 'reopened' | 'approved' | 'rejected'
  currentRequestStatus: string
  publicationStatus: PersistedVolunteerPublicationStatus
  finalScore: number
  universalScore: number
  structuralScore: number
  trackScore: number
  overallSummary: string
  endedAt: string
}

export class PersistedVolunteerHistoryError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PersistedVolunteerHistoryError'
  }
}

type RecordLike = Record<string, unknown>

function requireString(row: RecordLike, key: string): string {
  const value = row[key]
  if (typeof value !== 'string' || value.length === 0) {
    throw new PersistedVolunteerHistoryError(`Persisted history payload is missing ${key}.`)
  }
  return value
}

function requireInteger(row: RecordLike, key: string): number {
  const value = row[key]
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (!Number.isInteger(parsed)) {
    throw new PersistedVolunteerHistoryError(`Persisted history payload has invalid ${key}.`)
  }
  return parsed
}

function parseVersionStatus(value: unknown): PersistedVolunteerCompletedRecord['versionStatus'] {
  if (
    value === 'submitted' ||
    value === 'pending_moderation' ||
    value === 'reopened' ||
    value === 'approved' ||
    value === 'rejected'
  ) return value
  throw new PersistedVolunteerHistoryError(`Unexpected completed evaluator version status: ${String(value)}`)
}

function publicationLabel(
  status: PersistedVolunteerCompletedRecord['versionStatus'],
): PersistedVolunteerPublicationStatus {
  if (status === 'pending_moderation') return 'Pending Moderation'
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  if (status === 'reopened') return 'Re-review Requested'
  return 'Processing'
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export async function loadPersistedVolunteerCompletedHistory(): Promise<PersistedVolunteerCompletedRecord[]> {
  const client = getPortalSupabaseClient()
  const { data: assignmentData, error: assignmentError } = await client
    .from('human_assignments')
    .select('id,request_id,evaluation_version_id,status,ended_at')
    .eq('status', 'completed')
    .order('ended_at', { ascending: false })

  if (assignmentError) {
    throw new PersistedVolunteerHistoryError('Unable to load persisted completed assignments.')
  }
  if (!Array.isArray(assignmentData) || assignmentData.length === 0) return []

  const assignments = assignmentData as unknown as RecordLike[]
  const requestIds = assignments.map((row) => requireString(row, 'request_id'))
  const versionIds = assignments.map((row) => requireString(row, 'evaluation_version_id'))

  const [
    { data: requestData, error: requestError },
    { data: versionData, error: versionError },
  ] = await Promise.all([
    client
      .from('evaluation_requests')
      .select('id,submission_id,mode,status')
      .in('id', requestIds),
    client
      .from('evaluation_versions')
      .select(
        'id,version_number,status,overall_summary,universal_score,structural_score,track_score,final_score',
      )
      .in('id', versionIds),
  ])

  if (requestError || versionError) {
    throw new PersistedVolunteerHistoryError('Unable to resolve completed evaluator versions.')
  }

  const requests = new Map<string, RecordLike>()
  const submissionIds: string[] = []
  for (const raw of Array.isArray(requestData) ? requestData : []) {
    const row = raw as unknown as RecordLike
    const requestId = requireString(row, 'id')
    if (requireString(row, 'mode') !== 'human') {
      throw new PersistedVolunteerHistoryError('Volunteer history received a non-Human request.')
    }
    requests.set(requestId, row)
    submissionIds.push(requireString(row, 'submission_id'))
  }

  const versions = new Map<string, RecordLike>()
  for (const raw of Array.isArray(versionData) ? versionData : []) {
    const row = raw as unknown as RecordLike
    versions.set(requireString(row, 'id'), row)
  }

  const { data: submissionData, error: submissionError } = await client
    .from('submissions')
    .select('id,track_id')
    .in('id', submissionIds)

  if (submissionError) {
    throw new PersistedVolunteerHistoryError('Unable to resolve completed submissions.')
  }

  const submissions = new Map<string, RecordLike>()
  const trackIds: string[] = []
  for (const raw of Array.isArray(submissionData) ? submissionData : []) {
    const row = raw as unknown as RecordLike
    submissions.set(requireString(row, 'id'), row)
    trackIds.push(requireString(row, 'track_id'))
  }

  const { data: trackData, error: trackError } = await client
    .from('tracks')
    .select('id,name')
    .in('id', trackIds)

  if (trackError) {
    throw new PersistedVolunteerHistoryError('Unable to resolve completed track names.')
  }

  const tracks = new Map<string, string>()
  for (const raw of Array.isArray(trackData) ? trackData : []) {
    const row = raw as unknown as RecordLike
    tracks.set(requireString(row, 'id'), requireString(row, 'name'))
  }

  return assignments.map((assignment) => {
    const requestId = requireString(assignment, 'request_id')
    const versionId = requireString(assignment, 'evaluation_version_id')
    const request = requests.get(requestId)
    const version = versions.get(versionId)
    if (!request || !version) {
      throw new PersistedVolunteerHistoryError('Completed assignment relationships are incomplete.')
    }

    const submissionId = requireString(request, 'submission_id')
    const submission = submissions.get(submissionId)
    if (!submission) {
      throw new PersistedVolunteerHistoryError('Completed submission relationship is missing.')
    }

    const trackId = requireString(submission, 'track_id')
    const trackName = tracks.get(trackId)
    if (!trackName) throw new PersistedVolunteerHistoryError(`Track ${trackId} is unavailable.`)

    const versionStatus = parseVersionStatus(version.status)

    return {
      assignmentId: requireString(assignment, 'id'),
      requestId,
      submissionId,
      submissionRef: formatPersistedSubmissionRef(submissionId),
      trackId,
      trackName,
      versionId,
      versionNumber: requireInteger(version, 'version_number'),
      versionStatus,
      currentRequestStatus: requireString(request, 'status'),
      publicationStatus: publicationLabel(versionStatus),
      finalScore: requireInteger(version, 'final_score'),
      universalScore: requireInteger(version, 'universal_score'),
      structuralScore: requireInteger(version, 'structural_score'),
      trackScore: requireInteger(version, 'track_score'),
      overallSummary: requireString(version, 'overall_summary'),
      endedAt: requireString(assignment, 'ended_at'),
    }
  })
}

export async function loadPersistedVolunteerCompletedRecord(
  submissionId: string,
  versionId?: string,
): Promise<PersistedVolunteerCompletedRecord | null> {
  if (!isUuid(submissionId)) return null
  if (versionId && !isUuid(versionId)) return null

  const history = await loadPersistedVolunteerCompletedHistory()
  return (
    history.find(
      (record) =>
        record.submissionId === submissionId &&
        (!versionId || record.versionId === versionId),
    ) ?? null
  )
}
