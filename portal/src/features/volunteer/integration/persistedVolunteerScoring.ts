import { getPortalSupabaseClient } from '../../../foundation/integration/supabaseClient'
import {
  getCriteriaForTrack,
  type CriterionDefinition,
} from '../data/canonicalTrackRegistry'
import {
  isAnchorScoreCompatible,
  type QualitativeAnchor,
} from '../data/generatedRubricAnchors'
import {
  loadPersistedVolunteerAssignment,
  type PersistedVolunteerAssignment,
} from './persistedVolunteerLifecycle'

export interface PersistedCriterionFeedback {
  criterionId: string
  anchor: QualitativeAnchor
  score: number
  primaryTimestampSeconds: number
  evidence: string
  strength: string
  weakness: string
  actionableImprovement: string
}

export interface PersistedCriterionView extends CriterionDefinition {
  feedback: PersistedCriterionFeedback | null
}

export interface PersistedScoringTotals {
  universalDelivery: number
  structuralFlow: number
  trackSpecialisation: number
  submissionScore: number
  criterionScoresCount: number
  anchorCount: number
  structuredFeedbackCount: number
  isOverallSummaryComplete: boolean
  isReady: boolean
}

export interface PersistedVolunteerScoringDraft {
  assignment: PersistedVolunteerAssignment
  overallSummary: string
  criteria: PersistedCriterionView[]
  totals: PersistedScoringTotals
}

export interface PersistedVolunteerSubmissionReceipt {
  requestId: string
  evaluationVersionId: string
  finalScore: number
  status: 'pending_moderation' | 'approved'
}

export interface PersistedVolunteerCompletedEvaluation {
  requestId: string
  submissionId: string
  submissionRef: string
  versionNumber: number
  versionStatus: 'pending_moderation' | 'approved' | 'rejected'
  requestStatus: 'pending_moderation' | 'approved' | 'rejected'
  finalScore: number
}

export interface PersistedVolunteerVideoSource {
  url: string
  expiresInSeconds: number
}

export class PersistedVolunteerScoringError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PersistedVolunteerScoringError'
  }
}

type RecordLike = Record<string, unknown>

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
    throw new PersistedVolunteerScoringError(`Persisted scoring payload is missing ${key}.`)
  }
  return value
}

function requireNumber(row: RecordLike, key: string): number {
  const value = row[key]
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (!Number.isFinite(parsed)) {
    throw new PersistedVolunteerScoringError(`Persisted scoring payload has invalid ${key}.`)
  }
  return parsed
}

function nullableNumber(row: RecordLike, key: string): number | null {
  const value = row[key]
  if (value === null || value === undefined) return null
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  return Number.isFinite(parsed) ? parsed : null
}

function parseAnchor(value: unknown): QualitativeAnchor {
  if (value === 'Low' || value === 'Competent' || value === 'Excellent') return value
  throw new PersistedVolunteerScoringError('Persisted criterion anchor is invalid.')
}

function parseFeedback(row: RecordLike): PersistedCriterionFeedback {
  return {
    criterionId: requireString(row, 'criterion_id'),
    anchor: parseAnchor(row.anchor),
    score: requireNumber(row, 'score'),
    primaryTimestampSeconds: requireNumber(row, 'primary_timestamp_seconds'),
    evidence: requireString(row, 'evidence'),
    strength: requireString(row, 'strength'),
    weakness: requireString(row, 'weakness'),
    actionableImprovement: requireString(row, 'actionable_improvement'),
  }
}

function feedbackIsComplete(feedback: PersistedCriterionFeedback | null): boolean {
  if (!feedback) return false
  return (
    feedback.evidence.trim().length > 0 &&
    feedback.strength.trim().length > 0 &&
    feedback.weakness.trim().length > 0 &&
    feedback.actionableImprovement.trim().length > 0
  )
}

export function calculatePersistedScoringTotals(
  criteria: PersistedCriterionView[],
  overallSummary: string,
): PersistedScoringTotals {
  let universalDelivery = 0
  let structuralFlow = 0
  let trackSpecialisation = 0
  let criterionScoresCount = 0
  let structuredFeedbackCount = 0

  for (const criterion of criteria) {
    const feedback = criterion.feedback
    if (!feedback) continue

    criterionScoresCount += 1
    if (feedbackIsComplete(feedback)) structuredFeedbackCount += 1

    if (criterion.category === 'Universal Delivery') universalDelivery += feedback.score
    if (criterion.category === 'Structural Flow') structuralFlow += feedback.score
    if (criterion.category === 'Track Specialisation') trackSpecialisation += feedback.score
  }

  const anchorCount = criterionScoresCount
  const submissionScore = universalDelivery + structuralFlow + trackSpecialisation
  const isOverallSummaryComplete = overallSummary.trim().length > 0
  const expectedCriterionCount = criteria.length

  return {
    universalDelivery,
    structuralFlow,
    trackSpecialisation,
    submissionScore,
    criterionScoresCount,
    anchorCount,
    structuredFeedbackCount,
    isOverallSummaryComplete,
    isReady:
      expectedCriterionCount === 16 &&
      criterionScoresCount === expectedCriterionCount &&
      structuredFeedbackCount === expectedCriterionCount &&
      isOverallSummaryComplete,
  }
}

export async function loadPersistedVolunteerScoringDraft(
  submissionId: string,
): Promise<PersistedVolunteerScoringDraft | null> {
  const assignment = await loadPersistedVolunteerAssignment(submissionId)
  if (!assignment) return null
  if (assignment.assignmentStatus !== 'In Evaluation') {
    throw new PersistedVolunteerScoringError(
      'Persisted criterion editing requires an In Evaluation assignment.',
    )
  }

  const criterionDefinitions = getCriteriaForTrack(assignment.trackId)
  if (!criterionDefinitions || criterionDefinitions.length !== 16) {
    throw new PersistedVolunteerScoringError('Authoritative 16-criterion rubric is unavailable.')
  }

  const client = getPortalSupabaseClient()
  const [{ data: versionData, error: versionError }, { data: resultData, error: resultError }] =
    await Promise.all([
      client
        .from('evaluation_versions')
        .select('id,request_id,version_number,status,overall_summary')
        .eq('id', assignment.evaluationVersionId)
        .maybeSingle(),
      client
        .from('evaluation_criterion_results')
        .select(
          'criterion_id,anchor,score,primary_timestamp_seconds,evidence,strength,weakness,actionable_improvement',
        )
        .eq('evaluation_version_id', assignment.evaluationVersionId),
    ])

  if (versionError || !versionData) {
    throw new PersistedVolunteerScoringError('Unable to load persisted evaluator version.')
  }
  if (resultError) {
    throw new PersistedVolunteerScoringError('Unable to load persisted criterion feedback.')
  }

  const version = versionData as unknown as RecordLike
  const versionStatus = requireString(version, 'status')
  if (versionStatus !== 'draft' && versionStatus !== 'reopened') {
    throw new PersistedVolunteerScoringError('Evaluator version is no longer editable.')
  }

  const overallSummary =
    typeof version.overall_summary === 'string' ? version.overall_summary : ''

  const feedbackMap = new Map<string, PersistedCriterionFeedback>()
  if (Array.isArray(resultData)) {
    for (const raw of resultData) {
      const feedback = parseFeedback(raw as unknown as RecordLike)
      feedbackMap.set(feedback.criterionId, feedback)
    }
  }

  const criteria = criterionDefinitions.map((criterion) => ({
    ...criterion,
    feedback: feedbackMap.get(criterion.id) ?? null,
  }))

  return {
    assignment,
    overallSummary,
    criteria,
    totals: calculatePersistedScoringTotals(criteria, overallSummary),
  }
}

async function invokeVolunteerMutation(body: Record<string, unknown>): Promise<RecordLike> {
  const client = getPortalSupabaseClient()
  const { data, error } = await client.functions.invoke('human-volunteer', { body })

  if (error) {
    throw new PersistedVolunteerScoringError(error.message || 'Volunteer operation was rejected.')
  }

  const parsed = asObject(data)
  if (!parsed) {
    throw new PersistedVolunteerScoringError('Volunteer operation returned an invalid payload.')
  }
  return parsed
}

export async function savePersistedCriterionFeedback(
  requestId: string,
  criterion: CriterionDefinition,
  feedback: PersistedCriterionFeedback,
): Promise<void> {
  if (feedback.criterionId !== criterion.id) {
    throw new PersistedVolunteerScoringError('Criterion identity mismatch.')
  }
  if (!Number.isInteger(feedback.score)) {
    throw new PersistedVolunteerScoringError('Criterion score must be an integer.')
  }
  if (!isAnchorScoreCompatible(criterion.maxPoints, feedback.anchor, feedback.score)) {
    throw new PersistedVolunteerScoringError('Criterion score is outside the selected anchor band.')
  }
  if (
    !Number.isFinite(feedback.primaryTimestampSeconds) ||
    feedback.primaryTimestampSeconds < 0
  ) {
    throw new PersistedVolunteerScoringError('Criterion timestamp is invalid.')
  }
  if (
    !feedback.evidence.trim() ||
    !feedback.strength.trim() ||
    !feedback.weakness.trim() ||
    !feedback.actionableImprovement.trim()
  ) {
    throw new PersistedVolunteerScoringError('Complete structured criterion feedback is required.')
  }

  await invokeVolunteerMutation({
    action: 'save_criterion',
    request_id: requestId,
    criterion_id: criterion.id,
    anchor: feedback.anchor,
    score: feedback.score,
    primary_timestamp_seconds: feedback.primaryTimestampSeconds,
    evidence: feedback.evidence.trim(),
    strength: feedback.strength.trim(),
    weakness: feedback.weakness.trim(),
    actionable_improvement: feedback.actionableImprovement.trim(),
  })
}

export async function savePersistedOverallSummary(
  requestId: string,
  overallSummary: string,
): Promise<void> {
  const summary = overallSummary.trim()
  if (!summary) {
    throw new PersistedVolunteerScoringError('Overall Summary is required.')
  }

  await invokeVolunteerMutation({
    action: 'save_summary',
    request_id: requestId,
    overall_summary: summary,
  })
}

export async function submitPersistedVolunteerEvaluation(
  requestId: string,
): Promise<PersistedVolunteerSubmissionReceipt> {
  const result = await invokeVolunteerMutation({
    action: 'submit',
    request_id: requestId,
  })

  const status = requireString(result, 'status')
  if (status !== 'pending_moderation' && status !== 'approved') {
    throw new PersistedVolunteerScoringError(`Unexpected Human submission status: ${status}`)
  }

  return {
    requestId: requireString(result, 'request_id'),
    evaluationVersionId: requireString(result, 'evaluation_version_id'),
    finalScore: requireNumber(result, 'final_score'),
    status,
  }
}

export async function loadPersistedVolunteerCompletedEvaluation(
  submissionId: string,
): Promise<PersistedVolunteerCompletedEvaluation | null> {
  const client = getPortalSupabaseClient()
  const { data: requestData, error: requestError } = await client
    .from('evaluation_requests')
    .select('id,submission_id,mode,status')
    .eq('submission_id', submissionId)
    .eq('mode', 'human')
    .maybeSingle()

  if (requestError) {
    throw new PersistedVolunteerScoringError('Unable to load submitted Human evaluation.')
  }
  if (!requestData) return null

  const request = requestData as unknown as RecordLike
  const requestStatus = requireString(request, 'status')
  if (
    requestStatus !== 'pending_moderation' &&
    requestStatus !== 'approved' &&
    requestStatus !== 'rejected'
  ) {
    return null
  }

  const requestId = requireString(request, 'id')
  const { data: versionData, error: versionError } = await client
    .from('evaluation_versions')
    .select('id,version_number,status,final_score')
    .eq('request_id', requestId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (versionError || !versionData) {
    throw new PersistedVolunteerScoringError('Submitted evaluator version is unavailable.')
  }

  const version = versionData as unknown as RecordLike
  const versionStatus = requireString(version, 'status')
  if (
    versionStatus !== 'pending_moderation' &&
    versionStatus !== 'approved' &&
    versionStatus !== 'rejected'
  ) {
    throw new PersistedVolunteerScoringError('Submitted evaluator version status is incoherent.')
  }

  const finalScore = nullableNumber(version, 'final_score')
  if (finalScore === null) {
    throw new PersistedVolunteerScoringError('Submitted evaluator score is unavailable.')
  }

  const versionNumber = requireNumber(version, 'version_number')
  if (!Number.isInteger(versionNumber)) {
    throw new PersistedVolunteerScoringError('Submitted evaluator version number is invalid.')
  }

  return {
    requestId,
    submissionId,
    submissionRef: `SUB-${submissionId.replace(/-/g, '').slice(0, 8).toUpperCase()}`,
    versionNumber,
    versionStatus,
    requestStatus,
    finalScore,
  }
}

export async function createPersistedVolunteerVideoSource(
  submissionId: string,
): Promise<PersistedVolunteerVideoSource | null> {
  const client = getPortalSupabaseClient()
  const { data: videoData, error: videoError } = await client
    .from('submission_videos')
    .select('bucket_name,object_path,lifecycle_status')
    .eq('submission_id', submissionId)
    .maybeSingle()

  if (videoError) {
    throw new PersistedVolunteerScoringError('Unable to load authorized submission video metadata.')
  }
  if (!videoData) return null

  const video = videoData as unknown as RecordLike
  const lifecycleStatus = requireString(video, 'lifecycle_status')
  if (lifecycleStatus !== 'retained') {
    return null
  }

  const bucketName = requireString(video, 'bucket_name')
  const objectPath = requireString(video, 'object_path')
  if (bucketName !== 'evaluation-videos') {
    throw new PersistedVolunteerScoringError('Unexpected submission video bucket.')
  }

  const expiresInSeconds = 300
  const { data: signedData, error: signedError } = await client.storage
    .from(bucketName)
    .createSignedUrl(objectPath, expiresInSeconds)

  if (signedError || !signedData?.signedUrl) {
    throw new PersistedVolunteerScoringError('Unable to authorize temporary submission video access.')
  }

  return {
    url: signedData.signedUrl,
    expiresInSeconds,
  }
}

export function timestampToSeconds(value: string): number | null {
  const match = /^(\d{1,2}):([0-5]\d)$/.exec(value.trim())
  if (!match) return null

  const minutes = Number(match[1])
  const seconds = Number(match[2])
  if (!Number.isInteger(minutes) || !Number.isInteger(seconds)) return null

  return minutes * 60 + seconds
}

export function secondsToTimestamp(value: number): string {
  const safe = Math.max(0, Math.floor(value))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
