import { vi } from 'vitest'

// Mock all composables
export function mockComposables() {
  vi.mock('@/composables/useKeyboardShortcuts', () => ({
    useKeyboardShortcuts: vi.fn(),
  }))

  vi.mock('@/composables/useTaskFilters', () => ({
    useTaskFilters: vi.fn(() => ({
      todayTasks: [],
      getQuadrantTasks: vi.fn(() => []),
      quadrantCounts: { do: 0, plan: 0, delegate: 0, eliminate: 0 },
      q2Ratio: 0,
      getQuadrant: vi.fn(() => 'do'),
    })),
  }))

  vi.mock('@/composables/useTaskStats', () => ({
    useTaskStats: vi.fn(() => ({
      stats: {
        totalTasks: 0,
        completedToday: 0,
        highPriority: 0,
      },
    })),
  }))
}

// Mock all stores
export function mockStores() {
  vi.mock('@/stores/useTodoStore', () => ({
    useTodoStore: vi.fn(() => ({
      tasks: [],
      addTask: vi.fn(),
      toggleCompleted: vi.fn(),
      deleteTask: vi.fn(),
      toggleImportant: vi.fn(),
      toggleUrgent: vi.fn(),
    })),
  }))

  vi.mock('@/stores/useBigRocksStore', () => ({
    useBigRocksStore: vi.fn(() => ({
      bigRocks: { work: [], family: [], health: [], personal: [] },
      allBigRocks: [],
      updateBigRocks: vi.fn(),
    })),
  }))

  vi.mock('@/stores/useUIStore', () => ({
    useUIStore: vi.fn(() => ({
      currentView: 'today',
      currentQuadrant: 'do',
      showQuickCapture: false,
      showBigRocks: false,
      showOnboarding: false,
      taskInput: '',
      tutorialTaskInput: '',
      captureImportant: false,
      captureUrgent: false,
      statusMessage: '',
      currentOnboardingStep: 1,
      switchToTodayView: vi.fn(),
      switchToWeekView: vi.fn(),
      switchQuadrant: vi.fn(),
      toggleQuickCapture: vi.fn(),
      toggleBigRocks: vi.fn(),
      toggleOnboarding: vi.fn(),
      resetCaptureState: vi.fn(),
      announceStatus: vi.fn(),
      nextOnboardingStep: vi.fn(),
      prevOnboardingStep: vi.fn(),
      resetOnboarding: vi.fn(),
    })),
  }))
}

// Mock components for testing-library/vue
export function mockComponents() {
  vi.mock('@/components/ui/BaseModal.vue', () => ({
    default: {
      name: 'BaseModal',
      template: '<div data-testid="base-modal"><slot /></div>',
      props: ['modelValue', 'title', 'maxWidth'],
    },
  }))

  vi.mock('@/components/ui/TaskCard.vue', () => ({
    default: {
      name: 'TaskCard',
      template: '<div data-testid="task-card">Task Card</div>',
      props: ['task', 'showControls', 'showQuadrantLabel'],
    },
  }))
}

// Mock Vue composition API functions
export function mockVue() {
  vi.mock('vue', async () => {
    const actual = await vi.importActual('vue')
    return {
      ...actual,
      toRef: vi.fn((obj, key) => ({ value: obj[key] })),
      onMounted: vi.fn(fn => fn()),
    }
  })
}

// Mock types
export function mockTypes() {
  vi.mock('@/types', () => ({
    QuadrantType: {},
  }))
}

// Mock DOM APIs
export function mockDOMAPIs() {
  const mockFocus = vi.fn()
  const mockShowModal = vi.fn()
  const mockClose = vi.fn()
  const mockQuerySelector = vi.fn()
  const mockQuerySelectorAll = vi.fn()

  // HTMLDialogElement methods
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    value: mockShowModal,
    writable: true,
  })

  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    value: mockClose,
    writable: true,
  })

  Object.defineProperty(HTMLDialogElement.prototype, 'querySelector', {
    value: mockQuerySelector,
    writable: true,
  })

  Object.defineProperty(HTMLDialogElement.prototype, 'querySelectorAll', {
    value: mockQuerySelectorAll,
    writable: true,
  })

  // document.activeElement mock
  Object.defineProperty(document, 'activeElement', {
    value: { focus: mockFocus },
    writable: true,
    configurable: true,
  })

  return {
    mockFocus,
    mockShowModal,
    mockClose,
    mockQuerySelector,
    mockQuerySelectorAll,
  }
}

// Setup all mocks for component testing
export function setupComponentMocks() {
  mockComposables()
  mockStores()
  mockComponents()
  mockVue()
  mockTypes()
  return mockDOMAPIs()
}
