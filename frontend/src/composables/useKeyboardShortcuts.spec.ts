import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUIStore } from '@/stores/useUIStore'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'

// Mock VueUse
vi.mock('@vueuse/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vueuse/core')>()
  return {
    ...actual,
    useMagicKeys: vi.fn(() => ({
      n: { value: false },
      escape: { value: false },
      t: { value: false },
      w: { value: false },
      _1: { value: false },
      _2: { value: false },
      _3: { value: false },
      _4: { value: false },
    })),
    whenever: vi.fn(),
  }
})

describe('useKeyboardShortcuts', () => {
  let mockUseMagicKeys: any
  let mockWhenever: any

  beforeEach(async () => {
    setActivePinia(createPinia())

    // Reset mocks
    vi.clearAllMocks()

    const vueUse = vi.mocked(await import('@vueuse/core'))
    mockUseMagicKeys = vueUse.useMagicKeys
    mockWhenever = vueUse.whenever
  })

  it('initializes keyboard shortcuts', () => {
    useKeyboardShortcuts()

    expect(mockUseMagicKeys).toHaveBeenCalledWith({
      passive: false,
      onEventFired: expect.any(Function),
    })
  })

  it('sets up whenever listeners for all keys', () => {
    useKeyboardShortcuts()

    // Should call whenever for each key
    expect(mockWhenever).toHaveBeenCalledTimes(8)
  })

  it('returns keys object', () => {
    mockUseMagicKeys.mockReturnValue({
      n: { value: false },
      escape: { value: false },
      t: { value: false },
      w: { value: false },
      _1: { value: false },
      _2: { value: false },
      _3: { value: false },
      _4: { value: false },
    })

    const result = useKeyboardShortcuts()

    expect(result).toHaveProperty('keys')
    expect(result.keys).toHaveProperty('n')
    expect(result.keys).toHaveProperty('escape')
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
        n: { value: false },
        escape: { value: false },
        t: { value: false },
        w: { value: false },
        _1: { value: false },
        _2: { value: false },
        _3: { value: false },
        _4: { value: false },
      }
    })

    useKeyboardShortcuts()

    expect(onEventFired).toBeDefined()

    // Test preventDefault for defined keys
    const mockEvent = {
      key: 'n',
      target: document.body,
      preventDefault: vi.fn(),
    }

    onEventFired(mockEvent)
    expect(mockEvent.preventDefault).toHaveBeenCalled()
  })

  it('ignores events from input elements except Escape', () => {
    let onEventFired: any

    mockUseMagicKeys.mockImplementation((config: any) => {
      onEventFired = config.onEventFired
      return {}
    })

    useKeyboardShortcuts()

    const inputElement = document.createElement('input')
    const textareaElement = document.createElement('textarea')

    // Test non-Escape key on input - should be ignored
    const mockInputEvent = {
      key: 'n',
      target: inputElement,
      preventDefault: vi.fn(),
    }

    onEventFired(mockInputEvent)
    expect(mockInputEvent.preventDefault).not.toHaveBeenCalled()

    // Test Escape key on input - should work
    const mockEscapeEvent = {
      key: 'Escape',
      target: inputElement,
      preventDefault: vi.fn(),
    }

    onEventFired(mockEscapeEvent)
    expect(mockEscapeEvent.preventDefault).toHaveBeenCalled()

    // Test non-Escape key on textarea - should be ignored
    const mockTextareaEvent = {
      key: 't',
      target: textareaElement,
      preventDefault: vi.fn(),
    }

    onEventFired(mockTextareaEvent)
    expect(mockTextareaEvent.preventDefault).not.toHaveBeenCalled()
  })

  it('prevents default for defined shortcut keys', () => {
    let onEventFired: any

    mockUseMagicKeys.mockImplementation((config: any) => {
      onEventFired = config.onEventFired
      return {}
    })

    useKeyboardShortcuts()

    const definedKeys = ['n', 'escape', 't', 'w', '1', '2', '3', '4']

    definedKeys.forEach((key) => {
      const mockEvent = {
        key: key === 'escape' ? 'Escape' : key,
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
      return {}
    })

    useKeyboardShortcuts()

    const undefinedKeys = ['z', 'x', 'c', 'v']

    undefinedKeys.forEach((key) => {
      const mockEvent = {
        key,
        target: document.body,
        preventDefault: vi.fn(),
      }

      onEventFired(mockEvent)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })
  })

  it('integrates with UI store actions', () => {
    const store = useUIStore()

    // Mock store methods
    const toggleQuickCapture = vi.spyOn(store, 'toggleQuickCapture')
    const closeAllModals = vi.spyOn(store, 'closeAllModals')
    const switchToTodayView = vi.spyOn(store, 'switchToTodayView')
    const switchToWeekView = vi.spyOn(store, 'switchToWeekView')
    const switchQuadrant = vi.spyOn(store, 'switchQuadrant')

    useKeyboardShortcuts()

    // Verify that whenever was called with the correct callbacks
    expect(mockWhenever).toHaveBeenCalledTimes(8)

    // The actual callback testing would require more complex mocking
    // since the callbacks are passed to whenever
    expect(toggleQuickCapture).not.toHaveBeenCalled() // Not called during setup
    expect(closeAllModals).not.toHaveBeenCalled()
    expect(switchToTodayView).not.toHaveBeenCalled()
    expect(switchToWeekView).not.toHaveBeenCalled()
    expect(switchQuadrant).not.toHaveBeenCalled()
  })

  it('handles case-insensitive key matching', () => {
    let onEventFired: any

    mockUseMagicKeys.mockImplementation((config: any) => {
      onEventFired = config.onEventFired
      return {}
    })

    useKeyboardShortcuts()

    // Test uppercase keys
    const mockEventUpper = {
      key: 'N',
      target: document.body,
      preventDefault: vi.fn(),
    }

    onEventFired(mockEventUpper)
    expect(mockEventUpper.preventDefault).toHaveBeenCalled()

    // Test lowercase keys
    const mockEventLower = {
      key: 'n',
      target: document.body,
      preventDefault: vi.fn(),
    }

    onEventFired(mockEventLower)
    expect(mockEventLower.preventDefault).toHaveBeenCalled()
  })

  it('provides access to all keyboard shortcuts', () => {
    const result = useKeyboardShortcuts()

    // Verify that all expected shortcuts are available
    const expectedKeys = ['n', 'escape', 't', 'w', '_1', '_2', '_3', '_4']

    expectedKeys.forEach((key) => {
      expect(result.keys).toHaveProperty(key)
    })
  })

  it('executes keyboard shortcut callbacks', () => {
    const store = useUIStore()

    // Mock store methods
    const toggleQuickCapture = vi.spyOn(store, 'toggleQuickCapture')
    const closeAllModals = vi.spyOn(store, 'closeAllModals')
    const switchToTodayView = vi.spyOn(store, 'switchToTodayView')
    const switchToWeekView = vi.spyOn(store, 'switchToWeekView')
    const switchQuadrant = vi.spyOn(store, 'switchQuadrant')

    const callbacks: any[] = []

    // Capture the callbacks passed to whenever
    mockWhenever.mockImplementation((_key: any, callback: any) => {
      callbacks.push(callback)
    })

    useKeyboardShortcuts()

    // Execute the callbacks to test the actual shortcut logic
    callbacks[0]() // n key callback
    expect(toggleQuickCapture).toHaveBeenCalledWith(true)

    callbacks[1]() // escape key callback
    expect(closeAllModals).toHaveBeenCalled()

    callbacks[2]() // t key callback
    expect(switchToTodayView).toHaveBeenCalled()

    callbacks[3]() // w key callback
    expect(switchToWeekView).toHaveBeenCalled()

    // Test quadrant switching (requires currentView to be 'week')
    store.currentView = 'week'

    callbacks[4]() // _1 key callback
    expect(switchQuadrant).toHaveBeenCalledWith('do')

    callbacks[5]() // _2 key callback
    expect(switchQuadrant).toHaveBeenCalledWith('plan')

    callbacks[6]() // _3 key callback
    expect(switchQuadrant).toHaveBeenCalledWith('delegate')

    callbacks[7]() // _4 key callback
    expect(switchQuadrant).toHaveBeenCalledWith('eliminate')
  })

  it('ignores quadrant shortcuts when not in week view', () => {
    const store = useUIStore()
    const switchQuadrant = vi.spyOn(store, 'switchQuadrant')

    const callbacks: any[] = []
    mockWhenever.mockImplementation((_key: any, callback: any) => {
      callbacks.push(callback)
    })

    useKeyboardShortcuts()

    // Set view to 'today' (not 'week')
    store.currentView = 'today'

    // Execute quadrant callbacks - should not call switchQuadrant
    callbacks[4]() // _1 key
    callbacks[5]() // _2 key
    callbacks[6]() // _3 key
    callbacks[7]() // _4 key

    expect(switchQuadrant).not.toHaveBeenCalled()
  })
})
