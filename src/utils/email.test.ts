import { describe, expect, it } from 'vitest'
import { isValidEmail, normalizeEmail } from './email'

describe('isValidEmail', () => {
  it('acepta emails estructuralmente válidos (incluidos subdominios y +)', () => {
    expect(isValidEmail('ana@example.com')).toBe(true)
    expect(isValidEmail('a.b+c-test@sub.example.co')).toBe(true)
    expect(isValidEmail('user_name-1@x.io')).toBe(true)
    expect(isValidEmail('  ana@example.com  ')).toBe(true)
  })

  it('rechaza formatos inválidos o con trailing content', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('a@b')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
    expect(isValidEmail('ana@')).toBe(false)
    expect(isValidEmail('ana example.com')).toBe(false)
    expect(isValidEmail('a@b.com?x=1')).toBe(false)
    expect(isValidEmail('a@b.com,o@x.com')).toBe(false)
    expect(isValidEmail('a@b.1')).toBe(false)
    expect(isValidEmail('a b@example.com')).toBe(false)
  })
})

describe('normalizeEmail', () => {
  it('recorta y pasa a minúsculas (tenancy por email)', () => {
    expect(normalizeEmail('  Ana@Example.com ')).toBe('ana@example.com')
    expect(normalizeEmail('Cliente@SUB.example.CO')).toBe('cliente@sub.example.co')
  })
})