import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextAreaField } from './TextAreaField'

describe('TextAreaField', () => {
  it('renderiza label y valor', () => {
    render(<TextAreaField id="desc" label="Descripción" value="hola" onValueChange={() => {}} />)
    expect(screen.getByLabelText('Descripción')).toHaveValue('hola')
  })

  it('notifica cambios', async () => {
    const onValueChange = vi.fn()
    render(<TextAreaField id="desc" label="Descripción" value="" onValueChange={onValueChange} />)
    await userEvent.type(screen.getByLabelText('Descripción'), 'x')
    expect(onValueChange).toHaveBeenCalledWith('x')
  })
})
