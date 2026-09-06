// Bidirectional Request ID <-> Submission ID Mapping Model for Auratio Step-IV

export interface RequestSubmissionMapping {
  requestId: string
  submissionId: string
  user: string
  track: string
  trackSlug?: string
  requestedMethod: 'Human' | 'AI'
  evaluationId?: string
  destinationPath: string
}

export const CANONICAL_REQUEST_SUBMISSION_MAP: Record<string, RequestSubmissionMapping> = {
  'SUB-8821': {
    requestId: 'REQ-1042',
    submissionId: 'SUB-8821',
    user: 'Alex Morgan',
    track: 'Business Pitch / Sales Pitch',
    trackSlug: 'business-pitch',
    requestedMethod: 'Human',
    evaluationId: 'HE-0142',
    destinationPath: '/admin/requests/req-1042',
  },
  'SUB-8814': {
    requestId: 'REQ-1038',
    submissionId: 'SUB-8814',
    user: 'Taylor Kim',
    track: 'Extempore',
    trackSlug: 'extempore',
    requestedMethod: 'Human',
    evaluationId: 'HE-0138',
    destinationPath: '/admin/requests/req-1038',
  },
  'SUB-8799': {
    requestId: 'REQ-1041',
    submissionId: 'SUB-8799',
    user: 'Sam Lee',
    track: 'Informative',
    trackSlug: 'informative',
    requestedMethod: 'AI',
    destinationPath: '/admin/requests/req-1041',
  },
}

export function getMappingBySubmissionId(submissionId: string): RequestSubmissionMapping {
  const norm = (submissionId || '').trim().toUpperCase()
  if (CANONICAL_REQUEST_SUBMISSION_MAP[norm]) {
    return CANONICAL_REQUEST_SUBMISSION_MAP[norm]
  }
  const numeric = norm.replace(/\D/g, '') || '0000'
  const reqId = `REQ-${numeric}`
  return {
    requestId: reqId,
    submissionId: norm,
    user: 'Evaluated Speaker',
    track: 'Business Pitch / Sales Pitch',
    requestedMethod: 'Human',
    destinationPath: `/admin/requests/${reqId.toLowerCase()}`,
  }
}

export function getMappingByRequestId(requestId: string): RequestSubmissionMapping | null {
  const norm = (requestId || '').trim().toUpperCase()
  for (const item of Object.values(CANONICAL_REQUEST_SUBMISSION_MAP)) {
    if (item.requestId.toUpperCase() === norm) {
      return item
    }
  }
  return null
}
