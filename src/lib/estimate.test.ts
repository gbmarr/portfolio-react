import { describe, expect, it } from 'vitest'
import { buildEstimateTimeline, MAX_SECTIONS, MIN_SECTIONS } from './estimate'

describe('buildEstimateTimeline', () => {
  it('uses the tier base timeline', () => {
    expect(buildEstimateTimeline({ tier: 'landing', sections: 0, extras: [] })).toBe(
      '1 a 2 semanas'
    )
    expect(buildEstimateTimeline({ tier: 'medida', sections: 0, extras: [] })).toBe(
      '4 a 8 semanas'
    )
  })

  it('starts the institutional tier at 2 a 4 semanas', () => {
    expect(buildEstimateTimeline({ tier: 'institucional', sections: 3, extras: [] })).toBe(
      '2 a 4 semanas'
    )
  })

  it('adds one week when an institutional site has more than 5 sections', () => {
    expect(buildEstimateTimeline({ tier: 'institucional', sections: 6, extras: [] })).toBe(
      '2 a 5 semanas'
    )
  })

  it('adds one week when 4 or more valid extras are selected', () => {
    expect(
      buildEstimateTimeline({
        tier: 'institucional',
        sections: 6,
        extras: ['blog', 'logo', 'copy', 'seo'],
      })
    ).toBe('2 a 6 semanas')
  })

  it('does not count extras that do not apply to the tier', () => {
    expect(
      buildEstimateTimeline({
        tier: 'institucional',
        sections: 6,
        extras: ['ecommerce', 'no-existe', 'blog', 'logo', 'copy'],
      })
    ).toBe('2 a 5 semanas')
  })

  it('ignores sections outside the institutional tier', () => {
    expect(buildEstimateTimeline({ tier: 'medida', sections: 99, extras: [] })).toBe(
      '4 a 8 semanas'
    )
  })

  it('clamps the institutional sections to the 3–8 range', () => {
    expect(buildEstimateTimeline({ tier: 'institucional', sections: 1, extras: [] })).toBe(
      '2 a 4 semanas'
    )
    expect(buildEstimateTimeline({ tier: 'institucional', sections: 99, extras: [] })).toBe(
      '2 a 5 semanas'
    )
  })

  it('exposes the shared section limits', () => {
    expect(MIN_SECTIONS).toBe(3)
    expect(MAX_SECTIONS).toBe(8)
  })
})
