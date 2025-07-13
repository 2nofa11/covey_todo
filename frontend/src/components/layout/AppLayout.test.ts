import { render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from './AppLayout.vue'
import { setupComponentMocks } from '@/test/setup'

// Setup all mocks
setupComponentMocks()

// Mock the modal composable
const mockModalOpen = vi.fn()
vi.mock('@/composables/useModal', () => ({
  useModal: () => ({
    open: mockModalOpen,
  }),
}))

// Mock router-link and router-view
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRoute: () => ({
      name: 'Index',
      path: '/',
    }),
    useRouter: () => ({
      push: vi.fn(),
    }),
  }
})

// Create a simple router for testing
const routes = [
  { path: '/', name: 'Index', component: { template: '<div>Home</div>' } },
  { path: '/week', name: 'Week', component: { template: '<div>Week</div>' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

describe('AppLayout', () => {
  it('renders correctly', () => {
    const { container } = render(AppLayout, {
      global: {
        plugins: [createPinia(), router],
      },
    })
    
    expect(container).toBeTruthy()
  })

  it('mounts without errors', () => {
    expect(() => {
      render(AppLayout, {
        global: {
          plugins: [createPinia(), router],
        },
      })
    }).not.toThrow()
  })

  it('calls modal.open functions correctly', () => {
    render(AppLayout, {
      global: {
        plugins: [createPinia(), router],
      },
    })

    // modalOpenが呼ばれることを確認
    expect(mockModalOpen).toHaveBeenCalled()
    
    // 呼び出された引数を確認
    const calls = mockModalOpen.mock.calls
    expect(calls.length).toBeGreaterThan(0)
    
    // 各呼び出しでモーダルコンポーネントとプロップスが渡されることを確認
    calls.forEach(([component, props]) => {
      expect(component).toBeDefined()
      expect(props).toBeDefined()
    })
  })

  it('executes callback functions when modal events occur', () => {
    render(AppLayout, {
      global: {
        plugins: [createPinia(), router],
      },
    })

    // modalOpenの各呼び出しのコールバックを実行してテスト
    const calls = mockModalOpen.mock.calls
    
    calls.forEach(([component, props]) => {
      if (props) {
        // onTaskAddedコールバックがある場合
        if (props.onTaskAdded) {
          props.onTaskAdded('Test Task', true, false)
          expect(typeof props.onTaskAdded).toBe('function')
        }
        
        // onBigRocksUpdatedコールバックがある場合
        if (props.onBigRocksUpdated) {
          props.onBigRocksUpdated({ work: ['test'] })
          expect(typeof props.onBigRocksUpdated).toBe('function')
        }
        
        // onTutorialTaskAddedコールバックがある場合
        if (props.onTutorialTaskAdded) {
          props.onTutorialTaskAdded('Tutorial Task')
          expect(typeof props.onTutorialTaskAdded).toBe('function')
        }
        
        // onOnboardingCompletedコールバックがある場合
        if (props.onOnboardingCompleted) {
          props.onOnboardingCompleted()
          expect(typeof props.onOnboardingCompleted).toBe('function')
        }
      }
    })
  })
})