import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm, MIN_SUBMIT_INTERVAL_MS } from './ContactForm'

describe('ContactForm', () => {
  it('renders the three short fields', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText('Tu nombre')).toBeInTheDocument()
    expect(screen.getByLabelText('Tu email o WhatsApp')).toBeInTheDocument()
    expect(screen.getByLabelText('Contame qué necesitás')).toBeInTheDocument()
  })

  it('includes an invisible honeypot field for Web3Forms', () => {
    const { container } = render(<ContactForm />)
    const honeypot = container.querySelector('input[name="botcheck"]')
    expect(honeypot).toBeInTheDocument()
    expect(honeypot).toHaveAttribute('tabindex', '-1')
    expect(honeypot).toHaveAttribute('aria-hidden', 'true')
  })

  it('submits the filled data and shows the success message', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ContactForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Tu nombre'), 'Ana Pérez')
    await user.type(screen.getByLabelText('Tu email o WhatsApp'), 'ana@example.com')
    await user.type(screen.getByLabelText('Contame qué necesitás'), 'Necesito una landing page')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Ana Pérez',
      email: 'ana@example.com',
      message: 'Necesito una landing page',
    })
    expect(screen.getByRole('status')).toHaveTextContent('¡Gracias!')
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

  it(
    'blocks rapid repeated submissions (anti-spam throttle)',
    async () => {
      const nowSpy = vi.spyOn(Date, 'now')
      const baseTime = 1_700_000_000_000
      nowSpy.mockReturnValue(baseTime)
      try {
        // delay: null acelera el tipeo (el throttle usa Date.now mockeado, no tiempo real).
        const user = userEvent.setup({ delay: null })
        const onSubmit = vi.fn()
        render(<ContactForm onSubmit={onSubmit} />)

        const fill = async () => {
          await user.type(screen.getByLabelText('Tu nombre'), 'Ana Pérez')
          await user.type(screen.getByLabelText('Tu email o WhatsApp'), 'ana@example.com')
          await user.type(
            screen.getByLabelText('Contame qué necesitás'),
            'Necesito una landing page'
          )
        }

        await fill()
        await user.click(screen.getByRole('button', { name: 'Enviar' }))
        expect(onSubmit).toHaveBeenCalledTimes(1)

        // Segundo envío "inmediato" (misma hora simulada): bloqueado por el throttle.
        await fill()
        await user.click(screen.getByRole('button', { name: 'Enviar' }))
        expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal')
        expect(onSubmit).toHaveBeenCalledTimes(1)

        // Pasado el intervalo mínimo, el envío vuelve a funcionar.
        nowSpy.mockReturnValue(baseTime + MIN_SUBMIT_INTERVAL_MS + 1)
        await user.click(screen.getByRole('button', { name: 'Enviar' }))
        expect(onSubmit).toHaveBeenCalledTimes(2)
      } finally {
        nowSpy.mockRestore()
      }
    },
    15000
  )
})