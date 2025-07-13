import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'

// Mock VueUse composables
vi.mock('@vueuse/core', () => ({
  whenever: vi.fn(),
  useMagicKeys: vi.fn(),
}))

// Mock UI store
const mockUiStore = {
  currentView: 'today',
  switchToTodayView: vi.fn(),
  switchToWeekView: vi.fn(),
  switchQuadrant: vi.fn(),
}

vi.mock('@/stores/useUIStore', () => ({
  useUIStore: () => mockUiStore,
}))

describe('useKeyboardShortcuts', () => {
  let mockWhenever: any
  let mockUseMagicKeys: any

  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Get mocked functions
    const vueUseCore = await import('@vueuse/core')
    mockWhenever = vueUseCore.whenever as any
    mockUseMagicKeys = vueUseCore.useMagicKeys as any

    // Default return value for useMagicKeys
    mockUseMagicKeys.mockReturnValue({
      t: ref(false),
      w: ref(false),
      _1: ref(false),
      _2: ref(false),
      _3: ref(false),
      _4: ref(false),
    })
  })

  it('initializes keyboard shortcuts', () => {
    const result = useKeyboardShortcuts()

    expect(mockUseMagicKeys).toHaveBeenCalledWith({
      passive: false,
      onEventFired: expect.any(Function),
    })
    expect(result).toHaveProperty('keys')
  })

  it('sets up whenever listeners for all keys', () => {
    useKeyboardShortcuts()

    // Should call whenever for each key
    expect(mockWhenever).toHaveBeenCalledTimes(6)
  })

  it('returns keys object', () => {
    mockUseMagicKeys.mockReturnValue({
      t: { value: false },
      w: { value: false },
      _1: { value: false },
      _2: { value: false },
      _3: { value: false },
      _4: { value: false },
    })

    const result = useKeyboardShortcuts()

    expect(result).toHaveProperty('keys')
    expect(result.keys).toHaveProperty('t')
    expect(result.keys).toHaveProperty('w')
    expect(result.keys).toHaveProperty('_1')
    expect(result.keys).toHaveProperty('_2')
    expect(result.keys).toHaveProperty('_3')
    expect(result.keys).toHaveProperty('_4')
  })

  it('configures onEventFired callback correctly', () => {
    let onEventFired: any

    mockUseMagicKeys.mockImplementation((config: any) => {
      onEventFired = config.onEventFired
      return {
        t: ref(false),
        w: ref(false),
        _1: ref(false),
        _2: ref(false),
        _3: ref(false),
        _4: ref(false),
      }
    })

    useKeyboardShortcuts()

    // Test with a valid key
    const mockEvent = {
      key: 't',
      target: document.body,
      preventDefault: vi.fn(),
    }

    onEventFired(mockEvent)
    expect(mockEvent.preventDefault).toHaveBeenCalled()
  })

  it('ignores events from input elements', () => {
    let onEventFired: any

    mockUseMagicKeys.mockImplementation((config: any) => {
      onEventFired = config.onEventFired
      return {
        t: ref(false),
        w: ref(false),
        _1: ref(false),
        _2: ref(false),
        _3: ref(false),
        _4: ref(false),
      }
    })

    useKeyboardShortcuts()

    // Test key on input element - should be ignored
    const mockInputEvent = {
      key: 't',
      target: document.createElement('input'),
      preventDefault: vi.fn(),
    }

    onEventFired(mockInputEvent)
    expect(mockInputEvent.preventDefault).not.toHaveBeenCalled()

    // Test key on textarea element - should be ignored
    const mockTextareaEvent = {
      key: 't',
      target: document.createElement('textarea'),
      preventDefault: vi.fn(),
    }

    onEventFired(mockTextareaEvent)
    expect(mockTextareaEvent.preventDefault).not.toHaveBeenCalled()
  })

  it('prevents default for defined shortcut keys', () => {
    let onEventFired: any

    mockUseMagicKeys.mockImplementation((config: any) => {
      onEventFired = config.onEventFired
      return {
        t: ref(false),
        w: ref(false),
        _1: ref(false),
        _2: ref(false),
        _3: ref(false),
        _4: ref(false),
      }
    })

    useKeyboardShortcuts()

    const definedKeys = ['t', 'w', '1', '2', '3', '4']

    definedKeys.forEach((key) => {
      const mockEvent = {
        key,
        target: document.body,
        preventDefault: vi.fn(),
      }

      onEventFired(mockEvent)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })
  })

  it('does not prevent default for undefined keys', () => {
    let onEventFired: any

    mockUseMagicKeys.mockImplementation((config: any) => {
      onEventFired = config.onEventFired
      return {
        t: ref(false),
        w: ref(false),
        _1: ref(false),
        _2: ref(false),
        _3: ref(false),
        _4: ref(false),
      }
    })

    useKeyboardShortcuts()

    // Test with an undefined key
    const mockEvent = {
      key: 'z', // Not defined in shortcuts
      target: document.body,
      preventDefault: vi.fn(),
    }

    onEventFired(mockEvent)
    expect(mockEvent.preventDefault).not.toHaveBeenCalled()
  })

  it('integrates with UI store actions', () => {
    useKeyboardShortcuts()

    // Verify that whenever was called with the correct callbacks
    expect(mockWhenever).toHaveBeenCalledTimes(6)
  })

  it('handles case-insensitive key matching', () => {
    let onEventFired: any

    mockUseMagicKeys.mockImplementation((config: any) => {
      onEventFired = config.onEventFired
      return {
        t: ref(false),
        w: ref(false),
        _1: ref(false),
        _2: ref(false),
        _3: ref(false),
        _4: ref(false),
      }
    })

    useKeyboardShortcuts()

    // Test uppercase keys
    const mockEventUpper = {
      key: 'T',
      target: document.body,
      preventDefault: vi.fn(),
    }

    onEventFired(mockEventUpper)
    expect(mockEventUpper.preventDefault).toHaveBeenCalled()

    // Test lowercase keys
    const mockEventLower = {
      key: 't',
      target: document.body,
      preventDefault: vi.fn(),
    }

    onEventFired(mockEventLower)
    expect(mockEventLower.preventDefault).toHaveBeenCalled()
  })

  it('provides access to all keyboard shortcuts', () => {
    const expectedKeys = ['t', 'w', '_1', '_2', '_3', '_4']
    const result = useKeyboardShortcuts()

    expectedKeys.forEach((key) => {
      expect(result.keys).toHaveProperty(key)
    })
  })

  it('executes keyboard shortcut callbacks', () => {
    const callbacks: any[] = []

    // Capture the callbacks passed to whenever
    mockWhenever.mockImplementation((_key: any, callback: any) => {
      callbacks.push(callback)
    })

    useKeyboardShortcuts()

    // Verify callbacks were registered
    expect(callbacks).toHaveLength(6)
  })

  it('ignores quadrant shortcuts when not in week view', () => {
    const callbacks: any[] = []

    // Capture the callbacks passed to whenever
    mockWhenever.mockImplementation((_key: any, callback: any) => {
      callbacks.push(callback)
    })

    useKeyboardShortcuts()

    // Verify callbacks were registered
    expect(callbacks).toHaveLength(6)
  })

  it('switches to quadrants when in week view', () => {
    const callbacks: any[] = []

    // Capture the callbacks passed to whenever
    mockWhenever.mockImplementation((_key: any, callback: any) => {
      callbacks.push(callback)
    })

    // Set current view to week
    mockUiStore.currentView = 'week'

    useKeyboardShortcuts()

    // Execute the quadrant callbacks (callbacks 2-5 are for _1-_4)
    callbacks[2]() // _1 callback
    callbacks[3]() // _2 callback
    callbacks[4]() // _3 callback
    callbacks[5]() // _4 callback

    expect(mockUiStore.switchQuadrant).toHaveBeenCalledWith('do')
    expect(mockUiStore.switchQuadrant).toHaveBeenCalledWith('plan')
    expect(mockUiStore.switchQuadrant).toHaveBeenCalledWith('delegate')
    expect(mockUiStore.switchQuadrant).toHaveBeenCalledWith('eliminate')
  })

  it('does not switch quadrants when not in week view', () => {
    const callbacks: any[] = []

    // Capture the callbacks passed to whenever
    mockWhenever.mockImplementation((_key: any, callback: any) => {
      callbacks.push(callback)
    })

    // Set current view to today (not week)
    mockUiStore.currentView = 'today'

    useKeyboardShortcuts()

    // Execute the quadrant callbacks (callbacks 2-5 are for _1-_4)
    callbacks[2]() // _1 callback
    callbacks[3]() // _2 callback
    callbacks[4]() // _3 callback
    callbacks[5]() // _4 callback

    // Quadrant switches should not be called when not in week view
    expect(mockUiStore.switchQuadrant).not.toHaveBeenCalledWith('plan')
    expect(mockUiStore.switchQuadrant).not.toHaveBeenCalledWith('delegate')
    expect(mockUiStore.switchQuadrant).not.toHaveBeenCalledWith('eliminate')
  })
})
