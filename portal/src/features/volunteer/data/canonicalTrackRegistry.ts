export type AuratioPath = 'Public Speaking' | 'Professional Presenting' | 'Content Creation'

export interface CriterionDefinition {
  id: string
  name: string
  category: 'Universal Delivery' | 'Structural Flow' | 'Track Specialisation'
  maxPoints: number
  description?: string
}

export interface TrackDefinition {
  label: string
  slug: string
  path: AuratioPath
  maxPoints: number
  criteria: CriterionDefinition[]
}

// 8 Universal Delivery Criteria (5 pts each = 40 pts max)
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

// 4 Structural Flow Criteria (5 pts each = 20 pts max)
export const STRUCTURAL_FLOW_CRITERIA: CriterionDefinition[] = [
  { id: 'sf-hook', name: 'Hook strength', category: 'Structural Flow', maxPoints: 5 },
  { id: 'sf-transitions', name: 'Logical transitions', category: 'Structural Flow', maxPoints: 5 },
  { id: 'sf-thesis', name: 'Central thesis clarity', category: 'Structural Flow', maxPoints: 5 },
  { id: 'sf-conclusion', name: 'Track-appropriate conclusion', category: 'Structural Flow', maxPoints: 5 },
]

export const PUBLIC_SPEAKING_TRACKS = [
  'Informative',
  'Extempore',
  'Persuasive',
  'Argumentative / Debate',
  'Explanatory',
] as const

export const PROFESSIONAL_PRESENTING_TRACKS = [
  'News Delivery',
  'Business Pitch / Sales Pitch',
  'General Presentation / Multimedia',
  'Academic — Poster / Project / Thesis',
  'Corporate Report',
] as const

export const CONTENT_CREATION_TRACKS = [
  'Infotainment-Oriented',
  'Academic — Lecture / Course',
  'Marketing / Promotional',
] as const

export const AUTHORITATIVE_MVP_TRACKS = [
  ...PUBLIC_SPEAKING_TRACKS,
  ...PROFESSIONAL_PRESENTING_TRACKS,
  ...CONTENT_CREATION_TRACKS,
] as const

export type AuthoritativeTrack = (typeof AUTHORITATIVE_MVP_TRACKS)[number]

export const CANONICAL_TRACK_REGISTRY: Record<string, TrackDefinition> = {
  // Public Speaking
  'informative': {
    label: 'Informative',
    slug: 'informative',
    path: 'Public Speaking',
    maxPoints: 40,
    criteria: [
      { id: 'inf-clarity', name: 'Objective clarity', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'inf-comprehension', name: 'Audience comprehension', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'inf-neutrality', name: 'Neutrality and factual accuracy', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'inf-breakdown', name: 'Complex concept breakdown', category: 'Track Specialisation', maxPoints: 10 },
    ],
  },
  'extempore': {
    label: 'Extempore',
    slug: 'extempore',
    path: 'Public Speaking',
    maxPoints: 40,
    criteria: [
      { id: 'ex-thesis', name: 'Rapid time-to-thesis', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'ex-structure', name: 'Spontaneous structure', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'ex-narrative', name: 'Narrative continuity', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'ex-composure', name: 'Composure and hesitation control', category: 'Track Specialisation', maxPoints: 10 },
    ],
  },
  'persuasive': {
    label: 'Persuasive',
    slug: 'persuasive',
    path: 'Public Speaking',
    maxPoints: 40,
    criteria: [
      { id: 'per-ethos-pathos-logos', name: 'Ethos, Pathos, and Logos balance', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'per-emotional-resonance', name: 'Audience emotional resonance', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'per-urgency-conviction', name: 'Urgency and conviction', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'per-objection', name: 'Objection anticipation and resistance handling', category: 'Track Specialisation', maxPoints: 10 },
    ],
  },
  'argumentative-debate': {
    label: 'Argumentative / Debate',
    slug: 'argumentative-debate',
    path: 'Public Speaking',
    maxPoints: 40,
    criteria: [
      { id: 'arg-premise', name: 'Premise-claim alignment', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'arg-evidence', name: 'Evidence rigour', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'arg-validity', name: 'Logical validity and signposting', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'arg-counterarguments', name: 'Counterarguments and rebuttals', category: 'Track Specialisation', maxPoints: 10 },
    ],
  },
  'explanatory': {
    label: 'Explanatory',
    slug: 'explanatory',
    path: 'Public Speaking',
    maxPoints: 40,
    criteria: [
      { id: 'exp-simplification', name: 'Pedagogical simplification', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'exp-analogies', name: 'Analogies and mental models', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'exp-jargon', name: 'Jargon control', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'exp-deconstruction', name: 'Step-by-step deconstruction', category: 'Track Specialisation', maxPoints: 10 },
    ],
  },

  // Professional Presenting
  'news-delivery': {
    label: 'News Delivery',
    slug: 'news-delivery',
    path: 'Professional Presenting',
    maxPoints: 40,
    criteria: [
      { id: 'nd-cadence', name: 'Teleprompter-style cadence', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'nd-tone', name: 'Objective authoritative tone', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'nd-signposting', name: 'Headline-shift signposting', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'nd-accuracy', name: 'Accuracy and composure', category: 'Track Specialisation', maxPoints: 10 },
    ],
  },
  'business-pitch': {
    label: 'Business Pitch / Sales Pitch',
    slug: 'business-pitch',
    path: 'Professional Presenting',
    maxPoints: 40,
    criteria: [
      { id: 'bp-problem', name: 'Problem-solution fit', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'bp-value', name: 'Value proposition clarity', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'bp-traction', name: 'Traction and investor appeal', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'bp-diff', name: 'Competitive differentiation', category: 'Track Specialisation', maxPoints: 10 },
    ],
  },
  'general-presentation-multimedia': {
    label: 'General Presentation / Multimedia',
    slug: 'general-presentation-multimedia',
    path: 'Professional Presenting',
    maxPoints: 40,
    criteria: [
      { id: 'gp-sync', name: 'Slide-to-speech synchronisation', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'gp-continuity', name: 'Narrative continuity across media', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'gp-visual', name: 'Visual support without reading', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'gp-pacing', name: 'Media pacing and accessibility', category: 'Track Specialisation', maxPoints: 10 },
    ],
  },
  'academic-poster-project-thesis': {
    label: 'Academic — Poster / Project / Thesis',
    slug: 'academic-poster-project-thesis',
    path: 'Professional Presenting',
    maxPoints: 40,
    criteria: [
      { id: 'ap-terminology', name: 'Specialised terminology precision', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'ap-methodology', name: 'Methodology defensibility', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'ap-evidence', name: 'Citation and evidence rigour', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'ap-findings', name: 'Findings and claim support', category: 'Track Specialisation', maxPoints: 10 },
    ],
  },
  'corporate-report': {
    label: 'Corporate Report',
    slug: 'corporate-report',
    path: 'Professional Presenting',
    maxPoints: 40,
    criteria: [
      { id: 'cr-bluf', name: 'Bottom-Line Up Front orientation', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'cr-translation', name: 'Complex data translation', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'cr-insight', name: 'Actionable business insight', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'cr-recommendation', name: 'Decision-oriented recommendation', category: 'Track Specialisation', maxPoints: 10 },
    ],
  },

  // Content Creation
  'infotainment-oriented': {
    label: 'Infotainment-Oriented',
    slug: 'infotainment-oriented',
    path: 'Content Creation',
    maxPoints: 40,
    criteria: [
      { id: 'info-balance', name: 'Information-entertainment balance', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'info-progression', name: 'Fast-paced narrative progression', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'info-triggers', name: 'Engagement triggers', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'info-energy', name: 'Personality and visual energy', category: 'Track Specialisation', maxPoints: 10 },
    ],
  },
  'academic-lecture-course': {
    label: 'Academic — Lecture / Course',
    slug: 'academic-lecture-course',
    path: 'Content Creation',
    maxPoints: 40,
    criteria: [
      { id: 'al-outcomes', name: 'Structured learning outcomes', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'al-sequence', name: 'Instructional sequence', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'al-checkin', name: 'Concept check-in pacing', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'al-takeaway', name: 'Instructional takeaway clarity', category: 'Track Specialisation', maxPoints: 10 },
    ],
  },
  'marketing-promotional': {
    label: 'Marketing / Promotional',
    slug: 'marketing-promotional',
    path: 'Content Creation',
    maxPoints: 40,
    criteria: [
      { id: 'mkt-painpoint', name: 'Audience pain-point positioning', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'mkt-payoff', name: 'Product or service payoff clarity', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'mkt-drivers', name: 'Conversion drivers', category: 'Track Specialisation', maxPoints: 10 },
      { id: 'mkt-alignment', name: 'Brand-message alignment', category: 'Track Specialisation', maxPoints: 10 },
    ],
  },
}

export const AUTHORITATIVE_TRACK_SLUGS = Object.keys(CANONICAL_TRACK_REGISTRY) as readonly string[]

// Export Record of trackSlug -> CriterionDefinition[]
export const TRACK_SPECIFIC_CRITERIA: Record<string, CriterionDefinition[]> = Object.fromEntries(
  Object.entries(CANONICAL_TRACK_REGISTRY).map(([slug, def]) => [slug, def.criteria])
)

/**
 * Normalizes input string to match canonical track slug.
 * Explicitly returns null for any unknown, invalid, or unsupported string.
 * Never defaults to business-pitch or any other track.
 */
function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .replace(/[—–]/g, '-') // replace em/en dash with hyphen
    .replace(/[/]/g, '-')  // replace slashes with hyphen
    .replace(/[^a-z0-9-]/g, '-') // non-alphanumeric to hyphen
    .replace(/-+/g, '-')   // collapse repeated hyphens
    .replace(/^-|-$/g, '')  // trim hyphens
}

// Canonical alias map to allow friendly normalization variants without drift
const ALIAS_TO_SLUG: Record<string, string> = {
  'business-pitch-sales-pitch': 'business-pitch',
  'sales-pitch': 'business-pitch',
  'general-presentation': 'general-presentation-multimedia',
  'academic-poster': 'academic-poster-project-thesis',
  'academic-lecture': 'academic-lecture-course',
}

/**
 * Deterministically resolves a track definition from an exact label, stable slug, or normalized key.
 * Returns null if track is not recognized. Never fabricates another track.
 */
export function getTrackDefinition(input: string | null | undefined): TrackDefinition | null {
  if (!input || typeof input !== 'string') return null
  const trimmed = input.trim()
  if (!trimmed) return null

  // 1. Direct slug match
  if (CANONICAL_TRACK_REGISTRY[trimmed]) {
    return CANONICAL_TRACK_REGISTRY[trimmed]
  }

  // 2. Direct label match
  const byLabel = Object.values(CANONICAL_TRACK_REGISTRY).find(
    (def) => def.label.toLowerCase() === trimmed.toLowerCase()
  )
  if (byLabel) return byLabel

  // 3. Normalized key match
  const norm = normalizeKey(trimmed)
  if (CANONICAL_TRACK_REGISTRY[norm]) {
    return CANONICAL_TRACK_REGISTRY[norm]
  }

  // 4. Alias lookup
  const resolvedAlias = ALIAS_TO_SLUG[norm]
  if (resolvedAlias && CANONICAL_TRACK_REGISTRY[resolvedAlias]) {
    return CANONICAL_TRACK_REGISTRY[resolvedAlias]
  }

  return null
}

/**
 * Resolves stable track slug from a track display label or slug.
 * Returns null if unknown. Never defaults to 'business-pitch'.
 */
export function getTrackSlug(input: string | null | undefined): string | null {
  return getTrackDefinition(input)?.slug ?? null
}

/**
 * Resolves exact authoritative track label from a track slug or label.
 * Returns null if unknown. Never defaults to 'Business Pitch / Sales Pitch'.
 */
export function getTrackLabel(input: string | null | undefined): string | null {
  return getTrackDefinition(input)?.label ?? null
}

/**
 * Returns all 16 scoring criteria for a track (8 Universal + 4 Structural + 4 Track Specialisation).
 * Returns null if track is invalid/unknown. Never falls back to Business Pitch.
 */
export function getCriteriaForTrack(trackSlugOrLabel: string | null | undefined): CriterionDefinition[] | null {
  const def = getTrackDefinition(trackSlugOrLabel)
  if (!def) return null

  return [
    ...UNIVERSAL_DELIVERY_CRITERIA,
    ...STRUCTURAL_FLOW_CRITERIA,
    ...def.criteria,
  ]
}
