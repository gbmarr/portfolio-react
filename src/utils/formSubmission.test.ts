import { afterEach, describe, expect, it, vi } from 'vitest'
import { submitContactForm } from './formSubmission'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
  vi.unstubAllEnvs()
})

const okResponse = (body: Record<string, unknown> = { success: true }) => ({
  ok: true,
  status: 200,
  json: async () => body,
})

describe('submitContactForm', () => {
  it('lanzar un error si falta FORM_ACCESS_KEY', async () => {
    vi.stubEnv('FORM_ACCESS_KEY', '')

    await expect(
      submitContactForm({ name: 'Ana', email: 'ana@example.com', message: 'Hola' })
    ).rejects.toThrow('FORM_ACCESS_KEY')
  })

  it('envía el mensaje a Web3Forms con la access key', async () => {
    vi.stubEnv('FORM_ACCESS_KEY', 'clave-de-test')
    const fetchMock = vi.fn().mockResolvedValue(okResponse())
    globalThis.fetch = fetchMock

    await submitContactForm({ name: 'Ana', email: 'ana@example.com', message: 'Hola' })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.web3forms.com/submit',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: expect.stringContaining('clave-de-test'),
      })
    )
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(body).toMatchObject({
      access_key: 'clave-de-test',
      name: 'Ana',
      email: 'ana@example.com',
      message: 'Hola',
    })
  })

  it('incluye el honeypot botcheck en el payload', async () => {
    vi.stubEnv('FORM_ACCESS_KEY', 'clave-de-test')
    const fetchMock = vi.fn().mockResolvedValue(okResponse())
    globalThis.fetch = fetchMock

    await submitContactForm(
      { name: 'Ana', email: 'ana@example.com', message: 'Hola' },
      'valor-que-llena-un-bot',
    )

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(body).toHaveProperty('botcheck', 'valor-que-llena-un-bot')
  })

  it('lanzar un error si la API responde con error', async () => {
    vi.stubEnv('FORM_ACCESS_KEY', 'clave-de-test')
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })

    await expect(
      submitContactForm({ name: 'Ana', email: 'ana@example.com', message: 'Hola' })
    ).rejects.toThrow('500')
  })

  it('lanzar un error si Web3Forms rechaza con success: false', async () => {
    vi.stubEnv('FORM_ACCESS_KEY', 'clave-de-test')
    globalThis.fetch = vi.fn().mockResolvedValue(okResponse({ success: false }))

    await expect(
      submitContactForm({ name: 'Ana', email: 'ana@example.com', message: 'Hola' })
    ).rejects.toThrow('rechazó')
  })
})