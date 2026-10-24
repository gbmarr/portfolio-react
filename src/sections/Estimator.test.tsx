import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Estimator } from './Estimator'
import { copy } from '../data/copy'

const turnstile = vi.hoisted(() => ({
  onChange: null as ((token: string) => void) | null,
}))

vi.mock('../components/Turnstile', () => ({
  TurnstileWidget: ({ onChange }: { onChange: (token: string) => void }) => {
    turnstile.onChange = onChange
    return null
  },
}))

const fetchMock = vi.fn()

function renderEstimator() {
  return render(
    <MemoryRouter>
      <Estimator />
    </MemoryRouter>
  )
}

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(copy.estimator.form.name), 'Ana Pérez')
  await user.type(screen.getByLabelText(copy.estimator.form.email), 'ana@example.com')
  await user.click(screen.getByRole('checkbox', { name: /Política de Privacidad/ }))
  turnstile.onChange?.('token-123')
}

beforeEach(() => {
  vi.stubEnv('PUBLIC_SUPABASE_URL', 'https://abc.supabase.co')
  vi.stubEnv('PUBLIC_TURNSTILE_SITE_KEY', 'site-key')
  fetchMock.mockReset()
  fetchMock.mockResolvedValue({ ok: true, status: 200 })
  vi.stubGlobal('fetch', fetchMock)
  turnstile.onChange = null
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('Estimator', () => {
  it('renders the heading, disclaimer and quote summary without prices', () => {
    renderEstimator()
    expect(screen.getByRole('heading', { level: 2, name: copy.estimator.title })).toBeInTheDocument()
    expect(screen.getByText(copy.estimator.disclaimer)).toBeInTheDocument()
    expect(screen.getByTestId('quote-summary')).toHaveTextContent('1 a 2 semanas')
    expect(screen.queryByText(/USD|ARS|Desde/)).toBeNull()
  })

  it('shows the estimated timeline for the selected tier', async () => {
    const user = userEvent.setup()
    renderEstimator()

    expect(screen.getByTestId('quote-summary')).toHaveTextContent('1 a 2 semanas')
    await user.click(screen.getByRole('radio', { name: /a medida/i }))
    expect(screen.getByTestId('quote-summary')).toHaveTextContent('4 a 8 semanas')
  })

  it('adjusts the timeline with the institutional sections slider', async () => {
    const user = userEvent.setup()
    renderEstimator()
    await user.click(screen.getByRole('radio', { name: /sitio completo/i }))

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '3')
    expect(slider).toHaveAttribute('max', '8')

    fireEvent.change(slider, { target: { value: '8' } })
    expect(screen.getByTestId('quote-summary')).toHaveTextContent('2 a 5 semanas')
  })

  it('hides the sections slider when the tier is not institutional', () => {
    renderEstimator()
    expect(screen.queryByRole('slider')).not.toBeInTheDocument()
  })

  it('adds a selected extra to the summary', async () => {
    const user = userEvent.setup()
    renderEstimator()
    await user.click(screen.getByRole('checkbox', { name: /Diseño de logo/ }))
    expect(screen.getByTestId('quote-summary')).toHaveTextContent('Diseño de logo')
  })

  it('shows the online store included in the custom tier', async () => {
    const user = userEvent.setup()
    renderEstimator()
    expect(screen.queryByRole('checkbox', { name: /tienda online/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /a medida/i }))
    const ecommerce = screen.getByRole('checkbox', { name: /tienda online/i })
    expect(ecommerce).toBeDisabled()
    expect(ecommerce).toBeChecked()
    expect(screen.getByTestId('quote-summary')).toHaveTextContent('Módulo de tienda online')
    expect(screen.getByText(/Incluido en este plan/)).toBeInTheDocument()
  })

  it('discards extras that no longer apply when changing tier', async () => {
    const user = userEvent.setup()
    renderEstimator()
    await user.click(screen.getByRole('radio', { name: /sitio completo/i }))
    await user.click(screen.getByRole('checkbox', { name: /Blog \/ CMS editable/ }))
    expect(screen.getByTestId('quote-summary')).toHaveTextContent('Blog / CMS editable')

    await user.click(screen.getByRole('radio', { name: /sitio de una página/i }))
    expect(screen.queryByRole('checkbox', { name: /Blog \/ CMS editable/ })).not.toBeInTheDocument()
    expect(screen.getByTestId('quote-summary')).toHaveTextContent(copy.estimator.noExtras)
  })

  it('links to the privacy policy and terms', () => {
    renderEstimator()
    expect(screen.getByRole('link', { name: copy.legal.privacy })).toHaveAttribute(
      'href',
      '/privacidad'
    )
    expect(screen.getByRole('link', { name: copy.legal.terms })).toHaveAttribute(
      'href',
      '/terminos'
    )
  })

  it('does not offer a WhatsApp CTA with prices', () => {
    renderEstimator()
    expect(screen.queryByRole('link', { name: /WhatsApp/i })).not.toBeInTheDocument()
  })

  it('blocks the submit when the consent is missing', async () => {
    const user = userEvent.setup()
    renderEstimator()
    await user.type(screen.getByLabelText(copy.estimator.form.name), 'Ana Pérez')
    await user.type(screen.getByLabelText(copy.estimator.form.email), 'ana@example.com')
    turnstile.onChange?.('token-123')
    await user.click(screen.getByRole('button', { name: copy.estimator.form.submit }))

    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(copy.estimator.form.error)
  })

  it('rejects a WhatsApp number in the email field', async () => {
    const user = userEvent.setup()
    renderEstimator()
    await user.type(screen.getByLabelText(copy.estimator.form.name), 'Ana Pérez')
    await user.type(screen.getByLabelText(copy.estimator.form.email), '11 2345 6789')
    await user.click(screen.getByRole('checkbox', { name: /Política de Privacidad/ }))
    turnstile.onChange?.('token-123')
    await user.click(screen.getByRole('button', { name: copy.estimator.form.submit }))

    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(copy.estimator.form.error)
  })

  it('blocks the submit without a Turnstile token', async () => {
    const user = userEvent.setup()
    renderEstimator()
    await user.type(screen.getByLabelText(copy.estimator.form.name), 'Ana Pérez')
    await user.type(screen.getByLabelText(copy.estimator.form.email), 'ana@example.com')
    await user.click(screen.getByRole('checkbox', { name: /Política de Privacidad/ }))
    await user.click(screen.getByRole('button', { name: copy.estimator.form.submit }))

    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(copy.estimator.form.error)
  })

  it('sends the quote request without any price fields', async () => {
    const user = userEvent.setup()
    renderEstimator()
    await fillRequired(user)
    await user.click(screen.getByRole('button', { name: copy.estimator.form.submit }))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://abc.functions.supabase.co/contact-notify')
    const body = JSON.parse(String(init.body))
    expect(body).toMatchObject({
      kind: 'quote',
      name: 'Ana Pérez',
      email: 'ana@example.com',
      tier: 'landing',
      sections: 0,
      extras: [],
      consentAccepted: true,
      turnstileToken: 'token-123',
    })
    expect(body).not.toHaveProperty('minUsd')
    expect(body).not.toHaveProperty('maxUsd')
    expect(screen.getByRole('status')).toHaveTextContent(copy.estimator.form.success)
  })

  it('sends the selected tier, sections and extras', async () => {
    const user = userEvent.setup()
    renderEstimator()
    await user.click(screen.getByRole('radio', { name: /sitio completo/i }))
    await user.click(screen.getByRole('checkbox', { name: /Blog \/ CMS editable/ }))
    await user.type(screen.getByLabelText(copy.estimator.form.notes), 'Un estudio contable')
    await fillRequired(user)
    await user.click(screen.getByRole('button', { name: copy.estimator.form.submit }))

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(String(init.body))
    expect(body).toMatchObject({
      tier: 'institucional',
      sections: 5,
      extras: ['blog'],
      notes: 'Un estudio contable',
    })
  })

  it('shows the error when the backend rejects the request', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce({ ok: false, status: 429 })
    renderEstimator()
    await fillRequired(user)
    await user.click(screen.getByRole('button', { name: copy.estimator.form.submit }))

    expect(screen.getByRole('alert')).toHaveTextContent(copy.estimator.form.error)
  })

  it('fakes success when the honeypot is filled', async () => {
    const user = userEvent.setup()
    renderEstimator()
    const honeypot = document.querySelector('input[name="botcheck"]')
    expect(honeypot).not.toBeNull()
    fireEvent.change(honeypot!, { target: { value: 'bot' } })
    await user.click(screen.getByRole('button', { name: copy.estimator.form.submit }))

    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent(copy.estimator.form.success)
  })
})
