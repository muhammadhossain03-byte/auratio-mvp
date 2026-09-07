import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ANCHORS = ['Low', 'Competent', 'Excellent']
const EXPECTED_TRACK_COUNT = 13
const EXPECTED_CRITERION_COUNT = 64
const EXPECTED_ANCHOR_DESCRIPTION_COUNT = 192

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const portalDir = path.resolve(scriptDir, '..')
const sourcePath = path.resolve(portalDir, '..', 'docs', 'ai', 'rubrics-and-anchors-v1.json')
const outputPath = path.resolve(
  portalDir,
  'src',
  'features',
  'volunteer',
  'data',
  'generatedRubricAnchors.ts'
)

function fail(message) {
  throw new Error(`[generate-rubric-anchors] ${message}`)
}

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(`${label} must be an object.`)
  }
  return value
}

function validateRange(range, expectedMin, expectedMax, label) {
  requireObject(range, label)
  if (range.min !== expectedMin || range.max !== expectedMax) {
    fail(`${label} must be exactly ${expectedMin}-${expectedMax}.`)
  }
}

function validateCriterion(criterion, seenIds, anchorDescriptionsById) {
  requireObject(criterion, 'criterion')
  if (typeof criterion.id !== 'string' || criterion.id.trim() === '') {
    fail('Every criterion requires a non-empty string id.')
  }
  if (seenIds.has(criterion.id)) {
    fail(`Duplicate criterion id: ${criterion.id}`)
  }
  seenIds.add(criterion.id)

  if (criterion.max_points !== 5 && criterion.max_points !== 10) {
    fail(`Criterion ${criterion.id} has unsupported max_points=${criterion.max_points}.`)
  }

  const anchors = requireObject(criterion.anchors, `${criterion.id}.anchors`)
  const keys = Object.keys(anchors).sort()
  const expectedKeys = [...ANCHORS].sort()
  if (JSON.stringify(keys) !== JSON.stringify(expectedKeys)) {
    fail(`Criterion ${criterion.id} must contain exactly Low, Competent, and Excellent anchors.`)
  }

  for (const anchor of ANCHORS) {
    if (typeof anchors[anchor] !== 'string' || anchors[anchor].trim() === '') {
      fail(`Criterion ${criterion.id} has an empty ${anchor} anchor description.`)
    }
  }

  anchorDescriptionsById[criterion.id] = {
    Low: anchors.Low,
    Competent: anchors.Competent,
    Excellent: anchors.Excellent,
  }
}

function buildGeneratedSource(source) {
  const scoreRanges = requireObject(source.score_ranges, 'score_ranges')
  const five = requireObject(scoreRanges['5_point'], 'score_ranges.5_point')
  const ten = requireObject(scoreRanges['10_point'], 'score_ranges.10_point')

  validateRange(five.Low, 0, 2, '5-point Low')
  validateRange(five.Competent, 3, 4, '5-point Competent')
  validateRange(five.Excellent, 5, 5, '5-point Excellent')
  validateRange(ten.Low, 0, 4, '10-point Low')
  validateRange(ten.Competent, 5, 8, '10-point Competent')
  validateRange(ten.Excellent, 9, 10, '10-point Excellent')

  if (!Array.isArray(source.universal_delivery) || source.universal_delivery.length !== 8) {
    fail('universal_delivery must contain exactly 8 criteria.')
  }
  if (!Array.isArray(source.structural_flow) || source.structural_flow.length !== 4) {
    fail('structural_flow must contain exactly 4 criteria.')
  }

  const tracks = requireObject(source.tracks, 'tracks')
  const trackEntries = Object.entries(tracks)
  if (trackEntries.length !== EXPECTED_TRACK_COUNT) {
    fail(`tracks must contain exactly ${EXPECTED_TRACK_COUNT} tracks.`)
  }

  const seenIds = new Set()
  const anchorDescriptionsById = {}

  for (const criterion of source.universal_delivery) {
    validateCriterion(criterion, seenIds, anchorDescriptionsById)
  }
  for (const criterion of source.structural_flow) {
    validateCriterion(criterion, seenIds, anchorDescriptionsById)
  }
  for (const [trackSlug, track] of trackEntries) {
    requireObject(track, `tracks.${trackSlug}`)
    if (!Array.isArray(track.criteria) || track.criteria.length !== 4) {
      fail(`Track ${trackSlug} must contain exactly 4 criteria.`)
    }
    for (const criterion of track.criteria) {
      validateCriterion(criterion, seenIds, anchorDescriptionsById)
    }
  }

  if (seenIds.size !== EXPECTED_CRITERION_COUNT) {
    fail(`Expected ${EXPECTED_CRITERION_COUNT} unique criterion ids, found ${seenIds.size}.`)
  }

  const anchorDescriptionCount = Object.values(anchorDescriptionsById)
    .reduce((sum, descriptions) => sum + Object.keys(descriptions).length, 0)

  if (anchorDescriptionCount !== EXPECTED_ANCHOR_DESCRIPTION_COUNT) {
    fail(
      `Expected ${EXPECTED_ANCHOR_DESCRIPTION_COUNT} anchor descriptions, found ${anchorDescriptionCount}.`
    )
  }

  const canonicalScoreRanges = {
    '5_point': {
      Low: { min: five.Low.min, max: five.Low.max },
      Competent: { min: five.Competent.min, max: five.Competent.max },
      Excellent: { min: five.Excellent.min, max: five.Excellent.max },
    },
    '10_point': {
      Low: { min: ten.Low.min, max: ten.Low.max },
      Competent: { min: ten.Competent.min, max: ten.Competent.max },
      Excellent: { min: ten.Excellent.min, max: ten.Excellent.max },
    },
  }

  return `// AUTO-GENERATED by portal/scripts/generate-rubric-anchors.mjs
// Source: docs/ai/rubrics-and-anchors-v1.json
// Do not hand-edit. Regenerate from the authoritative JSON.

export type QualitativeAnchor = 'Low' | 'Competent' | 'Excellent'

export interface AnchorScoreRange {
  min: number
  max: number
}

export interface CriterionAnchorDescriptions {
  Low: string
  Competent: string
  Excellent: string
}

export const CANONICAL_SCORE_RANGES = ${JSON.stringify(canonicalScoreRanges, null, 2)} as const

export const CRITERION_ANCHOR_DESCRIPTIONS = ${JSON.stringify(anchorDescriptionsById, null, 2)} as const

export const CANONICAL_CRITERION_COUNT = ${EXPECTED_CRITERION_COUNT}
export const CANONICAL_ANCHOR_DESCRIPTION_COUNT = ${EXPECTED_ANCHOR_DESCRIPTION_COUNT}

export function isQualitativeAnchor(value: unknown): value is QualitativeAnchor {
  return value === 'Low' || value === 'Competent' || value === 'Excellent'
}

export function getAnchorScoreRange(
  maxPoints: number,
  anchor: QualitativeAnchor | null | undefined
): AnchorScoreRange | null {
  if (!anchor || !isQualitativeAnchor(anchor)) return null
  const key = maxPoints === 5 ? '5_point' : maxPoints === 10 ? '10_point' : null
  if (!key) return null
  return CANONICAL_SCORE_RANGES[key][anchor]
}

export function isAnchorScoreCompatible(
  maxPoints: number,
  anchor: QualitativeAnchor | null | undefined,
  score: number | null | undefined
): boolean {
  if (score === null || score === undefined || !Number.isInteger(score)) return false
  const range = getAnchorScoreRange(maxPoints, anchor)
  return range !== null && score >= range.min && score <= range.max
}

export function formatAnchorScoreRange(
  maxPoints: number,
  anchor: QualitativeAnchor | null | undefined
): string {
  const range = getAnchorScoreRange(maxPoints, anchor)
  if (!range) return ''
  return range.min === range.max ? String(range.min) : \`\${range.min}–\${range.max}\`
}

export function getAnchorScoreValidationMessage(
  maxPoints: number,
  anchor: QualitativeAnchor
): string {
  const range = getAnchorScoreRange(maxPoints, anchor)
  if (!range) return 'Selected anchor is not valid for this criterion.'
  if (range.min === range.max) {
    return \`\${anchor} requires a score of \${range.min} for this criterion.\`
  }
  return \`\${anchor} requires a score between \${range.min} and \${range.max} for this criterion.\`
}

export function getCriterionAnchorDescriptions(
  criterionId: string
): CriterionAnchorDescriptions | null {
  const registry = CRITERION_ANCHOR_DESCRIPTIONS as Record<string, CriterionAnchorDescriptions>
  return registry[criterionId] ?? null
}
`
}

if (!fs.existsSync(sourcePath)) {
  fail(`Authoritative rubric source not found: ${sourcePath}`)
}

const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
const generated = buildGeneratedSource(source)
const checkOnly = process.argv.includes('--check')

if (checkOnly) {
  if (!fs.existsSync(outputPath)) {
    fail(`Generated runtime file is missing: ${outputPath}`)
  }
  const current = fs.readFileSync(outputPath, 'utf8')
  if (current !== generated) {
    fail('Generated runtime anchor registry is out of date. Run npm run generate:rubric-anchors.')
  }
  console.log(
    `[generate-rubric-anchors] CHECK PASS: ${EXPECTED_CRITERION_COUNT} criteria / ` +
      `${EXPECTED_ANCHOR_DESCRIPTION_COUNT} anchor descriptions.`
  )
} else {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, generated, 'utf8')
  console.log(
    `[generate-rubric-anchors] WROTE ${outputPath}: ${EXPECTED_CRITERION_COUNT} criteria / ` +
      `${EXPECTED_ANCHOR_DESCRIPTION_COUNT} anchor descriptions.`
  )
}
