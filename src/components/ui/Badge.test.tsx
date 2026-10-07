import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renderiza el texto con tono neutral por defecto', () => {
    render(<Badge>Activo</Badge>)
    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  it('aplica la clase del tono indicado', () => {
    render(<Badge tone="done">Completado</Badge>)
    expect(screen.getByText('Completado')).toHaveClass('text-emerald-300')
  })
})
