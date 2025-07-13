import type { Ref } from 'vue'
import type { Task } from '@/types'
import { computed } from 'vue'

export function useTaskStats(tasks: Ref<Task[]>) {
  // 今日かどうかを判定するユーティリティ関数
  function isToday(date: Date): boolean {
    const today = new Date()
    return date.getDate() === today.getDate()
      && date.getMonth() === today.getMonth()
      && date.getFullYear() === today.getFullYear()
  }

  // 基本統計
  const stats = computed(() => ({
    // 全未完了タスク数
    totalTasks: tasks.value.filter(t => !t.completed).length,

    // 今日完了したタスク数
    completedToday: tasks.value.filter((t) => {
      if (!t.completed || !t.completedAt)
        return false
      return isToday(new Date(t.completedAt))
    }).length,

    // 高優先度タスク数（重要かつ緊急）
    highPriority: tasks.value.filter(t => !t.completed && t.important && t.urgent).length,

    // 全完了タスク数
    totalCompleted: tasks.value.filter(t => t.completed).length,

    // 全タスク数
    totalAll: tasks.value.length,
  }))

  // 完了率
  const completionRate = computed(() => {
    if (stats.value.totalAll === 0)
      return 0
    return Math.round((stats.value.totalCompleted / stats.value.totalAll) * 100)
  })

  // 今日の進捗統計
  const todayProgress = computed(() => {
    const todayRelevantTasks = tasks.value.filter(t => t.important || t.urgent)
    const todayCompletedTasks = todayRelevantTasks.filter(t => t.completed)

    return {
      total: todayRelevantTasks.length,
      completed: todayCompletedTasks.length,
      remaining: todayRelevantTasks.length - todayCompletedTasks.length,
      completionRate: todayRelevantTasks.length > 0
        ? Math.round((todayCompletedTasks.length / todayRelevantTasks.length) * 100)
        : 0,
    }
  })

  // クワドラント別統計
  const quadrantStats = computed(() => {
    const getQuadrant = (important: boolean, urgent: boolean) => {
      if (important && urgent)
        return 'do'
      if (important && !urgent)
        return 'plan'
      if (!important && urgent)
        return 'delegate'
      return 'eliminate'
    }

    const quadrants = {
      do: { total: 0, completed: 0 },
      plan: { total: 0, completed: 0 },
      delegate: { total: 0, completed: 0 },
      eliminate: { total: 0, completed: 0 },
    }

    tasks.value.forEach((task) => {
      const quadrant = getQuadrant(task.important, task.urgent)
      quadrants[quadrant].total++
      if (task.completed) {
        quadrants[quadrant].completed++
      }
    })

    return quadrants
  })

  // 週次進捗（過去7日間の完了タスク）
  const weeklyProgress = computed(() => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    return tasks.value.filter((task) => {
      if (!task.completed || !task.completedAt)
        return false
      const completedDate = new Date(task.completedAt)
      return completedDate >= weekAgo && completedDate <= now
    }).length
  })

  return {
    stats,
    completionRate,
    todayProgress,
    quadrantStats,
    weeklyProgress,
    isToday,
  }
}
