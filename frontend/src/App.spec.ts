import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import App from './App.vue'

// Mock Home component
vi.mock('./pages/Home.vue', () => ({
  default: {
    name: 'Home',
    template: '<div>Mocked Home</div>',
  },
}))

describe('app.vue', () => {
  it('should render Home component', () => {
    render(App)
    expect(screen.getByText('Mocked Home')).toBeTruthy()
  })

  it('should import Home component', () => {
    expect(App).toBeDefined()
  })
})
