import type { Ref } from 'vue'
import type { QuadrantType, Task } from '@/types'
import { computed } from 'vue'

export function useTaskFilters(tasks: Ref<Task[]>) {
  // クワドラントを判定するユーティリティ関数
  function getQuadrant(important: boolean, urgent: boolean): QuadrantType {
    if (important && urgent)
      return 'do'
    if (important && !urgent)
      return 'plan'
    if (!important && urgent)
      return 'delegate'
    return 'eliminate'
  }

  // 今日表示用のタスク（重要または緊急）
  const todayTasks = computed(() =>
    tasks.value.filter(t => !t.completed && (t.important || t.urgent)),
  )

  // 特定のクワドラントのタスク
  function getQuadrantTasks(quadrant: QuadrantType) {
    return computed(() =>
      tasks.value.filter(t => getQuadrant(t.important, t.urgent) === quadrant),
    )
  }

  // 各クワドラントのタスク数
  const quadrantCounts = computed(() => ({
    do: tasks.value.filter(t => getQuadrant(t.important, t.urgent) === 'do' && !t.completed).length,
    plan: tasks.value.filter(t => getQuadrant(t.important, t.urgent) === 'plan' && !t.completed).length,
    delegate: tasks.value.filter(t => getQuadrant(t.important, t.urgent) === 'delegate' && !t.completed).length,
    eliminate: tasks.value.filter(t => getQuadrant(t.important, t.urgent) === 'eliminate' && !t.completed).length,
  }))

  // 第2領域（重要・非緊急）の比率
  const q2Ratio = computed(() => {
    if (todayTasks.value.length === 0)
      return 0
    const q2Tasks = todayTasks.value.filter(t => t.important && !t.urgent)
    return Math.round((q2Tasks.length / todayTasks.value.length) * 100)
  })

  // 完了済みタスク
  const completedTasks = computed(() =>
    tasks.value.filter(t => t.completed),
  )

  // 未完了タスク
  const activeTasks = computed(() =>
    tasks.value.filter(t => !t.completed),
  )

  return {
    getQuadrant,
    todayTasks,
    getQuadrantTasks,
    quadrantCounts,
    q2Ratio,
    completedTasks,
    activeTasks,
  }
}
