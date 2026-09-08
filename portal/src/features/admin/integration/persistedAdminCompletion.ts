import { getPortalSupabaseClient } from '../../../foundation/integration/supabaseClient'
import {
  loadPersistedAdminHumanRequest,
  reassignPersistedAdminHumanRequest,
  type PersistedAdminHumanRequestContext,
  type PersistedAdminRequestedMode,
  type PersistedAdminVolunteerOption,
} from './persistedAdminHumanLifecycle'

export interface PersistedAdminModerationItem {
  requestId: string
  submissionId: string
  submissionRef: string
  trackId: string
  trackName: string
  requestedMode: PersistedAdminRequestedMode
  requestStatus: 'submitted' | 'pending_moderation'
  versionId: string
  versionNumber: number
  versionStatus: 'submitted' | 'pending_moderation'
  evaluatorUserId: string
  evaluatorName: string
  overallSummary: string
  universalScore: number
  structuralScore: number
  trackScore: number
  finalScore: number
  triggerCode: string
  triggerLabel: string
  baselineScore: number | null
}

export interface PersistedAdminEvaluationRecord {
  requestId: string
  submissionId: string
  submissionRef: string
  trackName: string
  requestedMode: PersistedAdminRequestedMode
  effectiveMode: 'ai' | 'human'
  requestStatus: string
  assignmentLabel: string
  publicationLabel: string
  finalScore: number | null
  destinationPath: string | null
}

export interface PersistedAdminDashboardMetrics {
  openRequests: number
  pendingModeration: number
  humanAssignments: number
  publishedEvents: number
  humanUnassigned: number
  humanActive: number
  aiProcessing: number
  approved: number
}

export class PersistedAdminModerationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PersistedAdminModerationError'
  }
}

type RecordLike = Record<string, unknown>

const activeAssignmentStatuses = ['assigned', 'accepted', 'in_evaluation'] as const
const moderationRequestStatuses = ['submitted', 'pending_moderation'] as const

function requireString(row: RecordLike, key: string): string {
  const value = row[key]
  if (typeof value !== 'string' || value.length === 0) {
    throw new PersistedAdminModerationError(`Persisted Admin payload is missing ${key}.`)
  }
  return value
}

function requireInteger(row: RecordLike, key: string): number {
  const value = row[key]
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (!Number.isInteger(parsed)) {
    throw new PersistedAdminModerationError(`Persisted Admin payload has invalid ${key}.`)
  }
  return parsed
}

function nullableNumber(row: RecordLike, key: string): number | null {
  const value = row[key]
  if (value === null || value === undefined) return null
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  return Number.isFinite(parsed) ? parsed : null
}

function parseRequestedMode(value: unknown): PersistedAdminRequestedMode {
  if (value === 'ai' || value === 'human') return value
  throw new PersistedAdminModerationError('Persisted requested evaluation method is invalid.')
}

function parseEffectiveMode(value: unknown): 'ai' | 'human' {
  if (value === 'ai' || value === 'human') return value
  throw new PersistedAdminModerationError('Persisted effective evaluation route is invalid.')
}

function parseModerationStatus(value: unknown): 'submitted' | 'pending_moderation' {
  if (value === 'submitted' || value === 'pending_moderation') return value
  throw new PersistedAdminModerationError(`Unexpected moderation status: ${String(value)}`)
}

function formatSubmissionRef(submissionId: string): string {
  return `SUB-${submissionId.replace(/-/g, '').slice(0, 8).toUpperCase()}`
}

function metadataObject(value: unknown): RecordLike {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as RecordLike)
    : {}
}

function moderationTriggerLabel(code: string): string {
  if (code === 'first_human_in_track') return 'First approved Human baseline required'
  if (code === 'score_anomaly_gt_15') {
    return 'Human score differs from latest approved Human baseline by more than 15 points'
  }
  return 'Human moderation review required'
}

function titleCaseStatus(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export async function loadPersistedAdminModerationQueue(): Promise<PersistedAdminModerationItem[]> {
  const client = getPortalSupabaseClient()
  const { data: requestData, error: requestError } = await client
    .from('evaluation_requests')
    .select('id,submission_id,requested_mode,mode,status,created_at')
    .eq('mode', 'human')
    .in('status', [...moderationRequestStatuses])
    .order('created_at', { ascending: false })

  if (requestError) {
    throw new PersistedAdminModerationError('Unable to load persisted moderation queue.')
  }
  if (!Array.isArray(requestData) || requestData.length === 0) return []

  const requests = requestData as unknown as RecordLike[]
  const requestIds = requests.map((row) => requireString(row, 'id'))
  const submissionIds = requests.map((row) => requireString(row, 'submission_id'))

  const [
    { data: submissionData, error: submissionError },
    { data: trackData, error: trackError },
    { data: versionData, error: versionError },
    { data: profileData, error: profileError },
    { data: auditData, error: auditError },
  ] = await Promise.all([
    client.from('submissions').select('id,track_id').in('id', submissionIds),
    client.from('tracks').select('id,name'),
    client
      .from('evaluation_versions')
      .select(
        'id,request_id,version_number,status,evaluator_user_id,overall_summary,universal_score,structural_score,track_score,final_score,submitted_at',
      )
      .in('request_id', requestIds)
      .in('status', [...moderationRequestStatuses]),
    client.from('profiles').select('user_id,display_name'),
    client
      .from('audit_log')
      .select('request_id,action,metadata,created_at')
      .in('request_id', requestIds)
      .eq('action', 'human.moderation_decision')
      .order('created_at', { ascending: false }),
  ])

  if (submissionError || trackError || versionError || profileError || auditError) {
    throw new PersistedAdminModerationError('Unable to resolve persisted moderation context.')
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

  const profiles = new Map<string, string>()
  for (const raw of Array.isArray(profileData) ? profileData : []) {
    const row = raw as unknown as RecordLike
    profiles.set(requireString(row, 'user_id'), requireString(row, 'display_name'))
  }

  const versions = new Map<string, RecordLike>()
  for (const raw of Array.isArray(versionData) ? versionData : []) {
    const row = raw as unknown as RecordLike
    const requestId = requireString(row, 'request_id')
    const current = versions.get(requestId)
    if (!current || requireInteger(row, 'version_number') > requireInteger(current, 'version_number')) {
      versions.set(requestId, row)
    }
  }

  const audits = new Map<string, RecordLike>()
  for (const raw of Array.isArray(auditData) ? auditData : []) {
    const row = raw as unknown as RecordLike
    const requestId = requireString(row, 'request_id')
    if (!audits.has(requestId)) audits.set(requestId, row)
  }

  return requests.map((request) => {
    const requestId = requireString(request, 'id')
    const submissionId = requireString(request, 'submission_id')
    const submission = submissions.get(submissionId)
    const version = versions.get(requestId)
    if (!submission || !version) {
      throw new PersistedAdminModerationError('Moderation request relationships are incomplete.')
    }

    const trackId = requireString(submission, 'track_id')
    const trackName = tracks.get(trackId)
    if (!trackName) throw new PersistedAdminModerationError(`Track ${trackId} is unavailable.`)

    const requestStatus = parseModerationStatus(request.status)
    const versionStatus = parseModerationStatus(version.status)
    if (requestStatus !== versionStatus) {
      throw new PersistedAdminModerationError(
        `Moderation request/version state is incoherent: ${requestStatus}/${versionStatus}.`,
      )
    }

    const evaluatorUserId = requireString(version, 'evaluator_user_id')
    const evaluatorName = profiles.get(evaluatorUserId)
    if (!evaluatorName) {
      throw new PersistedAdminModerationError('Submitted evaluator profile is unavailable.')
    }

    const audit = audits.get(requestId)
    const metadata = audit ? metadataObject(audit.metadata) : {}
    const triggerCode =
      typeof metadata.reason === 'string' ? metadata.reason : 'moderation_required'
    const baselineRaw = metadata.baseline_score
    const baselineScore =
      typeof baselineRaw === 'number'
        ? baselineRaw
        : typeof baselineRaw === 'string' && baselineRaw.trim() !== ''
          ? Number(baselineRaw)
          : null

    return {
      requestId,
      submissionId,
      submissionRef: formatSubmissionRef(submissionId),
      trackId,
      trackName,
      requestedMode: parseRequestedMode(request.requested_mode),
      requestStatus,
      versionId: requireString(version, 'id'),
      versionNumber: requireInteger(version, 'version_number'),
      versionStatus,
      evaluatorUserId,
      evaluatorName,
      overallSummary: requireString(version, 'overall_summary'),
      universalScore: requireInteger(version, 'universal_score'),
      structuralScore: requireInteger(version, 'structural_score'),
      trackScore: requireInteger(version, 'track_score'),
      finalScore: requireInteger(version, 'final_score'),
      triggerCode,
      triggerLabel: moderationTriggerLabel(triggerCode),
      baselineScore:
        baselineScore !== null && Number.isFinite(baselineScore) ? baselineScore : null,
    }
  })
}

export async function loadPersistedAdminModerationItem(
  submissionId: string,
): Promise<PersistedAdminModerationItem | null> {
  const queue = await loadPersistedAdminModerationQueue()
  return queue.find((item) => item.submissionId === submissionId) ?? null
}

export async function loadPersistedAdminActiveVolunteers(): Promise<PersistedAdminVolunteerOption[]> {
  const client = getPortalSupabaseClient()
  const { data, error } = await client
    .from('profiles')
    .select('user_id,display_name')
    .eq('role', 'volunteer')
    .eq('account_status', 'active')
    .order('display_name', { ascending: true })

  if (error) {
    throw new PersistedAdminModerationError('Active Volunteer list is unavailable.')
  }

  return (Array.isArray(data) ? data : []).map((raw) => {
    const row = raw as unknown as RecordLike
    return {
      userId: requireString(row, 'user_id'),
      displayName: requireString(row, 'display_name'),
    }
  })
}

async function invokeAdminMutation(body: Record<string, unknown>): Promise<void> {
  const client = getPortalSupabaseClient()
  const { error } = await client.functions.invoke('human-admin', { body })
  if (error) {
    throw new PersistedAdminModerationError(
      error.message || 'Admin moderation operation was rejected.',
    )
  }
}

async function verifyRequestStatus(requestId: string, expected: string): Promise<void> {
  const client = getPortalSupabaseClient()
  const { data, error } = await client
    .from('evaluation_requests')
    .select('status')
    .eq('id', requestId)
    .maybeSingle()

  if (error || !data) {
    throw new PersistedAdminModerationError('Unable to verify persisted moderation outcome.')
  }

  const row = data as unknown as RecordLike
  if (requireString(row, 'status') !== expected) {
    throw new PersistedAdminModerationError(
      `Moderation action did not persist expected ${expected} state.`,
    )
  }
}

export async function approvePersistedAdminModeration(requestId: string): Promise<void> {
  await invokeAdminMutation({ action: 'approve', request_id: requestId })
  await verifyRequestStatus(requestId, 'approved')
}

export async function rejectPersistedAdminModeration(
  requestId: string,
  reason: string,
): Promise<void> {
  const why = reason.trim()
  if (!why) throw new PersistedAdminModerationError('Rejection reason is required.')

  await invokeAdminMutation({
    action: 'reject',
    request_id: requestId,
    reason: why,
  })
  await verifyRequestStatus(requestId, 'rejected')
}

export async function reopenPersistedAdminModeration(
  requestId: string,
  reason: string,
): Promise<PersistedAdminHumanRequestContext> {
  const why = reason.trim()
  if (!why) throw new PersistedAdminModerationError('Re-review reason is required.')

  await invokeAdminMutation({
    action: 'reopen',
    request_id: requestId,
    reason: why,
  })
  await verifyRequestStatus(requestId, 'reopened')

  const reopened = await loadPersistedAdminHumanRequest(requestId)
  if (!reopened || reopened.status !== 'reopened') {
    throw new PersistedAdminModerationError(
      'Re-review draft did not become available for persisted assignment.',
    )
  }
  return reopened
}

export async function reassignPersistedAdminModeration(
  requestId: string,
  volunteerUserId: string,
  reason: string,
): Promise<PersistedAdminHumanRequestContext> {
  return reassignPersistedAdminHumanRequest(requestId, volunteerUserId, reason)
}

export async function loadPersistedAdminEvaluationRecords(): Promise<PersistedAdminEvaluationRecord[]> {
  const client = getPortalSupabaseClient()
  const { data: requestData, error: requestError } = await client
    .from('evaluation_requests')
    .select('id,submission_id,requested_mode,mode,status,created_at')
    .order('created_at', { ascending: false })

  if (requestError) {
    throw new PersistedAdminModerationError('Unable to load persisted evaluation records.')
  }
  if (!Array.isArray(requestData) || requestData.length === 0) return []

  const requests = requestData as unknown as RecordLike[]
  const requestIds = requests.map((row) => requireString(row, 'id'))
  const submissionIds = requests.map((row) => requireString(row, 'submission_id'))

  const [
    { data: submissionData, error: submissionError },
    { data: trackData, error: trackError },
    { data: versionData, error: versionError },
    { data: assignmentData, error: assignmentError },
  ] = await Promise.all([
    client.from('submissions').select('id,track_id').in('id', submissionIds),
    client.from('tracks').select('id,name'),
    client
      .from('evaluation_versions')
      .select('id,request_id,version_number,status,final_score')
      .in('request_id', requestIds),
    client
      .from('human_assignments')
      .select('request_id,status')
      .in('request_id', requestIds)
      .in('status', [...activeAssignmentStatuses]),
  ])

  if (submissionError || trackError || versionError || assignmentError) {
    throw new PersistedAdminModerationError('Unable to resolve persisted evaluation records.')
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

  const latestVersions = new Map<string, RecordLike>()
  for (const raw of Array.isArray(versionData) ? versionData : []) {
    const row = raw as unknown as RecordLike
    const requestId = requireString(row, 'request_id')
    const current = latestVersions.get(requestId)
    if (!current || requireInteger(row, 'version_number') > requireInteger(current, 'version_number')) {
      latestVersions.set(requestId, row)
    }
  }

  const activeAssignments = new Map<string, string>()
  for (const raw of Array.isArray(assignmentData) ? assignmentData : []) {
    const row = raw as unknown as RecordLike
    const requestId = requireString(row, 'request_id')
    if (activeAssignments.has(requestId)) {
      throw new PersistedAdminModerationError(
        `Persisted Human request ${requestId} has more than one active Volunteer owner.`,
      )
    }
    activeAssignments.set(requestId, requireString(row, 'status'))
  }

  return requests.map((request) => {
    const requestId = requireString(request, 'id')
    const submissionId = requireString(request, 'submission_id')
    const submission = submissions.get(submissionId)
    if (!submission) {
      throw new PersistedAdminModerationError('Evaluation record submission is unavailable.')
    }

    const trackId = requireString(submission, 'track_id')
    const trackName = tracks.get(trackId)
    if (!trackName) throw new PersistedAdminModerationError(`Track ${trackId} is unavailable.`)

    const requestedMode = parseRequestedMode(request.requested_mode)
    const effectiveMode = parseEffectiveMode(request.mode)
    const requestStatus = requireString(request, 'status')
    const latestVersion = latestVersions.get(requestId) ?? null
    const activeAssignment = activeAssignments.get(requestId) ?? null

    let assignmentLabel = 'Not applicable — AI'
    if (effectiveMode === 'human') {
      if (activeAssignment) assignmentLabel = titleCaseStatus(activeAssignment)
      else if (
        requestStatus === 'submitted' ||
        requestStatus === 'pending_moderation' ||
        requestStatus === 'approved' ||
        requestStatus === 'rejected'
      ) assignmentLabel = 'Submitted'
      else if (requestStatus === 'cancelled') assignmentLabel = 'Cancelled'
      else assignmentLabel = 'Unassigned'
    }

    const publicationLabel =
      requestStatus === 'approved'
        ? 'Approved'
        : requestStatus === 'rejected'
          ? 'Rejected'
          : requestStatus === 'cancelled'
            ? 'Cancelled'
            : requestStatus === 'pending_moderation'
              ? 'Pending Moderation'
              : 'Processing'

    const versionScore = latestVersion ? nullableNumber(latestVersion, 'final_score') : null
    const finalScore =
      requestStatus === 'rejected' || requestStatus === 'cancelled' ? null : versionScore

    let destinationPath: string | null = null
    if (effectiveMode === 'human') {
      if (requestStatus === 'submitted' || requestStatus === 'pending_moderation') {
        destinationPath = `/admin/moderation/${encodeURIComponent(submissionId)}`
      } else if (
        requestStatus === 'unassigned' ||
        requestStatus === 'assigned' ||
        requestStatus === 'accepted' ||
        requestStatus === 'in_evaluation' ||
        requestStatus === 'reopened'
      ) {
        destinationPath = `/admin/requests/${encodeURIComponent(requestId)}`
      }
    }

    return {
      requestId,
      submissionId,
      submissionRef: formatSubmissionRef(submissionId),
      trackName,
      requestedMode,
      effectiveMode,
      requestStatus,
      assignmentLabel,
      publicationLabel,
      finalScore,
      destinationPath,
    }
  })
}

export async function loadPersistedAdminDashboardMetrics(): Promise<PersistedAdminDashboardMetrics> {
  const client = getPortalSupabaseClient()
  const [
    { data: requestData, error: requestError },
    { data: assignmentData, error: assignmentError },
    { data: eventData, error: eventError },
  ] = await Promise.all([
    client.from('evaluation_requests').select('id,mode,status'),
    client
      .from('human_assignments')
      .select('id')
      .in('status', [...activeAssignmentStatuses]),
    client.from('events').select('id').eq('status', 'published'),
  ])

  if (requestError || assignmentError || eventError) {
    throw new PersistedAdminModerationError('Unable to load persisted Admin dashboard metrics.')
  }

  const requests = (Array.isArray(requestData) ? requestData : []) as unknown as RecordLike[]
  const assignments = Array.isArray(assignmentData) ? assignmentData : []
  const events = Array.isArray(eventData) ? eventData : []

  const terminal = new Set(['approved', 'rejected', 'cancelled'])

  return {
    openRequests: requests.filter((row) => !terminal.has(requireString(row, 'status'))).length,
    pendingModeration: requests.filter((row) => requireString(row, 'status') === 'pending_moderation').length,
    humanAssignments: assignments.length,
    publishedEvents: events.length,
    humanUnassigned: requests.filter(
      (row) =>
        requireString(row, 'mode') === 'human' &&
        (requireString(row, 'status') === 'unassigned' || requireString(row, 'status') === 'reopened'),
    ).length,
    humanActive: requests.filter(
      (row) =>
        requireString(row, 'mode') === 'human' &&
        ['assigned', 'accepted', 'in_evaluation'].includes(requireString(row, 'status')),
    ).length,
    aiProcessing: requests.filter(
      (row) => requireString(row, 'mode') === 'ai' && requireString(row, 'status') === 'processing',
    ).length,
    approved: requests.filter((row) => requireString(row, 'status') === 'approved').length,
  }
}
