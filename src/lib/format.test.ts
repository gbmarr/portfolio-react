import { describe, expect, it } from 'vitest'
import { formatDate, formatDateTime, formatMoney } from './format'

describe('formatMoney', () => {
  it('formatea pesos y dólares en es-AR', () => {
    expect(formatMoney(1500, 'ARS')).toContain('1.500')
    expect(formatMoney(1500, 'USD')).toContain('1.500')
  })
})

describe('formatDate', () => {
  it('formatea fechas YYYY-MM-DD', () => {
    expect(formatDate('2026-10-05')).toBe('05/10/2026')
  })

  it('devuelve guión para vacío o inválido', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('no-es-fecha')).toBe('—')
  })
})

describe('formatDateTime', () => {
  it('formatea timestamps ISO', () => {
    expect(formatDateTime('2026-10-05T14:30:00Z')).toMatch(/05\/10\/2026/)
  })

  it('devuelve guión para vacío o inválido', () => {
    expect(formatDateTime(null)).toBe('—')
    expect(formatDateTime('basura')).toBe('—')
  })
})
