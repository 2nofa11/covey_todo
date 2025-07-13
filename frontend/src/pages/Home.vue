<script setup lang="ts">
import type { QuadrantType } from '@/types'
import { onMounted, toRef } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import TaskCard from '@/components/ui/TaskCard.vue'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useTaskFilters } from '@/composables/useTaskFilters'
import { useTaskStats } from '@/composables/useTaskStats'
import { useBigRocksStore } from '@/stores/useBigRocksStore'
import { useTodoStore } from '@/stores/useTodoStore'
import { useUIStore } from '@/stores/useUIStore'

// ストアとcomposableを使用
const todoStore = useTodoStore()
const bigRocksStore = useBigRocksStore()
const uiStore = useUIStore()

// フィルタリングと統計（refに変換）
const tasksRef = toRef(todoStore, 'tasks')
const { todayTasks, getQuadrantTasks, quadrantCounts, q2Ratio, getQuadrant } = useTaskFilters(tasksRef)
const { stats } = useTaskStats(tasksRef)

// クワドラントタスクを取得
const quadrantTasks = getQuadrantTasks(uiStore.currentQuadrant)

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

// 簡潔なアクション関数
function handleQuickCapture() {
  const title = uiStore.taskInput.trim()
  if (title) {
    todoStore.addTask(title, uiStore.captureImportant, uiStore.captureUrgent)
    uiStore.toggleQuickCapture(false)
    uiStore.resetCaptureState()
    uiStore.announceStatus('新しいタスクを追加しました')
  }
}

function handleBigRocks(e: Event) {
  e.preventDefault()
  const formData = new FormData(e.target as HTMLFormElement)
  const newBigRocks: Record<string, string[]> = {}
  const roles = ['work', 'family', 'health', 'personal']

  roles.forEach((role) => {
    for (let i = 0; i < 3; i++) {
      const value = formData.get(`${role}-${i}`) as string
      if (value?.trim()) {
        if (!newBigRocks[role])
          newBigRocks[role] = []
        newBigRocks[role][i] = value.trim()
      }
    }
  })

  bigRocksStore.updateBigRocks(newBigRocks)
  uiStore.toggleBigRocks(false)
}

function addTutorialTask() {
  const title = uiStore.tutorialTaskInput.trim()
  if (title) {
    todoStore.addTask(title, true, false)
    uiStore.tutorialTaskInput = ''
    // 即座にオンボーディングを完了してダイアログを閉じる
    finishOnboarding()
  }
}

function finishOnboarding() {
  localStorage.setItem('coveyOnboarded', 'true')
  uiStore.toggleOnboarding(false)
  uiStore.resetOnboarding()
}

onMounted(() => {
  // オンボーディングの初期化
  const onboarded = localStorage.getItem('coveyOnboarded')
  if (!onboarded) {
    uiStore.toggleOnboarding(true)
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
              @click="uiStore.toggleQuickCapture(true)"
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
                  @click="uiStore.toggleQuickCapture(true)"
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
                <button
                  class="bg-iceberg text-white px-3 py-1 rounded text-sm hover:opacity-90 transition-opacity"
                  @click="uiStore.toggleQuickCapture(true)"
                >
                  追加
                </button>
              </div>

              <div v-if="quadrantTasks.length === 0" class="text-center py-8 text-gray-500">
                <p>このクワドラントにはタスクがありません</p>
                <button
                  class="mt-4 bg-iceberg text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  @click="uiStore.toggleQuickCapture(true)"
                >
                  新しいタスクを追加
                </button>
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
                @click="uiStore.toggleBigRocks(true)"
              >
                編集
              </button>
            </div>

            <div v-if="bigRocksStore.allBigRocks.length === 0" class="text-gray-500 text-sm">
              <p>まだ設定されていません</p>
              <button
                class="mt-2 text-iceberg hover:underline text-sm"
                @click="uiStore.toggleBigRocks(true)"
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
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">未完了タスク</span>
                <span class="font-medium">{{ stats.totalTasks }}件</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">今日完了</span>
                <span class="font-medium">{{ stats.completedToday }}件</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">高優先度</span>
                <span class="font-medium">{{ stats.highPriority }}件</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">第2領域の比率</span>
                <span class="font-medium">{{ q2Ratio }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- クイックキャプチャモーダル -->
    <BaseModal
      v-model="uiStore.showQuickCapture"
      title="新しいタスクを追加"
    >
      <form @submit.prevent="handleQuickCapture">
        <div class="mb-4">
          <label for="taskInput" class="block text-sm font-medium text-gray-700 mb-2">
            タスク名
          </label>
          <input
            id="taskInput"
            v-model="uiStore.taskInput"
            type="text"
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iceberg focus:border-iceberg"
            placeholder="タスクを入力してください..."
            autofocus
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
              :aria-checked="uiStore.captureImportant"
              aria-label="重要なタスクとしてマーク"
              class="priority-toggle flex items-center justify-center py-3 px-4 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-iceberg focus:ring-offset-2"
              :class="[
                uiStore.captureImportant ? 'border-iceberg bg-iceberg text-white' : 'border-gray-200 hover:border-iceberg',
              ]"
              @click="uiStore.captureImportant = !uiStore.captureImportant"
              @keydown.space.prevent="uiStore.captureImportant = !uiStore.captureImportant"
              @keydown.enter.prevent="uiStore.captureImportant = !uiStore.captureImportant"
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
              :aria-checked="uiStore.captureUrgent"
              aria-label="緊急なタスクとしてマーク"
              class="priority-toggle flex items-center justify-center py-3 px-4 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-tomato focus:ring-offset-2"
              :class="[
                uiStore.captureUrgent ? 'border-tomato bg-tomato text-white' : 'border-gray-200 hover:border-tomato',
              ]"
              @click="uiStore.captureUrgent = !uiStore.captureUrgent"
              @keydown.space.prevent="uiStore.captureUrgent = !uiStore.captureUrgent"
              @keydown.enter.prevent="uiStore.captureUrgent = !uiStore.captureUrgent"
            >
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span class="font-medium">緊急</span>
            </button>
          </div>
          <div v-show="uiStore.captureImportant || uiStore.captureUrgent" class="mt-3 p-3 rounded-lg bg-gray-50">
            <div class="flex items-center">
              <div
                class="w-4 h-4 rounded mr-2"
                :class="[
                  getQuadrant(uiStore.captureImportant, uiStore.captureUrgent) === 'do' ? 'bg-tomato'
                  : getQuadrant(uiStore.captureImportant, uiStore.captureUrgent) === 'plan' ? 'bg-iceberg'
                    : getQuadrant(uiStore.captureImportant, uiStore.captureUrgent) === 'delegate' ? 'bg-caramel'
                      : 'bg-gray-400',
                ]"
              />
              <span class="text-sm font-medium">
                {{ getQuadrant(uiStore.captureImportant, uiStore.captureUrgent) === 'do' ? 'Do - Important & Urgent'
                  : getQuadrant(uiStore.captureImportant, uiStore.captureUrgent) === 'plan' ? 'Plan - Important Only'
                    : getQuadrant(uiStore.captureImportant, uiStore.captureUrgent) === 'delegate' ? 'Delegate - Urgent Only'
                      : 'Eliminate - Neither Important nor Urgent' }}
              </span>
            </div>
            <p class="text-xs text-gray-600 mt-1">
              {{ getQuadrant(uiStore.captureImportant, uiStore.captureUrgent) === 'do' ? 'Handle immediately - crisis or emergency'
                : getQuadrant(uiStore.captureImportant, uiStore.captureUrgent) === 'plan' ? 'Schedule for later - prevents future crises'
                  : getQuadrant(uiStore.captureImportant, uiStore.captureUrgent) === 'delegate' ? 'Let someone else handle this'
                    : 'Consider if this task is necessary' }}
            </p>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            @click="uiStore.toggleQuickCapture(false)"
          >
            キャンセル
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-iceberg text-white rounded-lg hover:opacity-90 transition-opacity"
            :disabled="!uiStore.taskInput.trim()"
          >
            追加
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Big Rocksモーダル -->
    <BaseModal
      v-model="uiStore.showBigRocks"
      title="週の最重要事項を設定"
      max-width="max-w-2xl"
    >
      <form @submit.prevent="handleBigRocks">
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
                :name="`work-${i - 1}`"
                type="text"
                class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-iceberg focus:border-iceberg"
                :placeholder="`仕事の重要事項 ${i}`"
                :value="bigRocksStore.bigRocks.work?.[i - 1] || ''"
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
                :name="`family-${i - 1}`"
                type="text"
                class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-iceberg focus:border-iceberg"
                :placeholder="`家族の重要事項 ${i}`"
                :value="bigRocksStore.bigRocks.family?.[i - 1] || ''"
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
                :name="`health-${i - 1}`"
                type="text"
                class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-iceberg focus:border-iceberg"
                :placeholder="`健康の重要事項 ${i}`"
                :value="bigRocksStore.bigRocks.health?.[i - 1] || ''"
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
                :name="`personal-${i - 1}`"
                type="text"
                class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-iceberg focus:border-iceberg"
                :placeholder="`個人の重要事項 ${i}`"
                :value="bigRocksStore.bigRocks.personal?.[i - 1] || ''"
              >
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-8">
          <button
            type="button"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            @click="uiStore.toggleBigRocks(false)"
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
    </BaseModal>

    <!-- オンボーディングモーダル -->
    <BaseModal
      v-model="uiStore.showOnboarding"
      max-width="max-w-xl"
    >
      <!-- ステップ1: 歓迎 -->
      <div v-if="uiStore.currentOnboardingStep === 1" class="text-center">
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
            @click="uiStore.nextOnboardingStep()"
          >
            始める
          </button>
        </div>
      </div>

      <!-- ステップ2: マトリックス説明 -->
      <div v-if="uiStore.currentOnboardingStep === 2" class="text-center">
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
            @click="uiStore.prevOnboardingStep()"
          >
            戻る
          </button>
          <button
            class="px-6 py-2 bg-iceberg text-white rounded-lg hover:opacity-90 transition-opacity"
            @click="uiStore.nextOnboardingStep()"
          >
            次へ
          </button>
        </div>
      </div>

      <!-- ステップ3: 実際にタスクを追加 -->
      <div v-if="uiStore.currentOnboardingStep === 3">
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
              v-model="uiStore.tutorialTaskInput"
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
              @click="uiStore.prevOnboardingStep()"
            >
              戻る
            </button>
            <button
              type="submit"
              class="px-6 py-2 bg-iceberg text-white rounded-lg hover:opacity-90 transition-opacity"
              :disabled="!uiStore.tutorialTaskInput.trim()"
            >
              追加して完了
            </button>
          </div>
        </form>
      </div>

      <!-- 完了画面 -->
      <div v-if="uiStore.currentOnboardingStep > 3" class="text-center">
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
    </BaseModal>
  </div>
</template>
