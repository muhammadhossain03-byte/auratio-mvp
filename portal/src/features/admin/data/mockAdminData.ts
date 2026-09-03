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
    destinationPath: '/admin/requests/req-1042/reassign',
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
    destinationPath: '/admin/moderation/sub-8821',
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
    destinationPath: '/admin/volunteers/farhana',
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
    destinationPath: '/admin/volunteers/farhana',
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
    destinationPath: '/admin/volunteers/farhana',
  },
]

let adminVolunteers: AdminVolunteerItem[] = [...CANONICAL_VOLUNTEERS]

export function getAdminVolunteersList(): AdminVolunteerItem[] {
  return [...adminVolunteers]
}

export function resetAdminVolunteers(): void {
  adminVolunteers = [...CANONICAL_VOLUNTEERS]
}

export function addAdminVolunteer(params: {
  name: string
  email: string
  trackCount: number
}): AdminVolunteerItem {
  const slug = params.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `vol-${Date.now()}`
  const newItem: AdminVolunteerItem = {
    id: slug,
    name: params.name,
    email: params.email,
    tracks: `${params.trackCount} track${params.trackCount === 1 ? '' : 's'}`,
    effectiveAvailability: 'Available',
    activeAssignments: '0',
    lifecycle: 'Invited',
    actionLabel: 'Open',
    destinationPath: `/admin/volunteers/${slug}`,
  }
  adminVolunteers = [...adminVolunteers, newItem]
  return newItem
}

export function getAdminVolunteerById(id: string): AdminVolunteerItem | undefined {
  return adminVolunteers.find((v) => v.id === id) || (id === 'farhana' ? adminVolunteers.find((v) => v.id === 'farhana') : undefined)
}

export const adminVolunteersList: AdminVolunteerItem[] = adminVolunteers

export interface AdminEventItem {
  id: string
  title: string
  date: string
  location: string
  relevantPaths: string
  status: 'Published' | 'Draft'
  actionLabel: string
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

let adminEvents: AdminEventItem[] = [...CANONICAL_EVENTS]

export function getAdminEventsList(): AdminEventItem[] {
  return [...adminEvents]
}

export function resetAdminEvents(): void {
  adminEvents = [...CANONICAL_EVENTS]
}

export function getAdminEventById(id: string): AdminEventItem | undefined {
  return adminEvents.find((e) => e.id === id) || (id === 'draft' ? adminEvents[2] : undefined)
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

  const eventId = event.id || `event-${Date.now()}`
  const existingIdx = adminEvents.findIndex((e) => e.id === eventId)

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
    adminEvents[existingIdx] = savedItem
  } else {
    adminEvents = [savedItem, ...adminEvents]
  }

  return savedItem
}

export const adminEventsList: AdminEventItem[] = adminEvents

export interface AdminAuditLogItem {
  timestamp: string
  actor: string
  action: string
  target: string
  reason: string
}

export const adminAuditLogsList: AdminAuditLogItem[] = [
  {
    timestamp: '25 Aug 03:41',
    actor: 'Admin A. Rahman',
    action: 'Reassigned Human Evaluation',
    target: 'HE-0142 / SUB-8821',
    reason: 'Scheduling / operational',
  },
  {
    timestamp: '25 Aug 03:26',
    actor: 'Farhana Islam',
    action: 'Submitted evaluator version',
    target: 'SUB-8821',
    reason: '—',
  },
  {
    timestamp: '25 Aug 03:10',
    actor: 'Super Admin',
    action: 'Deactivated Admin account',
    target: 'admin@example',
    reason: 'Where applicable',
  },
  {
    timestamp: '25 Aug 02:58',
    actor: 'Admin A. Rahman',
    action: 'Availability override',
    target: 'Nadia Rahman',
    reason: 'Coverage need',
  },
  {
    timestamp: '25 Aug 02:44',
    actor: 'Admin A. Rahman',
    action: 'Changed track eligibility',
    target: 'Imran Hossain',
    reason: '—',
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

// In-memory moderation state for SUB-8821
let sub8821PublicationStatus: 'Pending Moderation' | 'Approved' | 'Rejected' | 'Reopened' = 'Pending Moderation'
let sub8821RejectionReason = ''

export function getSub8821ModerationState() {
  return {
    publicationStatus: sub8821PublicationStatus,
    rejectionReason: sub8821RejectionReason,
  }
}

export function approveSub8821() {
  sub8821PublicationStatus = 'Approved'
  return getSub8821ModerationState()
}

export function rejectSub8821(reason: string) {
  sub8821PublicationStatus = 'Rejected'
  sub8821RejectionReason = reason
  return getSub8821ModerationState()
}

export function requestReReviewSub8821() {
  sub8821PublicationStatus = 'Reopened'
  return getSub8821ModerationState()
}

export function resetSub8821Moderation() {
  sub8821PublicationStatus = 'Pending Moderation'
  sub8821RejectionReason = ''
}

// In-memory Farhana availability override state
let farhanaEffectiveAvailability = 'Available'
let farhanaOverrideReason = 'None'

export function getFarhanaAvailabilityState() {
  return {
    declaredAvailability: 'Available',
    effectiveAvailability: farhanaEffectiveAvailability,
    overrideReason: farhanaOverrideReason,
  }
}

export function applyFarhanaAvailabilityOverride(effectiveStatus: string, reason: string) {
  farhanaEffectiveAvailability = effectiveStatus
  farhanaOverrideReason = reason || 'Operational coverage / scheduling reason'
  return getFarhanaAvailabilityState()
}

export function resetFarhanaAvailabilityOverride() {
  farhanaEffectiveAvailability = 'Available'
  farhanaOverrideReason = 'None'
}

// In-memory Farhana track eligibility state
export const INITIAL_FARHANA_TRACKS = [
  'Informative',
  'Persuasive',
  'Business Pitch / Sales Pitch',
]

let farhanaTracksState: string[] = [...INITIAL_FARHANA_TRACKS]

export function getFarhanaTrackEligibility(): string[] {
  return [...farhanaTracksState]
}

export function saveFarhanaTrackEligibility(tracks: string[]): string[] {
  if (tracks.length > 0) {
    farhanaTracksState = [...tracks]
  }
  return getFarhanaTrackEligibility()
}

export function resetFarhanaTrackEligibility() {
  farhanaTracksState = [...INITIAL_FARHANA_TRACKS]
}

// In-memory Volunteer Invite track draft state (isolated from Farhana)
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
  ;(window as unknown as { __addAdminVolunteer: typeof addAdminVolunteer }).__addAdminVolunteer = addAdminVolunteer
}

