import type { Task } from '@/types'
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useTaskStats } from './useTaskStats'

describe('useTaskStats', () => {
  const createMockTask = (overrides: Partial<Task> = {}): Task => ({
    id: Math.random(),
    title: 'Test Task',
    important: false,
    urgent: false,
    completed: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  })

  const getTodayDate = () => new Date().toISOString()
  const getYesterdayDate = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString()
  }

  it('calculates basic stats correctly', () => {
    const tasks = ref<Task[]>([
      createMockTask({ completed: false }),
      createMockTask({ completed: false }),
      createMockTask({ completed: true, completedAt: getTodayDate() }),
      createMockTask({ important: true, urgent: true, completed: false }),
      createMockTask({ completed: true, completedAt: getYesterdayDate() }),
    ])

    const { stats } = useTaskStats(tasks)

    expect(stats.value.totalTasks).toBe(3) // Uncompleted tasks
    expect(stats.value.completedToday).toBe(1) // Completed today
    expect(stats.value.highPriority).toBe(1) // Important and urgent
    expect(stats.value.totalCompleted).toBe(2) // All completed
    expect(stats.value.totalAll).toBe(5) // All tasks
  })

  it('identifies today completed tasks correctly', () => {
    const today = new Date()
    const todayISOString = today.toISOString()

    const tasks = ref<Task[]>([
      createMockTask({ completed: true, completedAt: todayISOString }),
      createMockTask({ completed: true, completedAt: getYesterdayDate() }),
      createMockTask({ completed: false }),
    ])

    const { stats } = useTaskStats(tasks)

    expect(stats.value.completedToday).toBe(1)
  })

  it('calculates completion rate correctly', () => {
    const tasks = ref<Task[]>([
      createMockTask({ completed: true }),
      createMockTask({ completed: true }),
      createMockTask({ completed: false }),
      createMockTask({ completed: false }),
    ])

    const { completionRate } = useTaskStats(tasks)

    expect(completionRate.value).toBe(50) // 2 out of 4 completed = 50%
  })

  it('returns 0 completion rate for empty tasks', () => {
    const tasks = ref<Task[]>([])
    const { completionRate } = useTaskStats(tasks)

    expect(completionRate.value).toBe(0)
  })

  it('calculates today progress correctly', () => {
    const tasks = ref<Task[]>([
      createMockTask({ important: true, urgent: false, completed: true }), // Relevant + completed
      createMockTask({ important: true, urgent: false, completed: false }), // Relevant + active
      createMockTask({ important: false, urgent: true, completed: true }), // Relevant + completed
      createMockTask({ important: false, urgent: false, completed: false }), // Not relevant
    ])

    const { todayProgress } = useTaskStats(tasks)

    expect(todayProgress.value.total).toBe(3) // Important or urgent tasks
    expect(todayProgress.value.completed).toBe(2) // Completed relevant tasks
    expect(todayProgress.value.remaining).toBe(1) // Active relevant tasks
    expect(todayProgress.value.completionRate).toBe(67) // 2/3 = 67%
  })

  it('handles empty today progress correctly', () => {
    const tasks = ref<Task[]>([
      createMockTask({ important: false, urgent: false, completed: false }),
    ])

    const { todayProgress } = useTaskStats(tasks)

    expect(todayProgress.value.total).toBe(0)
    expect(todayProgress.value.completed).toBe(0)
    expect(todayProgress.value.remaining).toBe(0)
    expect(todayProgress.value.completionRate).toBe(0)
  })

  it('calculates quadrant stats correctly', () => {
    const tasks = ref<Task[]>([
      createMockTask({ important: true, urgent: true, completed: true }), // do
      createMockTask({ important: true, urgent: true, completed: false }), // do
      createMockTask({ important: true, urgent: false, completed: true }), // plan
      createMockTask({ important: false, urgent: true, completed: false }), // delegate
      createMockTask({ important: false, urgent: false, completed: false }), // eliminate
    ])

    const { quadrantStats } = useTaskStats(tasks)

    expect(quadrantStats.value.do.total).toBe(2)
    expect(quadrantStats.value.do.completed).toBe(1)
    expect(quadrantStats.value.plan.total).toBe(1)
    expect(quadrantStats.value.plan.completed).toBe(1)
    expect(quadrantStats.value.delegate.total).toBe(1)
    expect(quadrantStats.value.delegate.completed).toBe(0)
    expect(quadrantStats.value.eliminate.total).toBe(1)
    expect(quadrantStats.value.eliminate.completed).toBe(0)
  })

  it('calculates weekly progress correctly', () => {
    const now = new Date()
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)

    const tasks = ref<Task[]>([
      createMockTask({ completed: true, completedAt: now.toISOString() }),
      createMockTask({ completed: true, completedAt: threeDaysAgo.toISOString() }),
      createMockTask({ completed: true, completedAt: tenDaysAgo.toISOString() }), // Outside 7 days
      createMockTask({ completed: false }),
    ])

    const { weeklyProgress } = useTaskStats(tasks)

    expect(weeklyProgress.value).toBe(2) // Only tasks completed within 7 days
  })

  it('handles tasks without completedAt date', () => {
    const tasks = ref<Task[]>([
      createMockTask({ completed: true }), // No completedAt
      createMockTask({ completed: true, completedAt: getTodayDate() }),
    ])

    const { stats, weeklyProgress } = useTaskStats(tasks)

    expect(stats.value.completedToday).toBe(1) // Only the one with today's date
    expect(weeklyProgress.value).toBe(1) // Only the one with today's date
  })

  it('correctly identifies isToday utility function', () => {
    const tasks = ref<Task[]>([])
    const { isToday } = useTaskStats(tasks)

    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    expect(isToday(today)).toBe(true)
    expect(isToday(yesterday)).toBe(false)
  })

  it('handles edge cases in date comparisons', () => {
    const tasks = ref<Task[]>([])
    const { isToday } = useTaskStats(tasks)

    const now = new Date()
    const sameDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1)

    expect(isToday(sameDay)).toBe(true)
    expect(isToday(nextDay)).toBe(false)
  })

  it('reacts to task changes', () => {
    const tasks = ref<Task[]>([
      createMockTask({ completed: false }),
    ])

    const { stats } = useTaskStats(tasks)

    expect(stats.value.totalTasks).toBe(1)

    // Add a completed task
    tasks.value.push(createMockTask({ completed: true }))

    expect(stats.value.totalTasks).toBe(1) // Still 1 uncompleted
    expect(stats.value.totalCompleted).toBe(1)
    expect(stats.value.totalAll).toBe(2)

    // Complete the first task
    tasks.value[0].completed = true

    expect(stats.value.totalTasks).toBe(0) // No uncompleted tasks
    expect(stats.value.totalCompleted).toBe(2)
  })

  it('handles all task combinations in quadrant stats', () => {
    const tasks = ref<Task[]>([
      // Multiple tasks per quadrant to test counting
      createMockTask({ important: true, urgent: true, completed: true }),
      createMockTask({ important: true, urgent: true, completed: false }),
      createMockTask({ important: true, urgent: true, completed: true }),

      createMockTask({ important: true, urgent: false, completed: false }),
      createMockTask({ important: true, urgent: false, completed: false }),

      createMockTask({ important: false, urgent: true, completed: true }),

      createMockTask({ important: false, urgent: false, completed: false }),
      createMockTask({ important: false, urgent: false, completed: true }),
    ])

    const { quadrantStats } = useTaskStats(tasks)

    expect(quadrantStats.value.do.total).toBe(3)
    expect(quadrantStats.value.do.completed).toBe(2)

    expect(quadrantStats.value.plan.total).toBe(2)
    expect(quadrantStats.value.plan.completed).toBe(0)

    expect(quadrantStats.value.delegate.total).toBe(1)
    expect(quadrantStats.value.delegate.completed).toBe(1)

    expect(quadrantStats.value.eliminate.total).toBe(2)
    expect(quadrantStats.value.eliminate.completed).toBe(1)
  })

  it('handles high priority task identification', () => {
    const tasks = ref<Task[]>([
      createMockTask({ important: true, urgent: true, completed: false }), // High priority
      createMockTask({ important: true, urgent: false, completed: false }), // Not high priority
      createMockTask({ important: false, urgent: true, completed: false }), // Not high priority
      createMockTask({ important: true, urgent: true, completed: true }), // High priority but completed
    ])

    const { stats } = useTaskStats(tasks)

    expect(stats.value.highPriority).toBe(1) // Only uncompleted high priority tasks
  })
})
