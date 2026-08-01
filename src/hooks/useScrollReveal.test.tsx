import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useScrollReveal } from './useScrollReveal'

function Probe() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()
  return (
    <div ref={ref}>
      <span>visible: {String(isVisible)}</span>
    </div>
  )
}

function installMockObserver() {
  let callback: IntersectionObserverCallback = () => {}
  const disconnect = vi.fn()

  class MockIntersectionObserver {
    constructor(cb: IntersectionObserverCallback) {
      callback = cb
    }
    observe = vi.fn()
    disconnect = disconnect
    unobserve = vi.fn()
    takeRecords = () => []
    root = null
    rootMargin = ''
    thresholds = []
  }

  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  return {
    trigger: (isIntersecting: boolean) =>
      act(() => {
        callback([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver)
      }),
    disconnect,
  }
}

describe('useScrollReveal', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts hidden and reveals when the element intersects', () => {
    const { trigger } = installMockObserver()

    render(<Probe />)
    expect(screen.getByText('visible: false')).toBeInTheDocument()

    trigger(true)
    expect(screen.getByText('visible: true')).toBeInTheDocument()
  })

  it('stays hidden when the element has not intersected yet', () => {
    installMockObserver()

    render(<Probe />)
    expect(screen.getByText('visible: false')).toBeInTheDocument()
  })

  it('disconnects the observer once the element is revealed', () => {
    const { trigger, disconnect } = installMockObserver()

    render(<Probe />)
    trigger(true)

    expect(disconnect).toHaveBeenCalled()
  })

  it('reveals immediately when prefers-reduced-motion is set', () => {
    vi.stubGlobal(
      'matchMedia',
      vi
        .fn()
        .mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    )

    render(<Probe />)
    expect(screen.getByText('visible: true')).toBeInTheDocument()
  })

  it('reveals immediately when IntersectionObserver is unavailable', () => {
    // jsdom has no IntersectionObserver by default; ensure no stub is present.
    render(<Probe />)
    expect(screen.getByText('visible: true')).toBeInTheDocument()
  })
})
