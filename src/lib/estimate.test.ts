import { describe, expect, it } from 'vitest'
import { buildEstimateWhatsAppMessage, computeEstimate } from './estimate'

const FIXED_ARS_RATE = 1400
const base = { sections: 3, extras: [] }

describe('computeEstimate', () => {
  it('estimates a landing from the services base price', () => {
    const result = computeEstimate({ tier: 'landing', ...base }, FIXED_ARS_RATE)
    expect(result.minUsd).toBe(350)
    expect(result.maxUsd).toBe(420)
  })

  it('estimates an institutional site at 3 sections from base', () => {
    const result = computeEstimate({ tier: 'institucional', ...base }, FIXED_ARS_RATE)
    expect(result.minUsd).toBe(600)
    expect(result.maxUsd).toBe(720)
  })

  it('adds USD 80 per extra section above 3', () => {
    const result = computeEstimate(
      { tier: 'institucional', sections: 8, extras: [] },
      FIXED_ARS_RATE
    )
    expect(result.minUsd).toBe(600 + 5 * 80)
    expect(result.maxUsd).toBe(1200)
  })

  it('clamps the sections input to the 3–8 range', () => {
    const low = computeEstimate({ tier: 'institucional', sections: 1, extras: [] }, FIXED_ARS_RATE)
    const high = computeEstimate(
      { tier: 'institucional', sections: 99, extras: [] },
      FIXED_ARS_RATE
    )
    expect(low.minUsd).toBe(600)
    expect(high.minUsd).toBe(1000)
  })

  it('estimates a custom project from its local base', () => {
    const result = computeEstimate({ tier: 'medida', ...base }, FIXED_ARS_RATE)
    expect(result.minUsd).toBe(1200)
    expect(result.maxUsd).toBe(1440)
  })

  it('adds fixed extras to the subtotal', () => {
    const result = computeEstimate(
      { tier: 'landing', sections: 3, extras: ['logo', 'seo'] },
      FIXED_ARS_RATE
    )
    expect(result.minUsd).toBe(350 + 200 + 100)
    expect(result.maxUsd).toBe(780)
  })

  it('applies multidioma as 40% over the subtotal including other extras', () => {
    const result = computeEstimate(
      {
        tier: 'landing',
        sections: 3,
        extras: ['logo', 'multidioma'],
      },
      FIXED_ARS_RATE
    )
    expect(result.minUsd).toBe(770) // (350 + 200) × 1.4
    expect(result.maxUsd).toBe(920) // 924 redondeado a múltiplo de 10
  })

  it('ignora la tienda online en una landing (no aplica al tier)', () => {
    const result = computeEstimate(
      { tier: 'landing', sections: 3, extras: ['ecommerce'] },
      FIXED_ARS_RATE
    )
    expect(result.minUsd).toBe(350)
    expect(result.maxUsd).toBe(420)
  })

  it('no cobra la tienda en medida: viene incluida en el plan', () => {
    const result = computeEstimate(
      { tier: 'medida', sections: 3, extras: ['ecommerce'] },
      FIXED_ARS_RATE
    )
    expect(result.minUsd).toBe(1200)
    expect(result.maxUsd).toBe(1440)
  })

  it('no deja que extras inválidos alarguen el plazo', () => {
    const result = computeEstimate(
      {
        tier: 'landing',
        sections: 3,
        extras: ['no-existe', 'nope', 'x', 'y'],
      },
      FIXED_ARS_RATE
    )
    expect(result.timeline).toBe('1 a 2 semanas')
  })

  it('ignores unknown extra ids', () => {
    const result = computeEstimate(
      { tier: 'landing', sections: 3, extras: ['no-existe'] },
      FIXED_ARS_RATE
    )
    expect(result.minUsd).toBe(350)
  })

  it('converts the range to ARS with the injected rate', () => {
    const result = computeEstimate({ tier: 'landing', ...base }, FIXED_ARS_RATE)
    expect(result.minArs).toBe(result.minUsd * FIXED_ARS_RATE)
    expect(result.maxArs).toBe(result.maxUsd * FIXED_ARS_RATE)
  })

  it('builds the timeline from the tier', () => {
    expect(computeEstimate({ tier: 'landing', ...base }, FIXED_ARS_RATE).timeline).toBe(
      '1 a 2 semanas'
    )
    expect(computeEstimate({ tier: 'medida', ...base }, FIXED_ARS_RATE).timeline).toBe(
      '4 a 8 semanas'
    )
  })

  it('adds one week when an institutional site has more than 5 sections', () => {
    const result = computeEstimate(
      { tier: 'institucional', sections: 6, extras: [] },
      FIXED_ARS_RATE
    )
    expect(result.timeline).toBe('2 a 5 semanas')
  })

  it('adds one week when 4 or more extras are selected', () => {
    const result = computeEstimate(
      {
        tier: 'institucional',
        sections: 6,
        extras: ['blog', 'logo', 'copy', 'seo'],
      },
      FIXED_ARS_RATE
    )
    expect(result.timeline).toBe('2 a 6 semanas')
  })

  it('includes a breakdown whose amounts reconcile with the minimum', () => {
    const result = computeEstimate(
      {
        tier: 'institucional',
        sections: 5,
        extras: ['blog', 'multidioma'],
      },
      FIXED_ARS_RATE
    )
    const sum = result.breakdown.reduce((acc, row) => acc + row.amountUsd, 0)
    expect(result.breakdown.length).toBeGreaterThan(1)
    expect(Math.abs(sum - result.minUsd)).toBeLessThanOrEqual(10)
  })
})

describe('buildEstimateWhatsAppMessage', () => {
  it('mentions the tier, sections, extras and the range', () => {
    const input = { tier: 'institucional' as const, sections: 6, extras: ['blog'] }
    const result = computeEstimate(input, FIXED_ARS_RATE)
    const message = buildEstimateWhatsAppMessage(input, result)

    expect(message).toContain('Sitio completo')
    expect(message).toContain('6 secciones')
    expect(message).toContain('Blog / CMS editable')
    expect(message).not.toContain('exprés')
    expect(message).toContain(`USD ${result.minUsd}`)
    expect(message).toContain(`USD ${result.maxUsd}`)
  })

  it('no menciona extras que no aplican al tier', () => {
    const input = { tier: 'landing' as const, sections: 3, extras: ['ecommerce'] }
    const result = computeEstimate(input, FIXED_ARS_RATE)
    const message = buildEstimateWhatsAppMessage(input, result)
    expect(message).not.toContain('tienda online')
  })

  it('acota las secciones al rango 3–8 en el mensaje', () => {
    const input = { tier: 'institucional' as const, sections: 99, extras: [] }
    const result = computeEstimate(input, FIXED_ARS_RATE)
    const message = buildEstimateWhatsAppMessage(input, result)
    expect(message).toContain('8 secciones')
  })
})
