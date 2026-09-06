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
}

export function getMappingBySubmissionId(submissionId: string): RequestSubmissionMapping | null {
  const norm = (submissionId || '').trim().toUpperCase()
  if (CANONICAL_REQUEST_SUBMISSION_MAP[norm]) {
    return CANONICAL_REQUEST_SUBMISSION_MAP[norm]
  }
  return null
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
