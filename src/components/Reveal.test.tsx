import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Reveal } from './Reveal'

function installMockObserver() {
  let callback: IntersectionObserverCallback = () => {}

  class MockIntersectionObserver {
    constructor(cb: IntersectionObserverCallback) {
      callback = cb
    }
    observe = vi.fn()
    disconnect = vi.fn()
    unobserve = vi.fn()
    takeRecords = () => []
    root = null
    rootMargin = ''
    thresholds = []
  }

  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  return (isIntersecting: boolean) =>
    act(() => {
      callback(
        [{ isIntersecting } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
}

describe('Reveal', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders its children', () => {
    render(<Reveal>Contenido revelado</Reveal>)
    expect(screen.getByText('Contenido revelado')).toBeInTheDocument()
  })

  it('starts hidden and becomes visible when the element intersects', () => {
    const trigger = installMockObserver()

    const { container } = render(<Reveal>Hola</Reveal>)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper).toHaveClass('opacity-0')

    trigger(true)
    expect(wrapper).toHaveClass('opacity-100')
  })

  it('forwards a custom className', () => {
    const trigger = installMockObserver()
    const { container } = render(<Reveal className="mt-8">Hola</Reveal>)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper).toHaveClass('mt-8')
    trigger(true)
  })

  it('applies a transition delay when delay is provided', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    )

    const { container } = render(<Reveal delay={200}>Hola</Reveal>)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper).toHaveStyle({ transitionDelay: '200ms' })
  })
})
