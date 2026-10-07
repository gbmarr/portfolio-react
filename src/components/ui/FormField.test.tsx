import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormField } from './FormField'

describe('FormField', () => {
  it('renderiza label, id y valor', () => {
    render(<FormField id="campo" label="Título" value="hola" onValueChange={() => {}} />)
    const input = screen.getByLabelText('Título')
    expect(input).toHaveAttribute('id', 'campo')
    expect(input).toHaveValue('hola')
  })

  it('notifica cambios con el nuevo valor', async () => {
    const onValueChange = vi.fn()
    render(<FormField id="campo" label="Título" value="" onValueChange={onValueChange} />)

    await userEvent.type(screen.getByLabelText('Título'), 'a')
    expect(onValueChange).toHaveBeenCalledWith('a')
  })

  it('propaga atributos adicionales al input', () => {
    render(
      <FormField
        id="campo"
        label="Email"
        value=""
        onValueChange={() => {}}
        type="email"
        required
        maxLength={10}
      />,
    )
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toBeRequired()
    expect(input).toHaveAttribute('maxlength', '10')
  })
})
