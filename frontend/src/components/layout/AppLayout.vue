<script setup lang="ts">
import { onMounted, toRef } from 'vue'
import BigRocksModal from '@/components/modals/BigRocksModal.vue'
import OnboardingModal from '@/components/modals/OnboardingModal.vue'
import QuickCaptureModal from '@/components/modals/QuickCaptureModal.vue'
import MultiProgressBar from '@/components/ui/MultiProgressBar.vue'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useModal } from '@/composables/useModal'
import { useTaskFilters } from '@/composables/useTaskFilters'
import { useTaskStats } from '@/composables/useTaskStats'
import { useBigRocksStore } from '@/stores/useBigRocksStore'
import { useTodoStore } from '@/stores/useTodoStore'
import { useUIStore } from '@/stores/useUIStore'

// ストアとcomposableを使用
const todoStore = useTodoStore()
const bigRocksStore = useBigRocksStore()
const uiStore = useUIStore()
const modal = useModal()

// フィルタリングと統計（refに変換）
const tasksRef = toRef(todoStore, 'tasks')
const { getQuadrant } = useTaskFilters(tasksRef)
const { quadrantRatios } = useTaskStats(tasksRef)

// キーボードショートカット
useKeyboardShortcuts()

// モーダル制御関数
function openQuickCapture() {
  modal.open(QuickCaptureModal, {
    getQuadrant,
    onTaskAdded: (title: string, important: boolean, urgent: boolean) => {
      todoStore.addTask(title, important, urgent)
      uiStore.announceStatus('新しいタスクを追加しました')
    },
  })
}

function openBigRocks() {
  modal.open(BigRocksModal, {
    initialBigRocks: bigRocksStore.bigRocks,
    onBigRocksUpdated: (bigRocks: Record<string, string[]>) => {
      bigRocksStore.updateBigRocks(bigRocks)
    },
  })
}

function openOnboarding() {
  modal.open(OnboardingModal, {
    onTutorialTaskAdded: (title: string) => {
      todoStore.addTask(title, true, false)
    },
    onOnboardingCompleted: () => {
      // オンボーディング完了処理は既にOnboardingModal内で行われる
    },
  })
}

onMounted(() => {
  // オンボーディングの初期化
  const onboarded = localStorage.getItem('coveyOnboarded')
  if (!onboarded) {
    openOnboarding()
  }
})
</script>

<template>
  <div class="min-h-screen bg-bisque">
    <!-- ステータス通知用（スクリーンリーダー用） -->
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ uiStore.statusMessage }}
    </div>

    <!-- メインコンテンツ -->
    <div class="max-w-7xl mx-auto px-4 py-6">
      <!-- ヘッダー -->
      <header class="mb-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              Covey Todo
            </h1>
            <p class="text-gray-600">
              重要度・緊急度マトリックスでタスクを整理しましょう
            </p>
          </div>

          <!-- クイックアクション -->
          <div class="flex items-center space-x-3">
            <router-link
              to="/"
              class="bg-tomato text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
              :class="$route.name === 'Index' ? 'ring-2 ring-offset-2 ring-tomato' : ''"
            >
              <span>📅</span>
              <span class="hidden sm:inline">Today</span>
            </router-link>
            <router-link
              to="/week"
              class="bg-iceberg text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
              :class="$route.name === 'Week' ? 'ring-2 ring-offset-2 ring-iceberg' : ''"
            >
              <span>📊</span>
              <span class="hidden sm:inline">Week</span>
            </router-link>

            <button
              class="bg-iceberg text-white p-3 rounded-full hover:opacity-90 transition-opacity text-2xl"
              aria-label="新しいタスクを追加"
              title="新しいタスクを追加 (N キー)"
              @click="openQuickCapture"
            >
              +
            </button>
          </div>
        </div>

        <!-- モバイル用ビュー切り替え -->
        <div class="sm:hidden mt-4 grid grid-cols-2 gap-2">
          <router-link
            to="/"
            class="py-2 px-4 rounded-lg text-center font-medium transition-colors block"
            :class="[
              $route.name === 'Index' ? 'bg-tomato text-white' : 'bg-white text-gray-700 hover:bg-gray-50',
            ]"
          >
            今日ビュー
          </router-link>
          <router-link
            to="/week"
            class="py-2 px-4 rounded-lg text-center font-medium transition-colors block"
            :class="[
              $route.name === 'Week' ? 'bg-iceberg text-white' : 'bg-white text-gray-700 hover:bg-gray-50',
            ]"
          >
            週間ビュー
          </router-link>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- メインコンテンツエリア -->
        <div class="lg:col-span-3">
          <router-view />
        </div>

        <!-- サイドバー -->
        <div class="space-y-6">
          <!-- Big Rocks -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900">
                週の最重要事項
              </h3>
              <button
                class="text-iceberg hover:text-iceberg-dark text-sm"
                @click="openBigRocks"
              >
                編集
              </button>
            </div>

            <div v-if="bigRocksStore.allBigRocks.length === 0" class="text-gray-500 text-sm">
              <p>まだ設定されていません</p>
              <button
                class="mt-2 text-iceberg hover:underline text-sm"
                @click="openBigRocks"
              >
                設定する
              </button>
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="bigRock in bigRocksStore.allBigRocks"
                :key="`${bigRock.role}-${bigRock.rock}`"
                class="text-sm"
              >
                <span class="font-medium text-gray-700">{{ bigRock.role }}:</span>
                <span class="text-gray-600 ml-1">{{ bigRock.rock }}</span>
              </div>
            </div>
          </div>

          <!-- 統計 -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h3 class="font-semibold text-gray-900 mb-4">
              統計
            </h3>
            <MultiProgressBar
              :segments="[
                { percentage: quadrantRatios.do, color: 'bg-tomato', label: '今すぐやる' },
                { percentage: quadrantRatios.plan, color: 'bg-iceberg', label: '計画する' },
                { percentage: quadrantRatios.delegate, color: 'bg-caramel', label: '人に任せる' },
                { percentage: quadrantRatios.eliminate, color: 'bg-gray-400', label: 'やらない' },
              ]"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
