import { describe, expect, it } from 'vitest'
import { computeTooltipPlacement } from './tooltipPosition'

describe('computeTooltipPlacement', () => {
  it('centra el tooltip encima cuando hay espacio arriba', () => {
    const placement = computeTooltipPlacement({
      wrapperRect: { top: 200, bottom: 240, left: 100, width: 60 },
      tooltipWidth: 200,
      tooltipHeight: 80,
      viewportWidth: 390,
      viewportHeight: 844,
    })

    expect(placement.vertical).toBe('above')
    expect(placement.left).toBe(-70)
    expect(placement.arrowLeft).toBe(100)
  })

  it('rota el tooltip para abajo cuando no hay espacio arriba', () => {
    const placement = computeTooltipPlacement({
      wrapperRect: { top: 10, bottom: 50, left: 100, width: 60 },
      tooltipWidth: 200,
      tooltipHeight: 80,
      viewportWidth: 390,
      viewportHeight: 844,
    })

    expect(placement.vertical).toBe('below')
    expect(placement.left).toBe(-70)
    expect(placement.arrowLeft).toBe(100)
  })

  it('elige el lado con más espacio cuando no entra en ninguno', () => {
    const placement = computeTooltipPlacement({
      wrapperRect: { top: 40, bottom: 80, left: 100, width: 60 },
      tooltipWidth: 200,
      tooltipHeight: 120,
      viewportWidth: 390,
      viewportHeight: 200,
    })

    expect(placement.vertical).toBe('below')
  })

  it('clampa el tooltip hacia adentro cuando el chip está pegado al borde izquierdo', () => {
    const placement = computeTooltipPlacement({
      wrapperRect: { top: 200, bottom: 240, left: 4, width: 60 },
      tooltipWidth: 200,
      tooltipHeight: 80,
      viewportWidth: 390,
      viewportHeight: 844,
    })

    expect(placement.vertical).toBe('above')
    expect(placement.left).toBe(4)
    expect(placement.arrowLeft).toBe(26)
  })

  it('clampa el tooltip hacia adentro cuando el chip está pegado al borde derecho', () => {
    const placement = computeTooltipPlacement({
      wrapperRect: { top: 200, bottom: 240, left: 326, width: 60 },
      tooltipWidth: 200,
      tooltipHeight: 80,
      viewportWidth: 390,
      viewportHeight: 844,
    })

    expect(placement.vertical).toBe('above')
    expect(placement.left).toBe(-144)
    // El tooltip queda dentro del viewport: right = 182 + 200 <= 390 - 8.
    expect(placement.arrowLeft).toBe(174)
  })

  it('respetar el margen inferior del viewport al clampear', () => {
    const placement = computeTooltipPlacement({
      wrapperRect: { top: 200, bottom: 240, left: 326, width: 60 },
      tooltipWidth: 200,
      tooltipHeight: 80,
      viewportWidth: 390,
      viewportHeight: 844,
    })

    const tooltipRight = placement.left + 326 + 200
    expect(tooltipRight).toBeLessThanOrEqual(390 - 8)
  })

  it('oculta la flecha si el centro del chip queda fuera del tooltip', () => {
    const placement = computeTooltipPlacement({
      wrapperRect: { top: 200, bottom: 240, left: 340, width: 100 },
      tooltipWidth: 40,
      tooltipHeight: 80,
      viewportWidth: 390,
      viewportHeight: 844,
    })

    expect(placement.arrowLeft).toBeNull()
  })
})