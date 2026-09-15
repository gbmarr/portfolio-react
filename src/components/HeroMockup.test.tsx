import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { HeroMockup } from './HeroMockup'

describe('HeroMockup', () => {
  it('renders a decorative SVG scene in the desktop variant', () => {
    const { container } = render(<HeroMockup />)
    const svg = container.querySelector('svg[aria-hidden="true"]')
    expect(svg).toBeInTheDocument()
    expect(container.querySelector('.aspect-video')).toBeInTheDocument()
  })

  it('renders a decorative SVG scene in the phone variant', () => {
    const { container } = render(<HeroMockup variant="phone" />)
    const svg = container.querySelector('svg[aria-hidden="true"]')
    expect(svg).toBeInTheDocument()
    expect(container.querySelector('.aspect-\\[9\\/19\\]')).toBeInTheDocument()
  })

  it('is purely decorative (no img, no role)', () => {
    const { container } = render(<HeroMockup />)
    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(svgWithRole(container)).toBe(false)
  })
})

function svgWithRole(container: HTMLElement): boolean {
  return Array.from(container.querySelectorAll('svg')).some(
    (svg) => svg.getAttribute('role') !== null,
  )
}