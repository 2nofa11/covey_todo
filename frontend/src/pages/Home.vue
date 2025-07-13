<script setup lang="ts">
import type { QuadrantType } from '@/types'
import { computed, onMounted, toRef } from 'vue'
import BigRocksModal from '@/components/modals/BigRocksModal.vue'
import OnboardingModal from '@/components/modals/OnboardingModal.vue'
import QuickCaptureModal from '@/components/modals/QuickCaptureModal.vue'
import MultiProgressBar from '@/components/ui/MultiProgressBar.vue'
import TaskCard from '@/components/ui/TaskCard.vue'
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
const { todayTasks, getQuadrantTasks, quadrantCounts, getQuadrant } = useTaskFilters(tasksRef)
const { quadrantRatios } = useTaskStats(tasksRef)

// クワドラントタスクを取得（リアクティブ）
const quadrantTasks = computed(() =>
  getQuadrantTasks(uiStore.currentQuadrant).value,
)

// キーボードショートカット
useKeyboardShortcuts()

// ユーティリティ関数
function getQuadrantLabel(quadrant: QuadrantType): string {
  const labels = {
    do: '緊急',
    plan: '重要',
    delegate: '委任',
    eliminate: '削除',
  }
  return labels[quadrant]
}

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
            <button
              class="bg-tomato text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
              :class="uiStore.currentView === 'today' ? 'ring-2 ring-offset-2 ring-tomato' : ''"
              @click="uiStore.switchToTodayView()"
            >
              <span>📅</span>
              <span class="hidden sm:inline">Today</span>
            </button>
            <button
              class="bg-iceberg text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
              :class="uiStore.currentView === 'week' ? 'ring-2 ring-offset-2 ring-iceberg' : ''"
              @click="uiStore.switchToWeekView()"
            >
              <span>📊</span>
              <span class="hidden sm:inline">Week</span>
            </button>

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
          <button
            class="py-2 px-4 rounded-lg text-center font-medium transition-colors"
            :class="[
              uiStore.currentView === 'today' ? 'bg-tomato text-white' : 'bg-white text-gray-700 hover:bg-gray-50',
            ]"
            @click="uiStore.switchToTodayView()"
          >
            今日ビュー
          </button>
          <button
            class="py-2 px-4 rounded-lg text-center font-medium transition-colors"
            :class="[
              uiStore.currentView === 'week' ? 'bg-iceberg text-white' : 'bg-white text-gray-700 hover:bg-gray-50',
            ]"
            @click="uiStore.switchToWeekView()"
          >
            週間ビュー
          </button>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- メインコンテンツエリア -->
        <div class="lg:col-span-3">
          <!-- 今日ビュー -->
          <div v-if="uiStore.currentView === 'today'" class="space-y-6">
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

          <!-- 週間ビュー -->
          <div v-else-if="uiStore.currentView === 'week'" class="space-y-6">
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
