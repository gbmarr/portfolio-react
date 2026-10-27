import { describe, expect, it } from 'vitest'
import {
  APP_TIME_ZONE,
  argentinaDateKey,
  argentinaYear,
  formatDate,
  formatDateTime,
} from './format'

describe('formatDate', () => {
  it('formatea fechas YYYY-MM-DD sin desplazarlas por zona horaria', () => {
    expect(formatDate('2026-10-05')).toBe('05/10/2026')
  })

  it('formatea timestamps en la zona horaria de Argentina', () => {
    expect(formatDate('2026-10-06T02:30:00Z')).toBe('05/10/2026')
  })

  it('devuelve guión para vacío o inválido', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('no-es-fecha')).toBe('—')
    expect(formatDate('2026-02-31')).toBe('—')
  })
})

describe('formatDateTime', () => {
  it('formatea timestamps ISO en la zona horaria de Argentina', () => {
    const formatted = formatDateTime('2026-10-06T02:30:00Z')
    expect(formatted).toContain('05/10/2026')
    expect(formatted).toContain('23:30')
  })

  it('devuelve guión para vacío o inválido', () => {
    expect(formatDateTime(null)).toBe('—')
    expect(formatDateTime('basura')).toBe('—')
  })
})

describe('argentinaDateKey', () => {
  it('usa el día calendario de Argentina, no el de UTC', () => {
    expect(argentinaDateKey(new Date('2027-01-01T02:00:00Z'))).toBe('2026-12-31')
    expect(argentinaDateKey(new Date('2027-01-01T03:00:00Z'))).toBe('2027-01-01')
  })
})

describe('argentinaYear', () => {
  it('devuelve el año calendario de Argentina', () => {
    expect(argentinaYear(new Date('2027-01-01T02:00:00Z'))).toBe(2026)
    expect(argentinaYear(new Date('2027-01-01T03:00:00Z'))).toBe(2027)
  })
})

describe('APP_TIME_ZONE', () => {
  it('es la zona horaria de Argentina', () => {
    expect(APP_TIME_ZONE).toBe('America/Argentina/Buenos_Aires')
  })
})
