<script setup lang="ts">
import { toRef } from 'vue'
import QuickCaptureModal from '@/components/modals/QuickCaptureModal.vue'
import TaskCard from '@/components/ui/TaskCard.vue'
import { useModal } from '@/composables/useModal'
import { useTaskFilters } from '@/composables/useTaskFilters'
import { useTodoStore } from '@/stores/useTodoStore'
import { useUIStore } from '@/stores/useUIStore'

const todoStore = useTodoStore()
const uiStore = useUIStore()
const modal = useModal()

const tasksRef = toRef(todoStore, 'tasks')
const { todayTasks, getQuadrant } = useTaskFilters(tasksRef)

function openQuickCapture() {
  modal.open(QuickCaptureModal, {
    getQuadrant,
    onTaskAdded: (title: string, important: boolean, urgent: boolean) => {
      todoStore.addTask(title, important, urgent)
      uiStore.announceStatus('新しいタスクを追加しました')
    },
  })
}
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-900">
          今日の重要なタスク
        </h2>
        <span class="text-sm text-gray-500">
          {{ todayTasks.length }}件
        </span>
      </div>

      <div v-if="todayTasks.length === 0" class="text-center py-8 text-gray-500">
        <p class="text-lg mb-2">
          🎉 お疲れさまでした！
        </p>
        <p>重要なタスクはすべて完了です</p>
        <button
          class="mt-4 bg-iceberg text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          @click="openQuickCapture"
        >
          新しいタスクを追加
        </button>
      </div>

      <div v-else class="space-y-3">
        <TaskCard
          v-for="task in todayTasks"
          :key="task.id"
          :task="task"
          @toggle-completed="todoStore.toggleCompleted"
        />
      </div>
    </div>
  </div>
</template>
