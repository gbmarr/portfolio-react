import { describe, expect, it } from 'vitest'
import { arsRate } from '../data/estimate'
import { buildEstimateWhatsAppMessage, computeEstimate } from './estimate'

const base = { sections: 3, extras: [] }

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
    const result = computeEstimate({ tier: 'institucional', sections: 8, extras: [] })
    expect(result.minUsd).toBe(450 + 5 * 80)
    expect(result.maxUsd).toBe(1020)
  })

  it('clamps the sections input to the 3–8 range', () => {
    const low = computeEstimate({ tier: 'institucional', sections: 1, extras: [] })
    const high = computeEstimate({ tier: 'institucional', sections: 99, extras: [] })
    expect(low.minUsd).toBe(450)
    expect(high.minUsd).toBe(850)
  })

  it('estimates a custom project from its local base', () => {
    const result = computeEstimate({ tier: 'medida', ...base })
    expect(result.minUsd).toBe(1200)
    expect(result.maxUsd).toBe(1440)
  })

  it('adds fixed extras to the subtotal', () => {
    const result = computeEstimate({ tier: 'landing', sections: 3, extras: ['logo', 'seo'] })
    expect(result.minUsd).toBe(250 + 200 + 100)
    expect(result.maxUsd).toBe(660)
  })

  it('applies multidioma as 40% over the subtotal including other extras', () => {
    const result = computeEstimate({
      tier: 'landing',
      sections: 3,
      extras: ['logo', 'multidioma'],
    })
    expect(result.minUsd).toBe(630) // (250 + 200) × 1.4
    expect(result.maxUsd).toBe(760) // 756 redondeado a múltiplo de 10
  })

  it('ignora la tienda online en una landing (no aplica al tier)', () => {
    const result = computeEstimate({ tier: 'landing', sections: 3, extras: ['ecommerce'] })
    expect(result.minUsd).toBe(250)
    expect(result.maxUsd).toBe(300)
  })

  it('no cobra la tienda en medida: viene incluida en el plan', () => {
    const result = computeEstimate({ tier: 'medida', sections: 3, extras: ['ecommerce'] })
    expect(result.minUsd).toBe(1200)
    expect(result.maxUsd).toBe(1440)
  })

  it('no deja que extras inválidos alarguen el plazo', () => {
    const result = computeEstimate({
      tier: 'landing',
      sections: 3,
      extras: ['no-existe', 'nope', 'x', 'y'],
    })
    expect(result.timeline).toBe('1 a 2 semanas')
  })

  it('ignores unknown extra ids', () => {
    const result = computeEstimate({ tier: 'landing', sections: 3, extras: ['no-existe'] })
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
    const result = computeEstimate({ tier: 'institucional', sections: 6, extras: [] })
    expect(result.timeline).toBe('2 a 5 semanas')
  })

  it('adds one week when 4 or more extras are selected', () => {
    const result = computeEstimate({
      tier: 'institucional',
      sections: 6,
      extras: ['blog', 'logo', 'copy', 'seo'],
    })
    expect(result.timeline).toBe('2 a 6 semanas')
  })

  it('includes a breakdown whose amounts reconcile with the minimum', () => {
    const result = computeEstimate({
      tier: 'institucional',
      sections: 5,
      extras: ['blog', 'multidioma'],
    })
    const sum = result.breakdown.reduce((acc, row) => acc + row.amountUsd, 0)
    expect(result.breakdown.length).toBeGreaterThan(1)
    expect(Math.abs(sum - result.minUsd)).toBeLessThanOrEqual(10)
  })
})

describe('buildEstimateWhatsAppMessage', () => {
  it('mentions the tier, sections, extras and the range', () => {
    const input = { tier: 'institucional' as const, sections: 6, extras: ['blog'] }
    const result = computeEstimate(input)
    const message = buildEstimateWhatsAppMessage(input, result)

    expect(message).toContain('Sitio institucional')
    expect(message).toContain('6 secciones')
    expect(message).toContain('Blog / CMS editable')
    expect(message).not.toContain('exprés')
    expect(message).toContain(`USD ${result.minUsd}`)
    expect(message).toContain(`USD ${result.maxUsd}`)
  })

  it('no menciona extras que no aplican al tier', () => {
    const input = { tier: 'landing' as const, sections: 3, extras: ['ecommerce'] }
    const result = computeEstimate(input)
    const message = buildEstimateWhatsAppMessage(input, result)
    expect(message).not.toContain('tienda online')
  })

  it('acota las secciones al rango 3–8 en el mensaje', () => {
    const input = { tier: 'institucional' as const, sections: 99, extras: [] }
    const result = computeEstimate(input)
    const message = buildEstimateWhatsAppMessage(input, result)
    expect(message).toContain('8 secciones')
  })
})
