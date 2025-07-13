<script setup lang="ts">
import { ref } from 'vue'
import { useModal } from '@/composables/useModal'

interface Props {
  initialBigRocks?: Record<string, string[]>
  onBigRocksUpdated: (bigRocks: Record<string, string[]>) => void
}

const props = defineProps<Props>()

const modal = useModal()

const roles = ['work', 'family', 'health', 'personal']
const formData = ref<Record<string, string[]>>({})

// 初期データを設定
function initializeForm() {
  roles.forEach((role) => {
    formData.value[role] = props.initialBigRocks?.[role] || ['', '', '']
  })
}

// コンポーネント初期化時にフォームを初期化
initializeForm()

function handleSubmit() {
  const newBigRocks: Record<string, string[]> = {}

  roles.forEach((role) => {
    const values = formData.value[role]?.filter(val => val.trim()) || []
    if (values.length > 0) {
      newBigRocks[role] = values
    }
  })

  props.onBigRocksUpdated(newBigRocks)
  modal.close()
}

function handleClose() {
  initializeForm()
  modal.close()
}

function updateRoleValue(role: string, index: number, value: string) {
  if (!formData.value[role]) {
    formData.value[role] = ['', '', '']
  }
  formData.value[role][index] = value
}
</script>

<template>
  <div>
    <div class="mb-4">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">
        週の最重要事項を設定
      </h2>
    </div>

    <form @submit.prevent="handleSubmit">
      <p class="text-gray-600 mb-6">
        各分野で今週最も重要な3つのことを設定してください
      </p>

      <div class="space-y-6">
        <!-- 仕事 -->
        <div>
          <h4 class="font-medium text-gray-900 mb-3">
            💼 仕事・キャリア
          </h4>
          <div class="space-y-2">
            <input
              v-for="i in 3"
              :key="`work-${i - 1}`"
              :value="formData.work?.[i - 1] || ''"
              type="text"
              class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-iceberg focus:border-iceberg"
              :placeholder="`仕事の重要事項 ${i}`"
              @input="updateRoleValue('work', i - 1, ($event.target as HTMLInputElement).value)"
            >
          </div>
        </div>

        <!-- 家族 -->
        <div>
          <h4 class="font-medium text-gray-900 mb-3">
            👨‍👩‍👧‍👦 家族・人間関係
          </h4>
          <div class="space-y-2">
            <input
              v-for="i in 3"
              :key="`family-${i - 1}`"
              :value="formData.family?.[i - 1] || ''"
              type="text"
              class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-iceberg focus:border-iceberg"
              :placeholder="`家族の重要事項 ${i}`"
              @input="updateRoleValue('family', i - 1, ($event.target as HTMLInputElement).value)"
            >
          </div>
        </div>

        <!-- 健康 -->
        <div>
          <h4 class="font-medium text-gray-900 mb-3">
            🏃‍♂️ 健康・ウェルネス
          </h4>
          <div class="space-y-2">
            <input
              v-for="i in 3"
              :key="`health-${i - 1}`"
              :value="formData.health?.[i - 1] || ''"
              type="text"
              class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-iceberg focus:border-iceberg"
              :placeholder="`健康の重要事項 ${i}`"
              @input="updateRoleValue('health', i - 1, ($event.target as HTMLInputElement).value)"
            >
          </div>
        </div>

        <!-- 個人 -->
        <div>
          <h4 class="font-medium text-gray-900 mb-3">
            🌱 個人的成長・学習
          </h4>
          <div class="space-y-2">
            <input
              v-for="i in 3"
              :key="`personal-${i - 1}`"
              :value="formData.personal?.[i - 1] || ''"
              type="text"
              class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-iceberg focus:border-iceberg"
              :placeholder="`個人の重要事項 ${i}`"
              @input="updateRoleValue('personal', i - 1, ($event.target as HTMLInputElement).value)"
            >
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-8">
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
        >
          保存
        </button>
      </div>
    </form>
  </div>
</template>
