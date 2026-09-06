export interface ActiveAssignment {
  id: string
  track: string
  trackSlug: string
  assignmentStatus: 'Assigned' | 'Accepted' | 'In Evaluation' | 'Submitted'
  publicationStatus: 'Processing' | 'Pending Moderation' | 'Approved' | 'Rejected'
}

export type QualitativeAnchor = 'Low' | 'Competent' | 'Excellent'

export type {
  CriterionDefinition,
  TrackDefinition,
  AuthoritativeTrack,
  AuratioPath,
} from './canonicalTrackRegistry'

export {
  UNIVERSAL_DELIVERY_CRITERIA,
  STRUCTURAL_FLOW_CRITERIA,
  PUBLIC_SPEAKING_TRACKS,
  PROFESSIONAL_PRESENTING_TRACKS,
  CONTENT_CREATION_TRACKS,
  AUTHORITATIVE_MVP_TRACKS,
  AUTHORITATIVE_TRACK_SLUGS,
  CANONICAL_TRACK_REGISTRY,
  TRACK_SPECIFIC_CRITERIA,
  getTrackDefinition,
  getTrackSlug,
  getTrackLabel,
  getCriteriaForTrack,
} from './canonicalTrackRegistry'

import {
  AUTHORITATIVE_MVP_TRACKS,
  CANONICAL_TRACK_REGISTRY,
  getTrackSlug,
  getTrackLabel,
  getCriteriaForTrack,
} from './canonicalTrackRegistry'
import { getMappingBySubmissionId } from '../../shared/requestSubmissionMap'

export interface CriterionScoreData {
  id: string
  name: string
  category: 'Universal Delivery' | 'Structural Flow' | 'Track Specialisation'
  maxPoints: number
  anchor: QualitativeAnchor | null
  exactScore: number | null
  evidenceTimestamp: string
  evidence: string
  strength: string
  weakness: string
  advice: string
}

export interface VolunteerSubmissionScoringDraft {
  submissionId: string
  track: string
  trackSlug: string
  criteria: Record<string, CriterionScoreData>
  overallSummary: string
  isSubmitted: boolean
  submittedAt: string | null
  version: number
  score?: number
  priorSubmittedVersion?: VolunteerSubmissionScoringDraft | null
}

export interface CompletedAssignmentRecord {
  id: string
  track: string
  assignmentStatus: 'Submitted'
  publicationStatus: 'Pending Moderation' | 'Approved' | 'Rejected' | 'Processing'
  route: string
  score?: number
}

export const CANONICAL_ACTIVE_ASSIGNMENTS: ActiveAssignment[] = [
  {
    id: 'SUB-8821',
    track: 'Business Pitch / Sales Pitch',
    trackSlug: 'business-pitch',
    assignmentStatus: 'Assigned',
    publicationStatus: 'Processing',
  },
  {
    id: 'SUB-8814',
    track: 'Extempore',
    trackSlug: 'extempore',
    assignmentStatus: 'Accepted',
    publicationStatus: 'Processing',
  },
  {
    id: 'SUB-8799',
    track: 'Informative',
    trackSlug: 'informative',
    assignmentStatus: 'In Evaluation',
    publicationStatus: 'Processing',
  },
]

/**
 * Test fixture utility catalogue.
 * This catalogue must NEVER participate in product runtime entity resolution.
 */
export const SYNTHETIC_ALL_TRACK_ASSIGNMENTS: ActiveAssignment[] = [
  {
    id: 'SUB-SYNTH-INF',
    track: 'Informative',
    trackSlug: 'informative',
    assignmentStatus: 'In Evaluation',
    publicationStatus: 'Processing',
  },
  {
    id: 'SUB-SYNTH-EXT',
    track: 'Extempore',
    trackSlug: 'extempore',
    assignmentStatus: 'In Evaluation',
    publicationStatus: 'Processing',
  },
  {
    id: 'SUB-SYNTH-PER',
    track: 'Persuasive',
    trackSlug: 'persuasive',
    assignmentStatus: 'In Evaluation',
    publicationStatus: 'Processing',
  },
  {
    id: 'SUB-SYNTH-ARG',
    track: 'Argumentative / Debate',
    trackSlug: 'argumentative-debate',
    assignmentStatus: 'In Evaluation',
    publicationStatus: 'Processing',
  },
  {
    id: 'SUB-SYNTH-EXP',
    track: 'Explanatory',
    trackSlug: 'explanatory',
    assignmentStatus: 'In Evaluation',
    publicationStatus: 'Processing',
  },
  {
    id: 'SUB-SYNTH-ND',
    track: 'News Delivery',
    trackSlug: 'news-delivery',
    assignmentStatus: 'In Evaluation',
    publicationStatus: 'Processing',
  },
  {
    id: 'SUB-SYNTH-BP',
    track: 'Business Pitch / Sales Pitch',
    trackSlug: 'business-pitch',
    assignmentStatus: 'In Evaluation',
    publicationStatus: 'Processing',
  },
  {
    id: 'SUB-SYNTH-GP',
    track: 'General Presentation / Multimedia',
    trackSlug: 'general-presentation-multimedia',
    assignmentStatus: 'In Evaluation',
    publicationStatus: 'Processing',
  },
  {
    id: 'SUB-SYNTH-AP',
    track: 'Academic — Poster / Project / Thesis',
    trackSlug: 'academic-poster-project-thesis',
    assignmentStatus: 'In Evaluation',
    publicationStatus: 'Processing',
  },
  {
    id: 'SUB-SYNTH-CR',
    track: 'Corporate Report',
    trackSlug: 'corporate-report',
    assignmentStatus: 'In Evaluation',
    publicationStatus: 'Processing',
  },
  {
    id: 'SUB-SYNTH-INFO',
    track: 'Infotainment-Oriented',
    trackSlug: 'infotainment-oriented',
    assignmentStatus: 'In Evaluation',
    publicationStatus: 'Processing',
  },
  {
    id: 'SUB-SYNTH-AL',
    track: 'Academic — Lecture / Course',
    trackSlug: 'academic-lecture-course',
    assignmentStatus: 'In Evaluation',
    publicationStatus: 'Processing',
  },
  {
    id: 'SUB-SYNTH-MKT',
    track: 'Marketing / Promotional',
    trackSlug: 'marketing-promotional',
    assignmentStatus: 'In Evaluation',
    publicationStatus: 'Processing',
  },
]

export const CANONICAL_COMPLETED_HISTORY: CompletedAssignmentRecord[] = [
  {
    id: 'SUB-8821',
    track: 'Business Pitch / Sales Pitch',
    assignmentStatus: 'Submitted',
    publicationStatus: 'Pending Moderation',
    route: '/volunteer/completed/sub-8821',
    score: 85,
  },
  {
    id: 'SUB-8792',
    track: 'Extempore',
    assignmentStatus: 'Submitted',
    publicationStatus: 'Approved',
    route: '/volunteer/completed/sub-8792',
  },
  {
    id: 'SUB-8755',
    track: 'Informative',
    assignmentStatus: 'Submitted',
    publicationStatus: 'Rejected',
    route: '/volunteer/completed/sub-8755',
  },
  {
    id: 'SUB-8741',
    track: 'Persuasive',
    assignmentStatus: 'Submitted',
    publicationStatus: 'Processing',
    route: '/volunteer/completed/sub-8741',
  },
]

const ASSIGNMENTS_KEY = 'auratio_volunteer_assignments'
const COMPLETED_HISTORY_KEY = 'auratio_volunteer_completed_history'
const DECLINED_KEY = 'auratio_volunteer_declined'
const ADMIN_UNASSIGNED_QUEUE_KEY = 'auratio_admin_unassigned_from_decline'
const DRAFT_PREFIX = 'auratio_volunteer_draft_'
const LOCKED_VERSION_PREFIX = 'auratio_volunteer_locked_'

export interface DeclinedAssignmentRecord {
  submissionId: string
  track: string
  trackSlug?: string
  declinedAt: string
  reason: string
  previousStatus: string
  returnedToAdminQueue: boolean
}

export interface AdminUnassignedRequestRecord {
  requestId: string
  submissionId: string
  user: string
  track: string
  trackSlug?: string
  requestedMethod: 'Human'
  reason: string
  returnedAt: string
  status: 'Unassigned'
  evaluationId?: string
}

export function getDeclinedAssignments(): DeclinedAssignmentRecord[] {
  try {
    const raw = window.sessionStorage?.getItem(DECLINED_KEY)
    if (raw !== null && raw !== undefined) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed as DeclinedAssignmentRecord[]
      }
    }
  } catch {}
  return []
}

export function saveDeclinedAssignments(records: DeclinedAssignmentRecord[]): void {
  try {
    window.sessionStorage?.setItem(DECLINED_KEY, JSON.stringify(records))
  } catch {}
}

export function getDeclinedAssignment(submissionId: string): DeclinedAssignmentRecord | null {
  if (!submissionId) return null
  const normalizedId = submissionId.toUpperCase()
  const list = getDeclinedAssignments()
  return list.find((d) => d.submissionId.toUpperCase() === normalizedId) ?? null
}

export function isAssignmentDeclined(submissionId: string): boolean {
  return getDeclinedAssignment(submissionId) !== null
}

export function getAdminUnassignedDeclinedQueue(): AdminUnassignedRequestRecord[] {
  try {
    const raw = window.sessionStorage?.getItem(ADMIN_UNASSIGNED_QUEUE_KEY)
    if (raw !== null && raw !== undefined) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed as AdminUnassignedRequestRecord[]
      }
    }
  } catch {}
  return []
}

export function saveAdminUnassignedDeclinedQueue(records: AdminUnassignedRequestRecord[]): void {
  try {
    window.sessionStorage?.setItem(ADMIN_UNASSIGNED_QUEUE_KEY, JSON.stringify(records))
  } catch {}
}

export function removeAdminUnassignedDeclinedQueue(identifier: string): void {
  const norm = (identifier || '').toUpperCase()
  const list = getAdminUnassignedDeclinedQueue().filter(
    (r) => r.submissionId.toUpperCase() !== norm && r.requestId.toUpperCase() !== norm
  )
  saveAdminUnassignedDeclinedQueue(list)
}

export function declineVolunteerAssignment(
  submissionId: string,
  reason: string
): { success: boolean; error?: string; record?: DeclinedAssignmentRecord } {
  if (!submissionId || !submissionId.trim()) {
    return { success: false, error: 'Submission ID is required' }
  }
  const normalizedId = submissionId.toUpperCase()

  const trimmedReason = (reason || '').trim()
  if (!trimmedReason) {
    return { success: false, error: 'A valid non-empty decline reason is required' }
  }

  // Prevent duplicate decline
  if (isAssignmentDeclined(normalizedId)) {
    return { success: false, error: `Assignment ${normalizedId} has already been declined` }
  }

  const assignment = getVolunteerAssignment(normalizedId)
  if (!assignment) {
    return { success: false, error: `Assignment ${normalizedId} not found` }
  }

  // Validate declineability:
  // Cannot decline submitted evaluation
  if (assignment.assignmentStatus === 'Submitted' || isEvaluationSubmitted(normalizedId)) {
    return { success: false, error: `Assignment ${normalizedId} has already been submitted and cannot be declined` }
  }

  // Auratio lifecycle: only Assigned tasks are legitimately declineable
  if (assignment.assignmentStatus !== 'Assigned') {
    return { success: false, error: `Assignment ${normalizedId} is in status "${assignment.assignmentStatus}" and cannot be declined` }
  }

  const declineRecord: DeclinedAssignmentRecord = {
    submissionId: normalizedId,
    track: assignment.track,
    trackSlug: assignment.trackSlug,
    declinedAt: new Date().toISOString(),
    reason: trimmedReason,
    previousStatus: assignment.assignmentStatus,
    returnedToAdminQueue: true,
  }

  // 1. Record decline provenance for audit
  const existingDeclined = getDeclinedAssignments().filter((d) => d.submissionId.toUpperCase() !== normalizedId)
  saveDeclinedAssignments([...existingDeclined, declineRecord])

  // 2. Remove / revoke Volunteer active ownership
  const currentActive = getVolunteerAssignments().filter((a) => a.id.toUpperCase() !== normalizedId)
  saveVolunteerAssignments(currentActive)

  // 3. Remove any draft for the declined assignment
  try {
    window.sessionStorage?.removeItem(`${DRAFT_PREFIX}${normalizedId}`)
  } catch {}

  // 4. Reflect in Admin Unassigned queue state representation (Section 3)
  const mapping = getMappingBySubmissionId(normalizedId)
  const existingAdminQueue = getAdminUnassignedDeclinedQueue().filter(
    (r) => r.submissionId.toUpperCase() !== normalizedId && r.requestId.toUpperCase() !== mapping.requestId.toUpperCase()
  )
  const adminRecord: AdminUnassignedRequestRecord = {
    requestId: mapping.requestId,
    submissionId: normalizedId,
    user: mapping.user,
    track: assignment.track,
    trackSlug: assignment.trackSlug,
    requestedMethod: 'Human',
    reason: trimmedReason,
    returnedAt: declineRecord.declinedAt,
    status: 'Unassigned',
    evaluationId: mapping.evaluationId,
  }
  saveAdminUnassignedDeclinedQueue([...existingAdminQueue, adminRecord])

  return { success: true, record: declineRecord }
}

export function getVolunteerAssignments(): ActiveAssignment[] {
  let list: ActiveAssignment[] = CANONICAL_ACTIVE_ASSIGNMENTS
  try {
    const raw = window.sessionStorage?.getItem(ASSIGNMENTS_KEY)
    if (raw !== null && raw !== undefined) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          list = parsed as ActiveAssignment[]
        }
      } catch {}
    }
  } catch {}

  // Prevent canonical-fallback resurrection:
  // A declined assignment must never reappear in active assignments under any circumstances
  const declinedRecords = getDeclinedAssignments()
  if (declinedRecords.length > 0) {
    const declinedIds = new Set(declinedRecords.map((d) => d.submissionId.toUpperCase()))
    return list.filter((a) => !declinedIds.has(a.id.toUpperCase()))
  }

  return list
}

export function saveVolunteerAssignments(assignments: ActiveAssignment[]): void {
  try {
    window.sessionStorage?.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments))
  } catch {}
}

export function getVolunteerAssignment(submissionId: string): ActiveAssignment | null {
  const normalizedId = submissionId.toUpperCase()
  const assignments = getVolunteerAssignments()
  return assignments.find((a) => a.id.toUpperCase() === normalizedId) ?? null
}

export function seedVolunteerAssignment(assignment: ActiveAssignment): void {
  const current = getVolunteerAssignments()
  const filtered = current.filter((a) => a.id.toUpperCase() !== assignment.id.toUpperCase())
  saveVolunteerAssignments([...filtered, assignment])
  const remainingDeclined = getDeclinedAssignments().filter((d) => d.submissionId.toUpperCase() !== assignment.id.toUpperCase())
  saveDeclinedAssignments(remainingDeclined)
  removeAdminUnassignedDeclinedQueue(assignment.id)
}

export function updateAssignmentStatus(submissionId: string, status: ActiveAssignment['assignmentStatus']): void {
  const normalizedId = submissionId.toUpperCase()
  const assignments = getVolunteerAssignments().map((a) => {
    if (a.id.toUpperCase() === normalizedId) {
      return { ...a, assignmentStatus: status }
    }
    return a
  })
  saveVolunteerAssignments(assignments)
}

export function isValidTimestamp(ts: string | null | undefined): boolean {
  if (!ts) return false
  const trimmed = ts.trim()
  const match = /^(\d{2,}):([0-5]\d)$/.exec(trimmed)
  return match !== null
}

export function isCriterionComplete(criterion: CriterionScoreData): boolean {
  if (!criterion.anchor) return false
  if (criterion.exactScore === null || isNaN(criterion.exactScore) || !Number.isInteger(criterion.exactScore)) return false
  if (criterion.exactScore < 0 || criterion.exactScore > criterion.maxPoints) {
    return false
  }
  if (!isValidTimestamp(criterion.evidenceTimestamp)) {
    return false
  }
  return (
    criterion.evidence.trim().length > 0 &&
    criterion.strength.trim().length > 0 &&
    criterion.weakness.trim().length > 0 &&
    criterion.advice.trim().length > 0
  )
}

export function createFreshDraft(submissionId: string, trackName: string): VolunteerSubmissionScoringDraft | null {
  const normalizedId = submissionId.toUpperCase()
  const trackSlug = getTrackSlug(trackName)
  if (!trackSlug) return null
  const allCriteria = getCriteriaForTrack(trackSlug)
  if (!allCriteria) return null

  const criteriaRecord: Record<string, CriterionScoreData> = {}
  for (const c of allCriteria) {
    criteriaRecord[c.id] = {
      id: c.id,
      name: c.name,
      category: c.category,
      maxPoints: c.maxPoints,
      anchor: null,
      exactScore: null,
      evidenceTimestamp: '',
      evidence: '',
      strength: '',
      weakness: '',
      advice: '',
    }
  }

  const exactLabel = getTrackLabel(trackName) || trackName

  return {
    submissionId: normalizedId,
    track: exactLabel,
    trackSlug,
    criteria: criteriaRecord,
    overallSummary: '',
    isSubmitted: false,
    submittedAt: null,
    version: 1,
  }
}

export function getScoringDraft(submissionId: string): VolunteerSubmissionScoringDraft | null {
  const normalizedId = submissionId.toUpperCase()
  if (isAssignmentDeclined(normalizedId)) {
    return null
  }
  const assignment = getVolunteerAssignment(normalizedId)

  // Determine track
  let trackName = assignment?.track
  if (!trackName) {
    if (normalizedId === 'SUB-8821') trackName = 'Business Pitch / Sales Pitch'
    else if (normalizedId === 'SUB-8814') trackName = 'Extempore'
    else if (normalizedId === 'SUB-8799') trackName = 'Informative'
    else if (normalizedId === 'SUB-8741') trackName = 'Persuasive'
    else return null
  }

  const trackSlug = getTrackSlug(trackName)
  if (!trackSlug) return null

  try {
    const raw = window.sessionStorage?.getItem(`${DRAFT_PREFIX}${normalizedId}`)
    if (raw) {
      const parsed = JSON.parse(raw) as VolunteerSubmissionScoringDraft
      if (parsed.submissionId === normalizedId) {
        return parsed
      }
    }
  } catch {}

  // Return fresh empty draft starting at 0/100, 0/16
  const fresh = createFreshDraft(normalizedId, trackName)
  if (fresh) {
    saveScoringDraft(fresh)
  }
  return fresh
}

export function saveScoringDraft(draft: VolunteerSubmissionScoringDraft): void {
  try {
    const normalizedId = draft.submissionId.toUpperCase()
    if (isAssignmentDeclined(normalizedId)) {
      return
    }
    const raw = window.sessionStorage?.getItem(`${DRAFT_PREFIX}${normalizedId}`)
    if (raw) {
      const existing = JSON.parse(raw) as VolunteerSubmissionScoringDraft
      // If existing draft is locked/submitted, prevent mutation unless draft is a strictly higher version
      if (existing.isSubmitted && draft.version <= existing.version) {
        return
      }
    }
    window.sessionStorage?.setItem(`${DRAFT_PREFIX}${normalizedId}`, JSON.stringify(draft))
  } catch {}
}

export function saveCriterionScoreData(
  submissionId: string,
  criterionId: string,
  data: Partial<CriterionScoreData>
): VolunteerSubmissionScoringDraft | null {
  const draft = getScoringDraft(submissionId)
  if (!draft || draft.isSubmitted) return null

  if (draft.criteria[criterionId]) {
    draft.criteria[criterionId] = {
      ...draft.criteria[criterionId],
      ...data,
    }
    saveScoringDraft(draft)
  }
  return draft
}

export function saveOverallSummary(
  submissionId: string,
  summary: string
): VolunteerSubmissionScoringDraft | null {
  const draft = getScoringDraft(submissionId)
  if (!draft || draft.isSubmitted) return null

  draft.overallSummary = summary
  saveScoringDraft(draft)
  return draft
}

export function calculateDraftTotals(draft: VolunteerSubmissionScoringDraft) {
  let universalDelivery = 0
  let structuralFlow = 0
  let trackSpecialisation = 0
  let criterionScoresCount = 0
  let anchorCount = 0
  let structuredFeedbackCount = 0

  for (const c of Object.values(draft.criteria)) {
    if (c.anchor !== null) {
      anchorCount++
    }
    if (c.exactScore !== null && !isNaN(c.exactScore)) {
      criterionScoresCount++
      if (c.category === 'Universal Delivery') {
        universalDelivery += Math.min(c.maxPoints, Math.max(0, c.exactScore))
      } else if (c.category === 'Structural Flow') {
        structuralFlow += Math.min(c.maxPoints, Math.max(0, c.exactScore))
      } else if (c.category === 'Track Specialisation') {
        trackSpecialisation += Math.min(c.maxPoints, Math.max(0, c.exactScore))
      }
    }
    if (isCriterionComplete(c)) {
      structuredFeedbackCount++
    }
  }

  const calculatedScore = Math.min(100, universalDelivery + structuralFlow + trackSpecialisation)
  const submissionScore = draft.score !== undefined ? draft.score : calculatedScore
  const isOverallSummaryComplete = draft.overallSummary.trim().length > 0
  const isReady =
    anchorCount === 16 &&
    criterionScoresCount === 16 &&
    structuredFeedbackCount === 16 &&
    isOverallSummaryComplete

  return {
    universalDelivery,
    structuralFlow,
    trackSpecialisation,
    submissionScore,
    criterionScoresCount,
    anchorCount,
    structuredFeedbackCount,
    isOverallSummaryComplete,
    isReady,
  }
}

export function getCompletedHistory(): CompletedAssignmentRecord[] {
  let list: CompletedAssignmentRecord[] = CANONICAL_COMPLETED_HISTORY
  try {
    const raw = window.sessionStorage?.getItem(COMPLETED_HISTORY_KEY)
    if (raw !== null && raw !== undefined) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        list = parsed as CompletedAssignmentRecord[]
      }
    }
  } catch {}

  // Filter out any declined assignments that were not genuinely submitted
  const declinedRecords = getDeclinedAssignments()
  if (declinedRecords.length > 0) {
    const declinedIds = new Set(declinedRecords.map((d) => d.submissionId.toUpperCase()))
    return list.filter((c) => {
      if (!declinedIds.has(c.id.toUpperCase())) return true
      const locked = getLatestLockedSubmission(c.id)
      return locked?.isSubmitted === true
    })
  }

  return list
}

export function saveCompletedHistory(items: CompletedAssignmentRecord[]): void {
  try {
    window.sessionStorage?.setItem(COMPLETED_HISTORY_KEY, JSON.stringify(items))
  } catch {}
}

export function submitEvaluation(submissionId: string): { success: boolean; draft: VolunteerSubmissionScoringDraft | null } {
  const normalizedId = submissionId.toUpperCase()
  const draft = getScoringDraft(normalizedId)
  if (!draft) return { success: false, draft: null }

  // Locked invariant: already-submitted evaluation cannot be submitted again
  if (draft.isSubmitted) {
    return { success: false, draft }
  }

  const totals = calculateDraftTotals(draft)
  if (totals.isReady !== true) {
    return { success: false, draft }
  }

  // Lock draft
  draft.isSubmitted = true
  draft.submittedAt = new Date().toISOString()
  draft.score = totals.submissionScore
  saveScoringDraft(draft)

  // Save locked snapshot
  try {
    window.sessionStorage?.setItem(`${LOCKED_VERSION_PREFIX}${normalizedId}_v${draft.version}`, JSON.stringify(draft))
  } catch {}

  // 1. Remove from active assignments
  const activeAssignments = getVolunteerAssignments().filter((a) => a.id.toUpperCase() !== normalizedId)
  saveVolunteerAssignments(activeAssignments)

  // 2. Add to completed history
  const existingHistory = getCompletedHistory().filter((c) => c.id.toUpperCase() !== normalizedId)
  const newRecord: CompletedAssignmentRecord = {
    id: normalizedId,
    track: draft.track,
    assignmentStatus: 'Submitted',
    publicationStatus: 'Pending Moderation',
    route: `/volunteer/completed/${normalizedId.toLowerCase()}`,
    score: totals.submissionScore,
  }
  saveCompletedHistory([newRecord, ...existingHistory])

  return { success: true, draft }
}

export function getLatestLockedSubmission(submissionId: string): VolunteerSubmissionScoringDraft | null {
  const normalizedId = submissionId.toUpperCase()
  let latest: VolunteerSubmissionScoringDraft | null = null
  let maxVersion = 0

  // 1. Scan locked version snapshots in sessionStorage
  try {
    const prefix = `${LOCKED_VERSION_PREFIX}${normalizedId}_v`
    for (let i = 0; i < (window.sessionStorage?.length || 0); i++) {
      const key = window.sessionStorage.key(i)
      if (key && key.startsWith(prefix)) {
        const vNum = parseInt(key.slice(prefix.length), 10)
        if (!isNaN(vNum) && vNum > maxVersion) {
          const raw = window.sessionStorage.getItem(key)
          if (raw) {
            const parsed = JSON.parse(raw) as VolunteerSubmissionScoringDraft
            if (parsed.isSubmitted && parsed.submissionId === normalizedId) {
              maxVersion = vNum
              latest = parsed
            }
          }
        }
      }
    }
  } catch {}

  // 2. Also check if the active draft in sessionStorage is submitted and has version >= maxVersion
  try {
    const rawDraft = window.sessionStorage?.getItem(`${DRAFT_PREFIX}${normalizedId}`)
    if (rawDraft) {
      const draft = JSON.parse(rawDraft) as VolunteerSubmissionScoringDraft
      if (draft.isSubmitted && draft.submissionId === normalizedId && draft.version >= maxVersion) {
        maxVersion = draft.version
        latest = draft
      }
    }
  } catch {}

  return latest
}

export function getPreservedLockedSubmission(submissionId: string, version?: number): VolunteerSubmissionScoringDraft | null {
  const normalizedId = submissionId.toUpperCase()
  if (version !== undefined) {
    try {
      const raw = window.sessionStorage?.getItem(`${LOCKED_VERSION_PREFIX}${normalizedId}_v${version}`)
      if (raw) {
        return JSON.parse(raw) as VolunteerSubmissionScoringDraft
      }
    } catch {}

    const draft = getScoringDraft(normalizedId)
    if (draft && draft.isSubmitted && draft.version === version) {
      return draft
    }
    return null
  }

  return getLatestLockedSubmission(normalizedId)
}

export function reopenEvaluation(submissionId: string): VolunteerSubmissionScoringDraft | null {
  const normalizedId = submissionId.toUpperCase()
  const prior = getLatestLockedSubmission(normalizedId)

  // V-01 Invariant: A Reopened Evaluation may exist only when there is a legitimate previously submitted and locked evaluator version.
  // Unknown, invalid, unsupported, or never-submitted submission IDs must return null.
  if (!prior || !prior.isSubmitted) {
    return null
  }

  // Increment version from the latest valid locked submitted version
  const newVersion = prior.version + 1
  const newDraft: VolunteerSubmissionScoringDraft = {
    submissionId: normalizedId,
    track: prior.track,
    trackSlug: prior.trackSlug,
    criteria: JSON.parse(JSON.stringify(prior.criteria)),
    overallSummary: prior.overallSummary || '',
    isSubmitted: false,
    submittedAt: null,
    version: newVersion,
    priorSubmittedVersion: JSON.parse(JSON.stringify(prior)),
  }

  saveScoringDraft(newDraft)

  // Prior locked version snapshot in `${LOCKED_VERSION_PREFIX}${normalizedId}_v${prior.version}` remains immutable

  // Re-add to active assignments if not present or update its status to 'In Evaluation'
  const currentActive = getVolunteerAssignments()
  const existingActiveIdx = currentActive.findIndex((a) => a.id.toUpperCase() === normalizedId)
  if (existingActiveIdx >= 0) {
    currentActive[existingActiveIdx] = {
      ...currentActive[existingActiveIdx],
      assignmentStatus: 'In Evaluation',
    }
    saveVolunteerAssignments(currentActive)
  } else {
    const updatedActive: ActiveAssignment[] = [
      ...currentActive,
      {
        id: normalizedId,
        track: newDraft.track,
        trackSlug: newDraft.trackSlug,
        assignmentStatus: 'In Evaluation',
        publicationStatus: 'Processing',
      },
    ]
    saveVolunteerAssignments(updatedActive)
  }

  return newDraft
}

export function isEvaluationSubmitted(submissionId: string): boolean {
  const normalizedId = submissionId.toUpperCase()

  // Declined assignments cannot be considered submitted evaluations unless genuinely submitted
  if (isAssignmentDeclined(normalizedId)) {
    const locked = getLatestLockedSubmission(normalizedId)
    return locked?.isSubmitted === true
  }

  const draft = getScoringDraft(normalizedId)

  if (draft?.isSubmitted) {
    return true
  }

  const activeAssignment = getVolunteerAssignment(normalizedId)
  if (activeAssignment) {
    return false
  }

  const completedHistory = getCompletedHistory()
  if (completedHistory.some((c) => c.id.toUpperCase() === normalizedId)) {
    return true
  }

  const locked = getLatestLockedSubmission(normalizedId)
  if (locked?.isSubmitted) {
    return true
  }

  return false
}

export function getCompletedEntity(submissionId: string): CompletedAssignmentRecord | null {
  if (!submissionId) return null
  const normalizedId = submissionId.toUpperCase()
  const history = getCompletedHistory()
  return history.find((c) => c.id.toUpperCase() === normalizedId) ?? null
}

export function getCompletedRouteForSubmission(submissionId: string): string {
  const normalizedId = submissionId.toUpperCase()
  const history = getCompletedHistory()
  const record = history.find((c) => c.id.toUpperCase() === normalizedId)
  if (record?.route) {
    return record.route
  }

  return '/volunteer/completed'
}

export function resetVolunteerState(): void {
  try {
    window.sessionStorage?.removeItem(ASSIGNMENTS_KEY)
    window.sessionStorage?.removeItem(COMPLETED_HISTORY_KEY)
    window.sessionStorage?.removeItem(DECLINED_KEY)
    window.sessionStorage?.removeItem(ADMIN_UNASSIGNED_QUEUE_KEY)
    const allKeys = Object.keys(window.sessionStorage || {})
    for (const key of allKeys) {
      if (key.startsWith(DRAFT_PREFIX) || key.startsWith(LOCKED_VERSION_PREFIX)) {
        window.sessionStorage.removeItem(key)
      }
    }
  } catch {}
}

if (typeof window !== 'undefined') {
  const win = window as unknown as Record<string, unknown>
  win.__resetVolunteerState = resetVolunteerState
  win.__submitVolunteerEvaluation = submitEvaluation
  win.__getVolunteerScoringDraft = getScoringDraft
  win.__saveCriterionScoreData = saveCriterionScoreData
  win.__saveOverallSummary = saveOverallSummary
  win.__reopenEvaluation = reopenEvaluation
  win.__getVolunteerAssignment = getVolunteerAssignment
  win.__isEvaluationSubmitted = isEvaluationSubmitted
  win.__getLatestLockedSubmission = getLatestLockedSubmission
  win.__getCompletedEntity = getCompletedEntity
  win.__getCompletedHistory = getCompletedHistory
  win.__getTrackSlug = getTrackSlug
  win.__getTrackLabel = getTrackLabel
  win.__getCriteriaForTrack = getCriteriaForTrack
  win.__CANONICAL_TRACK_REGISTRY = CANONICAL_TRACK_REGISTRY
  win.__AUTHORITATIVE_MVP_TRACKS = AUTHORITATIVE_MVP_TRACKS
  win.__seedVolunteerAssignment = seedVolunteerAssignment
  win.__declineVolunteerAssignment = declineVolunteerAssignment
  win.__getDeclinedAssignments = getDeclinedAssignments
  win.__getDeclinedAssignment = getDeclinedAssignment
  win.__isAssignmentDeclined = isAssignmentDeclined
  win.__getAdminUnassignedDeclinedQueue = getAdminUnassignedDeclinedQueue
  win.__removeAdminUnassignedDeclinedQueue = removeAdminUnassignedDeclinedQueue
}
