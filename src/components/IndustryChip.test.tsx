import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IndustryChip } from './IndustryChip'
import { computeTooltipPlacement } from '../utils/tooltipPosition'

// La matemática de posicionamiento se testea a fondo en tooltipPosition.test.ts;
// acá la mockeamos para verificar que el componente la cablea bien.
vi.mock('../utils/tooltipPosition', () => ({
  computeTooltipPlacement: vi.fn(() => ({ vertical: 'above', left: 0, arrowLeft: null })),
}))

const placementMock = vi.mocked(computeTooltipPlacement)

const item = {
  name: 'Plomeros',
  benefit: 'Una pérdida se resuelve con el plomero que aparece en Google a las 9 de la noche.',
}

afterEach(() => {
  placementMock.mockClear()
  placementMock.mockReturnValue({ vertical: 'above', left: 0, arrowLeft: null })
})

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

  it('opens on click and closes on a second click (toggle)', async () => {
    const user = userEvent.setup()
    render(<IndustryChip item={item} />)
    const button = screen.getByRole('button', { name: item.name })

    await user.click(button)
    expect(screen.getByRole('tooltip')).toHaveTextContent(item.benefit)

    await user.click(button)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('keeps the tooltip open when the pointer leaves after a click (pinned)', async () => {
    const user = userEvent.setup()
    render(<IndustryChip item={item} />)
    const button = screen.getByRole('button', { name: item.name })

    await user.click(button)
    await user.unhover(button)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('closes the tooltip on blur', async () => {
    const user = userEvent.setup()
    render(<IndustryChip item={item} />)
    const button = screen.getByRole('button', { name: item.name })

    await user.click(button)
    fireEvent.blur(button)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('closes the tooltip with Escape', async () => {
    const user = userEvent.setup()
    render(<IndustryChip item={item} />)
    const button = screen.getByRole('button', { name: item.name })

    await user.click(button)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    fireEvent.keyDown(button, { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('closes the tooltip on scroll', async () => {
    const user = userEvent.setup()
    render(<IndustryChip item={item} />)
    const button = screen.getByRole('button', { name: item.name })

    await user.click(button)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    fireEvent.scroll(window)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('applies the below placement and shifts the arrow from the computed position', async () => {
    const user = userEvent.setup()
    placementMock.mockReturnValue({ vertical: 'below', left: -12, arrowLeft: 40 })
    render(<IndustryChip item={item} />)

    await user.click(screen.getByRole('button', { name: item.name }))
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveClass('top-full')
    expect(tooltip).toHaveStyle({ left: '-12px' })

    const arrow = tooltip.querySelector('span[aria-hidden="true"]')
    expect(arrow).not.toHaveClass('hidden')
    expect(arrow).toHaveStyle({ left: '40px' })
  })

  it('hides the arrow when the computed position has no room for it', async () => {
    const user = userEvent.setup()
    render(<IndustryChip item={item} />)

    await user.click(screen.getByRole('button', { name: item.name }))
    const arrow = screen.getByRole('tooltip').querySelector('span[aria-hidden="true"]')
    expect(arrow).toHaveClass('hidden')
  })
})