import { describe, expect, it } from 'vitest'
import { hasControlChars, safeMailtoAddress } from './contactSafety'

describe('hasControlChars', () => {
  it('detecta CR/LF/NUL', () => {
    expect(hasControlChars('a@b.com\nbcc:x')).toBe(true)
    expect(hasControlChars('a@b.com\r\n')).toBe(true)
    expect(hasControlChars('a\u0000b')).toBe(true)
  })

  it('no marca texto normal (incluye acentos y espacios)', () => {
    expect(hasControlChars('Ana Pérez')).toBe(false)
    expect(hasControlChars('ana@example.com')).toBe(false)
  })
})

describe('safeMailtoAddress', () => {
  it('acepta y recorta un email normal', () => {
    expect(safeMailtoAddress('  ana@example.com ')).toBe('ana@example.com')
    expect(safeMailtoAddress('a.b+c@sub.example.co')).toBe('a.b+c@sub.example.co')
  })

  it('rechaza delimitadores de mailto/header y caracteres de control', () => {
    expect(safeMailtoAddress('victim@example.com%0d%0abcc:attacker@example.com')).toBeNull()
    expect(safeMailtoAddress('ana@example.com?body=hi')).toBeNull()
    expect(safeMailtoAddress('a@b.com,other@x.com')).toBeNull()
    expect(safeMailtoAddress('a@b.com\nbcc:x@y.com')).toBeNull()
  })

  it('rechaza valores que no son email (teléfono o vacío)', () => {
    expect(safeMailtoAddress('+54 9 11 5555 5555')).toBeNull()
    expect(safeMailtoAddress('   ')).toBeNull()
  })
})
