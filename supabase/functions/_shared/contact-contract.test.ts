import { describe, expect, it } from 'vitest'
import {
  CONTACT_LIMITS,
  EMAIL_PATTERN,
  hasControlChars,
  isSafeEmail,
  TURNSTILE_ACTION,
} from './contact-contract'

describe('contact-contract', () => {
  it('fija los límites compartidos (espejo cliente/servidor)', () => {
    expect(CONTACT_LIMITS).toEqual({
      nameMax: 80,
      emailMax: 120,
      messageMin: 10,
      messageMax: 2000,
    })
  })

  it('fija la acción de Turnstile (widget y siteverify)', () => {
    expect(TURNSTILE_ACTION).toBe('contact')
  })

  it('detecta caracteres de control (CR/LF/NUL) y no marca texto normal', () => {
    expect(hasControlChars('a@b.com\nbcc:x')).toBe(true)
    expect(hasControlChars('a@b.com\r\n')).toBe(true)
    expect(hasControlChars('a\u0000b')).toBe(true)
    expect(hasControlChars('Ana Pérez')).toBe(false)
    expect(hasControlChars('+54 9 11 5555-5555')).toBe(false)
  })

  it('acepta emails estructuralmente válidos y recorta', () => {
    expect(isSafeEmail('ana@example.com')).toBe(true)
    expect(isSafeEmail('  a.b+c@sub.example.co  ')).toBe(true)
    expect(EMAIL_PATTERN.test('user_name-1@x.io')).toBe(true)
  })

  it('rechaza delimitadores de header/mailto y no-emails', () => {
    expect(isSafeEmail('a@b.com?body=hi')).toBe(false)
    expect(isSafeEmail('a@b.com,other@x.com')).toBe(false)
    expect(isSafeEmail('+54 9 11 5555 5555')).toBe(false)
    expect(isSafeEmail('')).toBe(false)
  })
})
