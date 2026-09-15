import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FAQ } from './FAQ'
import { faqs } from '../data/faq'

describe('FAQ', () => {
  it('renders every question', () => {
    render(<FAQ items={faqs} />)
    for (const faq of faqs) {
      expect(screen.getByText(faq.question)).toBeInTheDocument()
    }
  })

  it('shows the answer when the question is opened', async () => {
    const user = userEvent.setup()
    render(<FAQ items={faqs} />)
    const summary = screen.getByText(faqs[0].question)
    await user.click(summary)
    expect(screen.getByText(faqs[0].answer)).toBeVisible()
  })
})