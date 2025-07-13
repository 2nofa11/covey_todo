<script setup lang="ts">
import type { QuadrantType } from '@/types'
import { computed, toRef } from 'vue'
import TaskCard from '@/components/ui/TaskCard.vue'
import { useTaskFilters } from '@/composables/useTaskFilters'
import { useTodoStore } from '@/stores/useTodoStore'
import { useUIStore } from '@/stores/useUIStore'

const todoStore = useTodoStore()
const uiStore = useUIStore()

const tasksRef = toRef(todoStore, 'tasks')
const { getQuadrantTasks, quadrantCounts } = useTaskFilters(tasksRef)

const quadrantTasks = computed(() =>
  getQuadrantTasks(uiStore.currentQuadrant).value,
)

function getQuadrantLabel(quadrant: QuadrantType): string {
  const labels = {
    do: '緊急',
    plan: '重要',
    delegate: '委任',
    eliminate: '削除',
  }
  return labels[quadrant]
}
</script>

<template>
  <div class="space-y-6">
    <!-- クワドラント選択 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h2 class="text-lg font-semibold mb-4">
        クワドラント ({{ getQuadrantLabel(uiStore.currentQuadrant) }})
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          class="p-4 rounded-lg text-center font-medium transition-colors border-2"
          :class="[
            uiStore.currentQuadrant === 'do' ? 'bg-tomato text-white border-tomato' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200',
          ]"
          @click="uiStore.switchQuadrant('do')"
        >
          <div class="text-2xl mb-1">
            🔥
          </div>
          <div class="text-sm">
            今すぐやる
          </div>
          <div class="text-xs opacity-75">
            {{ quadrantCounts.do }}件
          </div>
        </button>

        <button
          class="p-4 rounded-lg text-center font-medium transition-colors border-2"
          :class="[
            uiStore.currentQuadrant === 'plan' ? 'bg-iceberg text-white border-iceberg' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200',
          ]"
          @click="uiStore.switchQuadrant('plan')"
        >
          <div class="text-2xl mb-1">
            ⭐
          </div>
          <div class="text-sm">
            計画する
          </div>
          <div class="text-xs opacity-75">
            {{ quadrantCounts.plan }}件
          </div>
        </button>

        <button
          class="p-4 rounded-lg text-center font-medium transition-colors border-2"
          :class="[
            uiStore.currentQuadrant === 'delegate' ? 'bg-caramel text-gray-800 border-caramel' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200',
          ]"
          @click="uiStore.switchQuadrant('delegate')"
        >
          <div class="text-2xl mb-1">
            👥
          </div>
          <div class="text-sm">
            人に任せる
          </div>
          <div class="text-xs opacity-75">
            {{ quadrantCounts.delegate }}件
          </div>
        </button>

        <button
          class="p-4 rounded-lg text-center font-medium transition-colors border-2"
          :class="[
            uiStore.currentQuadrant === 'eliminate' ? 'bg-gray-400 text-white border-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200',
          ]"
          @click="uiStore.switchQuadrant('eliminate')"
        >
          <div class="text-2xl mb-1">
            🗑️
          </div>
          <div class="text-sm">
            やらない
          </div>
          <div class="text-xs opacity-75">
            {{ quadrantCounts.eliminate }}件
          </div>
        </button>
      </div>
    </div>

    <!-- クワドラント別タスク一覧 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">
          {{ getQuadrantLabel(uiStore.currentQuadrant) }}のタスク
        </h3>
      </div>

      <div v-if="quadrantTasks.length === 0" class="text-center py-8 text-gray-500">
        <p>このクワドラントにはタスクがありません</p>
      </div>

      <div v-else class="space-y-3">
        <TaskCard
          v-for="task in quadrantTasks"
          :key="task.id"
          :task="task"
          :show-controls="true"
          :show-quadrant-label="false"
          @toggle-completed="todoStore.toggleCompleted"
          @delete-task="todoStore.deleteTask"
          @toggle-important="todoStore.toggleImportant"
          @toggle-urgent="todoStore.toggleUrgent"
        />
      </div>
    </div>
  </div>
</template>
