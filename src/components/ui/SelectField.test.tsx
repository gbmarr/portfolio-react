import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SelectField } from './SelectField'

const options = [
  { value: 'web', label: 'Sitio web' },
  { value: 'app', label: 'App' },
]

describe('SelectField', () => {
  it('renderiza label y opciones', () => {
    render(
      <SelectField id="tipo" label="Tipo" value="web" onValueChange={() => {}} options={options} />,
    )
    expect(screen.getByLabelText('Tipo')).toHaveValue('web')
    expect(screen.getByRole('option', { name: 'App' })).toBeInTheDocument()
  })

  it('notifica cambios', async () => {
    const onValueChange = vi.fn()
    render(
      <SelectField id="tipo" label="Tipo" value="web" onValueChange={onValueChange} options={options} />,
    )
    await userEvent.selectOptions(screen.getByLabelText('Tipo'), 'app')
    expect(onValueChange).toHaveBeenCalledWith('app')
  })

  it('propaga atributos adicionales', () => {
    render(
      <SelectField
        id="tipo"
        label="Tipo"
        value="web"
        onValueChange={() => {}}
        options={options}
        required
      />,
    )
    expect(screen.getByLabelText('Tipo')).toBeRequired()
  })
})
