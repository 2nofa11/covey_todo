import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useUIStore } from './useUIStore'

describe('useUIStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with default state', () => {
    const store = useUIStore()

    expect(store.currentView).toBe('today')
    expect(store.currentQuadrant).toBe('do')
    expect(store.statusMessage).toBe('')
  })

  it('switches to today view', () => {
    const store = useUIStore()

    store.switchToWeekView()
    expect(store.currentView).toBe('week')

    store.switchToTodayView()
    expect(store.currentView).toBe('today')
  })

  it('switches to week view', () => {
    const store = useUIStore()

    expect(store.currentView).toBe('today')

    store.switchToWeekView()
    expect(store.currentView).toBe('week')
  })

  it('switches quadrant', () => {
    const store = useUIStore()

    expect(store.currentQuadrant).toBe('do')

    store.switchQuadrant('plan')
    expect(store.currentQuadrant).toBe('plan')

    store.switchQuadrant('delegate')
    expect(store.currentQuadrant).toBe('delegate')

    store.switchQuadrant('eliminate')
    expect(store.currentQuadrant).toBe('eliminate')

    store.switchQuadrant('do')
    expect(store.currentQuadrant).toBe('do')
  })

  it('announces status message and clears it after timeout', () => {
    const store = useUIStore()

    expect(store.statusMessage).toBe('')

    store.announceStatus('Test message')
    expect(store.statusMessage).toBe('Test message')

    // Fast-forward time by 1000ms
    vi.advanceTimersByTime(1000)

    expect(store.statusMessage).toBe('')
  })

  it('maintains state consistency when switching views multiple times', () => {
    const store = useUIStore()

    // Switch multiple times
    store.switchToWeekView()
    store.switchToTodayView()
    store.switchToWeekView()

    expect(store.currentView).toBe('week')
  })

  it('maintains quadrant state when switching views', () => {
    const store = useUIStore()

    store.switchQuadrant('plan')
    store.switchToWeekView()
    store.switchToTodayView()

    expect(store.currentQuadrant).toBe('plan')
  })

  it('handles status message overlaps correctly', () => {
    const store = useUIStore()

    store.announceStatus('First message')
    expect(store.statusMessage).toBe('First message')

    // Announce another message before the first one clears
    vi.advanceTimersByTime(500)
    store.announceStatus('Second message')
    expect(store.statusMessage).toBe('Second message')

    // Wait for the timeout
    vi.advanceTimersByTime(1000)
    expect(store.statusMessage).toBe('')
  })
})
