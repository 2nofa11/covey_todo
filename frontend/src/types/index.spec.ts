import type { BigRocks, QuadrantType, Task, ViewType } from './index'
import { describe, expect, it } from 'vitest'

describe('types/index', () => {
  describe('task interface', () => {
    it('accepts valid Task object', () => {
      const task: Task = {
        id: 1,
        title: 'Test Task',
        important: true,
        urgent: false,
        completed: false,
        createdAt: '2023-01-01T00:00:00.000Z',
      }

      expect(task.id).toBe(1)
      expect(task.title).toBe('Test Task')
      expect(task.important).toBe(true)
      expect(task.urgent).toBe(false)
      expect(task.completed).toBe(false)
      expect(task.createdAt).toBe('2023-01-01T00:00:00.000Z')
      expect(task.completedAt).toBeUndefined()
    })

    it('accepts Task with optional completedAt', () => {
      const task: Task = {
        id: 1,
        title: 'Completed Task',
        important: true,
        urgent: false,
        completed: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        completedAt: '2023-01-01T12:00:00.000Z',
      }

      expect(task.completedAt).toBe('2023-01-01T12:00:00.000Z')
    })

    it('validates Task properties types', () => {
      const task: Task = {
        id: 123,
        title: 'Type Test',
        important: false,
        urgent: true,
        completed: true,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      }

      expect(typeof task.id).toBe('number')
      expect(typeof task.title).toBe('string')
      expect(typeof task.important).toBe('boolean')
      expect(typeof task.urgent).toBe('boolean')
      expect(typeof task.completed).toBe('boolean')
      expect(typeof task.createdAt).toBe('string')
      expect(typeof task.completedAt).toBe('string')
    })
  })

  describe('bigRocks interface', () => {
    it('accepts valid BigRocks object', () => {
      const bigRocks: BigRocks = {
        work: ['Complete project', 'Review code'],
        family: ['Vacation planning'],
        health: ['Gym routine', 'Diet plan'],
      }

      expect(bigRocks.work).toEqual(['Complete project', 'Review code'])
      expect(bigRocks.family).toEqual(['Vacation planning'])
      expect(bigRocks.health).toEqual(['Gym routine', 'Diet plan'])
    })

    it('accepts empty BigRocks object', () => {
      const bigRocks: BigRocks = {}

      expect(Object.keys(bigRocks)).toHaveLength(0)
    })

    it('accepts BigRocks with dynamic role names', () => {
      const bigRocks: BigRocks = {
        'custom-role': ['Custom task 1', 'Custom task 2'],
        'another_role': ['Another task'],
      }

      expect(bigRocks['custom-role']).toEqual(['Custom task 1', 'Custom task 2'])
      expect(bigRocks.another_role).toEqual(['Another task'])
    })

    it('accepts BigRocks with empty arrays', () => {
      const bigRocks: BigRocks = {
        work: [],
        personal: ['Personal task'],
      }

      expect(bigRocks.work).toEqual([])
      expect(bigRocks.personal).toEqual(['Personal task'])
    })
  })

  describe('quadrantType', () => {
    it('accepts all valid quadrant values', () => {
      const quadrants: QuadrantType[] = ['do', 'plan', 'delegate', 'eliminate']

      quadrants.forEach((quadrant) => {
        const testQuadrant: QuadrantType = quadrant
        expect(['do', 'plan', 'delegate', 'eliminate']).toContain(testQuadrant)
      })
    })

    it('can be used in function parameters', () => {
      function processQuadrant(quadrant: QuadrantType): string {
        return `Processing ${quadrant} quadrant`
      }

      expect(processQuadrant('do')).toBe('Processing do quadrant')
      expect(processQuadrant('plan')).toBe('Processing plan quadrant')
      expect(processQuadrant('delegate')).toBe('Processing delegate quadrant')
      expect(processQuadrant('eliminate')).toBe('Processing eliminate quadrant')
    })

    it('can be used in switch statements', () => {
      function getQuadrantLabel(quadrant: QuadrantType): string {
        switch (quadrant) {
          case 'do':
            return 'Do - Urgent & Important'
          case 'plan':
            return 'Plan - Important'
          case 'delegate':
            return 'Delegate - Urgent'
          case 'eliminate':
            return 'Eliminate - Neither'
          default:
            // This should never be reached due to TypeScript
            return 'Unknown'
        }
      }

      expect(getQuadrantLabel('do')).toBe('Do - Urgent & Important')
      expect(getQuadrantLabel('plan')).toBe('Plan - Important')
      expect(getQuadrantLabel('delegate')).toBe('Delegate - Urgent')
      expect(getQuadrantLabel('eliminate')).toBe('Eliminate - Neither')
    })
  })

  describe('viewType', () => {
    it('accepts all valid view values', () => {
      const views: ViewType[] = ['today', 'week']

      views.forEach((view) => {
        const testView: ViewType = view
        expect(['today', 'week']).toContain(testView)
      })
    })

    it('can be used in function parameters', () => {
      function switchView(view: ViewType): string {
        return `Switching to ${view} view`
      }

      expect(switchView('today')).toBe('Switching to today view')
      expect(switchView('week')).toBe('Switching to week view')
    })

    it('can be used in conditional logic', () => {
      function getViewDescription(view: ViewType): string {
        if (view === 'today') {
          return 'Today view shows important and urgent tasks'
        }
        else if (view === 'week') {
          return 'Week view shows all tasks organized by quadrants'
        }
        return 'Unknown view'
      }

      expect(getViewDescription('today')).toBe('Today view shows important and urgent tasks')
      expect(getViewDescription('week')).toBe('Week view shows all tasks organized by quadrants')
    })
  })

  describe('type integration', () => {
    it('uses Task with QuadrantType classification', () => {
      function classifyTask(task: Task): QuadrantType {
        if (task.important && task.urgent)
          return 'do'
        if (task.important && !task.urgent)
          return 'plan'
        if (!task.important && task.urgent)
          return 'delegate'
        return 'eliminate'
      }

      const urgentImportantTask: Task = {
        id: 1,
        title: 'Critical Bug Fix',
        important: true,
        urgent: true,
        completed: false,
        createdAt: '2023-01-01T00:00:00.000Z',
      }

      expect(classifyTask(urgentImportantTask)).toBe('do')

      const importantTask: Task = {
        id: 2,
        title: 'Long-term Planning',
        important: true,
        urgent: false,
        completed: false,
        createdAt: '2023-01-01T00:00:00.000Z',
      }

      expect(classifyTask(importantTask)).toBe('plan')
    })

    it('combines all types in a comprehensive example', () => {
      interface AppState {
        tasks: Task[]
        bigRocks: BigRocks
        currentView: ViewType
        selectedQuadrant: QuadrantType
      }

      const appState: AppState = {
        tasks: [
          {
            id: 1,
            title: 'Review pull request',
            important: true,
            urgent: true,
            completed: false,
            createdAt: '2023-01-01T09:00:00.000Z',
          },
        ],
        bigRocks: {
          work: ['Complete quarterly review'],
          personal: ['Exercise regularly'],
        },
        currentView: 'today',
        selectedQuadrant: 'do',
      }

      expect(appState.tasks).toHaveLength(1)
      expect(appState.bigRocks.work).toEqual(['Complete quarterly review'])
      expect(appState.currentView).toBe('today')
      expect(appState.selectedQuadrant).toBe('do')
    })
  })

  describe('type constraints and validation', () => {
    it('ensures Task id is numeric', () => {
      const task: Task = {
        id: 42,
        title: 'Numeric ID Test',
        important: false,
        urgent: false,
        completed: false,
        createdAt: '2023-01-01T00:00:00.000Z',
      }

      expect(Number.isInteger(task.id)).toBe(true)
    })

    it('ensures boolean flags are properly typed', () => {
      const task: Task = {
        id: 1,
        title: 'Boolean Test',
        important: true,
        urgent: false,
        completed: true,
        createdAt: '2023-01-01T00:00:00.000Z',
      }

      expect(typeof task.important).toBe('boolean')
      expect(typeof task.urgent).toBe('boolean')
      expect(typeof task.completed).toBe('boolean')
      expect(task.important).toBe(true)
      expect(task.urgent).toBe(false)
      expect(task.completed).toBe(true)
    })

    it('validates string array structure in BigRocks', () => {
      const bigRocks: BigRocks = {
        testRole: ['Task 1', 'Task 2', 'Task 3'],
      }

      expect(Array.isArray(bigRocks.testRole)).toBe(true)
      bigRocks.testRole.forEach((task) => {
        expect(typeof task).toBe('string')
      })
    })
  })
})
