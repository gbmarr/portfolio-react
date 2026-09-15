import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FAQSection } from './FAQSection'
import { faqs } from '../data/faq'
import { copy } from '../data/copy'

describe('FAQSection', () => {
  it('renders all the FAQ questions', () => {
    render(<FAQSection />)
    expect(screen.getByRole('heading', { name: copy.faq.title })).toBeInTheDocument()
    for (const faq of faqs) {
      expect(screen.getByText(faq.question)).toBeInTheDocument()
    }
  })
})