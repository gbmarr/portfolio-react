import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorAlert } from './ErrorAlert'

describe('ErrorAlert', () => {
  it('muestra el mensaje con rol alert y estilo de error', () => {
    render(<ErrorAlert>No se pudo guardar.</ErrorAlert>)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('No se pudo guardar.')
    expect(alert).toHaveClass('text-red-300')
  })
})
