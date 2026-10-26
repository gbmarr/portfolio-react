import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClientGuidePage } from './ClientGuidePage'
import { guideSections, guideTotalSteps } from '../../data/clientGuide'
import { GUIDE_PROGRESS_STORAGE_KEY } from '../../hooks/useGuideProgress'

describe('ClientGuidePage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('muestra las secciones, beneficios y el progreso inicial', () => {
    render(<ClientGuidePage />)

    expect(screen.getByRole('heading', { name: /Todo lo que necesitás/ })).toBeInTheDocument()
    expect(screen.getByText('Por qué te conviene')).toBeInTheDocument()
    expect(screen.getAllByText('Email profesional, no personal').length).toBeGreaterThan(0)

    for (const section of guideSections) {
      expect(screen.getByRole('heading', { name: section.title })).toBeInTheDocument()
    }

    expect(screen.getByText(`0 de ${guideTotalSteps} pasos completados`)).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Progreso de la guía' })).toHaveAttribute(
      'aria-valuenow',
      '0'
    )
  })

  it('marca un paso, actualiza el progreso y lo persiste', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<ClientGuidePage />)

    const checkbox = screen.getByRole('checkbox', { name: /Elegí el nombre y verificá/ })
    await user.click(checkbox)

    expect(checkbox).toBeChecked()
    expect(screen.getByText(`1 de ${guideTotalSteps} pasos completados`)).toBeInTheDocument()
    expect(window.localStorage.getItem(GUIDE_PROGRESS_STORAGE_KEY)).toContain('marca-nombre')

    unmount()
    render(<ClientGuidePage />)

    expect(screen.getByRole('checkbox', { name: /Elegí el nombre y verificá/ })).toBeChecked()
  })

  it('permite reiniciar el progreso guardado', async () => {
    const user = userEvent.setup()
    render(<ClientGuidePage />)

    await user.click(screen.getByRole('checkbox', { name: /Elegí el nombre y verificá/ }))
    await user.click(screen.getByRole('button', { name: 'Reiniciar progreso' }))

    expect(screen.getByRole('alertdialog', { name: 'Reiniciar progreso' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sí, reiniciar' }))

    expect(screen.getByRole('checkbox', { name: /Elegí el nombre y verificá/ })).not.toBeChecked()
    expect(screen.getByText(`0 de ${guideTotalSteps} pasos completados`)).toBeInTheDocument()
    expect(window.localStorage.getItem(GUIDE_PROGRESS_STORAGE_KEY)).toBeNull()
  })
})
