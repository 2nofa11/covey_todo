import { render, screen } from '@testing-library/vue'
import { createPinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import { setupComponentMocks } from '@/test/setup'
import App from './App.vue'

// Setup all mocks
setupComponentMocks()

// Mock AppLayout component
vi.mock('./components/layout/AppLayout.vue', () => ({
  default: {
    name: 'AppLayout',
    template: '<div>Mocked AppLayout</div>',
  },
}))

// Mock ModalContainer component
vi.mock('./components/ModalContainer.vue', () => ({
  default: {
    name: 'ModalContainer',
    template: '<div>Mocked ModalContainer</div>',
  },
}))

describe('app.vue', () => {
  it('should render Home component', () => {
    render(App, {
      global: {
        plugins: [createPinia()],
      },
    })
    expect(screen.getByText('Mocked AppLayout')).toBeTruthy()
    expect(screen.getByText('Mocked ModalContainer')).toBeTruthy()
  })

  it('should import Home component', () => {
    expect(App).toBeDefined()
  })
})
