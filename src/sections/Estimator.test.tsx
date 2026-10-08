import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Estimator } from './Estimator'
import { copy } from '../data/copy'
import { expressTimeline } from '../data/estimate'

function resultPanel() {
  return screen.getByTestId('estimate-result')
}

describe('Estimator', () => {
  it('renders the section heading, disclaimer and an aria-live result', () => {
    render(<Estimator />)
    expect(
      screen.getByRole('heading', { level: 2, name: copy.estimator.title })
    ).toBeInTheDocument()
    expect(resultPanel()).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByText(copy.estimator.disclaimer)).toBeInTheDocument()
  })

  it('estimates a landing by default', () => {
    render(<Estimator />)
    expect(resultPanel()).toHaveTextContent('USD 250')
    expect(resultPanel()).toHaveTextContent('USD 300')
  })

  it('switches the tier with the radio controls', async () => {
    const user = userEvent.setup()
    render(<Estimator />)
    await user.click(screen.getByRole('radio', { name: /proyecto a medida/i }))
    expect(resultPanel()).toHaveTextContent('USD 1.200')
    expect(resultPanel()).toHaveTextContent('USD 1.440')
  })

  it('adjusts the estimate with the sections slider on the institutional tier', async () => {
    const user = userEvent.setup()
    render(<Estimator />)
    await user.click(screen.getByRole('radio', { name: /sitio institucional/i }))
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '3')
    expect(slider).toHaveAttribute('max', '8')
    fireEvent.change(slider, { target: { value: '8' } })
    expect(resultPanel()).toHaveTextContent('USD 850')
    expect(resultPanel()).toHaveTextContent('USD 1.020')
  })

  it('hides the sections slider when the tier is not institutional', () => {
    render(<Estimator />)
    expect(screen.queryByRole('slider')).not.toBeInTheDocument()
  })

  it('adds a fixed extra when checked', async () => {
    const user = userEvent.setup()
    render(<Estimator />)
    const blog = screen.getByRole('checkbox', { name: /Blog \/ CMS editable/ })
    await user.click(blog)
    expect(resultPanel()).toHaveTextContent('USD 400')
    expect(resultPanel()).toHaveTextContent('USD 480')
  })

  it('applies express urgency', async () => {
    const user = userEvent.setup()
    render(<Estimator />)
    await user.click(screen.getByRole('checkbox', { name: copy.estimator.expressLabel }))
    expect(resultPanel()).toHaveTextContent('USD 330')
    expect(resultPanel()).toHaveTextContent(expressTimeline)
  })

  it('disables the ecommerce extra on the medida tier with an included note', async () => {
    const user = userEvent.setup()
    render(<Estimator />)
    const ecommerce = screen.getByRole('checkbox', { name: /tienda online/i })
    expect(ecommerce).toBeEnabled()
    await user.click(screen.getByRole('radio', { name: /proyecto a medida/i }))
    expect(ecommerce).toBeDisabled()
    expect(screen.getByText(/Incluido en este plan/)).toBeInTheDocument()
  })

  it('links the WhatsApp CTA with a preloaded estimate message', () => {
    render(<Estimator />)
    const cta = screen.getByRole('link', { name: copy.estimator.ctaWhatsApp })
    expect(cta.getAttribute('href')).toContain('wa.me')
    const decoded = decodeURIComponent(cta.getAttribute('href') ?? '')
    expect(decoded).toContain('Landing page')
    expect(decoded).toContain('USD 250')
    expect(decoded).toContain('USD 300')
  })

  it('offers the maintenance chip linking to the contact section', () => {
    render(<Estimator />)
    const chip = screen.getByRole('link', { name: copy.estimator.maintenanceChip })
    expect(chip).toHaveAttribute('href', '#contacto')
  })
})
