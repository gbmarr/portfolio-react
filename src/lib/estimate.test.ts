import { describe, expect, it } from 'vitest'
import { arsRate } from '../data/estimate'
import { buildEstimateWhatsAppMessage, computeEstimate } from './estimate'

const base = { sections: 3, extras: [], express: false }

describe('computeEstimate', () => {
  it('estimates a landing from the services base price', () => {
    const result = computeEstimate({ tier: 'landing', ...base })
    expect(result.minUsd).toBe(250)
    expect(result.maxUsd).toBe(300)
  })

  it('estimates an institutional site at 3 sections from base', () => {
    const result = computeEstimate({ tier: 'institucional', ...base })
    expect(result.minUsd).toBe(450)
    expect(result.maxUsd).toBe(540)
  })

  it('adds USD 80 per extra section above 3', () => {
    const result = computeEstimate({ tier: 'institucional', sections: 8, extras: [], express: false })
    expect(result.minUsd).toBe(450 + 5 * 80)
    expect(result.maxUsd).toBe(1020)
  })

  it('clamps the sections input to the 3–8 range', () => {
    const low = computeEstimate({ tier: 'institucional', sections: 1, extras: [], express: false })
    const high = computeEstimate({ tier: 'institucional', sections: 99, extras: [], express: false })
    expect(low.minUsd).toBe(450)
    expect(high.minUsd).toBe(850)
  })

  it('estimates a custom project from its local base', () => {
    const result = computeEstimate({ tier: 'medida', ...base })
    expect(result.minUsd).toBe(1200)
    expect(result.maxUsd).toBe(1440)
  })

  it('adds fixed extras to the subtotal', () => {
    const result = computeEstimate({ tier: 'landing', sections: 3, extras: ['blog', 'seo'], express: false })
    expect(result.minUsd).toBe(250 + 150 + 100)
    expect(result.maxUsd).toBe(600)
  })

  it('applies multidioma as 40% over the subtotal including other extras', () => {
    const result = computeEstimate({
      tier: 'landing',
      sections: 3,
      extras: ['blog', 'multidioma'],
      express: false,
    })
    expect(result.minUsd).toBe(560) // (250 + 150) × 1.4
    expect(result.maxUsd).toBe(670) // 672 redondeado a múltiplo de 10
  })

  it('applies the express multiplier of 1.3', () => {
    const result = computeEstimate({ tier: 'landing', sections: 3, extras: [], express: true })
    expect(result.minUsd).toBe(330) // 325 redondeado
    expect(result.maxUsd).toBe(390)
  })

  it('ignores unknown extra ids', () => {
    const result = computeEstimate({ tier: 'landing', sections: 3, extras: ['no-existe'], express: false })
    expect(result.minUsd).toBe(250)
  })

  it('converts the range to ARS with the configured rate', () => {
    const result = computeEstimate({ tier: 'landing', ...base })
    expect(result.minArs).toBe(result.minUsd * arsRate)
    expect(result.maxArs).toBe(result.maxUsd * arsRate)
  })

  it('builds the timeline from the tier', () => {
    expect(computeEstimate({ tier: 'landing', ...base }).timeline).toBe('1 a 2 semanas')
    expect(computeEstimate({ tier: 'medida', ...base }).timeline).toBe('4 a 8 semanas')
  })

  it('adds one week when an institutional site has more than 5 sections', () => {
    const result = computeEstimate({ tier: 'institucional', sections: 6, extras: [], express: false })
    expect(result.timeline).toBe('2 a 5 semanas')
  })

  it('adds one week when 4 or more extras are selected', () => {
    const result = computeEstimate({
      tier: 'institucional',
      sections: 6,
      extras: ['blog', 'logo', 'copy', 'seo'],
      express: false,
    })
    expect(result.timeline).toBe('2 a 6 semanas')
  })

  it('lets express prevail as a one-week timeline', () => {
    const result = computeEstimate({
      tier: 'institucional',
      sections: 8,
      extras: ['blog', 'logo', 'copy', 'seo'],
      express: true,
    })
    expect(result.timeline).toBe('Exprés: hasta 1 semana')
  })

  it('includes a breakdown whose amounts reconcile with the minimum', () => {
    const result = computeEstimate({
      tier: 'institucional',
      sections: 5,
      extras: ['blog', 'multidioma'],
      express: true,
    })
    const sum = result.breakdown.reduce((acc, row) => acc + row.amountUsd, 0)
    expect(result.breakdown.length).toBeGreaterThan(1)
    expect(Math.abs(sum - result.minUsd)).toBeLessThanOrEqual(10)
  })
})

describe('buildEstimateWhatsAppMessage', () => {
  it('mentions the tier, sections, extras, urgency and the range', () => {
    const input = { tier: 'institucional' as const, sections: 6, extras: ['blog'], express: true }
    const result = computeEstimate(input)
    const message = buildEstimateWhatsAppMessage(input, result)

    expect(message).toContain('Sitio institucional')
    expect(message).toContain('6 secciones')
    expect(message).toContain('Blog / CMS editable')
    expect(message.toLowerCase()).toContain('exprés')
    expect(message).toContain(`USD ${result.minUsd}`)
    expect(message).toContain(`USD ${result.maxUsd}`)
  })
})
