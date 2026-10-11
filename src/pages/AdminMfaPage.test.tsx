import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}))

vi.mock('../lib/auth-context', () => ({ useAuth: mocks.useAuth }))

import { AdminMfaPage } from './AdminMfaPage'
import { panelCopy } from '../data/panel'

function renderMfaPage() {
  return render(
    <MemoryRouter initialEntries={['/admin/mfa']}>
      <Routes>
        <Route path="/admin/mfa" element={<AdminMfaPage />} />
        <Route path="/" element={<div>home-page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

function authOverrides(overrides: Record<string, unknown> = {}) {
  mocks.useAuth.mockReturnValue({
    listMfaFactors: vi.fn(async () => []),
    enrollMfa: vi.fn(async () => ({
      factorId: 'f-1',
      qrCode: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"/>',
    })),
    challengeMfa: vi.fn(async () => 'c-1'),
    verifyMfa: vi.fn(async () => undefined),
    ...overrides,
  })
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('AdminMfaPage (verificación en dos pasos)', () => {
  it('muestra el estado de preparación al montar', () => {
    authOverrides()
    renderMfaPage()
    expect(screen.getByRole('status')).toHaveTextContent(panelCopy.adminMfa.checking)
  })

  it('muestra el QR para enrolar cuando no hay factores TOTP', async () => {
    const enrollMfa = vi.fn(async () => ({
      factorId: 'f-1',
      qrCode: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"/>',
    }))
    authOverrides({
      listMfaFactors: vi.fn(async () => []),
      enrollMfa,
    })
    renderMfaPage()

    expect(await screen.findByAltText(panelCopy.adminMfa.qrAlt)).toBeInTheDocument()
    expect(enrollMfa).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: panelCopy.adminMfa.enable })).toBeInTheDocument()
    expect(screen.getByLabelText(panelCopy.adminMfa.codeLabel)).toBeInTheDocument()
  })

  it('muestra el desafío cuando ya hay un factor enrolado', async () => {
    authOverrides({
      listMfaFactors: vi.fn(async () => ['factor-1']),
      challengeMfa: vi.fn(async () => 'challenge-1'),
    })
    renderMfaPage()

    expect(await screen.findByText(panelCopy.adminMfa.verifyIntro)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: panelCopy.adminMfa.verify })).toBeInTheDocument()
  })

  it('verifica el código TOTP contra el factor y el challenge', async () => {
    const verifyMfa = vi.fn(async () => undefined)
    authOverrides({
      listMfaFactors: vi.fn(async () => ['factor-1']),
      challengeMfa: vi.fn(async () => 'challenge-1'),
      verifyMfa,
    })
    renderMfaPage()

    await userEvent.type(await screen.findByLabelText(panelCopy.adminMfa.codeLabel), '123456')
    await userEvent.click(screen.getByRole('button', { name: panelCopy.adminMfa.verify }))

    expect(verifyMfa).toHaveBeenCalledWith('factor-1', 'challenge-1', '123456')
  })

  it('abre el desafío al activar desde el QR de enrolamiento (fix 400/no-op)', async () => {
    const challengeMfa = vi.fn(async () => 'challenge-from-submit')
    const verifyMfa = vi.fn(async () => undefined)
    authOverrides({
      listMfaFactors: vi.fn(async () => []),
      enrollMfa: vi.fn(async () => ({
        factorId: 'f-1',
        qrCode: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"/>',
      })),
      challengeMfa,
      verifyMfa,
    })
    renderMfaPage()

    await userEvent.type(await screen.findByLabelText(panelCopy.adminMfa.codeLabel), '123456')
    await userEvent.click(screen.getByRole('button', { name: panelCopy.adminMfa.enable }))

    expect(challengeMfa).toHaveBeenCalledWith('f-1')
    expect(verifyMfa).toHaveBeenCalledWith('f-1', 'challenge-from-submit', '123456')
  })

  it('muestra error cuando el código es inválido', async () => {
    authOverrides({
      listMfaFactors: vi.fn(async () => ['factor-1']),
      challengeMfa: vi.fn(async () => 'challenge-1'),
      verifyMfa: vi.fn(async () => {
        throw new Error('invalid')
      }),
    })
    renderMfaPage()

    await userEvent.type(await screen.findByLabelText(panelCopy.adminMfa.codeLabel), '111111')
    await userEvent.click(screen.getByRole('button', { name: panelCopy.adminMfa.verify }))

    expect(await screen.findByRole('alert')).toHaveTextContent(panelCopy.adminMfa.invalidCode)
  })

  it('muestra error si no se puede preparar la verificación', async () => {
    authOverrides({
      listMfaFactors: vi.fn(async () => {
        throw new Error('network')
      }),
    })
    renderMfaPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(panelCopy.adminMfa.error)
  })

  it('solo habilita el botón con 6 dígitos', async () => {
    authOverrides({
      listMfaFactors: vi.fn(async () => ['factor-1']),
      challengeMfa: vi.fn(async () => 'challenge-1'),
    })
    renderMfaPage()

    const button = await screen.findByRole('button', { name: panelCopy.adminMfa.verify })
    expect(button).toBeDisabled()
    await userEvent.type(screen.getByLabelText(panelCopy.adminMfa.codeLabel), '1234')
    expect(button).toBeDisabled()
    await userEvent.type(screen.getByLabelText(panelCopy.adminMfa.codeLabel), '56')
    expect(button).toBeEnabled()
  })
})