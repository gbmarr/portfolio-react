import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Clean up the DOM between tests (Vitest runs without `globals: true`,
// so React Testing Library's automatic cleanup is not registered).
afterEach(() => {
  cleanup()
})
