import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Mockup } from './Mockup'

describe('Mockup', () => {
  it('renders the image with its alt text and lazy loading', () => {
    render(<Mockup src="/images/site.png" alt="Captura del sitio" />)
    const img = screen.getByRole('img', { name: 'Captura del sitio' })
    expect(img).toHaveAttribute('src', '/images/site.png')
    expect(img).toHaveAttribute('loading', 'lazy')
  })

  it('renders the initials when there is no screenshot', () => {
    render(<Mockup alt="Captura" initials="LS" />)
    expect(screen.getByText('LS')).toBeInTheDocument()
  })

  it('renders the phone variant with a notch', () => {
    const { container } = render(<Mockup alt="Captura" variant="phone" />)
    expect(container.querySelector('.rounded-\\[2rem\\]')).toBeInTheDocument()
  })

  it('renders the desktop variant as a wide frame', () => {
    const { container } = render(<Mockup alt="Captura" variant="desktop" />)
    expect(container.querySelector('.aspect-video')).toBeInTheDocument()
  })
})