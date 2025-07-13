import type { QuadrantType, Task } from '@/types'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

export const useTodoStore = defineStore('todo', () => {
  // VueUseで自動永続化
  const tasks = useLocalStorage<Task[]>('coveyTasks', [])

  // ユーティリティ関数
  function getQuadrant(important: boolean, urgent: boolean): QuadrantType {
    if (important && urgent)
      return 'do'
    if (important && !urgent)
      return 'plan'
    if (!important && urgent)
      return 'delegate'
    return 'eliminate'
  }

  function isToday(date: Date): boolean {
    const today = new Date()
    return date.getDate() === today.getDate()
      && date.getMonth() === today.getMonth()
      && date.getFullYear() === today.getFullYear()
  }

  // タスク管理アクション
  function addTask(title: string, important: boolean, urgent: boolean) {
    const task: Task = {
      id: Date.now(),
      title,
      important,
      urgent,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    tasks.value.push(task)
    return task
  }

  function toggleCompleted(taskId: number) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.completed = !task.completed
      if (task.completed) {
        task.completedAt = new Date().toISOString()
      }
      else {
        delete task.completedAt
      }
      return task
    }
  }

  function toggleImportant(taskId: number) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.important = !task.important
      return task
    }
  }

  function toggleUrgent(taskId: number) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.urgent = !task.urgent
      return task
    }
  }

  function deleteTask(taskId: number) {
    const taskToDelete = tasks.value.find(t => t.id === taskId)
    tasks.value = tasks.value.filter(t => t.id !== taskId)
    return taskToDelete
  }

  return {
    tasks,
    getQuadrant,
    isToday,
    addTask,
    toggleCompleted,
    toggleImportant,
    toggleUrgent,
    deleteTask,
  }
})
