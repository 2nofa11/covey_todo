import type { Task } from '@/types'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTodoStore } from './useTodoStore'

// VueUseのuseLocalStorageをモック - 実際のref動作を模倣
const mockTasks = vi.fn(() => [] as Task[])
vi.mock('@vueuse/core', () => ({
  useLocalStorage: vi.fn(() => ({
    value: mockTasks(),
  })),
}))

describe('useTodoStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // テスト前にタスクリストをリセット
    mockTasks.mockReturnValue([])
  })

  describe('getQuadrant', () => {
    it('returns "do" for important and urgent tasks', () => {
      const store = useTodoStore()
      expect(store.getQuadrant(true, true)).toBe('do')
    })

    it('returns "plan" for important but not urgent tasks', () => {
      const store = useTodoStore()
      expect(store.getQuadrant(true, false)).toBe('plan')
    })

    it('returns "delegate" for urgent but not important tasks', () => {
      const store = useTodoStore()
      expect(store.getQuadrant(false, true)).toBe('delegate')
    })

    it('returns "eliminate" for neither important nor urgent tasks', () => {
      const store = useTodoStore()
      expect(store.getQuadrant(false, false)).toBe('eliminate')
    })
  })

  describe('isToday', () => {
    it('returns true for today\'s date', () => {
      const store = useTodoStore()
      const today = new Date()
      expect(store.isToday(today)).toBe(true)
    })

    it('returns false for yesterday\'s date', () => {
      const store = useTodoStore()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(store.isToday(yesterday)).toBe(false)
    })

    it('returns false for tomorrow\'s date', () => {
      const store = useTodoStore()
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(store.isToday(tomorrow)).toBe(false)
    })

    it('returns false for different month', () => {
      const store = useTodoStore()
      const differentMonth = new Date()
      differentMonth.setMonth(differentMonth.getMonth() + 1)
      expect(store.isToday(differentMonth)).toBe(false)
    })

    it('returns false for different year', () => {
      const store = useTodoStore()
      const differentYear = new Date()
      differentYear.setFullYear(differentYear.getFullYear() + 1)
      expect(store.isToday(differentYear)).toBe(false)
    })
  })

  describe('addTask', () => {
    it('creates a task with correct properties', () => {
      // Mock task storage array
      const tasksArray: Task[] = []
      mockTasks.mockReturnValue(tasksArray)

      const store = useTodoStore()

      // Manually add task to mimic the actual behavior
      const task = {
        id: Date.now(),
        title: 'Test Task',
        important: true,
        urgent: false,
        completed: false,
        createdAt: new Date().toISOString(),
      }

      // Simulate the addTask behavior
      tasksArray.push(task)
      const result = store.addTask('Test Task', true, false)

      expect(result).toMatchObject({
        title: 'Test Task',
        important: true,
        urgent: false,
        completed: false,
      })
      expect(result.id).toBeDefined()
      expect(result.createdAt).toBeDefined()
    })

    it('generates unique IDs for different tasks', () => {
      const store = useTodoStore()

      const originalDateNow = Date.now
      let idCounter = 1000
      Date.now = vi.fn(() => ++idCounter)

      const task1 = store.addTask('Task 1', true, false)
      const task2 = store.addTask('Task 2', false, true)

      Date.now = originalDateNow

      expect(task1.id).not.toBe(task2.id)
    })
  })

  describe('toggleCompleted', () => {
    it('toggles task completion status from false to true', () => {
      const task = {
        id: 1,
        title: 'Test Task',
        important: true,
        urgent: false,
        completed: false,
        createdAt: new Date().toISOString(),
      }

      const tasksArray: Task[] = [task]
      mockTasks.mockReturnValue(tasksArray)

      const store = useTodoStore()
      const updatedTask = store.toggleCompleted(1)

      expect(updatedTask?.completed).toBe(true)
      expect(updatedTask?.completedAt).toBeDefined()
    })

    it('toggles task completion status from true to false', () => {
      const task = {
        id: 1,
        title: 'Test Task',
        important: true,
        urgent: false,
        completed: true,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      }

      const tasksArray: Task[] = [task]
      mockTasks.mockReturnValue(tasksArray)

      const store = useTodoStore()
      const updatedTask = store.toggleCompleted(1)

      expect(updatedTask?.completed).toBe(false)
      expect(updatedTask?.completedAt).toBeUndefined()
    })

    it('returns undefined for non-existent task', () => {
      const store = useTodoStore()
      const result = store.toggleCompleted(999)
      expect(result).toBeUndefined()
    })
  })

  describe('toggleImportant', () => {
    it('toggles task important status from false to true', () => {
      const task = {
        id: 1,
        title: 'Test Task',
        important: false,
        urgent: false,
        completed: false,
        createdAt: new Date().toISOString(),
      }

      const tasksArray: Task[] = [task]
      mockTasks.mockReturnValue(tasksArray)

      const store = useTodoStore()
      const updatedTask = store.toggleImportant(1)

      expect(updatedTask?.important).toBe(true)
    })

    it('toggles task important status from true to false', () => {
      const task = {
        id: 1,
        title: 'Test Task',
        important: true,
        urgent: false,
        completed: false,
        createdAt: new Date().toISOString(),
      }

      const tasksArray: Task[] = [task]
      mockTasks.mockReturnValue(tasksArray)

      const store = useTodoStore()
      const updatedTask = store.toggleImportant(1)

      expect(updatedTask?.important).toBe(false)
    })

    it('returns undefined for non-existent task', () => {
      const store = useTodoStore()
      const result = store.toggleImportant(999)
      expect(result).toBeUndefined()
    })
  })

  describe('toggleUrgent', () => {
    it('toggles task urgent status from false to true', () => {
      const task = {
        id: 1,
        title: 'Test Task',
        important: false,
        urgent: false,
        completed: false,
        createdAt: new Date().toISOString(),
      }

      const tasksArray: Task[] = [task]
      mockTasks.mockReturnValue(tasksArray)

      const store = useTodoStore()
      const updatedTask = store.toggleUrgent(1)

      expect(updatedTask?.urgent).toBe(true)
    })

    it('toggles task urgent status from true to false', () => {
      const task = {
        id: 1,
        title: 'Test Task',
        important: false,
        urgent: true,
        completed: false,
        createdAt: new Date().toISOString(),
      }

      const tasksArray: Task[] = [task]
      mockTasks.mockReturnValue(tasksArray)

      const store = useTodoStore()
      const updatedTask = store.toggleUrgent(1)

      expect(updatedTask?.urgent).toBe(false)
    })

    it('returns undefined for non-existent task', () => {
      const store = useTodoStore()
      const result = store.toggleUrgent(999)
      expect(result).toBeUndefined()
    })
  })

  describe('deleteTask', () => {
    it('deletes existing task and returns it', () => {
      const task = {
        id: 1,
        title: 'Test Task',
        important: true,
        urgent: false,
        completed: false,
        createdAt: new Date().toISOString(),
      }

      const tasksArray: Task[] = [task]
      mockTasks.mockReturnValue(tasksArray)

      const store = useTodoStore()
      const deletedTask = store.deleteTask(1)

      expect(deletedTask).toMatchObject(task)
    })

    it('returns undefined for non-existent task', () => {
      const store = useTodoStore()
      const result = store.deleteTask(999)
      expect(result).toBeUndefined()
    })
  })

  describe('edge cases and complex scenarios', () => {
    it('handles multiple task operations correctly', () => {
      const task1 = {
        id: 1,
        title: 'Task 1',
        important: true,
        urgent: true,
        completed: false,
        createdAt: new Date().toISOString(),
      }

      const task2 = {
        id: 2,
        title: 'Task 2',
        important: false,
        urgent: true,
        completed: false,
        createdAt: new Date().toISOString(),
      }

      const tasksArray: Task[] = [task1, task2]
      mockTasks.mockReturnValue(tasksArray)

      const store = useTodoStore()

      // Test multiple operations
      store.toggleCompleted(1)
      store.toggleImportant(2)

      expect(task1.completed).toBe(true)
      expect('completedAt' in task1).toBe(true)
      expect(task2.important).toBe(true)
    })

    it('handles task creation with all quadrant combinations', () => {
      const store = useTodoStore()

      const originalDateNow = Date.now
      let idCounter = 1000
      Date.now = vi.fn(() => ++idCounter)

      const doTask = store.addTask('Do Task', true, true)
      const planTask = store.addTask('Plan Task', true, false)
      const delegateTask = store.addTask('Delegate Task', false, true)
      const eliminateTask = store.addTask('Eliminate Task', false, false)

      Date.now = originalDateNow

      expect(store.getQuadrant(doTask.important, doTask.urgent)).toBe('do')
      expect(store.getQuadrant(planTask.important, planTask.urgent)).toBe('plan')
      expect(store.getQuadrant(delegateTask.important, delegateTask.urgent)).toBe('delegate')
      expect(store.getQuadrant(eliminateTask.important, eliminateTask.urgent)).toBe('eliminate')
    })
  })
})
