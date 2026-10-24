import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Estimator } from './Estimator'
import { copy } from '../data/copy'

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
    expect(resultPanel()).toHaveTextContent('USD 350')
    expect(resultPanel()).toHaveTextContent('USD 420')
  })

  it('switches the tier with the radio controls', async () => {
    const user = userEvent.setup()
    render(<Estimator />)
    await user.click(screen.getByRole('radio', { name: /a medida/i }))
    expect(resultPanel()).toHaveTextContent('USD 1.200')
    expect(resultPanel()).toHaveTextContent('USD 1.440')
  })

  it('adjusts the estimate with the sections slider on the institutional tier', async () => {
    const user = userEvent.setup()
    render(<Estimator />)
    await user.click(screen.getByRole('radio', { name: /sitio completo/i }))
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '3')
    expect(slider).toHaveAttribute('max', '8')
    fireEvent.change(slider, { target: { value: '8' } })
    expect(resultPanel()).toHaveTextContent('USD 1.000')
    expect(resultPanel()).toHaveTextContent('USD 1.200')
  })

  it('hides the sections slider when the tier is not institutional', () => {
    render(<Estimator />)
    expect(screen.queryByRole('slider')).not.toBeInTheDocument()
  })

  it('adds a fixed extra when checked', async () => {
    const user = userEvent.setup()
    render(<Estimator />)
    const logo = screen.getByRole('checkbox', { name: /Diseño de logo/ })
    await user.click(logo)
    expect(resultPanel()).toHaveTextContent('USD 550')
    expect(resultPanel()).toHaveTextContent('USD 660')
  })

  it('oculta la tienda en landing y la muestra incluida en medida', async () => {
    const user = userEvent.setup()
    render(<Estimator />)
    expect(screen.queryByRole('checkbox', { name: /tienda online/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /a medida/i }))
    const ecommerce = screen.getByRole('checkbox', { name: /tienda online/i })
    expect(ecommerce).toBeDisabled()
    expect(ecommerce).toBeChecked()
    expect(screen.getByText(/Incluido en este plan/)).toBeInTheDocument()
  })

  it('descarta extras que dejan de aplicar al cambiar de tier', async () => {
    const user = userEvent.setup()
    render(<Estimator />)
    await user.click(screen.getByRole('radio', { name: /sitio completo/i }))
    await user.click(screen.getByRole('checkbox', { name: /Blog \/ CMS editable/ }))
    // Sitio completo: 600 + 2 secciones extra (de 5) = 760, + blog 150 = 910.
    expect(resultPanel()).toHaveTextContent('USD 910')

    await user.click(screen.getByRole('radio', { name: /sitio de una página/i }))
    expect(resultPanel()).toHaveTextContent('USD 350')
    expect(
      screen.queryByRole('checkbox', { name: /Blog \/ CMS editable/ })
    ).not.toBeInTheDocument()
  })

  it('links the WhatsApp CTA with a preloaded estimate message', () => {
    render(<Estimator />)
    const cta = screen.getByRole('link', { name: copy.estimator.ctaWhatsApp })
    expect(cta.getAttribute('href')).toContain('wa.me')
    const decoded = decodeURIComponent(cta.getAttribute('href') ?? '')
    expect(decoded).toContain('Sitio de una página')
    expect(decoded).toContain('USD 350')
    expect(decoded).toContain('USD 420')
  })

  it('offers the maintenance chip linking to the contact section', () => {
    render(<Estimator />)
    const chip = screen.getByRole('link', { name: copy.estimator.maintenanceChip })
    expect(chip).toHaveAttribute('href', '#contacto')
  })

  it('does not render the express urgency option', () => {
    render(<Estimator />)
    expect(screen.queryByText(/menos de una semana/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: /exprés/i })).not.toBeInTheDocument()
  })
})
