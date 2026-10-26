import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InviteClientDialog } from './InviteClientDialog'
import { panelCopy } from '../../data/panel'

const h = vi.hoisted(() => ({
  useAuth: vi.fn(),
  inviteByMagicLink: vi.fn(),
  turnstileOnChange: null as ((token: string) => void) | null,
}))

vi.mock('../../lib/auth-context', () => ({ useAuth: h.useAuth }))

vi.mock('../../components/Turnstile', () => ({
  TurnstileWidget: ({ onChange }: { onChange: (token: string) => void }) => {
    h.turnstileOnChange = onChange
    return <div data-testid="turnstile-mock" />
  },
}))

function emitCaptcha(token = 'captcha-token') {
  act(() => h.turnstileOnChange?.(token))
}

function renderDialog() {
  const onClose = vi.fn()
  const onSent = vi.fn()
  render(<InviteClientDialog email="cliente@example.com" onClose={onClose} onSent={onSent} />)
  return { onClose, onSent }
}

beforeEach(() => {
  vi.stubEnv('PUBLIC_TURNSTILE_SITE_KEY', 'test-site-key')
  h.turnstileOnChange = null
  h.inviteByMagicLink.mockReset().mockResolvedValue(undefined)
  h.useAuth.mockReturnValue({ inviteByMagicLink: h.inviteByMagicLink })
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('InviteClientDialog', () => {
  it('muestra el email y permite cancelar', async () => {
    const user = userEvent.setup()
    const { onClose, onSent } = renderDialog()

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(panelCopy.invite.intro('cliente@example.com'))).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: panelCopy.invite.cancel }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onSent).not.toHaveBeenCalled()
  })

  it('envía la invitación con el token de CAPTCHA', async () => {
    const user = userEvent.setup()
    const { onClose, onSent } = renderDialog()
    emitCaptcha()

    await user.click(screen.getByRole('button', { name: panelCopy.invite.send }))

    await waitFor(() =>
      expect(h.inviteByMagicLink).toHaveBeenCalledWith('cliente@example.com', 'captcha-token')
    )
    expect(onSent).toHaveBeenCalledWith('cliente@example.com')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('mantiene el envío deshabilitado hasta completar el CAPTCHA', () => {
    renderDialog()

    expect(screen.getByTestId('turnstile-mock')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: panelCopy.invite.send })).toBeDisabled()

    emitCaptcha()
    expect(screen.getByRole('button', { name: panelCopy.invite.send })).toBeEnabled()
  })

  it('muestra un error específico si falla el CAPTCHA', async () => {
    const user = userEvent.setup()
    h.useAuth.mockReturnValue({
      inviteByMagicLink: vi
        .fn()
        .mockRejectedValue(Object.assign(new Error('captcha'), { code: 'captcha_failed' })),
    })
    const { onSent } = renderDialog()
    emitCaptcha()

    await user.click(screen.getByRole('button', { name: panelCopy.invite.send }))

    expect(await screen.findByRole('alert')).toHaveTextContent(panelCopy.invite.captchaError)
    expect(onSent).not.toHaveBeenCalled()
  })

  it('muestra un error genérico y mantiene el diálogo abierto', async () => {
    const user = userEvent.setup()
    h.useAuth.mockReturnValue({
      inviteByMagicLink: vi.fn().mockRejectedValue(new Error('boom')),
    })
    const { onClose } = renderDialog()
    emitCaptcha()

    await user.click(screen.getByRole('button', { name: panelCopy.invite.send }))

    expect(await screen.findByRole('alert')).toHaveTextContent(panelCopy.invite.error)
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
