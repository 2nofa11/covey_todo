import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useUIStore } from './useUIStore'

describe('useUIStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with default state', () => {
    const store = useUIStore()

    expect(store.currentView).toBe('today')
    expect(store.currentQuadrant).toBe('do')
    expect(store.showQuickCapture).toBe(false)
    expect(store.showBigRocks).toBe(false)
    expect(store.showOnboarding).toBe(false)
    expect(store.showWeeklyReview).toBe(false)
    expect(store.currentOnboardingStep).toBe(1)
    expect(store.taskInput).toBe('')
    expect(store.tutorialTaskInput).toBe('')
    expect(store.captureImportant).toBe(false)
    expect(store.captureUrgent).toBe(false)
    expect(store.statusMessage).toBe('')
  })

  it('switches to today view', () => {
    const store = useUIStore()

    store.currentView = 'week'
    store.switchToTodayView()

    expect(store.currentView).toBe('today')
  })

  it('switches to week view', () => {
    const store = useUIStore()

    store.switchToWeekView()

    expect(store.currentView).toBe('week')
  })

  it('switches quadrant', () => {
    const store = useUIStore()

    store.switchQuadrant('plan')
    expect(store.currentQuadrant).toBe('plan')

    store.switchQuadrant('delegate')
    expect(store.currentQuadrant).toBe('delegate')

    store.switchQuadrant('eliminate')
    expect(store.currentQuadrant).toBe('eliminate')
  })

  it('toggles quick capture modal', () => {
    const store = useUIStore()

    expect(store.showQuickCapture).toBe(false)

    store.toggleQuickCapture()
    expect(store.showQuickCapture).toBe(true)

    store.toggleQuickCapture()
    expect(store.showQuickCapture).toBe(false)
  })

  it('toggles quick capture with explicit value', () => {
    const store = useUIStore()

    store.toggleQuickCapture(true)
    expect(store.showQuickCapture).toBe(true)

    store.toggleQuickCapture(false)
    expect(store.showQuickCapture).toBe(false)
  })

  it('toggles big rocks modal', () => {
    const store = useUIStore()

    expect(store.showBigRocks).toBe(false)

    store.toggleBigRocks()
    expect(store.showBigRocks).toBe(true)

    store.toggleBigRocks()
    expect(store.showBigRocks).toBe(false)
  })

  it('toggles onboarding modal', () => {
    const store = useUIStore()

    expect(store.showOnboarding).toBe(false)

    store.toggleOnboarding()
    expect(store.showOnboarding).toBe(true)

    store.toggleOnboarding()
    expect(store.showOnboarding).toBe(false)
  })

  it('toggles weekly review modal', () => {
    const store = useUIStore()

    expect(store.showWeeklyReview).toBe(false)

    store.toggleWeeklyReview()
    expect(store.showWeeklyReview).toBe(true)

    store.toggleWeeklyReview()
    expect(store.showWeeklyReview).toBe(false)
  })

  it('resets capture state', () => {
    const store = useUIStore()

    // Set some values
    store.captureImportant = true
    store.captureUrgent = true
    store.taskInput = 'Test task'

    store.resetCaptureState()

    expect(store.captureImportant).toBe(false)
    expect(store.captureUrgent).toBe(false)
    expect(store.taskInput).toBe('')
  })

  it('navigates onboarding steps forward', () => {
    const store = useUIStore()

    expect(store.currentOnboardingStep).toBe(1)

    store.nextOnboardingStep()
    expect(store.currentOnboardingStep).toBe(2)

    store.nextOnboardingStep()
    expect(store.currentOnboardingStep).toBe(3)

    // Should not go beyond step 3
    store.nextOnboardingStep()
    expect(store.currentOnboardingStep).toBe(3)
  })

  it('navigates onboarding steps backward', () => {
    const store = useUIStore()

    store.currentOnboardingStep = 3

    store.prevOnboardingStep()
    expect(store.currentOnboardingStep).toBe(2)

    store.prevOnboardingStep()
    expect(store.currentOnboardingStep).toBe(1)

    // Should not go below step 1
    store.prevOnboardingStep()
    expect(store.currentOnboardingStep).toBe(1)
  })

  it('resets onboarding to first step', () => {
    const store = useUIStore()

    store.currentOnboardingStep = 3
    store.resetOnboarding()

    expect(store.currentOnboardingStep).toBe(1)
  })

  it('announces status message and clears it after timeout', () => {
    const store = useUIStore()

    store.announceStatus('Test message')

    expect(store.statusMessage).toBe('Test message')

    // Fast-forward time by 1 second
    vi.advanceTimersByTime(1000)

    expect(store.statusMessage).toBe('')
  })

  it('closes all modals', () => {
    const store = useUIStore()

    // Open all modals
    store.toggleQuickCapture(true)
    store.toggleBigRocks(true)
    store.toggleOnboarding(true)
    store.toggleWeeklyReview(true)

    expect(store.showQuickCapture).toBe(true)
    expect(store.showBigRocks).toBe(true)
    expect(store.showOnboarding).toBe(true)
    expect(store.showWeeklyReview).toBe(true)

    store.closeAllModals()

    expect(store.showQuickCapture).toBe(false)
    expect(store.showBigRocks).toBe(false)
    expect(store.showOnboarding).toBe(false)
    expect(store.showWeeklyReview).toBe(false)
  })

  it('closes only open modals in closeAllModals', () => {
    const store = useUIStore()

    // Open only some modals
    store.toggleQuickCapture(true)
    store.toggleOnboarding(true)

    expect(store.showQuickCapture).toBe(true)
    expect(store.showBigRocks).toBe(false)
    expect(store.showOnboarding).toBe(true)
    expect(store.showWeeklyReview).toBe(false)

    store.closeAllModals()

    expect(store.showQuickCapture).toBe(false)
    expect(store.showBigRocks).toBe(false)
    expect(store.showOnboarding).toBe(false)
    expect(store.showWeeklyReview).toBe(false)
  })

  it('handles task input state changes', () => {
    const store = useUIStore()

    store.taskInput = 'New task'
    expect(store.taskInput).toBe('New task')

    store.tutorialTaskInput = 'Tutorial task'
    expect(store.tutorialTaskInput).toBe('Tutorial task')
  })

  it('handles capture flags state changes', () => {
    const store = useUIStore()

    store.captureImportant = true
    expect(store.captureImportant).toBe(true)

    store.captureUrgent = true
    expect(store.captureUrgent).toBe(true)
  })

  it('maintains state consistency when toggling modals multiple times', () => {
    const store = useUIStore()

    // Toggle multiple times
    store.toggleQuickCapture()
    store.toggleQuickCapture()
    store.toggleQuickCapture()

    expect(store.showQuickCapture).toBe(true)

    store.toggleBigRocks()
    store.toggleBigRocks()

    expect(store.showBigRocks).toBe(false)
  })

  it('handles edge cases in onboarding navigation', () => {
    const store = useUIStore()

    // Test multiple forward navigations at boundary
    store.currentOnboardingStep = 3
    store.nextOnboardingStep()
    store.nextOnboardingStep()

    expect(store.currentOnboardingStep).toBe(3)

    // Test multiple backward navigations at boundary
    store.currentOnboardingStep = 1
    store.prevOnboardingStep()
    store.prevOnboardingStep()

    expect(store.currentOnboardingStep).toBe(1)
  })
})
