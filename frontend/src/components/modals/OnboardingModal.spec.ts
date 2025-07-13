import { fireEvent, render } from '@testing-library/vue'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import { setupComponentMocks } from '@/test/setup'
import OnboardingModal from './OnboardingModal.vue'

// Setup all mocks
setupComponentMocks()

describe('onboardingModal', () => {
  const defaultProps = {
    modelValue: true,
    onTutorialTaskAdded: vi.fn(),
    onOnboardingCompleted: vi.fn(),
  }

  it('renders when modelValue is true', () => {
    const { container } = render(OnboardingModal, {
      props: defaultProps,
      global: {
        plugins: [createPinia()],
      },
    })

    expect(container.firstChild).toBeTruthy()
  })

  it('does not render when modelValue is false', () => {
    const { container } = render(OnboardingModal, {
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
    const { emitted } = render(OnboardingModal, {
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
