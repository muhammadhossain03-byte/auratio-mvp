export interface ActiveAssignment {
  id: string
  track: string
  trackSlug: string
  assignmentStatus: 'Assigned' | 'Accepted' | 'In Evaluation' | 'Submitted'
  publicationStatus: 'Processing' | 'Pending Moderation' | 'Approved' | 'Rejected'
}

export type QualitativeAnchor = 'Low' | 'Competent' | 'Excellent'

export interface CriterionDefinition {
  id: string
  name: string
  category: 'Universal Delivery' | 'Structural Flow' | 'Track Specialisation'
  maxPoints: number
  description?: string
}

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

// 8 Universal Delivery Criteria (5 pts each = 40 pts)
export const UNIVERSAL_DELIVERY_CRITERIA: CriterionDefinition[] = [
  { id: 'ud-pacing', name: 'Pacing, WPM calibration, and pause placement', category: 'Universal Delivery', maxPoints: 5 },
  { id: 'ud-tone', name: 'Tone, modulation, and energy', category: 'Universal Delivery', maxPoints: 5 },
  { id: 'ud-variety', name: 'Vocal variety', category: 'Universal Delivery', maxPoints: 5 },
  { id: 'ud-filler', name: 'Filler-word and silence control', category: 'Universal Delivery', maxPoints: 5 },
  { id: 'ud-eye-contact', name: 'Eye contact and gaze stability', category: 'Universal Delivery', maxPoints: 5 },
  { id: 'ud-posture', name: 'Posture and body positioning', category: 'Universal Delivery', maxPoints: 5 },
  { id: 'ud-gestures', name: 'Purposeful gestures', category: 'Universal Delivery', maxPoints: 5 },
  { id: 'ud-framing', name: 'Framing and movement control', category: 'Universal Delivery', maxPoints: 5 },
]

// 4 Structural Flow Criteria (5 pts each = 20 pts)
export const STRUCTURAL_FLOW_CRITERIA: CriterionDefinition[] = [
  { id: 'sf-hook', name: 'Hook strength', category: 'Structural Flow', maxPoints: 5 },
  { id: 'sf-transitions', name: 'Logical transitions', category: 'Structural Flow', maxPoints: 5 },
  { id: 'sf-thesis', name: 'Central thesis clarity', category: 'Structural Flow', maxPoints: 5 },
  { id: 'sf-conclusion', name: 'Track-appropriate conclusion', category: 'Structural Flow', maxPoints: 5 },
]

// Track-specific rubrics (4 criteria each, 10 pts each = 40 pts)
export const TRACK_SPECIFIC_CRITERIA: Record<string, CriterionDefinition[]> = {
  'business-pitch': [
    { id: 'bp-problem', name: 'Problem-solution fit', category: 'Track Specialisation', maxPoints: 10 },
    { id: 'bp-value', name: 'Value proposition clarity', category: 'Track Specialisation', maxPoints: 10 },
    { id: 'bp-traction', name: 'Traction and investor appeal', category: 'Track Specialisation', maxPoints: 10 },
    { id: 'bp-diff', name: 'Competitive differentiation', category: 'Track Specialisation', maxPoints: 10 },
  ],
  'extempore': [
    { id: 'ex-thesis', name: 'Rapid time-to-thesis', category: 'Track Specialisation', maxPoints: 10 },
    { id: 'ex-structure', name: 'Spontaneous structure', category: 'Track Specialisation', maxPoints: 10 },
    { id: 'ex-narrative', name: 'Narrative continuity', category: 'Track Specialisation', maxPoints: 10 },
    { id: 'ex-composure', name: 'Composure and hesitation control', category: 'Track Specialisation', maxPoints: 10 },
  ],
  'informative': [
    { id: 'inf-clarity', name: 'Objective clarity', category: 'Track Specialisation', maxPoints: 10 },
    { id: 'inf-comprehension', name: 'Audience comprehension', category: 'Track Specialisation', maxPoints: 10 },
    { id: 'inf-neutrality', name: 'Neutrality and factual accuracy', category: 'Track Specialisation', maxPoints: 10 },
    { id: 'inf-breakdown', name: 'Complex concept breakdown', category: 'Track Specialisation', maxPoints: 10 },
  ],
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
    track: 'Motivational',
    assignmentStatus: 'Submitted',
    publicationStatus: 'Processing',
    route: '/volunteer/completed/sub-8741',
  },
]

const ASSIGNMENTS_KEY = 'auratio_volunteer_assignments'
const COMPLETED_HISTORY_KEY = 'auratio_volunteer_completed_history'
const DRAFT_PREFIX = 'auratio_volunteer_draft_'
const LOCKED_VERSION_PREFIX = 'auratio_volunteer_locked_'

function getTrackSlug(trackName: string): string {
  const norm = trackName.toLowerCase()
  if (norm.includes('business') || norm.includes('sales')) return 'business-pitch'
  if (norm.includes('extempore')) return 'extempore'
  if (norm.includes('informative')) return 'informative'
  return 'business-pitch'
}

export function getCriteriaForTrack(trackSlug: string): CriterionDefinition[] {
  const trackCriteria = TRACK_SPECIFIC_CRITERIA[trackSlug] || TRACK_SPECIFIC_CRITERIA['business-pitch']
  return [
    ...UNIVERSAL_DELIVERY_CRITERIA,
    ...STRUCTURAL_FLOW_CRITERIA,
    ...trackCriteria,
  ]
}

export function getVolunteerAssignments(): ActiveAssignment[] {
  try {
    const raw = window.sessionStorage?.getItem(ASSIGNMENTS_KEY)
    if (raw) {
      return JSON.parse(raw) as ActiveAssignment[]
    }
  } catch {}
  return CANONICAL_ACTIVE_ASSIGNMENTS
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

export function createFreshDraft(submissionId: string, trackName: string): VolunteerSubmissionScoringDraft {
  const normalizedId = submissionId.toUpperCase()
  const trackSlug = getTrackSlug(trackName)
  const allCriteria = getCriteriaForTrack(trackSlug)

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

  return {
    submissionId: normalizedId,
    track: trackName,
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
  const assignment = getVolunteerAssignment(normalizedId)

  // Determine track
  let trackName = assignment?.track
  if (!trackName) {
    if (normalizedId === 'SUB-8821') trackName = 'Business Pitch / Sales Pitch'
    else if (normalizedId === 'SUB-8814') trackName = 'Extempore'
    else if (normalizedId === 'SUB-8799') trackName = 'Informative'
    else return null
  }

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
  saveScoringDraft(fresh)
  return fresh
}

export function saveScoringDraft(draft: VolunteerSubmissionScoringDraft): void {
  try {
    const normalizedId = draft.submissionId.toUpperCase()
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

  const submissionScore = Math.min(100, universalDelivery + structuralFlow + trackSpecialisation)
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
  try {
    const raw = window.sessionStorage?.getItem(COMPLETED_HISTORY_KEY)
    if (raw) {
      return JSON.parse(raw) as CompletedAssignmentRecord[]
    }
  } catch {}
  return CANONICAL_COMPLETED_HISTORY
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

export function getPreservedLockedSubmission(submissionId: string, version = 1): VolunteerSubmissionScoringDraft | null {
  const normalizedId = submissionId.toUpperCase()
  try {
    const raw = window.sessionStorage?.getItem(`${LOCKED_VERSION_PREFIX}${normalizedId}_v${version}`)
    if (raw) {
      return JSON.parse(raw) as VolunteerSubmissionScoringDraft
    }
  } catch {}

  // Fallback to active draft if marked submitted
  const draft = getScoringDraft(normalizedId)
  if (draft && draft.isSubmitted) {
    return draft
  }
  return null
}

export function reopenEvaluation(submissionId: string): VolunteerSubmissionScoringDraft | null {
  const normalizedId = submissionId.toUpperCase()
  const prior = getPreservedLockedSubmission(normalizedId) || getScoringDraft(normalizedId)

  // Increment version, clone prior data so evaluator can edit without mutating prior locked version
  const newVersion = (prior?.version || 1) + 1
  const newDraft: VolunteerSubmissionScoringDraft = {
    submissionId: normalizedId,
    track: prior?.track || 'Business Pitch / Sales Pitch',
    trackSlug: prior?.trackSlug || 'business-pitch',
    criteria: prior ? JSON.parse(JSON.stringify(prior.criteria)) : {},
    overallSummary: prior?.overallSummary || '',
    isSubmitted: false,
    submittedAt: null,
    version: newVersion,
    priorSubmittedVersion: prior ? JSON.parse(JSON.stringify(prior)) : null,
  }

  saveScoringDraft(newDraft)

  // Re-add to active assignments if not present
  const currentActive = getVolunteerAssignments()
  if (!currentActive.some((a) => a.id.toUpperCase() === normalizedId)) {
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

  const locked = getPreservedLockedSubmission(normalizedId)
  if (locked?.isSubmitted) {
    return true
  }

  return false
}

export function getCompletedRouteForSubmission(submissionId: string): string {
  const normalizedId = submissionId.toUpperCase()
  const lowerId = submissionId.toLowerCase()

  const history = getCompletedHistory()
  const record = history.find((c) => c.id.toUpperCase() === normalizedId)
  if (record?.route) {
    return record.route
  }

  if (['sub-8821', 'sub-8792', 'sub-8755', 'sub-8741'].includes(lowerId)) {
    return `/volunteer/completed/${lowerId}`
  }

  return '/volunteer/completed'
}

export function resetVolunteerState(): void {
  try {
    window.sessionStorage?.removeItem(ASSIGNMENTS_KEY)
    window.sessionStorage?.removeItem(COMPLETED_HISTORY_KEY)
    const keysToRemove: string[] = []
    for (let i = 0; i < (window.sessionStorage?.length || 0); i++) {
      const key = window.sessionStorage.key(i)
      if (key && (key.startsWith(DRAFT_PREFIX) || key.startsWith(LOCKED_VERSION_PREFIX))) {
        keysToRemove.push(key)
      }
    }
    for (const k of keysToRemove) {
      window.sessionStorage.removeItem(k)
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
}
