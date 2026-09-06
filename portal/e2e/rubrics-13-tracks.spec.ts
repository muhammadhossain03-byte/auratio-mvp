import { test, expect } from '@playwright/test'

interface TrackSpecAssertion {
  label: string
  slug: string
  synthId: string
  criteria: [string, string, string, string]
}

const AUTHORITATIVE_13_TRACKS: TrackSpecAssertion[] = [
  {
    label: 'Informative',
    slug: 'informative',
    synthId: 'SUB-SYNTH-INF',
    criteria: [
      'Objective clarity',
      'Audience comprehension',
      'Neutrality and factual accuracy',
      'Complex concept breakdown',
    ],
  },
  {
    label: 'Extempore',
    slug: 'extempore',
    synthId: 'SUB-SYNTH-EXT',
    criteria: [
      'Rapid time-to-thesis',
      'Spontaneous structure',
      'Narrative continuity',
      'Composure and hesitation control',
    ],
  },
  {
    label: 'Persuasive',
    slug: 'persuasive',
    synthId: 'SUB-SYNTH-PER',
    criteria: [
      'Ethos, Pathos, and Logos balance',
      'Audience emotional resonance',
      'Urgency and conviction',
      'Objection anticipation and resistance handling',
    ],
  },
  {
    label: 'Argumentative / Debate',
    slug: 'argumentative-debate',
    synthId: 'SUB-SYNTH-ARG',
    criteria: [
      'Premise-claim alignment',
      'Evidence rigour',
      'Logical validity and signposting',
      'Counterarguments and rebuttals',
    ],
  },
  {
    label: 'Explanatory',
    slug: 'explanatory',
    synthId: 'SUB-SYNTH-EXP',
    criteria: [
      'Pedagogical simplification',
      'Analogies and mental models',
      'Jargon control',
      'Step-by-step deconstruction',
    ],
  },
  {
    label: 'News Delivery',
    slug: 'news-delivery',
    synthId: 'SUB-SYNTH-ND',
    criteria: [
      'Teleprompter-style cadence',
      'Objective authoritative tone',
      'Headline-shift signposting',
      'Accuracy and composure',
    ],
  },
  {
    label: 'Business Pitch / Sales Pitch',
    slug: 'business-pitch',
    synthId: 'SUB-SYNTH-BP',
    criteria: [
      'Problem-solution fit',
      'Value proposition clarity',
      'Traction and investor appeal',
      'Competitive differentiation',
    ],
  },
  {
    label: 'General Presentation / Multimedia',
    slug: 'general-presentation-multimedia',
    synthId: 'SUB-SYNTH-GP',
    criteria: [
      'Slide-to-speech synchronisation',
      'Narrative continuity across media',
      'Visual support without reading',
      'Media pacing and accessibility',
    ],
  },
  {
    label: 'Academic — Poster / Project / Thesis',
    slug: 'academic-poster-project-thesis',
    synthId: 'SUB-SYNTH-AP',
    criteria: [
      'Specialised terminology precision',
      'Methodology defensibility',
      'Citation and evidence rigour',
      'Findings and claim support',
    ],
  },
  {
    label: 'Corporate Report',
    slug: 'corporate-report',
    synthId: 'SUB-SYNTH-CR',
    criteria: [
      'Bottom-Line Up Front orientation',
      'Complex data translation',
      'Actionable business insight',
      'Decision-oriented recommendation',
    ],
  },
  {
    label: 'Infotainment-Oriented',
    slug: 'infotainment-oriented',
    synthId: 'SUB-SYNTH-INFO',
    criteria: [
      'Information-entertainment balance',
      'Fast-paced narrative progression',
      'Engagement triggers',
      'Personality and visual energy',
    ],
  },
  {
    label: 'Academic — Lecture / Course',
    slug: 'academic-lecture-course',
    synthId: 'SUB-SYNTH-AL',
    criteria: [
      'Structured learning outcomes',
      'Instructional sequence',
      'Concept check-in pacing',
      'Instructional takeaway clarity',
    ],
  },
  {
    label: 'Marketing / Promotional',
    slug: 'marketing-promotional',
    synthId: 'SUB-SYNTH-MKT',
    criteria: [
      'Audience pain-point positioning',
      'Product or service payoff clarity',
      'Conversion drivers',
      'Brand-message alignment',
    ],
  },
]

test.describe('Auratio 13 Human-Evaluation Track Rubrics & Canonical Registry', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/volunteer/assignments')
  })

  test('canonical track registry contains exactly 13 authoritative tracks with stable slugs and 4 criteria each', async ({ page }) => {
    const registryData = await page.evaluate(() => {
      const win = window as any
      const registry = win.__CANONICAL_TRACK_REGISTRY || {}
      const authoritativeTracks = win.__AUTHORITATIVE_MVP_TRACKS || []
      const slugs = Object.keys(registry)
      return {
        trackCount: slugs.length,
        slugs,
        authoritativeCount: authoritativeTracks.length,
        authoritativeTracks,
        registry,
      }
    })

    expect(registryData.trackCount).toBe(13)
    expect(registryData.authoritativeCount).toBe(13)

    for (const item of AUTHORITATIVE_13_TRACKS) {
      expect(registryData.slugs).toContain(item.slug)
      expect(registryData.authoritativeTracks).toContain(item.label)

      const def = registryData.registry[item.slug]
      expect(def).toBeDefined()
      expect(def.label).toBe(item.label)
      expect(def.slug).toBe(item.slug)
      expect(def.maxPoints).toBe(40)
      expect(def.criteria).toHaveLength(4)

      const names = def.criteria.map((c: any) => c.name)
      expect(names).toEqual(item.criteria)

      for (const c of def.criteria) {
        expect(c.maxPoints).toBe(10)
        expect(c.category).toBe('Track Specialisation')
      }
    }
  })

  test('getCriteriaForTrack resolves exactly 16 criteria (40 + 20 + 40 = 100 max points) for every single track', async ({ page }) => {
    const rubricVerification = await page.evaluate((tracks) => {
      const win = window as any
      const results: Record<string, any> = {}

      for (const t of tracks) {
        const criteriaBySlug = win.__getCriteriaForTrack(t.slug)
        const criteriaByLabel = win.__getCriteriaForTrack(t.label)

        const universal = criteriaBySlug.filter((c: any) => c.category === 'Universal Delivery')
        const structural = criteriaBySlug.filter((c: any) => c.category === 'Structural Flow')
        const trackSpec = criteriaBySlug.filter((c: any) => c.category === 'Track Specialisation')

        const universalMax = universal.reduce((acc: number, c: any) => acc + c.maxPoints, 0)
        const structuralMax = structural.reduce((acc: number, c: any) => acc + c.maxPoints, 0)
        const trackSpecMax = trackSpec.reduce((acc: number, c: any) => acc + c.maxPoints, 0)

        results[t.slug] = {
          totalCount: criteriaBySlug.length,
          matchesLabelLookup: JSON.stringify(criteriaBySlug) === JSON.stringify(criteriaByLabel),
          universalCount: universal.length,
          structuralCount: structural.length,
          trackSpecCount: trackSpec.length,
          universalMax,
          structuralMax,
          trackSpecMax,
          totalMax: universalMax + structuralMax + trackSpecMax,
          trackSpecNames: trackSpec.map((c: any) => c.name),
        }
      }

      return results
    }, AUTHORITATIVE_13_TRACKS)

    for (const item of AUTHORITATIVE_13_TRACKS) {
      const res = rubricVerification[item.slug]
      expect(res.totalCount).toBe(16)
      expect(res.matchesLabelLookup).toBe(true)
      expect(res.universalCount).toBe(8)
      expect(res.structuralCount).toBe(4)
      expect(res.trackSpecCount).toBe(4)
      expect(res.universalMax).toBe(40)
      expect(res.structuralMax).toBe(20)
      expect(res.trackSpecMax).toBe(40)
      expect(res.totalMax).toBe(100)
      expect(res.trackSpecNames).toEqual(item.criteria)
    }
  })

  test('no track receives another track rubric (cross-rubric isolation)', async ({ page }) => {
    const businessPitchCriteria = [
      'Problem-solution fit',
      'Value proposition clarity',
      'Traction and investor appeal',
      'Competitive differentiation',
    ]

    const isolation = await page.evaluate((bpCriteria) => {
      const win = window as any
      const failures: string[] = []

      // Test specific tracks mentioned in spec
      const tracksToCheck = [
        'Argumentative / Debate',
        'News Delivery',
        'Corporate Report',
        'Marketing / Promotional',
        'Explanatory',
        'Academic — Poster / Project / Thesis',
        'Infotainment-Oriented',
        'Academic — Lecture / Course',
        'General Presentation / Multimedia',
        'Persuasive',
        'Informative',
        'Extempore',
      ]

      for (const track of tracksToCheck) {
        const criteria = win.__getCriteriaForTrack(track)
        const trackSpec = criteria.filter((c: any) => c.category === 'Track Specialisation')
        const names = trackSpec.map((c: any) => c.name)

        // Check if any business pitch criteria accidentally leaked
        const hasBpCriteria = bpCriteria.some((bpName: string) => names.includes(bpName))
        if (hasBpCriteria) {
          failures.push(`${track} received Business Pitch criteria!`)
        }
      }

      return failures
    }, businessPitchCriteria)

    expect(isolation).toEqual([])
  })

  test('unknown, invalid, or misspelled tracks return null and never fall back to business-pitch', async ({ page }) => {
    const fallbackResults = await page.evaluate(() => {
      const win = window as any
      const testCases = [
        'unknown',
        'Motivational',
        'motivational',
        'Invalid Track',
        'business',
        'sales',
        '',
        null,
        undefined,
      ]

      return testCases.map((input) => ({
        input,
        slug: win.__getTrackSlug(input),
        criteria: win.__getCriteriaForTrack(input),
      }))
    })

    for (const tc of fallbackResults) {
      expect(tc.slug).toBeNull()
      expect(tc.criteria).toBeNull()
    }
  })

  test('persuasive rubric strictly adheres to v3.7 and contains zero CTA overlap', async ({ page }) => {
    const persuasiveData = await page.evaluate(() => {
      const win = window as any
      const criteria = win.__getCriteriaForTrack('Persuasive')
      const trackSpec = criteria.filter((c: any) => c.category === 'Track Specialisation')
      const names = trackSpec.map((c: any) => c.name)

      return {
        names,
        hasCta: names.some((n: string) => n.toLowerCase().includes('call to action') || n.toLowerCase().includes('cta')),
        hasArgumentCredibility: names.some((n: string) => n.toLowerCase().includes('argument strength')),
        hasEmotionalLogicalAppeal: names.some((n: string) => n.toLowerCase().includes('emotional and logical appeal')),
      }
    })

    expect(persuasiveData.names).toEqual([
      'Ethos, Pathos, and Logos balance',
      'Audience emotional resonance',
      'Urgency and conviction',
      'Objection anticipation and resistance handling',
    ])
    expect(persuasiveData.hasCta).toBe(false)
    expect(persuasiveData.hasArgumentCredibility).toBe(false)
    expect(persuasiveData.hasEmotionalLogicalAppeal).toBe(false)
  })

  test('zero occurrences of "Motivational" remain in any MVP track data or completed history', async ({ page }) => {
    const motivationalCheck = await page.evaluate(() => {
      const win = window as any
      const history = win.__getCompletedHistory ? win.__getCompletedHistory() : []
      const assignments = win.__getVolunteerAssignment ? [
        win.__getVolunteerAssignment('SUB-8821'),
        win.__getVolunteerAssignment('SUB-8814'),
        win.__getVolunteerAssignment('SUB-8799'),
      ] : []
      const authoritativeTracks = win.__AUTHORITATIVE_MVP_TRACKS || []
      const registryKeys = Object.keys(win.__CANONICAL_TRACK_REGISTRY || {})

      return {
        historyHasMotivational: history.some((h: any) => (h.track || '').toLowerCase().includes('motivational')),
        assignmentsHasMotivational: assignments.some((a: any) => (a?.track || '').toLowerCase().includes('motivational')),
        authoritativeHasMotivational: authoritativeTracks.some((t: string) => t.toLowerCase().includes('motivational')),
        registryHasMotivational: registryKeys.some((k: string) => k.toLowerCase().includes('motivational')),
      }
    })

    expect(motivationalCheck.historyHasMotivational).toBe(false)
    expect(motivationalCheck.assignmentsHasMotivational).toBe(false)
    expect(motivationalCheck.authoritativeHasMotivational).toBe(false)
    expect(motivationalCheck.registryHasMotivational).toBe(false)
  })

  test('Volunteer scoring workspace resolves the correct rubric and renders 4 track-specific criteria for all 13 tracks via explicit test seeding', async ({ page }) => {
    for (const item of AUTHORITATIVE_13_TRACKS) {
      // 1. Explicitly seed assignment fixture into local session state
      await page.goto('/volunteer/assignments')
      await page.evaluate((fixture) => {
        const key = 'auratio_volunteer_assignments'
        const testAssignment = {
          id: fixture.synthId,
          track: fixture.label,
          trackSlug: fixture.slug,
          assignmentStatus: 'In Evaluation',
          publicationStatus: 'Processing',
        }
        window.sessionStorage.setItem(key, JSON.stringify([testAssignment]))
      }, item)

      // 2. Open scoring route
      await page.goto(`/volunteer/evaluation/${item.synthId.toLowerCase()}`)
      await expect(page).toHaveURL(`/volunteer/evaluation/${item.synthId.toLowerCase()}`)

      const bodyText = await page.innerText('body')

      // Assert submission ID and Track Name are shown
      expect(bodyText).toContain(item.synthId)
      expect(bodyText).toContain(item.label)

      // Assert Section C header shows track name and 40 points
      expect(bodyText).toContain(`Track Specialisation (${item.label}) — 0 / 40 points`)

      // Assert all 4 track criteria render
      for (const criterionName of item.criteria) {
        expect(bodyText).toContain(criterionName)
      }

      // Assert completeness shows 0 / 16 criteria scores
      expect(bodyText).toContain('0 / 16')

      // 3. Clean up session fixture
      await page.evaluate(() => {
        window.sessionStorage.clear()
        const win = window as any
        if (typeof win.__resetVolunteerState === 'function') {
          win.__resetVolunteerState()
        }
      })
    }
  })
})

test.describe('Synthetic Fixture Isolation & Safe Fallback Rejection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/volunteer/assignments')
    await page.evaluate(() => {
      window.sessionStorage.clear()
      const win = window as any
      if (typeof win.__resetVolunteerState === 'function') {
        win.__resetVolunteerState()
      }
    })
  })

  test('1. /volunteer/evaluation/SUB-SYNTH-ND does NOT resolve as a legitimate assignment during an ordinary clean runtime session', async ({ page }) => {
    await page.goto('/volunteer/evaluation/sub-synth-nd')
    await expect(page).toHaveURL('/volunteer/assignments')
    const bodyText = await page.innerText('body')
    expect(bodyText).not.toContain('News Delivery')
    expect(bodyText).not.toContain('SUB-SYNTH-ND')
    expect(bodyText).not.toContain('Track Specialisation (News Delivery)')
  })

  test('2. /volunteer/evaluation/SUB-SYNTH-MKT does NOT resolve as a legitimate assignment during an ordinary clean runtime session', async ({ page }) => {
    await page.goto('/volunteer/evaluation/sub-synth-mkt')
    await expect(page).toHaveURL('/volunteer/assignments')
    const bodyText = await page.innerText('body')
    expect(bodyText).not.toContain('Marketing / Promotional')
    expect(bodyText).not.toContain('SUB-SYNTH-MKT')
    expect(bodyText).not.toContain('Track Specialisation (Marketing / Promotional)')
  })

  test('3. a completely unknown ID behaves identically safely', async ({ page }) => {
    await page.goto('/volunteer/evaluation/sub-unknown-9999')
    await expect(page).toHaveURL('/volunteer/assignments')
    const bodyText = await page.innerText('body')
    expect(bodyText).not.toContain('SUB-UNKNOWN-9999')
  })

  test('4. after a test explicitly seeds a News Delivery assignment into local session state, that assignment legitimately resolves and shows the News Delivery rubric', async ({ page }) => {
    // Explicitly seed News Delivery assignment into sessionStorage
    await page.evaluate(() => {
      const key = 'auratio_volunteer_assignments'
      const item = {
        id: 'SUB-SYNTH-ND',
        track: 'News Delivery',
        trackSlug: 'news-delivery',
        assignmentStatus: 'In Evaluation',
        publicationStatus: 'Processing',
      }
      window.sessionStorage.setItem(key, JSON.stringify([item]))
    })

    await page.goto('/volunteer/evaluation/sub-synth-nd')
    await expect(page).toHaveURL('/volunteer/evaluation/sub-synth-nd')

    const bodyText = await page.innerText('body')
    expect(bodyText).toContain('SUB-SYNTH-ND')
    expect(bodyText).toContain('News Delivery')
    expect(bodyText).toContain('Track Specialisation (News Delivery) — 0 / 40 points')
    expect(bodyText).toContain('Teleprompter-style cadence')
    expect(bodyText).toContain('Objective authoritative tone')
    expect(bodyText).toContain('Headline-shift signposting')
    expect(bodyText).toContain('Accuracy and composure')
    expect(bodyText).toContain('0 / 16')
  })

  test('5. after a test explicitly seeds Marketing / Promotional, it legitimately resolves with its correct rubric', async ({ page }) => {
    // Explicitly seed Marketing / Promotional assignment into sessionStorage
    await page.evaluate(() => {
      const key = 'auratio_volunteer_assignments'
      const item = {
        id: 'SUB-SYNTH-MKT',
        track: 'Marketing / Promotional',
        trackSlug: 'marketing-promotional',
        assignmentStatus: 'In Evaluation',
        publicationStatus: 'Processing',
      }
      window.sessionStorage.setItem(key, JSON.stringify([item]))
    })

    await page.goto('/volunteer/evaluation/sub-synth-mkt')
    await expect(page).toHaveURL('/volunteer/evaluation/sub-synth-mkt')

    const bodyText = await page.innerText('body')
    expect(bodyText).toContain('SUB-SYNTH-MKT')
    expect(bodyText).toContain('Marketing / Promotional')
    expect(bodyText).toContain('Track Specialisation (Marketing / Promotional) — 0 / 40 points')
    expect(bodyText).toContain('Audience pain-point positioning')
    expect(bodyText).toContain('Product or service payoff clarity')
    expect(bodyText).toContain('Conversion drivers')
    expect(bodyText).toContain('Brand-message alignment')
    expect(bodyText).toContain('0 / 16')
  })

  test('synthetic test records never appear in ordinary runtime product flows (assignments, completed, criterion, review, submitted, reopened)', async ({ page }) => {
    // A. Active assignments list
    await page.goto('/volunteer/assignments')
    let text = await page.innerText('body')
    expect(text).not.toContain('SUB-SYNTH')

    // B. Completed / History list
    await page.goto('/volunteer/completed')
    text = await page.innerText('body')
    expect(text).not.toContain('SUB-SYNTH')

    // C. Deep routes redirect safely to assignments or completed
    await page.goto('/volunteer/assignments/sub-synth-nd')
    await expect(page).toHaveURL('/volunteer/assignments')

    await page.goto('/volunteer/evaluation/sub-synth-nd/criterion')
    await expect(page).toHaveURL('/volunteer/assignments')

    await page.goto('/volunteer/evaluation/sub-synth-nd/review')
    await expect(page).toHaveURL('/volunteer/assignments')

    await page.goto('/volunteer/evaluation/sub-synth-nd/submitted')
    await expect(page).toHaveURL('/volunteer/assignments')

    await page.goto('/volunteer/evaluation/sub-synth-nd/reopened')
    await expect(page).toHaveURL('/volunteer/assignments')

    await page.goto('/volunteer/completed/sub-synth-nd')
    await expect(page).toHaveURL('/volunteer/completed')

    // D. __SYNTHETIC_ALL_TRACK_ASSIGNMENTS global is not exposed on window
    const hasGlobal = await page.evaluate(() => '__SYNTHETIC_ALL_TRACK_ASSIGNMENTS' in window)
    expect(hasGlobal).toBe(false)
  })
})
