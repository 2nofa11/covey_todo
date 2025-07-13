<script setup lang="ts">
import type { QuadrantType } from '@/types'
import { ref } from 'vue'
import { useModal } from '@/composables/useModal'

interface Props {
  getQuadrant: (important: boolean, urgent: boolean) => QuadrantType
  onTaskAdded: (title: string, important: boolean, urgent: boolean) => void
}

const props = defineProps<Props>()

const modal = useModal()

const taskInput = ref('')
const captureImportant = ref(false)
const captureUrgent = ref(false)

function handleSubmit() {
  const title = taskInput.value.trim()
  if (title) {
    props.onTaskAdded(title, captureImportant.value, captureUrgent.value)
    resetForm()
    modal.close()
  }
}

function resetForm() {
  taskInput.value = ''
  captureImportant.value = false
  captureUrgent.value = false
}

function handleClose() {
  resetForm()
  modal.close()
}
</script>

<template>
  <div>
    <div class="mb-4">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">
        新しいタスクを追加
      </h2>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label for="taskInput" class="block text-sm font-medium text-gray-700 mb-2">
          タスク名
        </label>
        <input
          id="taskInput"
          v-model="taskInput"
          type="text"
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iceberg focus:border-iceberg"
          placeholder="タスクを入力してください..."
        >
      </div>

      <!-- Priority Selection -->
      <div class="mb-8">
        <p id="priority-instructions" class="text-sm text-gray-600 mb-3">
          このタスクを分類しましょう：
        </p>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            tabindex="0"
            role="switch"
            :aria-checked="captureImportant"
            aria-label="重要なタスクとしてマーク"
            class="priority-toggle flex items-center justify-center py-3 px-4 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-iceberg focus:ring-offset-2"
            :class="[
              captureImportant ? 'border-iceberg bg-iceberg text-white' : 'border-gray-200 hover:border-iceberg',
            ]"
            @click="captureImportant = !captureImportant"
            @keydown.space.prevent="captureImportant = !captureImportant"
            @keydown.enter.prevent="captureImportant = !captureImportant"
          >
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span class="font-medium">重要</span>
          </button>
          <button
            type="button"
            tabindex="0"
            role="switch"
            :aria-checked="captureUrgent"
            aria-label="緊急なタスクとしてマーク"
            class="priority-toggle flex items-center justify-center py-3 px-4 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-tomato focus:ring-offset-2"
            :class="[
              captureUrgent ? 'border-tomato bg-tomato text-white' : 'border-gray-200 hover:border-tomato',
            ]"
            @click="captureUrgent = !captureUrgent"
            @keydown.space.prevent="captureUrgent = !captureUrgent"
            @keydown.enter.prevent="captureUrgent = !captureUrgent"
          >
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span class="font-medium">緊急</span>
          </button>
        </div>
        <div v-show="captureImportant || captureUrgent" class="mt-3 p-3 rounded-lg bg-gray-50">
          <div class="flex items-center">
            <div
              class="w-4 h-4 rounded mr-2"
              :class="[
                getQuadrant(captureImportant, captureUrgent) === 'do' ? 'bg-tomato'
                : getQuadrant(captureImportant, captureUrgent) === 'plan' ? 'bg-iceberg'
                  : getQuadrant(captureImportant, captureUrgent) === 'delegate' ? 'bg-caramel'
                    : 'bg-gray-400',
              ]"
            />
            <span class="text-sm font-medium">
              {{ getQuadrant(captureImportant, captureUrgent) === 'do' ? 'Do - Important & Urgent'
                : getQuadrant(captureImportant, captureUrgent) === 'plan' ? 'Plan - Important Only'
                  : getQuadrant(captureImportant, captureUrgent) === 'delegate' ? 'Delegate - Urgent Only'
                    : 'Eliminate - Neither Important nor Urgent' }}
            </span>
          </div>
          <p class="text-xs text-gray-600 mt-1">
            {{ getQuadrant(captureImportant, captureUrgent) === 'do' ? 'Handle immediately - crisis or emergency'
              : getQuadrant(captureImportant, captureUrgent) === 'plan' ? 'Schedule for later - prevents future crises'
                : getQuadrant(captureImportant, captureUrgent) === 'delegate' ? 'Let someone else handle this'
                  : 'Consider if this task is necessary' }}
          </p>
        </div>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          type="button"
          class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          @click="handleClose"
        >
          キャンセル
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-iceberg text-white rounded-lg hover:opacity-90 transition-opacity"
          :disabled="!taskInput.trim()"
        >
          追加
        </button>
      </div>
    </form>
  </div>
</template>
