import { describe, expect, it } from 'vitest'
import {
  estimateExtras,
  getIncludedExtras,
  getSelectableExtras,
  getVisibleExtras,
  isExtraAllowed,
  resolveArsRate,
  type EstimateTierId,
} from './estimate'

const TIER_IDS: EstimateTierId[] = ['landing', 'institucional', 'medida']

describe('matriz de compatibilidad tier ↔ extra', () => {
  it('no permite la tienda online ni el blog en una landing', () => {
    expect(isExtraAllowed('landing', 'ecommerce')).toBe(false)
    expect(isExtraAllowed('landing', 'blog')).toBe(false)
  })

  it('la tienda online solo existe como extra incluido en medida', () => {
    expect(isExtraAllowed('institucional', 'ecommerce')).toBe(false)
    expect(isExtraAllowed('medida', 'ecommerce')).toBe(false)
    expect(getIncludedExtras('medida').map((extra) => extra.id)).toEqual(['ecommerce'])
  })

  it('bloguea únicamente en institucional y medida', () => {
    expect(isExtraAllowed('institucional', 'blog')).toBe(true)
    expect(isExtraAllowed('medida', 'blog')).toBe(true)
  })

  it('permite logo, copy, multidioma, integraciones y seo en todos los tiers', () => {
    for (const tier of TIER_IDS) {
      for (const id of ['logo', 'copy', 'multidioma', 'integraciones', 'seo']) {
        expect(isExtraAllowed(tier, id)).toBe(true)
      }
    }
  })

  it('ignora ids desconocidos', () => {
    expect(isExtraAllowed('landing', 'no-existe')).toBe(false)
  })

  it('getSelectableExtras excluye los extras incluidos', () => {
    expect(getSelectableExtras('medida').some((extra) => extra.id === 'ecommerce')).toBe(false)
    expect(getSelectableExtras('landing').some((extra) => extra.id === 'blog')).toBe(false)
  })

  it('getVisibleExtras suma seleccionables + incluidos de un tier', () => {
    const medida = getVisibleExtras('medida')
    expect(medida.some((extra) => extra.id === 'ecommerce')).toBe(true)
    expect(medida.some((extra) => extra.id === 'blog')).toBe(true)

    const landing = getVisibleExtras('landing')
    expect(landing.some((extra) => extra.id === 'ecommerce')).toBe(false)
    expect(landing.some((extra) => extra.id === 'blog')).toBe(false)
  })

  it('todo extra incluido lo está en algún tier coherente', () => {
    for (const extra of estimateExtras) {
      if (extra.includedFor) {
        expect(extra.includedFor.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('resolveArsRate', () => {
  const FALLBACK = 1400

  it('usa el valor válido cuando es un número positivo', () => {
    expect(resolveArsRate('1450')).toBe(1450)
  })

  it('ignora espacios en blanco alrededor del valor', () => {
    expect(resolveArsRate(' 1450 ')).toBe(1450)
  })

  it('cae al fallback cuando el valor es vacío o indefinido', () => {
    expect(resolveArsRate('')).toBe(FALLBACK)
    expect(resolveArsRate(undefined)).toBe(FALLBACK)
  })

  it('cae al fallback cuando el valor no es numérico', () => {
    expect(resolveArsRate('abc')).toBe(FALLBACK)
    expect(resolveArsRate('1450usd')).toBe(FALLBACK)
  })

  it('cae al fallback cuando el valor es negativo o cero', () => {
    expect(resolveArsRate('-1450')).toBe(FALLBACK)
    expect(resolveArsRate('0')).toBe(FALLBACK)
  })

  it('cae al fallback cuando el valor es NaN', () => {
    expect(resolveArsRate('NaN')).toBe(FALLBACK)
  })
})
