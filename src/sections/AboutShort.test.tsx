import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AboutShort } from './AboutShort'
import { copy } from '../data/copy'

describe('AboutShort', () => {
  it('renders the short bio with a real photo', () => {
    render(<AboutShort />)
    expect(screen.getByRole('heading', { name: copy.about.title })).toBeInTheDocument()
    expect(screen.getByText(copy.about.text)).toBeInTheDocument()
    const photo = screen.getByRole('img', { name: copy.about.photoAlt })
    expect(photo).toHaveAttribute('src', '/images/profile-photo.webp')
  })
})