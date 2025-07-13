import type { Task } from '@/types'
import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import TaskCard from './TaskCard.vue'

describe('taskCard', () => {
  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    important: true,
    urgent: false,
    completed: false,
    createdAt: '2023-01-01T00:00:00.000Z',
  }

  it('renders task with basic props', () => {
    const { container } = render(TaskCard, {
      props: {
        task: mockTask,
      },
    })

    expect(container.firstChild).toBeTruthy()
    expect(screen.getByText('Test Task')).toBeTruthy()
  })

  it('displays task title correctly', () => {
    render(TaskCard, {
      props: {
        task: mockTask,
      },
    })

    expect(screen.getByText('Test Task')).toBeTruthy()
  })

  it('shows checkbox for task completion', () => {
    render(TaskCard, {
      props: {
        task: mockTask,
      },
    })

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox).toBeTruthy()
    expect(checkbox.checked).toBe(false)
  })

  it('shows completed task with strikethrough', () => {
    const completedTask = { ...mockTask, completed: true }

    render(TaskCard, {
      props: {
        task: completedTask,
      },
    })

    const taskText = screen.getByText('Test Task')
    expect(taskText.classList.contains('line-through')).toBe(true)
    expect(taskText.classList.contains('text-gray-500')).toBe(true)
  })

  it('shows quadrant label by default', () => {
    render(TaskCard, {
      props: {
        task: mockTask, // important: true, urgent: false = 'plan' quadrant
      },
    })

    expect(screen.getByText('重要')).toBeTruthy()
  })

  it('hides quadrant label when showQuadrantLabel is false', () => {
    render(TaskCard, {
      props: {
        task: mockTask,
        showQuadrantLabel: false,
      },
    })

    expect(screen.queryByText('重要')).toBeFalsy()
  })

  it('displays correct quadrant labels', () => {
    // Test 'do' quadrant (important + urgent)
    const doTask = { ...mockTask, important: true, urgent: true }
    const { unmount: unmount1 } = render(TaskCard, {
      props: { task: doTask },
    })
    expect(screen.getByText('緊急')).toBeTruthy()
    unmount1()

    // Test 'plan' quadrant (important, not urgent)
    const planTask = { ...mockTask, important: true, urgent: false }
    const { unmount: unmount2 } = render(TaskCard, {
      props: { task: planTask },
    })
    expect(screen.getByText('重要')).toBeTruthy()
    unmount2()

    // Test 'delegate' quadrant (not important, urgent)
    const delegateTask = { ...mockTask, important: false, urgent: true }
    const { unmount: unmount3 } = render(TaskCard, {
      props: { task: delegateTask },
    })
    expect(screen.getByText('委任')).toBeTruthy()
    unmount3()

    // Test 'eliminate' quadrant (not important, not urgent)
    const eliminateTask = { ...mockTask, important: false, urgent: false }
    render(TaskCard, {
      props: { task: eliminateTask },
    })
    expect(screen.getByText('削除')).toBeTruthy()
  })

  it('applies correct quadrant colors', () => {
    const doTask = { ...mockTask, important: true, urgent: true }
    render(TaskCard, {
      props: { task: doTask },
    })

    const quadrantLabel = screen.getByText('緊急')
    expect(quadrantLabel.classList.contains('bg-tomato')).toBe(true)
    expect(quadrantLabel.classList.contains('text-white')).toBe(true)
  })

  it('emits toggleCompleted event when checkbox is clicked', async () => {
    const { emitted } = render(TaskCard, {
      props: {
        task: mockTask,
      },
    })

    const checkbox = screen.getByRole('checkbox')
    await fireEvent.click(checkbox)

    expect(emitted()).toHaveProperty('toggleCompleted')
    expect(emitted().toggleCompleted[0]).toEqual([mockTask.id])
  })

  it('shows controls when showControls is true', () => {
    render(TaskCard, {
      props: {
        task: mockTask,
        showControls: true,
      },
    })

    expect(screen.getByText('Important')).toBeTruthy()
    expect(screen.getByText('Urgent')).toBeTruthy()
    expect(screen.getByLabelText(`タスク ${mockTask.title} を削除`)).toBeTruthy()
  })

  it('hides controls when showControls is false', () => {
    render(TaskCard, {
      props: {
        task: mockTask,
        showControls: false,
      },
    })

    expect(screen.queryByText('Important')).toBeFalsy()
    expect(screen.queryByText('Urgent')).toBeFalsy()
    expect(screen.queryByLabelText(`タスク ${mockTask.title} を削除`)).toBeFalsy()
  })

  it('shows important button as active when task is important', () => {
    render(TaskCard, {
      props: {
        task: mockTask, // important: true
        showControls: true,
      },
    })

    const importantButton = screen.getByText('Important').closest('button')
    expect(importantButton?.classList.contains('bg-iceberg')).toBe(true)
    expect(importantButton?.classList.contains('text-white')).toBe(true)
  })

  it('shows urgent button as active when task is urgent', () => {
    const urgentTask = { ...mockTask, urgent: true }

    render(TaskCard, {
      props: {
        task: urgentTask,
        showControls: true,
      },
    })

    const urgentButton = screen.getByText('Urgent').closest('button')
    expect(urgentButton?.classList.contains('bg-tomato')).toBe(true)
    expect(urgentButton?.classList.contains('text-white')).toBe(true)
  })

  it('shows buttons as inactive when task properties are false', () => {
    const inactiveTask = { ...mockTask, important: false, urgent: false }

    render(TaskCard, {
      props: {
        task: inactiveTask,
        showControls: true,
      },
    })

    const importantButton = screen.getByText('Important').closest('button')
    const urgentButton = screen.getByText('Urgent').closest('button')

    expect(importantButton?.classList.contains('bg-gray-200')).toBe(true)
    expect(importantButton?.classList.contains('text-gray-600')).toBe(true)

    expect(urgentButton?.classList.contains('bg-gray-200')).toBe(true)
    expect(urgentButton?.classList.contains('text-gray-600')).toBe(true)
  })

  it('emits toggleImportant event when important button is clicked', async () => {
    const { emitted } = render(TaskCard, {
      props: {
        task: mockTask,
        showControls: true,
      },
    })

    const importantButton = screen.getByText('Important').closest('button')
    if (importantButton) {
      await fireEvent.click(importantButton)
    }

    expect(emitted()).toHaveProperty('toggleImportant')
    expect(emitted().toggleImportant[0]).toEqual([mockTask.id])
  })

  it('emits toggleUrgent event when urgent button is clicked', async () => {
    const { emitted } = render(TaskCard, {
      props: {
        task: mockTask,
        showControls: true,
      },
    })

    const urgentButton = screen.getByText('Urgent').closest('button')
    if (urgentButton) {
      await fireEvent.click(urgentButton)
    }

    expect(emitted()).toHaveProperty('toggleUrgent')
    expect(emitted().toggleUrgent[0]).toEqual([mockTask.id])
  })

  it('emits deleteTask event when delete button is clicked', async () => {
    const { emitted } = render(TaskCard, {
      props: {
        task: mockTask,
        showControls: true,
      },
    })

    const deleteButton = screen.getByLabelText(`タスク ${mockTask.title} を削除`)
    await fireEvent.click(deleteButton)

    expect(emitted()).toHaveProperty('deleteTask')
    expect(emitted().deleteTask[0]).toEqual([mockTask.id])
  })

  it('applies correct border styles', () => {
    const { container } = render(TaskCard, {
      props: {
        task: mockTask, // important: true, urgent: false = 'plan' quadrant
        showControls: false,
      },
    })

    const taskCard = container.querySelector('.task-card')
    expect(taskCard?.classList.contains('border-l-4')).toBe(true)
    expect(taskCard?.classList.contains('border-iceberg')).toBe(true)
  })

  it('applies different border style when showControls is true', () => {
    const { container } = render(TaskCard, {
      props: {
        task: mockTask,
        showControls: true,
      },
    })

    const taskCard = container.querySelector('.task-card')
    expect(taskCard?.classList.contains('border-2')).toBe(true)
    expect(taskCard?.classList.contains('border-gray-100')).toBe(true)
  })

  it('handles long task titles', () => {
    const longTitleTask = {
      ...mockTask,
      title: 'This is a very long task title that should be displayed correctly without breaking the layout',
    }

    render(TaskCard, {
      props: {
        task: longTitleTask,
      },
    })

    expect(screen.getByText(longTitleTask.title)).toBeTruthy()
  })

  it('handles all quadrant combinations', () => {
    const testCases = [
      { important: true, urgent: true, expectedLabel: '緊急', expectedBorder: 'border-tomato' },
      { important: true, urgent: false, expectedLabel: '重要', expectedBorder: 'border-iceberg' },
      { important: false, urgent: true, expectedLabel: '委任', expectedBorder: 'border-caramel' },
      { important: false, urgent: false, expectedLabel: '削除', expectedBorder: 'border-gray-400' },
    ]

    testCases.forEach(({ important, urgent, expectedLabel, expectedBorder }) => {
      const testTask = { ...mockTask, important, urgent }
      const { container, unmount } = render(TaskCard, {
        props: { task: testTask },
      })

      expect(screen.getByText(expectedLabel)).toBeTruthy()

      const taskCard = container.querySelector('.task-card')
      expect(taskCard?.classList.contains(expectedBorder)).toBe(true)

      unmount()
    })
  })

  it('maintains accessibility attributes', () => {
    render(TaskCard, {
      props: {
        task: mockTask,
        showControls: true,
      },
    })

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox.getAttribute('aria-label')).toBe(`タスク ${mockTask.title} を完了としてマーク`)

    const importantButton = screen.getByText('Important').closest('button')
    expect(importantButton?.getAttribute('aria-label')).toBe(`タスク ${mockTask.title} の重要度を切り替え`)
    expect(importantButton?.getAttribute('aria-pressed')).toBe('true')

    const urgentButton = screen.getByText('Urgent').closest('button')
    expect(urgentButton?.getAttribute('aria-label')).toBe(`タスク ${mockTask.title} の緊急度を切り替え`)
    expect(urgentButton?.getAttribute('aria-pressed')).toBe('false')
  })
})
