import type { Task } from '@/types'
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useTaskFilters } from './useTaskFilters'

describe('useTaskFilters', () => {
  const createMockTask = (overrides: Partial<Task> = {}): Task => ({
    id: Math.random(),
    title: 'Test Task',
    important: false,
    urgent: false,
    completed: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  })

  it('returns correct quadrant for task combinations', () => {
    const tasks = ref<Task[]>([])
    const { getQuadrant } = useTaskFilters(tasks)

    expect(getQuadrant(true, true)).toBe('do')
    expect(getQuadrant(true, false)).toBe('plan')
    expect(getQuadrant(false, true)).toBe('delegate')
    expect(getQuadrant(false, false)).toBe('eliminate')
  })

  it('filters today tasks correctly', () => {
    const tasks = ref<Task[]>([
      createMockTask({ id: 1, important: true, urgent: false, completed: false }),
      createMockTask({ id: 2, important: false, urgent: true, completed: false }),
      createMockTask({ id: 3, important: true, urgent: true, completed: false }),
      createMockTask({ id: 4, important: false, urgent: false, completed: false }),
      createMockTask({ id: 5, important: true, urgent: false, completed: true }),
    ])

    const { todayTasks } = useTaskFilters(tasks)

    expect(todayTasks.value).toHaveLength(3)
    expect(todayTasks.value.map(t => t.id)).toEqual([1, 2, 3])
  })

  it('excludes completed tasks from today tasks', () => {
    const tasks = ref<Task[]>([
      createMockTask({ important: true, urgent: false, completed: true }),
      createMockTask({ important: false, urgent: true, completed: true }),
      createMockTask({ important: true, urgent: true, completed: false }),
    ])

    const { todayTasks } = useTaskFilters(tasks)

    expect(todayTasks.value).toHaveLength(1)
    expect(todayTasks.value[0].important).toBe(true)
    expect(todayTasks.value[0].urgent).toBe(true)
    expect(todayTasks.value[0].completed).toBe(false)
  })

  it('filters tasks by quadrant correctly', () => {
    const tasks = ref<Task[]>([
      createMockTask({ id: 1, important: true, urgent: true }), // do
      createMockTask({ id: 2, important: true, urgent: false }), // plan
      createMockTask({ id: 3, important: false, urgent: true }), // delegate
      createMockTask({ id: 4, important: false, urgent: false }), // eliminate
      createMockTask({ id: 5, important: true, urgent: true }), // do
    ])

    const { getQuadrantTasks } = useTaskFilters(tasks)

    const doTasks = getQuadrantTasks('do')
    expect(doTasks.value).toHaveLength(2)
    expect(doTasks.value.map(t => t.id)).toEqual([1, 5])

    const planTasks = getQuadrantTasks('plan')
    expect(planTasks.value).toHaveLength(1)
    expect(planTasks.value[0].id).toBe(2)

    const delegateTasks = getQuadrantTasks('delegate')
    expect(delegateTasks.value).toHaveLength(1)
    expect(delegateTasks.value[0].id).toBe(3)

    const eliminateTasks = getQuadrantTasks('eliminate')
    expect(eliminateTasks.value).toHaveLength(1)
    expect(eliminateTasks.value[0].id).toBe(4)
  })

  it('counts quadrant tasks excluding completed ones', () => {
    const tasks = ref<Task[]>([
      createMockTask({ important: true, urgent: true, completed: false }), // do
      createMockTask({ important: true, urgent: true, completed: true }), // do (completed)
      createMockTask({ important: true, urgent: false, completed: false }), // plan
      createMockTask({ important: false, urgent: true, completed: false }), // delegate
      createMockTask({ important: false, urgent: false, completed: false }), // eliminate
    ])

    const { quadrantCounts } = useTaskFilters(tasks)

    expect(quadrantCounts.value).toEqual({
      do: 1, // Only uncompleted 'do' task
      plan: 1,
      delegate: 1,
      eliminate: 1,
    })
  })

  it('calculates Q2 ratio correctly', () => {
    const tasks = ref<Task[]>([
      createMockTask({ important: true, urgent: false, completed: false }), // Q2
      createMockTask({ important: true, urgent: false, completed: false }), // Q2
      createMockTask({ important: true, urgent: true, completed: false }), // Q1
      createMockTask({ important: false, urgent: true, completed: false }), // Q3
    ])

    const { q2Ratio } = useTaskFilters(tasks)

    // 2 Q2 tasks out of 4 total today tasks = 50%
    expect(q2Ratio.value).toBe(50)
  })

  it('returns 0 Q2 ratio when no today tasks', () => {
    const tasks = ref<Task[]>([
      createMockTask({ important: false, urgent: false, completed: false }),
    ])

    const { q2Ratio } = useTaskFilters(tasks)

    expect(q2Ratio.value).toBe(0)
  })

  it('filters completed tasks correctly', () => {
    const tasks = ref<Task[]>([
      createMockTask({ id: 1, completed: true }),
      createMockTask({ id: 2, completed: false }),
      createMockTask({ id: 3, completed: true }),
    ])

    const { completedTasks } = useTaskFilters(tasks)

    expect(completedTasks.value).toHaveLength(2)
    expect(completedTasks.value.map(t => t.id)).toEqual([1, 3])
  })

  it('filters active tasks correctly', () => {
    const tasks = ref<Task[]>([
      createMockTask({ id: 1, completed: true }),
      createMockTask({ id: 2, completed: false }),
      createMockTask({ id: 3, completed: true }),
    ])

    const { activeTasks } = useTaskFilters(tasks)

    expect(activeTasks.value).toHaveLength(1)
    expect(activeTasks.value[0].id).toBe(2)
  })

  it('reacts to task changes', () => {
    const tasks = ref<Task[]>([
      createMockTask({ important: true, urgent: false, completed: false }),
    ])

    const { todayTasks } = useTaskFilters(tasks)

    expect(todayTasks.value).toHaveLength(1)

    // Add a new task
    tasks.value.push(createMockTask({ important: false, urgent: true, completed: false }))

    expect(todayTasks.value).toHaveLength(2)

    // Remove all tasks
    tasks.value = []

    expect(todayTasks.value).toHaveLength(0)
  })

  it('handles empty task array', () => {
    const tasks = ref<Task[]>([])
    const { todayTasks, quadrantCounts, q2Ratio, completedTasks, activeTasks } = useTaskFilters(tasks)

    expect(todayTasks.value).toHaveLength(0)
    expect(quadrantCounts.value).toEqual({
      do: 0,
      plan: 0,
      delegate: 0,
      eliminate: 0,
    })
    expect(q2Ratio.value).toBe(0)
    expect(completedTasks.value).toHaveLength(0)
    expect(activeTasks.value).toHaveLength(0)
  })

  it('calculates Q2 ratio with mixed task types', () => {
    const tasks = ref<Task[]>([
      // Today tasks (important or urgent)
      createMockTask({ important: true, urgent: false, completed: false }), // Q2
      createMockTask({ important: true, urgent: true, completed: false }), // Q1
      createMockTask({ important: false, urgent: true, completed: false }), // Q3
      // Non-today task (not important and not urgent)
      createMockTask({ important: false, urgent: false, completed: false }), // Q4 (not in today)
    ])

    const { q2Ratio, todayTasks } = useTaskFilters(tasks)

    expect(todayTasks.value).toHaveLength(3) // Only important or urgent tasks
    expect(q2Ratio.value).toBe(33) // 1 Q2 task out of 3 today tasks = 33%
  })

  it('correctly identifies all quadrant combinations in getQuadrantTasks', () => {
    const tasks = ref<Task[]>([
      createMockTask({ id: 1, important: true, urgent: true }), // do
      createMockTask({ id: 2, important: true, urgent: false }), // plan
      createMockTask({ id: 3, important: false, urgent: true }), // delegate
      createMockTask({ id: 4, important: false, urgent: false }), // eliminate
    ])

    const { getQuadrantTasks } = useTaskFilters(tasks)

    const quadrants: Array<{ type: 'do' | 'plan' | 'delegate' | 'eliminate', expectedId: number }> = [
      { type: 'do', expectedId: 1 },
      { type: 'plan', expectedId: 2 },
      { type: 'delegate', expectedId: 3 },
      { type: 'eliminate', expectedId: 4 },
    ]

    quadrants.forEach(({ type, expectedId }) => {
      const quadrantTasks = getQuadrantTasks(type)
      expect(quadrantTasks.value).toHaveLength(1)
      expect(quadrantTasks.value[0].id).toBe(expectedId)
    })
  })
})
