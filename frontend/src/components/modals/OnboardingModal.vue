<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useModal } from '@/composables/useModal'

interface Props {
  autoShow?: boolean
  onTutorialTaskAdded: (title: string) => void
  onOnboardingCompleted: () => void
}

const props = defineProps<Props>()

const modal = useModal()

const currentStep = ref(1)
const tutorialTaskInput = ref('')

function nextStep() {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function addTutorialTask() {
  const title = tutorialTaskInput.value.trim()
  if (title) {
    props.onTutorialTaskAdded(title)
    tutorialTaskInput.value = ''
    finishOnboarding()
  }
}

function finishOnboarding() {
  localStorage.setItem('coveyOnboarded', 'true')
  props.onOnboardingCompleted()
  modal.close()
}

onMounted(() => {
  if (props.autoShow) {
    const onboarded = localStorage.getItem('coveyOnboarded')
    if (!onboarded) {
      // 少し遅延させてモーダルを表示
      setTimeout(() => {
        // useModalのstateを直接操作するのではなく、外部から制御
        // 実際にはHome.vueでチェックして開くべき
      }, 100)
    }
  }
})
</script>

<template>
  <div>
    <!-- ステップ1: 歓迎 -->
    <div v-if="currentStep === 1" class="text-center">
      <div class="text-6xl mb-4">
        🎯
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-4">
        Covey Todoへようこそ！
      </h2>
      <p class="text-gray-600 mb-6">
        スティーブン・R・コヴィーの「7つの習慣」で紹介された<br>
        重要度・緊急度マトリックスを使って<br>
        効果的にタスクを管理しましょう
      </p>
      <div class="flex justify-center space-x-3">
        <button
          class="px-6 py-2 bg-iceberg text-white rounded-lg hover:opacity-90 transition-opacity"
          @click="nextStep"
        >
          始める
        </button>
      </div>
    </div>

    <!-- ステップ2: マトリックス説明 -->
    <div v-if="currentStep === 2" class="text-center">
      <div class="text-4xl mb-4">
        📊
      </div>
      <h2 class="text-xl font-bold text-gray-900 mb-4">
        4つのクワドラント
      </h2>
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="p-4 bg-tomato text-white rounded-lg">
          <div class="text-2xl mb-2">
            🔥
          </div>
          <div class="font-semibold">
            今すぐやる
          </div>
          <div class="text-sm opacity-90">
            重要 & 緊急
          </div>
        </div>
        <div class="p-4 bg-iceberg text-white rounded-lg">
          <div class="text-2xl mb-2">
            ⭐
          </div>
          <div class="font-semibold">
            計画する
          </div>
          <div class="text-sm opacity-90">
            重要のみ
          </div>
        </div>
        <div class="p-4 bg-caramel text-gray-800 rounded-lg">
          <div class="text-2xl mb-2">
            👥
          </div>
          <div class="font-semibold">
            人に任せる
          </div>
          <div class="text-sm opacity-75">
            緊急のみ
          </div>
        </div>
        <div class="p-4 bg-gray-400 text-white rounded-lg">
          <div class="text-2xl mb-2">
            🗑️
          </div>
          <div class="font-semibold">
            やめる
          </div>
          <div class="text-sm opacity-90">
            どちらでもない
          </div>
        </div>
      </div>
      <div class="flex justify-between">
        <button
          class="px-4 py-2 text-gray-600 hover:text-gray-800"
          @click="prevStep"
        >
          戻る
        </button>
        <button
          class="px-6 py-2 bg-iceberg text-white rounded-lg hover:opacity-90 transition-opacity"
          @click="nextStep"
        >
          次へ
        </button>
      </div>
    </div>

    <!-- ステップ3: 実際にタスクを追加 -->
    <div v-if="currentStep === 3">
      <div class="text-center mb-6">
        <div class="text-4xl mb-4">
          ✍️
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">
          実際にタスクを追加してみましょう
        </h2>
        <p class="text-gray-600">
          重要なタスクを1つ入力してください
        </p>
      </div>

      <form @submit.prevent="addTutorialTask">
        <div class="mb-4">
          <input
            v-model="tutorialTaskInput"
            type="text"
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iceberg focus:border-iceberg"
            placeholder="例: プレゼンテーションの準備"
            autofocus
          >
        </div>
        <div class="flex justify-between">
          <button
            type="button"
            class="px-4 py-2 text-gray-600 hover:text-gray-800"
            @click="prevStep"
          >
            戻る
          </button>
          <button
            type="submit"
            class="px-6 py-2 bg-iceberg text-white rounded-lg hover:opacity-90 transition-opacity"
            :disabled="!tutorialTaskInput.trim()"
          >
            追加して完了
          </button>
        </div>
      </form>
    </div>

    <!-- 完了画面 -->
    <div v-if="currentStep > 3" class="text-center">
      <div class="text-6xl mb-4">
        🎉
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-4">
        準備完了です！
      </h2>
      <p class="text-gray-600 mb-6">
        これで効果的なタスク管理を始める準備ができました。<br>
        <strong>N</strong> キーまたは + ボタンで新しいタスクを追加できます。
      </p>
      <button
        class="px-6 py-2 bg-iceberg text-white rounded-lg hover:opacity-90 transition-opacity"
        @click="finishOnboarding"
      >
        始める
      </button>
    </div>
  </div>
</template>
