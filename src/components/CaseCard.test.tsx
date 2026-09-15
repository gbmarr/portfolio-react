import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CaseCard } from './CaseCard'
import { cases } from '../data/cases'

const dranes = cases.find((caseStudy) => caseStudy.id === 'dranes')!

describe('CaseCard', () => {
  it('renders the title, client and industry', () => {
    render(<CaseCard caseStudy={dranes} />)
    expect(screen.getByRole('heading', { name: dranes.title })).toBeInTheDocument()
    expect(screen.getAllByText(new RegExp(dranes.client)).length).toBeGreaterThan(0)
    expect(screen.getByText(new RegExp(dranes.industry))).toBeInTheDocument()
  })

  it('renders the context labels and content', () => {
    render(<CaseCard caseStudy={dranes} />)
    expect(screen.getByText('Qué necesitaba')).toBeInTheDocument()
    expect(screen.getByText('Qué hice')).toBeInTheDocument()
    expect(screen.getByText('Resultado')).toBeInTheDocument()
    expect(screen.getByText(dranes.need)).toBeInTheDocument()
    expect(screen.getByText(dranes.work)).toBeInTheDocument()
    expect(screen.getByText(dranes.result)).toBeInTheDocument()
  })

  it('renders the declared role badge for own projects', () => {
    render(<CaseCard caseStudy={dranes} />)
    expect(screen.getByText('Proyecto propio')).toBeInTheDocument()
  })

  it('renders a safe link to the live site when present', () => {
    const withUrl = cases.find((caseStudy) => caseStudy.id === 'simplehc')!
    render(<CaseCard caseStudy={withUrl} />)
    const link = screen.getByRole('link', { name: /Ver el sitio/ })
    expect(link).toHaveAttribute('href', withUrl.url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('omits the site link when there is no url', () => {
    render(<CaseCard caseStudy={dranes} />)
    expect(screen.queryByRole('link', { name: /Ver el sitio/ })).not.toBeInTheDocument()
  })
})