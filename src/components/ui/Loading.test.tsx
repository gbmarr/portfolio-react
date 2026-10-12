import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Loading } from './Loading'
import { panelCopy } from '../../data/panel'

describe('Loading', () => {
  it('muestra el texto de carga con rol status', () => {
    render(<Loading />)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(panelCopy.loading)
  })
})
