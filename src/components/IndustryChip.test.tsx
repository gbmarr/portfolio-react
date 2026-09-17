import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fireEvent } from '@testing-library/react'
import { IndustryChip } from './IndustryChip'

const item = {
  name: 'Plomeros',
  benefit: 'Una pérdida se resuelve con el plomero que aparece en Google a las 9 de la noche.',
}

describe('IndustryChip', () => {
  it('renders the industry name with the benefit hidden initially', () => {
    render(<IndustryChip item={item} />)
    expect(screen.getByRole('button', { name: item.name })).toBeInTheDocument()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows the tooltip on hover and hides it when the pointer leaves', async () => {
    const user = userEvent.setup()
    render(<IndustryChip item={item} />)
    const button = screen.getByRole('button', { name: item.name })

    await user.hover(button)
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent(item.benefit)
    expect(tooltip).toHaveAttribute('aria-hidden', 'false')
    expect(button).toHaveAttribute('aria-describedby', tooltip.id)

    await user.unhover(button)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows the tooltip on focus and hides it on blur', () => {
    render(<IndustryChip item={item} />)
    const button = screen.getByRole('button', { name: item.name })

    fireEvent.focus(button)
    expect(screen.getByRole('tooltip')).toHaveTextContent(item.benefit)

    fireEvent.blur(button)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('closes the tooltip with Escape', () => {
    render(<IndustryChip item={item} />)
    const button = screen.getByRole('button', { name: item.name })

    fireEvent.focus(button)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    fireEvent.keyDown(button, { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})