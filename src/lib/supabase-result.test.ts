import { describe, expect, it } from 'vitest'
import { throwIfError, unwrap, unwrapList, unwrapMaybe } from './supabase-result'

describe('unwrap', () => {
  it('devuelve el dato cuando existe', () => {
    expect(unwrap({ data: { id: 'x' }, error: null })).toEqual({ id: 'x' })
  })

  it('lanza el mensaje del servidor ante error', () => {
    expect(() => unwrap({ data: null, error: { message: 'RLS denied' } })).toThrow('RLS denied')
  })

  it('lanza el mensaje de no-encontrado por defecto cuando no hay dato', () => {
    expect(() => unwrap({ data: null, error: null })).toThrow('No se encontró el registro')
  })

  it('permite un mensaje de no-encontrado a medida', () => {
    expect(() => unwrap({ data: null, error: null }, 'Proyecto no encontrado')).toThrow(
      'Proyecto no encontrado'
    )
  })
})

describe('unwrapList', () => {
  it('devuelve la lista', () => {
    expect(unwrapList({ data: [1, 2], error: null })).toEqual([1, 2])
  })

  it('devuelve lista vacía cuando no hay datos', () => {
    expect(unwrapList({ data: null, error: null })).toEqual([])
  })

  it('lanza ante error', () => {
    expect(() => unwrapList({ data: null, error: { message: 'boom' } })).toThrow('boom')
  })
})

describe('unwrapMaybe', () => {
  it('devuelve el dato o null', () => {
    expect(unwrapMaybe({ data: { id: 'x' }, error: null })).toEqual({ id: 'x' })
    expect(unwrapMaybe({ data: null, error: null })).toBeNull()
  })

  it('lanza ante error', () => {
    expect(() => unwrapMaybe({ data: null, error: { message: 'RLS' } })).toThrow('RLS')
  })
})

describe('throwIfError', () => {
  it('no lanza cuando no hay error', () => {
    expect(() => throwIfError({ error: null })).not.toThrow()
  })

  it('lanza el mensaje del servidor', () => {
    expect(() => throwIfError({ error: { message: 'denied' } })).toThrow('denied')
  })
})
