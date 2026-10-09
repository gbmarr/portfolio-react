import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm, MIN_SUBMIT_INTERVAL_MS } from './ContactForm'

const h = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  turnstileOnChange: null as ((token: string) => void) | null,
}))

// El widget real carga el script de Cloudflare (jsdom no lo permite); en su
// lugar registramos el callback para simular el token en los tests.
vi.mock('./Turnstile', () => ({
  TurnstileWidget: ({ onChange }: { onChange: (token: string) => void }) => {
    h.turnstileOnChange = onChange
    return <div data-testid="turnstile-mock" />
  },
}))

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Tu nombre'), 'Ana Pérez')
  await user.type(screen.getByLabelText('Tu email o WhatsApp'), 'ana@example.com')
  await user.type(screen.getByLabelText('Contame qué necesitás'), 'Necesito una landing page')
  await user.click(screen.getByRole('button', { name: 'Enviar' }))
}

describe('ContactForm', () => {
  beforeEach(() => {
    vi.stubEnv('DATABASE_URL', 'https://abc.supabase.co')
    vi.stubEnv('TURNSTILE_SITE_KEY', '1x00000000000000000000AA')
    vi.stubGlobal('fetch', h.fetchMock)
    h.fetchMock.mockReset()
    h.turnstileOnChange = null
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('renders the three short fields', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText('Tu nombre')).toBeInTheDocument()
    expect(screen.getByLabelText('Tu email o WhatsApp')).toBeInTheDocument()
    expect(screen.getByLabelText('Contame qué necesitás')).toBeInTheDocument()
  })

  it('includes an invisible honeypot field', () => {
    const { container } = render(<ContactForm />)
    const honeypot = container.querySelector('input[name="botcheck"]')
    expect(honeypot).toBeInTheDocument()
    expect(honeypot).toHaveAttribute('tabindex', '-1')
    expect(honeypot).toHaveAttribute('aria-hidden', 'true')
  })

  it('submits the filled data and shows the success message (custom resolver)', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ContactForm onSubmit={onSubmit} />)

    await fillForm(user)

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Ana Pérez',
      email: 'ana@example.com',
      message: 'Necesito una landing page',
    })
    expect(screen.getByRole('status')).toHaveTextContent('¡Gracias!')
  })

  it('envía el payload con el token de Turnstile a la función de contacto', async () => {
    const user = userEvent.setup()
    h.fetchMock.mockResolvedValue({ ok: true, status: 200 })
    render(<ContactForm />)

    act(() => {
      h.turnstileOnChange?.('tok-123')
    })
    await fillForm(user)

    expect(h.fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = h.fetchMock.mock.calls[0]
    expect(url).toBe('https://abc.functions.supabase.co/contact-notify')
    expect(JSON.parse(init.body)).toEqual({
      name: 'Ana Pérez',
      email: 'ana@example.com',
      message: 'Necesito una landing page',
      turnstileToken: 'tok-123',
    })
    expect(screen.getByRole('status')).toHaveTextContent('¡Gracias!')
  })

  it('muestra error si la función rechaza (p. ej. rate limit 429)', async () => {
    const user = userEvent.setup()
    h.fetchMock.mockResolvedValue({ ok: false, status: 429 })
    render(<ContactForm />)

    act(() => {
      h.turnstileOnChange?.('tok-123')
    })
    await fillForm(user)

    expect(h.fetchMock).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal')
  })

  it('no envía si falta el token de Turnstile', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await fillForm(user)

    expect(h.fetchMock).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal')
  })

  it('trims whitespace before submitting', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ContactForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Tu nombre'), '  Ana Pérez  ')
    await user.type(screen.getByLabelText('Tu email o WhatsApp'), '  ana@example.com ')
    await user.type(screen.getByLabelText('Contame qué necesitás'), '  Necesito una landing  ')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Ana Pérez',
      email: 'ana@example.com',
      message: 'Necesito una landing',
    })
  })

  it('rejects a message that is too short', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ContactForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Tu nombre'), 'Ana Pérez')
    await user.type(screen.getByLabelText('Tu email o WhatsApp'), 'ana@example.com')
    await user.type(screen.getByLabelText('Contame qué necesitás'), 'Hola')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal')
  })

  it('shows an error message when the submit fails', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(new Error('fail'))
    render(<ContactForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Tu nombre'), 'Ana Pérez')
    await user.type(screen.getByLabelText('Tu email o WhatsApp'), 'ana@example.com')
    await user.type(screen.getByLabelText('Contame qué necesitás'), 'Necesito una landing page')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal')
  })

  it('rechaza un email con caracteres de control', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ContactForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText('Tu email o WhatsApp'), {
      target: { value: 'ana@example.com\u0007bcc:attacker@example.com' },
    })
    await user.type(screen.getByLabelText('Tu nombre'), 'Ana Pérez')
    await user.type(screen.getByLabelText('Contame qué necesitás'), 'Necesito una landing page')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal')
  })

  it(
    'blocks rapid repeated submissions (anti-spam throttle)',
    async () => {
      const nowSpy = vi.spyOn(Date, 'now')
      const baseTime = 1_700_000_000_000
      nowSpy.mockReturnValue(baseTime)
      try {
        const user = userEvent.setup({ delay: null })
        const onSubmit = vi.fn()
        render(<ContactForm onSubmit={onSubmit} />)

        const fill = async () => {
          await user.type(screen.getByLabelText('Tu nombre'), 'Ana Pérez')
          await user.type(screen.getByLabelText('Tu email o WhatsApp'), 'ana@example.com')
          await user.type(
            screen.getByLabelText('Contame qué necesitás'),
            'Necesito una landing page',
          )
        }

        await fill()
        await user.click(screen.getByRole('button', { name: 'Enviar' }))
        expect(onSubmit).toHaveBeenCalledTimes(1)

        await fill()
        await user.click(screen.getByRole('button', { name: 'Enviar' }))
        expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal')
        expect(onSubmit).toHaveBeenCalledTimes(1)

        nowSpy.mockReturnValue(baseTime + MIN_SUBMIT_INTERVAL_MS + 1)
        await user.click(screen.getByRole('button', { name: 'Enviar' }))
        expect(onSubmit).toHaveBeenCalledTimes(2)
      } finally {
        nowSpy.mockRestore()
      }
    },
    15000,
  )
})