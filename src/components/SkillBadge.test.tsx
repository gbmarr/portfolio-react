import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SkillBadge } from './SkillBadge'

describe('SkillBadge', () => {
  it('renders the skill name', () => {
    render(<SkillBadge name="React" />)
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('renders an accessible level indicator for an advanced skill', () => {
    render(<SkillBadge name="React" level="advanced" />)
    const indicator = screen.getByLabelText('Nivel avanzado')
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveClass('bg-accent-violet')
  })

  it('renders a beginner indicator without a colored dot', () => {
    render(<SkillBadge name="Node.js" level="beginner" />)
    const indicator = screen.getByLabelText('Nivel principiante')
    expect(indicator).toBeInTheDocument()
    expect(indicator).not.toHaveClass('bg-accent-violet')
  })

  it('renders without a level indicator when level is omitted', () => {
    render(<SkillBadge name="Git" />)
    expect(screen.queryByLabelText(/Nivel/)).not.toBeInTheDocument()
  })
})
