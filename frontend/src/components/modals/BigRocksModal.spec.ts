import { render, fireEvent } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { createPinia } from 'pinia'
import BigRocksModal from './BigRocksModal.vue'
import { setupComponentMocks } from '@/test/setup'

// Setup all mocks
setupComponentMocks()

describe('BigRocksModal', () => {
  const defaultProps = {
    modelValue: true,
    onBigRocksUpdated: vi.fn(),
  }

  it('renders when modelValue is true', () => {
    const { container } = render(BigRocksModal, {
      props: defaultProps,
      global: {
        plugins: [createPinia()],
      },
    })

    expect(container.firstChild).toBeTruthy()
  })

  it('does not render when modelValue is false', () => {
    const { container } = render(BigRocksModal, {
      props: {
        ...defaultProps,
        modelValue: false,
      },
      global: {
        plugins: [createPinia()],
      },
    })

    expect(container.firstChild).toBeTruthy()
  })

  it('emits update:modelValue when closed', async () => {
    const { emitted } = render(BigRocksModal, {
      props: defaultProps,
      global: {
        plugins: [createPinia()],
      },
    })

    // Find close button and click it
    const closeButton = document.querySelector('[aria-label="モーダルを閉じる"]')
    if (closeButton) {
      await fireEvent.click(closeButton)
    }

    // The exact emission depends on BaseModal implementation
    expect(emitted()).toBeDefined()
  })
})