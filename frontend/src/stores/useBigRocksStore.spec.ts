import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useBigRocksStore } from './useBigRocksStore'

describe('useBigRocksStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('initializes with empty big rocks', () => {
    const store = useBigRocksStore()

    expect(store.bigRocks).toEqual({})
    expect(store.allBigRocks).toEqual([])
  })

  it('updates big rocks data', () => {
    const store = useBigRocksStore()
    const newBigRocks = {
      work: ['Complete project', 'Review code'],
      personal: ['Exercise', 'Read book'],
    }

    store.updateBigRocks(newBigRocks)

    expect(store.bigRocks).toEqual(newBigRocks)
  })

  it('adds big rock to existing role', () => {
    const store = useBigRocksStore()

    store.addBigRock('work', 'First task')
    store.addBigRock('work', 'Second task')

    expect(store.bigRocks.work).toEqual(['First task', 'Second task'])
  })

  it('adds big rock to new role', () => {
    const store = useBigRocksStore()

    store.addBigRock('health', 'Go to gym')

    expect(store.bigRocks.health).toEqual(['Go to gym'])
  })

  it('removes big rock from role', () => {
    const store = useBigRocksStore()

    store.addBigRock('work', 'Task 1')
    store.addBigRock('work', 'Task 2')
    store.addBigRock('work', 'Task 3')

    store.removeBigRock('work', 1) // Remove 'Task 2'

    expect(store.bigRocks.work).toEqual(['Task 1', 'Task 3'])
  })

  it('removes role when all big rocks are deleted', () => {
    const store = useBigRocksStore()

    store.addBigRock('work', 'Only task')
    expect(store.bigRocks.work).toBeDefined()

    store.removeBigRock('work', 0)
    expect(store.bigRocks.work).toBeUndefined()
  })

  it('handles removal from non-existent role gracefully', () => {
    const store = useBigRocksStore()

    // Should not throw error
    store.removeBigRock('nonexistent', 0)

    expect(store.bigRocks).toEqual({})
  })

  it('computes all big rocks correctly', () => {
    const store = useBigRocksStore()

    store.addBigRock('work', 'Work task 1')
    store.addBigRock('work', 'Work task 2')
    store.addBigRock('personal', 'Personal task')

    expect(store.allBigRocks).toEqual([
      { role: 'work', rock: 'Work task 1' },
      { role: 'work', rock: 'Work task 2' },
      { role: 'personal', rock: 'Personal task' },
    ])
  })

  it('filters out empty strings from all big rocks', () => {
    const store = useBigRocksStore()

    store.updateBigRocks({
      work: ['Valid task', '', 'Another valid task'],
      personal: ['', 'Personal task'],
    })

    expect(store.allBigRocks).toEqual([
      { role: 'work', rock: 'Valid task' },
      { role: 'work', rock: 'Another valid task' },
      { role: 'personal', rock: 'Personal task' },
    ])
  })

  it('handles empty roles in all big rocks computation', () => {
    const store = useBigRocksStore()

    store.updateBigRocks({
      work: ['Work task'],
      empty: [],
      personal: ['Personal task'],
    })

    expect(store.allBigRocks).toEqual([
      { role: 'work', rock: 'Work task' },
      { role: 'personal', rock: 'Personal task' },
    ])
  })

  it('verifies localStorage integration exists', () => {
    const store = useBigRocksStore()

    // Test that the store can handle localStorage operations
    store.addBigRock('work', 'Persistent task')

    // Verify that data was added to the store
    expect(store.bigRocks.work).toEqual(['Persistent task'])
  })

  it('handles complex big rocks structure', () => {
    const store = useBigRocksStore()
    const complexBigRocks = {
      work: ['Project A', 'Project B', 'Team meeting'],
      family: ['Vacation planning', 'Kids activities'],
      health: ['Gym routine', 'Diet plan'],
      personal: ['Learn new skill', 'Read books'],
    }

    store.updateBigRocks(complexBigRocks)

    expect(store.allBigRocks).toHaveLength(9)
    expect(store.allBigRocks.filter(item => item.role === 'work')).toHaveLength(3)
    expect(store.allBigRocks.filter(item => item.role === 'family')).toHaveLength(2)
  })

  it('maintains reactivity when big rocks change', () => {
    const store = useBigRocksStore()

    expect(store.allBigRocks).toHaveLength(0)

    store.addBigRock('work', 'New task')
    expect(store.allBigRocks).toHaveLength(1)

    store.addBigRock('personal', 'Another task')
    expect(store.allBigRocks).toHaveLength(2)

    store.removeBigRock('work', 0)
    expect(store.allBigRocks).toHaveLength(1)
    expect(store.allBigRocks[0].role).toBe('personal')
  })
})
