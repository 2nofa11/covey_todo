<script setup lang="ts">
import type { QuadrantType, Task } from '@/types'

interface Props {
  task: Task
  showControls?: boolean
  showQuadrantLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showControls: false,
  showQuadrantLabel: true,
})

const emit = defineEmits<{
  toggleCompleted: [taskId: number]
  toggleImportant: [taskId: number]
  toggleUrgent: [taskId: number]
  deleteTask: [taskId: number]
}>()

// クワドラント判定
function getQuadrant(important: boolean, urgent: boolean): QuadrantType {
  if (important && urgent)
    return 'do'
  if (important && !urgent)
    return 'plan'
  if (!important && urgent)
    return 'delegate'
  return 'eliminate'
}

// クワドラント色の取得
function getQuadrantColor(quadrant: QuadrantType): string {
  const colors = {
    do: 'bg-tomato text-white',
    plan: 'bg-iceberg text-white',
    delegate: 'bg-caramel text-gray-800',
    eliminate: 'bg-gray-400 text-white',
  }
  return colors[quadrant]
}

// クワドラントラベルの取得
function getQuadrantLabel(quadrant: QuadrantType): string {
  const labels = {
    do: '緊急',
    plan: '重要',
    delegate: '委任',
    eliminate: '削除',
  }
  return labels[quadrant]
}

// 境界線の色を取得
function getBorderColor(quadrant: QuadrantType): string {
  const colors = {
    do: 'border-tomato',
    plan: 'border-iceberg',
    delegate: 'border-caramel',
    eliminate: 'border-gray-400',
  }
  return colors[quadrant]
}

const currentQuadrant = getQuadrant(props.task.important, props.task.urgent)
</script>

<template>
  <div
    class="task-card bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
    :class="[
      showControls ? 'border-2 border-gray-100' : 'border-l-4',
      showControls ? '' : getBorderColor(currentQuadrant),
    ]"
  >
    <!-- メインコンテンツ -->
    <div class="flex items-center justify-between" :class="{ 'mb-3': showControls }">
      <div class="flex items-center space-x-3">
        <input
          :id="`task-${task.id}-completed`"
          type="checkbox"
          :checked="task.completed"
          class="w-5 h-5 text-iceberg rounded focus:ring-iceberg"
          :aria-label="`タスク ${task.title} を完了としてマーク`"
          @change="emit('toggleCompleted', task.id)"
        >
        <span :class="task.completed ? 'line-through text-gray-500' : 'text-gray-900 font-medium'">
          {{ task.title }}
        </span>
      </div>

      <div class="flex items-center space-x-2">
        <!-- クワドラントラベル -->
        <span
          v-if="showQuadrantLabel"
          class="px-2 py-1 text-xs rounded-full"
          :class="getQuadrantColor(currentQuadrant)"
        >
          {{ getQuadrantLabel(currentQuadrant) }}
        </span>

        <!-- 削除ボタン -->
        <button
          v-if="showControls"
          class="text-gray-400 hover:text-red-500 transition-colors"
          :aria-label="`タスク ${task.title} を削除`"
          :title="`タスク ${task.title} を削除`"
          @click="emit('deleteTask', task.id)"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- コントロールボタン（週間ビューのみ） -->
    <div v-if="showControls" class="flex items-center space-x-4">
      <button
        class="flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors"
        :class="[
          task.important ? 'bg-iceberg text-white' : 'bg-gray-200 text-gray-600',
        ]"
        :aria-label="`タスク ${task.title} の重要度を切り替え`"
        :aria-pressed="task.important"
        @click="emit('toggleImportant', task.id)"
      >
        <span>★</span>
        <span>Important</span>
      </button>

      <button
        class="flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors"
        :class="[
          task.urgent ? 'bg-tomato text-white' : 'bg-gray-200 text-gray-600',
        ]"
        :aria-label="`タスク ${task.title} の緊急度を切り替え`"
        :aria-pressed="task.urgent"
        @click="emit('toggleUrgent', task.id)"
      >
        <span>⚡</span>
        <span>Urgent</span>
      </button>
    </div>
  </div>
</template>
