// Auratio Admin Portal — Local / In-Memory Mock Data & State

import {
  getAdminUnassignedDeclinedQueue,
  getVolunteerAssignments,
  removeAdminUnassignedDeclinedQueue,
  saveVolunteerAssignments,
  seedVolunteerAssignment,
} from '../../volunteer/data/mockVolunteerData'
import {
  CANONICAL_REQUEST_SUBMISSION_MAP,
  getMappingBySubmissionId,
  getMappingByRequestId,
  type RequestSubmissionMapping,
} from '../../shared/requestSubmissionMap'

export {
  CANONICAL_REQUEST_SUBMISSION_MAP,
  getMappingBySubmissionId,
  getMappingByRequestId,
  type RequestSubmissionMapping,
}

export interface AdminQueueItem {
  id: string
  user: string
  track: string
  requestedMethod: 'Human' | 'AI'
  routing: 'Requested' | 'Assigned AI' | 'Assigned Human' | 'Redirected Human' | 'Unassigned' | 'Cancelled'
  eligibility: 'Eligible'
  interactive: boolean
  destinationPath?: string
  submissionId?: string
  declineReason?: string
  returnedAt?: string
  terminationReason?: string
}

export interface AdminEvaluatorCandidate {
  name: string
  trackEligible: boolean
  effectiveAvailability: string
  activeAssignments: number
}

export interface AdminEvaluationRecordItem {
  submissionId: string
  finalMethod: 'Human' | 'AI'
  humanAssignmentStatus: string
  publicationStatus: 'Pending Moderation' | 'Processing' | 'Approved' | 'Cancelled'
  score: string
  interactive: boolean
  destinationPath?: string
}

export const initialAdminQueueItems: AdminQueueItem[] = [
  {
    id: 'REQ-1042',
    user: 'Alex Morgan',
    track: 'Business Pitch / Sales Pitch',
    requestedMethod: 'Human',
    routing: 'Requested',
    eligibility: 'Eligible',
    interactive: true,
    destinationPath: '/admin/requests/req-1042',
  },
  {
    id: 'REQ-1041',
    user: 'Sam Lee',
    track: 'Informative',
    requestedMethod: 'AI',
    routing: 'Assigned AI',
    eligibility: 'Eligible',
    interactive: true,
    destinationPath: '/admin/requests/req-1041',
  },
  {
    id: 'REQ-1038',
    user: 'Taylor Kim',
    track: 'Extempore',
    requestedMethod: 'Human',
    routing: 'Assigned Human',
    eligibility: 'Eligible',
    interactive: true,
    destinationPath: '/admin/requests/req-1038',
  },
  {
    id: 'REQ-1034',
    user: 'Jordan Ray',
    track: 'Corporate Report',
    requestedMethod: 'AI',
    routing: 'Redirected Human',
    eligibility: 'Eligible',
    interactive: true,
    destinationPath: '/admin/requests/req-1034',
  },
]

export const adminCandidates: AdminEvaluatorCandidate[] = [
  {
    name: 'Farhana Islam',
    trackEligible: true,
    effectiveAvailability: 'Available',
    activeAssignments: 2,
  },
  {
    name: 'Rakib Hasan',
    trackEligible: true,
    effectiveAvailability: 'Available',
    activeAssignments: 0,
  },
  {
    name: 'Tasnim Noor',
    trackEligible: true,
    effectiveAvailability: 'Available',
    activeAssignments: 5,
  },
]

export const adminEvaluationRecords: AdminEvaluationRecordItem[] = [
  {
    submissionId: 'SUB-8821',
    finalMethod: 'Human',
    humanAssignmentStatus: 'Submitted',
    publicationStatus: 'Pending Moderation',
    score: '85 / 100',
    interactive: true,
    destinationPath: '/admin/moderation/sub-8821',
  },
  {
    submissionId: 'SUB-8834',
    finalMethod: 'Human',
    humanAssignmentStatus: 'In Evaluation',
    publicationStatus: 'Processing',
    score: '—',
    interactive: true,
    destinationPath: '/admin/evaluations/sub-8834',
  },
  {
    submissionId: 'SUB-8798',
    finalMethod: 'AI',
    humanAssignmentStatus: 'Not applicable — AI',
    publicationStatus: 'Approved',
    score: '91 / 100',
    interactive: true,
    destinationPath: '/admin/evaluations/sub-8798',
  },
]

export interface AdminModerationQueueItem {
  id: string
  track: string
  assignmentStatus: string
  publicationStatus: string
  moderationTrigger: string
  destinationPath: string
}

export const adminModerationQueueItems: AdminModerationQueueItem[] = [
  {
    id: 'SUB-8821',
    track: 'Business Pitch / Sales Pitch',
    assignmentStatus: 'Submitted',
    publicationStatus: 'Pending Moderation',
    moderationTrigger: 'First Human in track — no Human baseline',
    destinationPath: '/admin/moderation/sub-8821',
  },
  {
    id: 'SUB-8730',
    track: 'Extempore',
    assignmentStatus: 'Submitted',
    publicationStatus: 'Pending Moderation',
    moderationTrigger: '+18 vs prior Approved Human average',
    destinationPath: '/admin/moderation/sub-8730',
  },
]

export interface AdminVolunteerItem {
  id: string
  name: string
  email?: string
  tracks: string
  effectiveAvailability: string
  activeAssignments: string
  lifecycle: string
  actionLabel: string
  destinationPath: string
  selectedTracks?: string[]
}

export const CANONICAL_VOLUNTEERS: AdminVolunteerItem[] = [
  {
    id: 'farhana',
    name: 'Farhana Islam',
    email: 'farhana@auratio.org',
    tracks: '3 tracks',
    effectiveAvailability: 'Available',
    activeAssignments: '2',
    lifecycle: 'Active',
    actionLabel: 'Open',
    destinationPath: '/admin/volunteers/farhana',
    selectedTracks: ['Informative', 'Persuasive', 'Business Pitch / Sales Pitch'],
  },
  {
    id: 'rakib',
    name: 'Rakib Hasan',
    email: 'rakib@auratio.org',
    tracks: '5 tracks',
    effectiveAvailability: 'Available',
    activeAssignments: '0',
    lifecycle: 'Active',
    actionLabel: 'Open',
    destinationPath: '/admin/volunteers/rakib',
    selectedTracks: ['Informative', 'Persuasive', 'Business Pitch / Sales Pitch', 'Extempore', 'Explanatory'],
  },
  {
    id: 'mehnaz',
    name: 'Mehnaz Karim',
    email: 'mehnaz@auratio.org',
    tracks: '2 tracks',
    effectiveAvailability: 'Unavailable',
    activeAssignments: '4',
    lifecycle: 'Active',
    actionLabel: 'Open',
    destinationPath: '/admin/volunteers/mehnaz',
    selectedTracks: ['Informative', 'Persuasive'],
  },
  {
    id: 'nusrat',
    name: 'Nusrat Jahan',
    email: 'nusrat@auratio.org',
    tracks: 'History retained',
    effectiveAvailability: '—',
    activeAssignments: '—',
    lifecycle: 'Deactivated',
    actionLabel: 'View',
    destinationPath: '/admin/volunteers/nusrat',
    selectedTracks: [],
  },
]

const VOLUNTEERS_STORAGE_KEY = 'auratio_extra_volunteers'

function loadExtraVolunteers(): AdminVolunteerItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.sessionStorage?.getItem(VOLUNTEERS_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveExtraVolunteers(items: AdminVolunteerItem[]): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage?.setItem(VOLUNTEERS_STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

let adminVolunteers: AdminVolunteerItem[] = [...CANONICAL_VOLUNTEERS, ...loadExtraVolunteers()]

export function getAdminVolunteersList(): AdminVolunteerItem[] {
  const extra = loadExtraVolunteers()
  adminVolunteers = [...CANONICAL_VOLUNTEERS, ...extra]
  return [...adminVolunteers]
}

export function resetAdminVolunteers(): void {
  adminVolunteers = [...CANONICAL_VOLUNTEERS]
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage?.removeItem(VOLUNTEERS_STORAGE_KEY)
    } catch {}
  }
  resetVolunteerTrackEligibility()
  resetVolunteerAvailabilityOverride()
}

export function addAdminVolunteer(params: {
  name: string
  email: string
  trackCount?: number
  selectedTracks?: string[]
}): AdminVolunteerItem {
  const slug = params.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `vol-${Date.now()}`
  const selectedTracks = params.selectedTracks || ['Informative', 'Persuasive', 'Business Pitch / Sales Pitch']
  const count = params.selectedTracks ? params.selectedTracks.length : (params.trackCount || 1)
  const newItem: AdminVolunteerItem = {
    id: slug,
    name: params.name,
    email: params.email,
    tracks: `${count} track${count === 1 ? '' : 's'}`,
    effectiveAvailability: 'Available',
    activeAssignments: '0',
    lifecycle: 'Invited',
    actionLabel: 'Open',
    destinationPath: `/admin/volunteers/${slug}`,
    selectedTracks: [...selectedTracks],
  }
  const extra = loadExtraVolunteers()
  saveExtraVolunteers([...extra, newItem])
  adminVolunteers = [...CANONICAL_VOLUNTEERS, ...extra, newItem]
  return newItem
}

export function getAdminVolunteerById(id: string): AdminVolunteerItem | undefined {
  const all = getAdminVolunteersList()
  return all.find((v) => v.id.toLowerCase() === id.toLowerCase())
}

export const adminVolunteersList: AdminVolunteerItem[] = adminVolunteers

export interface AdminEventItem {
  id: string
  title: string
  date: string
  location: string
  relevantPaths: string
  status: 'Published' | 'Draft'
  actionLabel: 'View' | 'Edit'
  destinationPath: string
  organizer?: string
  description?: string
  paths?: {
    publicSpeaking: boolean
    professionalPresenting: boolean
    contentCreation: boolean
  }
}

export const CANONICAL_EVENTS: AdminEventItem[] = [
  {
    id: 'summit',
    title: 'Public Speaking Summit',
    date: 'Upcoming date',
    location: 'Dhaka Division',
    relevantPaths: 'Public Speaking',
    status: 'Published',
    actionLabel: 'Edit',
    destinationPath: '/admin/events/editor?id=summit',
    organizer: 'National Debate Federation Bangladesh',
    description: 'National public speaking championship and workshop series for university and college speakers.',
    paths: {
      publicSpeaking: true,
      professionalPresenting: false,
      contentCreation: false,
    },
  },
  {
    id: 'meetup',
    title: 'Presentation Practice Meetup',
    date: 'Upcoming date',
    location: 'Dhaka Division',
    relevantPaths: 'Professional Presenting',
    status: 'Published',
    actionLabel: 'Edit',
    destinationPath: '/admin/events/editor?id=meetup',
    organizer: 'Dhaka Professional Communicators Club',
    description: 'Bi-weekly practice session for workplace presentations, pitch reviews, and executive communication feedback.',
    paths: {
      publicSpeaking: false,
      professionalPresenting: true,
      contentCreation: false,
    },
  },
  {
    id: 'draft',
    title: 'Draft Event',
    date: 'Date TBD',
    location: 'Division not set',
    relevantPaths: 'Content Creation',
    status: 'Draft',
    actionLabel: 'Edit',
    destinationPath: '/admin/events/editor?id=draft',
    organizer: '',
    description: '',
    paths: {
      publicSpeaking: false,
      professionalPresenting: false,
      contentCreation: true,
    },
  },
]

const EVENTS_STORAGE_KEY = 'auratio_extra_events'

function loadEvents(): AdminEventItem[] {
  if (typeof window === 'undefined') return CANONICAL_EVENTS
  try {
    const raw = window.sessionStorage?.getItem(EVENTS_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return CANONICAL_EVENTS
}

function saveEvents(items: AdminEventItem[]): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage?.setItem(EVENTS_STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

let adminEvents: AdminEventItem[] = loadEvents()

export function getAdminEventsList(): AdminEventItem[] {
  adminEvents = loadEvents()
  return [...adminEvents]
}

export function resetAdminEvents(): void {
  adminEvents = CANONICAL_EVENTS.map((item) => ({
    ...item,
    paths: item.paths ? { ...item.paths } : undefined,
  }))
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage?.removeItem(EVENTS_STORAGE_KEY)
    } catch {}
  }
}

export function getAdminEventById(id: string): AdminEventItem | undefined {
  const all = getAdminEventsList()
  return all.find((e) => e.id === id)
}

export function saveAdminEvent(event: {
  id?: string
  title: string
  dateTime: string
  division: string
  organizer: string
  description: string
  paths: {
    publicSpeaking: boolean
    professionalPresenting: boolean
    contentCreation: boolean
  }
}): AdminEventItem {
  const pathLabels: string[] = []
  if (event.paths.publicSpeaking) pathLabels.push('Public Speaking')
  if (event.paths.professionalPresenting) pathLabels.push('Professional Presenting')
  if (event.paths.contentCreation) pathLabels.push('Content Creation')
  const relevantPaths = pathLabels.join(', ') || 'None selected'

  const currentEvents = [...getAdminEventsList()]
  const eventId = event.id || `event-${Date.now()}`
  const existingIdx = currentEvents.findIndex((e) => e.id === eventId)

  const savedItem: AdminEventItem = {
    id: eventId,
    title: event.title || 'Untitled Draft Event',
    date: event.dateTime || 'Date TBD',
    location: event.division || 'Division not set',
    relevantPaths,
    status: 'Draft',
    actionLabel: 'Edit',
    destinationPath: `/admin/events/editor?id=${eventId}`,
    organizer: event.organizer,
    description: event.description,
    paths: event.paths,
  }

  if (existingIdx >= 0) {
    currentEvents[existingIdx] = savedItem
  } else {
    currentEvents.push(savedItem)
  }
  saveEvents(currentEvents)
  adminEvents = currentEvents
  return savedItem
}

export function publishAdminEvent(event: {
  id?: string
  title: string
  dateTime: string
  division: string
  organizer: string
  description: string
  paths: {
    publicSpeaking: boolean
    professionalPresenting: boolean
    contentCreation: boolean
  }
}): AdminEventItem {
  const pathLabels: string[] = []
  if (event.paths.publicSpeaking) pathLabels.push('Public Speaking')
  if (event.paths.professionalPresenting) pathLabels.push('Professional Presenting')
  if (event.paths.contentCreation) pathLabels.push('Content Creation')
  const relevantPaths = pathLabels.join(', ') || 'None selected'

  const currentEvents = [...getAdminEventsList()]
  const eventId = event.id || `event-${Date.now()}`
  const existingIdx = currentEvents.findIndex((e) => e.id === eventId)

  const savedItem: AdminEventItem = {
    id: eventId,
    title: event.title,
    date: event.dateTime || 'Upcoming date',
    location: event.division,
    relevantPaths,
    status: 'Published',
    actionLabel: 'Edit',
    destinationPath: `/admin/events/editor?id=${eventId}`,
    organizer: event.organizer,
    description: event.description,
    paths: event.paths,
  }

  if (existingIdx >= 0) {
    currentEvents[existingIdx] = savedItem
  } else {
    currentEvents.push(savedItem)
  }
  saveEvents(currentEvents)
  adminEvents = currentEvents
  return savedItem
}

export function deleteAdminEvent(id: string): boolean {
  const currentEvents = [...getAdminEventsList()]
  const filtered = currentEvents.filter((e) => e.id !== id)
  if (filtered.length !== currentEvents.length) {
    saveEvents(filtered)
    adminEvents = filtered
    return true
  }
  return false
}

export const adminEventsList: AdminEventItem[] = adminEvents

export interface AdminAuditLogItem {
  timestamp: string
  actor: string
  action: string
  target: string
  reason: string
  category: 'Governance' | 'Volunteer' | 'Assignment' | 'Evaluation' | 'Moderation'
}

export const adminAuditLogsList: AdminAuditLogItem[] = [
  {
    timestamp: '25 Aug 03:41',
    actor: 'Admin A. Rahman',
    action: 'Reassigned Human Evaluation',
    target: 'HE-0142 / SUB-8821',
    reason: 'Scheduling / operational',
    category: 'Assignment',
  },
  {
    timestamp: '25 Aug 03:26',
    actor: 'Farhana Islam',
    action: 'Submitted evaluator version',
    target: 'SUB-8821',
    reason: '—',
    category: 'Evaluation',
  },
  {
    timestamp: '25 Aug 03:10',
    actor: 'Super Admin',
    action: 'Deactivated Admin account',
    target: 'admin@example',
    reason: 'Where applicable',
    category: 'Governance',
  },
  {
    timestamp: '25 Aug 02:58',
    actor: 'Admin A. Rahman',
    action: 'Availability override',
    target: 'Nadia Rahman',
    reason: 'Coverage need',
    category: 'Volunteer',
  },
  {
    timestamp: '25 Aug 02:44',
    actor: 'Admin A. Rahman',
    action: 'Changed track eligibility',
    target: 'Imran Hossain',
    reason: '—',
    category: 'Volunteer',
  },
]

// In-memory & session assignment state for HE-0142
const ADMIN_HE0142_STORAGE_KEY = 'auratio_admin_he0142_state'
const ADMIN_HE0142_PENDING_KEY = 'auratio_admin_he0142_pending_reassignment'
const ADMIN_REQ1042_TERMINATION_KEY = 'auratio_admin_req1042_termination'

export interface HE0142PendingReassignment {
  candidate: string
  source: 'request' | 'moderation'
}

export interface Req1042TerminationState {
  status: 'Cancelled'
  reason: string
  cancelledAt: string
}

let he0142ActiveOwner: string | null = 'Farhana Islam'
let he0142SupersededOwner: string | null = null

function syncSUB8821VolunteerOwner(name: string | null): void {
  const remaining = getVolunteerAssignments().filter((a) => a.id.toUpperCase() !== 'SUB-8821')
  saveVolunteerAssignments(remaining)
  if (name === 'Farhana Islam') {
    seedVolunteerAssignment({
      id: 'SUB-8821',
      track: 'Business Pitch / Sales Pitch',
      trackSlug: 'business-pitch',
      assignmentStatus: 'Assigned',
      publicationStatus: 'Processing',
    })
  }
}

function saveHE0142State(state: { activeOwner: string | null; supersededOwner: string | null }): void {
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage?.setItem(ADMIN_HE0142_STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }
}

function loadHE0142State(): { activeOwner: string | null; supersededOwner: string | null } {
  const unassigned = getAdminUnassignedDeclinedQueue()
  const isDeclined = unassigned.some(
    (r) => r.requestId.toUpperCase() === 'REQ-1042' || r.submissionId.toUpperCase() === 'SUB-8821'
  )
  if (isDeclined) {
    return { activeOwner: null, supersededOwner: 'Farhana Islam' }
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = window.sessionStorage?.getItem(ADMIN_HE0142_STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
  }
  return { activeOwner: he0142ActiveOwner, supersededOwner: he0142SupersededOwner }
}

export function getHE0142AssignmentState() {
  const loaded = loadHE0142State()
  he0142ActiveOwner = loaded.activeOwner
  he0142SupersededOwner = loaded.supersededOwner
  return { activeOwner: he0142ActiveOwner, supersededOwner: he0142SupersededOwner }
}

export function getHE0142PendingReassignment(): HE0142PendingReassignment | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage?.getItem(ADMIN_HE0142_PENDING_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function stageHE0142Reassignment(
  candidate: string,
  source: 'request' | 'moderation' = 'request'
): HE0142PendingReassignment | null {
  const current = getHE0142AssignmentState()
  if (!current.activeOwner || candidate === current.activeOwner || getREQ1042TerminationState()) return null
  const pending = { candidate, source }
  try {
    window.sessionStorage?.setItem(ADMIN_HE0142_PENDING_KEY, JSON.stringify(pending))
  } catch {}
  return pending
}

export function clearHE0142PendingReassignment(): void {
  try {
    window.sessionStorage?.removeItem(ADMIN_HE0142_PENDING_KEY)
  } catch {}
}

export function confirmHE0142Reassignment(reason = 'Operational reassignment') {
  const prev = getHE0142AssignmentState()
  const pending = getHE0142PendingReassignment()
  if (!prev.activeOwner || !pending || pending.candidate === prev.activeOwner || reason.trim().length === 0) {
    return prev
  }
  he0142SupersededOwner = prev.activeOwner
  he0142ActiveOwner = pending.candidate
  const state = { activeOwner: he0142ActiveOwner, supersededOwner: he0142SupersededOwner }
  saveHE0142State(state)
  clearHE0142PendingReassignment()
  removeAdminUnassignedDeclinedQueue('REQ-1042')
  removeAdminUnassignedDeclinedQueue('SUB-8821')
  syncSUB8821VolunteerOwner(he0142ActiveOwner)
  return state
}

export function assignHE0142Candidate(name: string) {
  if (getREQ1042TerminationState()) return getHE0142AssignmentState()
  const prev = getHE0142AssignmentState()
  he0142ActiveOwner = name
  he0142SupersededOwner =
    prev.activeOwner && prev.activeOwner !== name ? prev.activeOwner : prev.supersededOwner
  const state = { activeOwner: he0142ActiveOwner, supersededOwner: he0142SupersededOwner }
  saveHE0142State(state)
  clearHE0142PendingReassignment()
  removeAdminUnassignedDeclinedQueue('REQ-1042')
  removeAdminUnassignedDeclinedQueue('SUB-8821')
  syncSUB8821VolunteerOwner(name)
  return state
}

export function getREQ1042TerminationState(): Req1042TerminationState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage?.getItem(ADMIN_REQ1042_TERMINATION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function cancelREQ1042HumanRequest(reason: string): Req1042TerminationState | null {
  const trimmed = reason.trim()
  if (!trimmed) return null
  const record: Req1042TerminationState = {
    status: 'Cancelled',
    reason: trimmed,
    cancelledAt: new Date().toISOString(),
  }
  try {
    window.sessionStorage?.setItem(ADMIN_REQ1042_TERMINATION_KEY, JSON.stringify(record))
  } catch {}
  he0142SupersededOwner = getHE0142AssignmentState().activeOwner
  he0142ActiveOwner = null
  saveHE0142State({ activeOwner: null, supersededOwner: he0142SupersededOwner })
  clearHE0142PendingReassignment()
  removeAdminUnassignedDeclinedQueue('REQ-1042')
  removeAdminUnassignedDeclinedQueue('SUB-8821')
  syncSUB8821VolunteerOwner(null)
  return record
}

export function resetHE0142Reassignment() {
  he0142ActiveOwner = 'Farhana Islam'
  he0142SupersededOwner = null
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage?.removeItem(ADMIN_HE0142_STORAGE_KEY)
      window.sessionStorage?.removeItem(ADMIN_HE0142_PENDING_KEY)
      window.sessionStorage?.removeItem(ADMIN_REQ1042_TERMINATION_KEY)
    } catch {}
  }
}

export interface Req1042RoutingState {
  routing: 'Unassigned' | 'Assigned Human' | 'Requested' | 'Cancelled'
  activeOwner: string | null
  supersededOwner: string | null
  declineRecord: ReturnType<typeof getAdminUnassignedDeclinedQueue>[0] | null
  terminationReason: string | null
}

export function getREQ1042RoutingState(): Req1042RoutingState {
  const termination = getREQ1042TerminationState()
  if (termination) {
    const heState = getHE0142AssignmentState()
    return {
      routing: 'Cancelled',
      activeOwner: null,
      supersededOwner: heState.supersededOwner,
      declineRecord: null,
      terminationReason: termination.reason,
    }
  }

  const unassigned = getAdminUnassignedDeclinedQueue()
  const declineRecord =
    unassigned.find(
      (r) => r.requestId.toUpperCase() === 'REQ-1042' || r.submissionId.toUpperCase() === 'SUB-8821'
    ) || null

  if (declineRecord) {
    return {
      routing: 'Unassigned',
      activeOwner: null,
      supersededOwner: 'Farhana Islam',
      declineRecord,
      terminationReason: null,
    }
  }

  const he0142State = getHE0142AssignmentState()
  const activeOwner =
    he0142State.activeOwner && he0142State.activeOwner !== 'None' ? he0142State.activeOwner : null

  if (activeOwner) {
    return {
      routing: 'Assigned Human',
      activeOwner,
      supersededOwner: he0142State.supersededOwner,
      declineRecord: null,
      terminationReason: null,
    }
  }

  return {
    routing: 'Requested',
    activeOwner: null,
    supersededOwner: he0142State.supersededOwner,
    declineRecord: null,
    terminationReason: null,
  }
}

export function getAdminEvaluationRequests(): AdminQueueItem[] {
  const items: AdminQueueItem[] = initialAdminQueueItems.map((item) => ({ ...item }))

  // 1. Read decline-returned unassigned requests from Volunteer decline
  const returnedRecords = getAdminUnassignedDeclinedQueue()
  const returnedMap = new Map<string, (typeof returnedRecords)[0]>()
  for (const r of returnedRecords) {
    returnedMap.set(r.requestId.toUpperCase(), r)
  }

  // 2. Derive single-source-of-truth routing state for REQ-1042 / HE-0142 / SUB-8821
  const req1042State = getREQ1042RoutingState()

  // 3. Apply routing state to queue items
  for (let i = 0; i < items.length; i++) {
    const reqId = items[i].id.toUpperCase()
    if (reqId === 'REQ-1042') {
      if (req1042State.routing === 'Cancelled') {
        items[i] = {
          ...items[i],
          routing: 'Cancelled',
          terminationReason: req1042State.terminationReason || undefined,
          interactive: true,
          destinationPath: items[i].destinationPath || `/admin/requests/req-1042`,
        }
      } else if (req1042State.routing === 'Unassigned' && req1042State.declineRecord) {
        items[i] = {
          ...items[i],
          track: req1042State.declineRecord.track,
          requestedMethod: 'Human',
          routing: 'Unassigned',
          submissionId: req1042State.declineRecord.submissionId,
          declineReason: req1042State.declineRecord.reason,
          returnedAt: req1042State.declineRecord.returnedAt,
          interactive: true,
          destinationPath: items[i].destinationPath || `/admin/requests/req-1042`,
        }
      } else if (req1042State.routing === 'Assigned Human') {
        items[i] = {
          ...items[i],
          routing: 'Assigned Human',
        }
      } else {
        items[i] = {
          ...items[i],
          routing: 'Requested',
        }
      }
      returnedMap.delete(reqId)
    } else if (returnedMap.has(reqId)) {
      const record = returnedMap.get(reqId)!
      items[i] = {
        ...items[i],
        track: record.track,
        requestedMethod: 'Human',
        routing: 'Unassigned',
        submissionId: record.submissionId,
        declineReason: record.reason,
        returnedAt: record.returnedAt,
        interactive: true,
        destinationPath: items[i].destinationPath || `/admin/requests/${record.requestId.toLowerCase()}`,
      }
      returnedMap.delete(reqId)
    }
  }

  // 4. Append any returned requests not matching canonical IDs
  for (const record of returnedMap.values()) {
    items.push({
      id: record.requestId,
      user: record.user || 'Evaluated Speaker',
      track: record.track,
      requestedMethod: 'Human',
      routing: 'Unassigned',
      eligibility: 'Eligible',
      interactive: true,
      destinationPath: `/admin/requests/${record.requestId.toLowerCase()}`,
      submissionId: record.submissionId,
      declineReason: record.reason,
      returnedAt: record.returnedAt,
    })
  }

  return items
}


// Session-backed Human lifecycle state for SUB-8834 processing demo
const ADMIN_SUB8834_LIFECYCLE_KEY = 'auratio_admin_sub8834_lifecycle'

export interface SUB8834LifecycleState {
  activeOwner: string | null
  supersededOwner: string | null
  pendingCandidate: string | null
  version: number
  status: 'In Evaluation' | 'Cancelled'
  terminationReason: string
  lastReassignmentReason: string
}

const INITIAL_SUB8834_LIFECYCLE: SUB8834LifecycleState = {
  activeOwner: 'Rakib Hasan',
  supersededOwner: null,
  pendingCandidate: null,
  version: 1,
  status: 'In Evaluation',
  terminationReason: '',
  lastReassignmentReason: '',
}

let sub8834LifecycleState: SUB8834LifecycleState = { ...INITIAL_SUB8834_LIFECYCLE }

function saveSUB8834LifecycleState(state: SUB8834LifecycleState): SUB8834LifecycleState {
  sub8834LifecycleState = { ...state }
  try {
    window.sessionStorage?.setItem(ADMIN_SUB8834_LIFECYCLE_KEY, JSON.stringify(sub8834LifecycleState))
  } catch {}
  return { ...sub8834LifecycleState }
}

export function getSUB8834LifecycleState(): SUB8834LifecycleState {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.sessionStorage?.getItem(ADMIN_SUB8834_LIFECYCLE_KEY)
      if (raw) {
        sub8834LifecycleState = JSON.parse(raw)
      }
    } catch {}
  }
  return { ...sub8834LifecycleState }
}

export function stageSUB8834Reassignment(candidate: string): SUB8834LifecycleState {
  const current = getSUB8834LifecycleState()
  if (current.status === 'Cancelled' || !current.activeOwner || candidate === current.activeOwner) return current
  return saveSUB8834LifecycleState({ ...current, pendingCandidate: candidate })
}

export function clearSUB8834PendingReassignment(): SUB8834LifecycleState {
  const current = getSUB8834LifecycleState()
  return saveSUB8834LifecycleState({ ...current, pendingCandidate: null })
}

export function confirmSUB8834Reassignment(reason: string): SUB8834LifecycleState {
  const current = getSUB8834LifecycleState()
  const trimmed = reason.trim()
  if (
    current.status === 'Cancelled' ||
    !current.activeOwner ||
    !current.pendingCandidate ||
    current.pendingCandidate === current.activeOwner ||
    !trimmed
  ) {
    return current
  }
  return saveSUB8834LifecycleState({
    ...current,
    supersededOwner: current.activeOwner,
    activeOwner: current.pendingCandidate,
    pendingCandidate: null,
    version: current.version + 1,
    lastReassignmentReason: trimmed,
  })
}

export function cancelSUB8834Request(reason: string): SUB8834LifecycleState {
  const current = getSUB8834LifecycleState()
  const trimmed = reason.trim()
  if (!trimmed || current.status === 'Cancelled') return current
  return saveSUB8834LifecycleState({
    ...current,
    supersededOwner: current.activeOwner || current.supersededOwner,
    activeOwner: null,
    pendingCandidate: null,
    status: 'Cancelled',
    terminationReason: trimmed,
  })
}

export function resetSUB8834Lifecycle(): void {
  sub8834LifecycleState = { ...INITIAL_SUB8834_LIFECYCLE }
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage?.removeItem(ADMIN_SUB8834_LIFECYCLE_KEY)
    } catch {}
  }
}

// In-memory multi-entity moderation state
export interface ModerationEntityState {
  id: string
  track: string
  evaluator: string
  scoreDisplay: string
  universalDelivery: string
  structuralFlow: string
  trackSpecialisation: string
  docxStatus: string
  trigger: string
  baseline: string
  publicationStatus: 'Pending Moderation' | 'Approved' | 'Rejected' | 'Reopened'
  rejectionReason: string
}

const INITIAL_MODERATION_ENTITIES: Record<string, ModerationEntityState> = {
  'SUB-8821': {
    id: 'SUB-8821',
    track: 'Business Pitch / Sales Pitch',
    evaluator: 'Farhana Islam',
    scoreDisplay: '85 / 100',
    universalDelivery: '34 / 40',
    structuralFlow: '17 / 20',
    trackSpecialisation: '34 / 40',
    docxStatus: 'Not generated while pending',
    trigger: 'First Human Evaluation in this track',
    baseline: 'None yet',
    publicationStatus: 'Pending Moderation',
    rejectionReason: '',
  },
  'SUB-8730': {
    id: 'SUB-8730',
    track: 'Extempore',
    evaluator: 'Assigned Human evaluator',
    scoreDisplay: 'Recorded in submission (+18 flag)',
    universalDelivery: 'Included in submission',
    structuralFlow: 'Included in submission',
    trackSpecialisation: 'Included in submission',
    docxStatus: 'Not generated while pending',
    trigger: '+18 vs prior Approved Human average',
    baseline: 'Running average of prior Approved Human scores',
    publicationStatus: 'Pending Moderation',
    rejectionReason: '',
  },
}

let moderationEntitiesState: Record<string, ModerationEntityState> = {
  'SUB-8821': { ...INITIAL_MODERATION_ENTITIES['SUB-8821'] },
  'SUB-8730': { ...INITIAL_MODERATION_ENTITIES['SUB-8730'] },
}

export function getModerationEntityState(rawId: string): ModerationEntityState | undefined {
  const id = rawId.toUpperCase()
  if (!moderationEntitiesState[id]) {
    return undefined
  }
  return { ...moderationEntitiesState[id] }
}

export function approveModerationEntity(rawId: string): ModerationEntityState | undefined {
  const id = rawId.toUpperCase()
  const current = getModerationEntityState(id)
  if (!current) return undefined
  moderationEntitiesState[id] = { ...current, publicationStatus: 'Approved' }
  const queueIdx = adminModerationQueueItems.findIndex((item) => item.id === id)
  if (queueIdx >= 0) {
    adminModerationQueueItems[queueIdx].publicationStatus = 'Approved'
  }
  return { ...moderationEntitiesState[id] }
}

export function rejectModerationEntity(rawId: string, reason: string): ModerationEntityState | undefined {
  const id = rawId.toUpperCase()
  const current = getModerationEntityState(id)
  if (!current) return undefined
  moderationEntitiesState[id] = { ...current, publicationStatus: 'Rejected', rejectionReason: reason }
  const queueIdx = adminModerationQueueItems.findIndex((item) => item.id === id)
  if (queueIdx >= 0) {
    adminModerationQueueItems[queueIdx].publicationStatus = 'Rejected'
  }
  return { ...moderationEntitiesState[id] }
}

export function requestReReviewModerationEntity(rawId: string): ModerationEntityState | undefined {
  const id = rawId.toUpperCase()
  const current = getModerationEntityState(id)
  if (!current) return undefined
  moderationEntitiesState[id] = { ...current, publicationStatus: 'Reopened' }
  const queueIdx = adminModerationQueueItems.findIndex((item) => item.id === id)
  if (queueIdx >= 0) {
    adminModerationQueueItems[queueIdx].publicationStatus = 'Reopened'
  }
  return { ...moderationEntitiesState[id] }
}

export function resetAllModeration(): void {
  moderationEntitiesState = {
    'SUB-8821': { ...INITIAL_MODERATION_ENTITIES['SUB-8821'] },
    'SUB-8730': { ...INITIAL_MODERATION_ENTITIES['SUB-8730'] },
  }
  const item8821 = adminModerationQueueItems.find((i) => i.id === 'SUB-8821')
  if (item8821) item8821.publicationStatus = 'Pending Moderation'
  const item8730 = adminModerationQueueItems.find((i) => i.id === 'SUB-8730')
  if (item8730) item8730.publicationStatus = 'Pending Moderation'
}

export function getSub8821ModerationState() {
  const s = getModerationEntityState('SUB-8821')
  return {
    publicationStatus: s?.publicationStatus || 'Pending Moderation',
    rejectionReason: s?.rejectionReason || '',
  }
}

export function approveSub8821() {
  return approveModerationEntity('SUB-8821')
}

export function rejectSub8821(reason: string) {
  return rejectModerationEntity('SUB-8821', reason)
}

export function requestReReviewSub8821() {
  return requestReReviewModerationEntity('SUB-8821')
}

export function resetSub8821Moderation() {
  resetAllModeration()
}

// In-memory Volunteer Management state (isolated per volunteer)
export interface VolunteerAvailabilityState {
  declaredAvailability: string
  effectiveAvailability: string
  overrideReason: string
}

export interface VolunteerManagementState {
  tracks: string[]
  availability: VolunteerAvailabilityState
}

const INITIAL_VOLUNTEER_MANAGEMENT_STATE: Record<string, VolunteerManagementState> = {
  farhana: {
    tracks: ['Informative', 'Persuasive', 'Business Pitch / Sales Pitch'],
    availability: {
      declaredAvailability: 'Available',
      effectiveAvailability: 'Available',
      overrideReason: 'None',
    },
  },
  rakib: {
    tracks: ['Informative', 'Persuasive', 'Business Pitch / Sales Pitch', 'Extempore', 'Explanatory'],
    availability: {
      declaredAvailability: 'Available',
      effectiveAvailability: 'Available',
      overrideReason: 'None',
    },
  },
  mehnaz: {
    tracks: ['Informative', 'Persuasive'],
    availability: {
      declaredAvailability: 'Unavailable',
      effectiveAvailability: 'Unavailable',
      overrideReason: 'None',
    },
  },
  nusrat: {
    tracks: [],
    availability: {
      declaredAvailability: '—',
      effectiveAvailability: '—',
      overrideReason: 'None',
    },
  },
}

let volunteerManagementState: Record<string, VolunteerManagementState> = {
  farhana: {
    tracks: [...INITIAL_VOLUNTEER_MANAGEMENT_STATE.farhana.tracks],
    availability: { ...INITIAL_VOLUNTEER_MANAGEMENT_STATE.farhana.availability },
  },
  rakib: {
    tracks: [...INITIAL_VOLUNTEER_MANAGEMENT_STATE.rakib.tracks],
    availability: { ...INITIAL_VOLUNTEER_MANAGEMENT_STATE.rakib.availability },
  },
  mehnaz: {
    tracks: [...INITIAL_VOLUNTEER_MANAGEMENT_STATE.mehnaz.tracks],
    availability: { ...INITIAL_VOLUNTEER_MANAGEMENT_STATE.mehnaz.availability },
  },
  nusrat: {
    tracks: [...INITIAL_VOLUNTEER_MANAGEMENT_STATE.nusrat.tracks],
    availability: { ...INITIAL_VOLUNTEER_MANAGEMENT_STATE.nusrat.availability },
  },
}

const VOLUNTEER_MGMT_STORAGE_KEY = 'auratio_volunteer_mgmt'

function loadVolunteerManagementState(): Record<string, VolunteerManagementState> {
  if (typeof window === 'undefined') {
    return volunteerManagementState
  }
  try {
    const raw = window.sessionStorage?.getItem(VOLUNTEER_MGMT_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      for (const k of Object.keys(INITIAL_VOLUNTEER_MANAGEMENT_STATE)) {
        if (parsed[k]) {
          volunteerManagementState[k] = parsed[k]
        }
      }
    }
  } catch {}
  return volunteerManagementState
}

function saveVolunteerManagementState(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage?.setItem(VOLUNTEER_MGMT_STORAGE_KEY, JSON.stringify(volunteerManagementState))
  } catch {}
}

export function getVolunteerTrackEligibility(rawId: string): string[] | undefined {
  loadVolunteerManagementState()
  const id = rawId.toLowerCase()
  const v = volunteerManagementState[id]
  if (!v) return undefined
  return [...v.tracks]
}

export function saveVolunteerTrackEligibility(rawId: string, tracks: string[]): string[] | undefined {
  loadVolunteerManagementState()
  const id = rawId.toLowerCase()
  const v = volunteerManagementState[id]
  if (!v) return undefined
  if (tracks.length > 0) {
    v.tracks = [...tracks]
    const vol = adminVolunteers.find((item) => item.id === id)
    if (vol) {
      vol.selectedTracks = [...tracks]
      vol.tracks = `${tracks.length} track${tracks.length === 1 ? '' : 's'}`
    }
    saveVolunteerManagementState()
  }
  return [...v.tracks]
}

export function resetVolunteerTrackEligibility(rawId?: string): void {
  loadVolunteerManagementState()
  if (rawId) {
    const id = rawId.toLowerCase()
    if (INITIAL_VOLUNTEER_MANAGEMENT_STATE[id]) {
      volunteerManagementState[id].tracks = [...INITIAL_VOLUNTEER_MANAGEMENT_STATE[id].tracks]
      const vol = adminVolunteers.find((item) => item.id === id)
      if (vol) {
        vol.selectedTracks = [...INITIAL_VOLUNTEER_MANAGEMENT_STATE[id].tracks]
        vol.tracks = vol.selectedTracks.length > 0 ? `${vol.selectedTracks.length} tracks` : 'History retained'
      }
    }
  } else {
    for (const id of Object.keys(INITIAL_VOLUNTEER_MANAGEMENT_STATE)) {
      volunteerManagementState[id].tracks = [...INITIAL_VOLUNTEER_MANAGEMENT_STATE[id].tracks]
      const vol = adminVolunteers.find((item) => item.id === id)
      if (vol) {
        vol.selectedTracks = [...INITIAL_VOLUNTEER_MANAGEMENT_STATE[id].tracks]
        vol.tracks = vol.selectedTracks.length > 0 ? `${vol.selectedTracks.length} tracks` : 'History retained'
      }
    }
  }
  if (!rawId && typeof window !== 'undefined') {
    try {
      window.sessionStorage?.removeItem(VOLUNTEER_MGMT_STORAGE_KEY)
    } catch {}
  } else {
    saveVolunteerManagementState()
  }
}

export function getVolunteerAvailabilityState(rawId: string): VolunteerAvailabilityState | undefined {
  loadVolunteerManagementState()
  const id = rawId.toLowerCase()
  const v = volunteerManagementState[id]
  if (!v) return undefined
  return { ...v.availability }
}

export function applyVolunteerAvailabilityOverride(
  rawId: string,
  effectiveStatus: string,
  reason: string,
): VolunteerAvailabilityState | undefined {
  loadVolunteerManagementState()
  const id = rawId.toLowerCase()
  const v = volunteerManagementState[id]
  if (!v) return undefined
  v.availability.effectiveAvailability = effectiveStatus
  v.availability.overrideReason = reason || 'Operational coverage / scheduling reason'
  const vol = adminVolunteers.find((item) => item.id === id)
  if (vol) {
    vol.effectiveAvailability = effectiveStatus
  }
  saveVolunteerManagementState()
  return { ...v.availability }
}

export function resetVolunteerAvailabilityOverride(rawId?: string): void {
  loadVolunteerManagementState()
  if (rawId) {
    const id = rawId.toLowerCase()
    if (INITIAL_VOLUNTEER_MANAGEMENT_STATE[id]) {
      volunteerManagementState[id].availability = { ...INITIAL_VOLUNTEER_MANAGEMENT_STATE[id].availability }
      const vol = adminVolunteers.find((item) => item.id === id)
      if (vol) {
        vol.effectiveAvailability = INITIAL_VOLUNTEER_MANAGEMENT_STATE[id].availability.effectiveAvailability
      }
    }
  } else {
    for (const id of Object.keys(INITIAL_VOLUNTEER_MANAGEMENT_STATE)) {
      volunteerManagementState[id].availability = { ...INITIAL_VOLUNTEER_MANAGEMENT_STATE[id].availability }
      const vol = adminVolunteers.find((item) => item.id === id)
      if (vol) {
        vol.effectiveAvailability = INITIAL_VOLUNTEER_MANAGEMENT_STATE[id].availability.effectiveAvailability
      }
    }
  }
  if (!rawId && typeof window !== 'undefined') {
    try {
      window.sessionStorage?.removeItem(VOLUNTEER_MGMT_STORAGE_KEY)
    } catch {}
  } else {
    saveVolunteerManagementState()
  }
}

// Backward-compatible Farhana wrappers
export function getFarhanaAvailabilityState() {
  return (
    getVolunteerAvailabilityState('farhana') || {
      declaredAvailability: 'Available',
      effectiveAvailability: 'Available',
      overrideReason: 'None',
    }
  )
}

export function applyFarhanaAvailabilityOverride(effectiveStatus: string, reason: string) {
  return applyVolunteerAvailabilityOverride('farhana', effectiveStatus, reason) || getFarhanaAvailabilityState()
}

export function resetFarhanaAvailabilityOverride() {
  resetVolunteerAvailabilityOverride('farhana')
}

export const INITIAL_FARHANA_TRACKS = [
  'Informative',
  'Persuasive',
  'Business Pitch / Sales Pitch',
]

export function getFarhanaTrackEligibility(): string[] {
  return getVolunteerTrackEligibility('farhana') || [...INITIAL_FARHANA_TRACKS]
}

export function saveFarhanaTrackEligibility(tracks: string[]): string[] {
  return saveVolunteerTrackEligibility('farhana', tracks) || getFarhanaTrackEligibility()
}

export function resetFarhanaTrackEligibility() {
  resetVolunteerTrackEligibility('farhana')
}

// In-memory Volunteer Invite track draft state (isolated from Farhana & canonical volunteers)
export const INITIAL_INVITE_VOLUNTEER_TRACKS = [
  'Informative',
  'Persuasive',
  'Business Pitch / Sales Pitch',
]

let inviteVolunteerTrackDraftState: string[] = [...INITIAL_INVITE_VOLUNTEER_TRACKS]

export function getInviteVolunteerTrackDraft(): string[] {
  return [...inviteVolunteerTrackDraftState]
}

export function saveInviteVolunteerTrackDraft(tracks: string[]): string[] {
  if (tracks.length > 0) {
    inviteVolunteerTrackDraftState = [...tracks]
  }
  return getInviteVolunteerTrackDraft()
}

export function resetInviteVolunteerTrackDraft() {
  inviteVolunteerTrackDraftState = [...INITIAL_INVITE_VOLUNTEER_TRACKS]
}

if (typeof window !== 'undefined') {
  ;(window as unknown as { __getHE0142AssignmentState: typeof getHE0142AssignmentState }).__getHE0142AssignmentState = getHE0142AssignmentState
  ;(window as unknown as { __resetHE0142Reassignment: typeof resetHE0142Reassignment }).__resetHE0142Reassignment = resetHE0142Reassignment
  ;(window as unknown as { __getHE0142PendingReassignment: typeof getHE0142PendingReassignment }).__getHE0142PendingReassignment = getHE0142PendingReassignment
  ;(window as unknown as { __stageHE0142Reassignment: typeof stageHE0142Reassignment }).__stageHE0142Reassignment = stageHE0142Reassignment
  ;(window as unknown as { __clearHE0142PendingReassignment: typeof clearHE0142PendingReassignment }).__clearHE0142PendingReassignment = clearHE0142PendingReassignment
  ;(window as unknown as { __cancelREQ1042HumanRequest: typeof cancelREQ1042HumanRequest }).__cancelREQ1042HumanRequest = cancelREQ1042HumanRequest
  ;(window as unknown as { __getREQ1042TerminationState: typeof getREQ1042TerminationState }).__getREQ1042TerminationState = getREQ1042TerminationState
  ;(window as unknown as { __getSUB8834LifecycleState: typeof getSUB8834LifecycleState }).__getSUB8834LifecycleState = getSUB8834LifecycleState
  ;(window as unknown as { __stageSUB8834Reassignment: typeof stageSUB8834Reassignment }).__stageSUB8834Reassignment = stageSUB8834Reassignment
  ;(window as unknown as { __confirmSUB8834Reassignment: typeof confirmSUB8834Reassignment }).__confirmSUB8834Reassignment = confirmSUB8834Reassignment
  ;(window as unknown as { __cancelSUB8834Request: typeof cancelSUB8834Request }).__cancelSUB8834Request = cancelSUB8834Request
  ;(window as unknown as { __resetSUB8834Lifecycle: typeof resetSUB8834Lifecycle }).__resetSUB8834Lifecycle = resetSUB8834Lifecycle
  ;(window as unknown as { __getSub8821ModerationState: typeof getSub8821ModerationState }).__getSub8821ModerationState = getSub8821ModerationState
  ;(window as unknown as { __resetSub8821Moderation: typeof resetSub8821Moderation }).__resetSub8821Moderation = resetSub8821Moderation
  ;(window as unknown as { __getFarhanaAvailabilityState: typeof getFarhanaAvailabilityState }).__getFarhanaAvailabilityState = getFarhanaAvailabilityState
  ;(window as unknown as { __resetFarhanaAvailabilityOverride: typeof resetFarhanaAvailabilityOverride }).__resetFarhanaAvailabilityOverride = resetFarhanaAvailabilityOverride
  ;(window as unknown as { __getFarhanaTrackEligibility: typeof getFarhanaTrackEligibility }).__getFarhanaTrackEligibility = getFarhanaTrackEligibility
  ;(window as unknown as { __resetFarhanaTrackEligibility: typeof resetFarhanaTrackEligibility }).__resetFarhanaTrackEligibility = resetFarhanaTrackEligibility
  ;(window as unknown as { __getInviteVolunteerTrackDraft: typeof getInviteVolunteerTrackDraft }).__getInviteVolunteerTrackDraft = getInviteVolunteerTrackDraft
  ;(window as unknown as { __resetInviteVolunteerTrackDraft: typeof resetInviteVolunteerTrackDraft }).__resetInviteVolunteerTrackDraft = resetInviteVolunteerTrackDraft
  ;(window as unknown as { __resetAdminVolunteers: typeof resetAdminVolunteers }).__resetAdminVolunteers = resetAdminVolunteers
  ;(window as unknown as { __resetAdminEvents: typeof resetAdminEvents }).__resetAdminEvents = resetAdminEvents
  ;(window as unknown as { __getAdminVolunteersList: typeof getAdminVolunteersList }).__getAdminVolunteersList = getAdminVolunteersList
  ;(window as unknown as { __getAdminEventsList: typeof getAdminEventsList }).__getAdminEventsList = getAdminEventsList
  ;(window as unknown as { __saveAdminEvent: typeof saveAdminEvent }).__saveAdminEvent = saveAdminEvent
  ;(window as unknown as { __publishAdminEvent: typeof publishAdminEvent }).__publishAdminEvent = publishAdminEvent
  ;(window as unknown as { __deleteAdminEvent: typeof deleteAdminEvent }).__deleteAdminEvent = deleteAdminEvent
  ;(window as unknown as { __addAdminVolunteer: typeof addAdminVolunteer }).__addAdminVolunteer = addAdminVolunteer
  ;(window as unknown as { __getModerationEntityState: typeof getModerationEntityState }).__getModerationEntityState = getModerationEntityState
  ;(window as unknown as { __approveModerationEntity: typeof approveModerationEntity }).__approveModerationEntity = approveModerationEntity
  ;(window as unknown as { __rejectModerationEntity: typeof rejectModerationEntity }).__rejectModerationEntity = rejectModerationEntity
  ;(window as unknown as { __requestReReviewModerationEntity: typeof requestReReviewModerationEntity }).__requestReReviewModerationEntity = requestReReviewModerationEntity
  ;(window as unknown as { __resetAllModeration: typeof resetAllModeration }).__resetAllModeration = resetAllModeration
  ;(window as unknown as { __getVolunteerTrackEligibility: typeof getVolunteerTrackEligibility }).__getVolunteerTrackEligibility = getVolunteerTrackEligibility
  ;(window as unknown as { __saveVolunteerTrackEligibility: typeof saveVolunteerTrackEligibility }).__saveVolunteerTrackEligibility = saveVolunteerTrackEligibility
  ;(window as unknown as { __resetVolunteerTrackEligibility: typeof resetVolunteerTrackEligibility }).__resetVolunteerTrackEligibility = resetVolunteerTrackEligibility
  ;(window as unknown as { __getVolunteerAvailabilityState: typeof getVolunteerAvailabilityState }).__getVolunteerAvailabilityState = getVolunteerAvailabilityState
  ;(window as unknown as { __applyVolunteerAvailabilityOverride: typeof applyVolunteerAvailabilityOverride }).__applyVolunteerAvailabilityOverride = applyVolunteerAvailabilityOverride
  ;(window as unknown as { __resetVolunteerAvailabilityOverride: typeof resetVolunteerAvailabilityOverride }).__resetVolunteerAvailabilityOverride = resetVolunteerAvailabilityOverride
  ;(window as unknown as { __getAdminEvaluationRequests: typeof getAdminEvaluationRequests }).__getAdminEvaluationRequests = getAdminEvaluationRequests
  ;(window as unknown as { __assignHE0142Candidate: typeof assignHE0142Candidate }).__assignHE0142Candidate = assignHE0142Candidate
  ;(window as unknown as { __confirmHE0142Reassignment: typeof confirmHE0142Reassignment }).__confirmHE0142Reassignment = confirmHE0142Reassignment
  ;(window as unknown as { __CANONICAL_REQUEST_SUBMISSION_MAP: typeof CANONICAL_REQUEST_SUBMISSION_MAP }).__CANONICAL_REQUEST_SUBMISSION_MAP = CANONICAL_REQUEST_SUBMISSION_MAP
  ;(window as unknown as { __getMappingBySubmissionId: typeof getMappingBySubmissionId }).__getMappingBySubmissionId = getMappingBySubmissionId
  ;(window as unknown as { __getMappingByRequestId: typeof getMappingByRequestId }).__getMappingByRequestId = getMappingByRequestId
  ;(window as unknown as { __getREQ1042RoutingState: typeof getREQ1042RoutingState }).__getREQ1042RoutingState = getREQ1042RoutingState
}
