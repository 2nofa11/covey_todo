import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { setupComponentMocks } from '@/test/setup'
import Home from '../../pages/index.vue'

// Setup all mocks
setupComponentMocks()

describe('home.vue', () => {
  it('should mount Home component', () => {
    const { container } = render(Home)
    expect(container.firstChild).toBeTruthy()
  })

  it('should import and execute module', async () => {
    await import('../../pages/index.vue')
    expect(true).toBe(true)
  })
})
