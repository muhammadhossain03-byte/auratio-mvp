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
    interactive: false,
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
    interactive: false, // moderation screen out of batch
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

export function resetHE0142Reassignment() {
  he0142ActiveOwner = 'Farhana Islam'
  he0142SupersededOwner = null
}
