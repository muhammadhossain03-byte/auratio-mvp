// Auratio Admin Portal — Local / In-Memory Mock Data & State

export interface AdminQueueItem {
  id: string
  user: string
  track: string
  requestedMethod: 'Human' | 'AI'
  routing: 'Requested' | 'Assigned AI' | 'Assigned Human' | 'Redirected Human'
  eligibility: 'Eligible'
  interactive: boolean
  destinationPath?: string
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
  publicationStatus: 'Pending Moderation' | 'Processing' | 'Approved'
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
    selectedTracks: ['Informative', 'Persuasive', 'Business Pitch / Sales Pitch', 'Extempore', 'Motivational'],
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

// In-memory assignment & reassignment state for HE-0142
let he0142ActiveOwner: string | null = 'Farhana Islam'
let he0142SupersededOwner: string | null = null

export function getHE0142AssignmentState() {
  return {
    activeOwner: he0142ActiveOwner,
    supersededOwner: he0142SupersededOwner,
  }
}

export function confirmHE0142Reassignment() {
  he0142SupersededOwner = he0142ActiveOwner
  he0142ActiveOwner = 'Nadia Rahman'
  return getHE0142AssignmentState()
}

export function assignHE0142Candidate(name: string) {
  he0142ActiveOwner = name
  he0142SupersededOwner = null
  return getHE0142AssignmentState()
}

export function resetHE0142Reassignment() {
  he0142ActiveOwner = 'Farhana Islam'
  he0142SupersededOwner = null
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
    tracks: ['Informative', 'Persuasive', 'Business Pitch / Sales Pitch', 'Extempore', 'Motivational'],
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
}
