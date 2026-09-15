import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm } from './ContactForm'

describe('ContactForm', () => {
  it('renders the three short fields', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText('Tu nombre')).toBeInTheDocument()
    expect(screen.getByLabelText('Tu email o WhatsApp')).toBeInTheDocument()
    expect(screen.getByLabelText('Contame qué necesitás')).toBeInTheDocument()
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
})