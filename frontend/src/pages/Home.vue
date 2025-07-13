<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'

// アプリの状態
const tasks = ref<Task[]>([])
const bigRocks = ref<BigRocks>({})
const currentQuadrant = ref<QuadrantType>('do')
const currentView = ref<ViewType>('today')
const captureImportant = ref(false)
const captureUrgent = ref(false)
const currentOnboardingStep = ref(1)

// モーダル表示状態
const showQuickCaptureModal = ref(false)
const showBigRocksModal = ref(false)
const showOnboardingModal = ref(false)
const showWeeklyReviewModal = ref(false)

// フォーム入力
const taskInput = ref('')
const tutorialTaskInput = ref('')

// 型定義
interface Task {
  id: number
  title: string
  important: boolean
  urgent: boolean
  completed: boolean
  createdAt: string
  completedAt?: string
}

interface BigRocks {
  [role: string]: string[]
}

type QuadrantType = 'do' | 'plan' | 'delegate' | 'eliminate'
type ViewType = 'today' | 'week'

// 計算されたプロパティ
const todayTasks = computed(() =>
  tasks.value.filter(t => !t.completed && (t.important || t.urgent)),
)

const quadrantTasks = computed(() =>
  tasks.value.filter(t => getQuadrant(t.important, t.urgent) === currentQuadrant.value),
)

const quadrantCounts = computed(() => ({
  do: tasks.value.filter(t => getQuadrant(t.important, t.urgent) === 'do' && !t.completed).length,
  plan: tasks.value.filter(t => getQuadrant(t.important, t.urgent) === 'plan' && !t.completed).length,
  delegate: tasks.value.filter(t => getQuadrant(t.important, t.urgent) === 'delegate' && !t.completed).length,
  eliminate: tasks.value.filter(t => getQuadrant(t.important, t.urgent) === 'eliminate' && !t.completed).length,
}))

const q2Ratio = computed(() => {
  if (todayTasks.value.length === 0)
    return 0
  const q2Tasks = todayTasks.value.filter(t => t.important && !t.urgent)
  return Math.round((q2Tasks.length / todayTasks.value.length) * 100)
})

const stats = computed(() => ({
  totalTasks: tasks.value.filter(t => !t.completed).length,
  completedToday: tasks.value.filter((t) => {
    if (!t.completed || !t.completedAt)
      return false
    return isToday(new Date(t.completedAt))
  }).length,
  highPriority: tasks.value.filter(t => !t.completed && t.important && t.urgent).length,
}))

const allBigRocks = computed(() => {
  const rocks: Array<{ role: string, rock: string }> = []
  Object.keys(bigRocks.value).forEach((role) => {
    if (bigRocks.value[role]) {
      bigRocks.value[role].forEach((rock) => {
        if (rock)
          rocks.push({ role, rock })
      })
    }
  })
  return rocks
})

// ユーティリティ関数
function getQuadrant(important: boolean, urgent: boolean): QuadrantType {
  if (important && urgent)
    return 'do'
  if (important && !urgent)
    return 'plan'
  if (!important && urgent)
    return 'delegate'
  return 'eliminate'
}

function isToday(date: Date): boolean {
  const today = new Date()
  return date.getDate() === today.getDate()
    && date.getMonth() === today.getMonth()
    && date.getFullYear() === today.getFullYear()
}

function getQuadrantColor(quadrant: QuadrantType): string {
  const colors = {
    do: 'bg-tomato text-white',
    plan: 'bg-iceberg text-white',
    delegate: 'bg-caramel text-gray-800',
    eliminate: 'bg-gray-400 text-white',
  }
  return colors[quadrant]
}

function getQuadrantLabel(quadrant: QuadrantType): string {
  const labels = {
    do: '緊急',
    plan: '重要',
    delegate: '委任',
    eliminate: '削除',
  }
  return labels[quadrant]
}

// データ管理
function saveData() {
  localStorage.setItem('coveyTasks', JSON.stringify(tasks.value))
  localStorage.setItem('coveyBigRocks', JSON.stringify(bigRocks.value))
}

function loadData() {
  const savedTasks = localStorage.getItem('coveyTasks')
  if (savedTasks) {
    tasks.value = JSON.parse(savedTasks)
  }

  const savedBigRocks = localStorage.getItem('coveyBigRocks')
  if (savedBigRocks) {
    bigRocks.value = JSON.parse(savedBigRocks)
  }
}

// タスク管理
function addTask(title: string, important: boolean, urgent: boolean) {
  const task: Task = {
    id: Date.now(),
    title,
    important,
    urgent,
    completed: false,
    createdAt: new Date().toISOString(),
  }
  tasks.value.push(task)
  saveData()
}

function toggleCompleted(taskId: number) {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.completed = !task.completed
    if (task.completed) {
      task.completedAt = new Date().toISOString()
    }
    else {
      delete task.completedAt
    }
    saveData()
  }
}

function toggleImportant(taskId: number) {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.important = !task.important
    saveData()
  }
}

function toggleUrgent(taskId: number) {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.urgent = !task.urgent
    saveData()
  }
}

function deleteTask(taskId: number) {
  tasks.value = tasks.value.filter(t => t.id !== taskId)
  saveData()
}

// モーダル管理
function openQuickCapture() {
  showQuickCaptureModal.value = true
  nextTick(() => {
    const input = document.getElementById('taskInput') as HTMLInputElement
    if (input)
      input.focus()
  })
}

function closeQuickCapture() {
  showQuickCaptureModal.value = false
  taskInput.value = ''
  resetCaptureState()
}

function resetCaptureState() {
  captureImportant.value = false
  captureUrgent.value = false
}

function handleQuickCapture() {
  const title = taskInput.value.trim()
  if (title) {
    addTask(title, captureImportant.value, captureUrgent.value)
    closeQuickCapture()
  }
}

function toggleImportantCapture() {
  captureImportant.value = !captureImportant.value
}

function toggleUrgentCapture() {
  captureUrgent.value = !captureUrgent.value
}

// ビュー切り替え
function switchToTodayView() {
  currentView.value = 'today'
}

function switchToWeekView() {
  currentView.value = 'week'
}

function switchQuadrant(quadrant: QuadrantType) {
  currentQuadrant.value = quadrant
}

// Big Rocks管理
function openBigRocks() {
  showBigRocksModal.value = true
}

function closeBigRocks() {
  showBigRocksModal.value = false
}

function handleBigRocks(e: Event) {
  e.preventDefault()

  // フォームデータからBig Rocksを更新
  const formData = new FormData(e.target as HTMLFormElement)
  const newBigRocks: BigRocks = {}
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

  bigRocks.value = newBigRocks
  saveData()
  closeBigRocks()
}

// オンボーディング
function showOnboarding() {
  showOnboardingModal.value = true
  currentOnboardingStep.value = 1
}

function nextOnboardingStep() {
  if (currentOnboardingStep.value < 3) {
    currentOnboardingStep.value++
  }
}

function prevOnboardingStep() {
  if (currentOnboardingStep.value > 1) {
    currentOnboardingStep.value--
  }
}

function addTutorialTask() {
  const title = tutorialTaskInput.value.trim()
  if (title) {
    addTask(title, true, false)
    tutorialTaskInput.value = ''
    setTimeout(() => {
      nextOnboardingStep()
    }, 500)
  }
}

function finishOnboarding() {
  localStorage.setItem('coveyOnboarded', 'true')
  showOnboardingModal.value = false
}

// キーボードショートカット
function handleKeyboard(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
    return
  }

  switch (e.key.toLowerCase()) {
    case 'n':
      e.preventDefault()
      openQuickCapture()
      break
    case 'escape':
      closeAllModals()
      break
  }
}

function closeAllModals() {
  showQuickCaptureModal.value = false
  showBigRocksModal.value = false
  showWeeklyReviewModal.value = false
  showOnboardingModal.value = false
}

// 初期化
onMounted(() => {
  loadData()

  // 初回ユーザーの場合はオンボーディングを表示
  if (!localStorage.getItem('coveyOnboarded')) {
    setTimeout(() => {
      showOnboarding()
    }, 1000)
  }

  // キーボードイベントリスナー
  document.addEventListener('keydown', handleKeyboard)
})
</script>

<template>
  <div class="bg-white min-h-screen font-sans leading-relaxed-jp tracking-jp">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-caramel">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <div class="flex items-center space-x-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">
                Covey Todo
              </h1>
              <p class="text-sm text-gray-500 mt-1">
                重要度・緊急度マトリックス
              </p>
            </div>
            <div class="hidden md:flex space-x-4">
              <button
                class="px-3 py-1 rounded-md font-medium flex items-center space-x-1" :class="[
                  currentView === 'today' ? 'bg-iceberg text-white' : 'bg-gray-200 text-gray-700',
                ]"
                @click="switchToTodayView"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>
                <span>今日</span>
              </button>
              <button
                class="px-3 py-1 rounded-md font-medium flex items-center space-x-1" :class="[
                  currentView === 'week' ? 'bg-iceberg text-white' : 'bg-gray-200 text-gray-700',
                ]"
                @click="switchToWeekView"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6zm0 4a1 1 0 100 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>
                <span>週間</span>
              </button>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <button
              class="bg-tomato hover:bg-red-600 text-white p-2 rounded-full font-bold text-xl"
              @click="openQuickCapture"
            >
              ＋
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Mobile View Toggle -->
      <div class="md:hidden mb-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <div class="grid grid-cols-2 gap-1">
            <button
              class="mobile-view-toggle px-4 py-3 rounded-md font-medium text-sm flex items-center justify-center space-x-2 transition-all duration-200" :class="[
                currentView === 'today' ? 'bg-iceberg text-white' : 'bg-gray-100 text-gray-700',
              ]"
              @click="switchToTodayView"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
              </svg>
              <span>今日</span>
            </button>
            <button
              class="mobile-view-toggle px-4 py-3 rounded-md font-medium text-sm flex items-center justify-center space-x-2 transition-all duration-200" :class="[
                currentView === 'week' ? 'bg-iceberg text-white' : 'bg-gray-100 text-gray-700',
              ]"
              @click="switchToWeekView"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6zm0 4a1 1 0 100 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
              </svg>
              <span>週間</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Quadrant Navigation -->
      <nav v-show="currentView === 'week'" class="mb-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            v-for="quadrant in ['do', 'plan', 'delegate', 'eliminate']"
            :key="quadrant"
            class="quadrant-tab py-3 px-4 rounded-lg font-semibold flex items-center justify-between" :class="[
              quadrant === 'do' ? 'bg-quadrant-do text-white'
              : quadrant === 'plan' ? 'bg-quadrant-plan text-white'
                : quadrant === 'delegate' ? 'bg-quadrant-delegate text-gray-800'
                  : 'bg-quadrant-eliminate text-gray-700',
              currentQuadrant === quadrant ? 'ring-2 ring-offset-2' : '',
            ]"
            @click="switchQuadrant(quadrant as QuadrantType)"
          >
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path v-if="quadrant === 'do'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd" />
                <path v-else-if="quadrant === 'plan'" fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clip-rule="evenodd" />
                <path v-else-if="quadrant === 'delegate'" fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                <path v-else fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
              </svg>
              <div>
                <span class="block font-medium">
                  {{ quadrant === 'do' ? '今すぐやる'
                    : quadrant === 'plan' ? '計画する'
                      : quadrant === 'delegate' ? '人に任せる' : 'やらない' }}
                </span>
                <span class="text-xs opacity-90">
                  {{ quadrant === 'do' ? '重要 & 緊急'
                    : quadrant === 'plan' ? '重要のみ'
                      : quadrant === 'delegate' ? '緊急のみ' : '重要でも緊急でもない' }}
                </span>
              </div>
            </div>
            <span
              class="badge rounded-full px-2 py-1 text-xs" :class="[
                quadrant === 'do' ? 'bg-red-700 text-white'
                : quadrant === 'plan' ? 'bg-blue-700 text-white'
                  : quadrant === 'delegate' ? 'bg-yellow-700 text-white'
                    : 'bg-gray-600 text-white',
              ]"
            >
              {{ quadrantCounts[quadrant as QuadrantType] }}
            </span>
          </button>
        </div>
      </nav>

      <!-- Main Views -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Task Lists -->
        <div class="lg:col-span-3">
          <!-- Today View -->
          <div v-show="currentView === 'today'" class="view-container">
            <div class="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 class="text-xl font-bold text-gray-900 mb-8">
                今日の重点項目 <span class="text-base font-normal text-gray-600">(Today's Focus)</span>
              </h2>
              <div class="mb-4 bg-gray-100 rounded-lg p-3">
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                  <span>第2領域の比率 <small class="text-xs">(重要・非緊急)</small></span>
                  <span>{{ q2Ratio }}%</span>
                </div>
                <div class="w-full bg-gray-300 rounded-full h-2">
                  <div class="bg-iceberg h-2 rounded-full" :style="`width: ${q2Ratio}%`" />
                </div>
              </div>

              <div v-if="todayTasks.length === 0" class="text-center py-12">
                <div class="mb-6">
                  <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-iceberg to-blue-500 rounded-full flex items-center justify-center">
                    <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">
                    生産性を向上させる準備はできていますか？ 🚀
                  </h3>
                  <p class="text-gray-600 mb-6 max-w-md mx-auto">
                    最初のタスクを追加することから始めましょう。実証済みの重要度・緊急度マトリックスを使って整理をお手伝いします。
                  </p>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div class="flex items-center mb-2">
                        <div class="w-6 h-6 bg-tomato rounded flex items-center justify-center mr-2">
                          <span class="text-white text-xs font-bold">!</span>
                        </div>
                        <span class="font-semibold text-red-900">重要 & 緊急</span>
                      </div>
                      <p class="text-xs text-red-700">
                        危機、緊急事態、期限主導のプロジェクト
                      </p>
                    </div>
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div class="flex items-center mb-2">
                        <div class="w-6 h-6 bg-iceberg rounded flex items-center justify-center mr-2">
                          <span class="text-white text-xs font-bold">★</span>
                        </div>
                        <span class="font-semibold text-blue-900">重要のみ</span>
                      </div>
                      <p class="text-xs text-blue-700">
                        予防、計画、個人的成長
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  class="bg-gradient-to-r from-tomato to-iceberg hover:from-red-600 hover:to-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                  @click="openQuickCapture"
                >
                  ＋ 最初のタスクを追加
                </button>
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="task in todayTasks"
                  :key="task.id"
                  class="task-card bg-white border-l-4 p-6 rounded-xl shadow-sm" :class="[
                    getQuadrant(task.important, task.urgent) === 'do' ? 'border-tomato' : 'border-iceberg',
                  ]"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        :checked="task.completed"
                        class="w-5 h-5 text-iceberg rounded focus:ring-iceberg"
                        @change="toggleCompleted(task.id)"
                      >
                      <span :class="task.completed ? 'line-through text-gray-500' : 'text-gray-900'">
                        {{ task.title }}
                      </span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="px-2 py-1 text-xs rounded-full" :class="[getQuadrantColor(getQuadrant(task.important, task.urgent))]">
                        {{ getQuadrantLabel(getQuadrant(task.important, task.urgent)) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quadrant Views -->
          <div v-show="currentView === 'week'" class="view-container">
            <div class="bg-white rounded-lg shadow-md p-8">
              <h2 class="text-xl font-bold text-gray-900 mb-8">
                <span v-if="currentQuadrant === 'do'">今すぐやる <span class="text-base font-normal text-gray-600">(Do - Important & Urgent)</span></span>
                <span v-else-if="currentQuadrant === 'plan'">計画する <span class="text-base font-normal text-gray-600">(Plan - Important Only)</span></span>
                <span v-else-if="currentQuadrant === 'delegate'">人に任せる <span class="text-base font-normal text-gray-600">(Delegate - Urgent Only)</span></span>
                <span v-else>やらない <span class="text-base font-normal text-gray-600">(Eliminate - Neither Important nor Urgent)</span></span>
              </h2>

              <div v-if="quadrantTasks.length === 0" class="text-center py-12 text-gray-500">
                <div class="mb-6">
                  <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">
                    この領域にはまだタスクがありません
                  </h3>
                  <p class="text-sm text-gray-600 mb-4">
                    <span v-if="currentQuadrant === 'do'">危機的状況や期限主導のプロジェクトで、即座に対応が必要です。</span>
                    <span v-else-if="currentQuadrant === 'plan'">危機を防ぎ、長期的な成功を築く戦略的な活動です。</span>
                    <span v-else-if="currentQuadrant === 'delegate'">緊急に見えるが、主要な目標に貢献しない活動です。</span>
                    <span v-else>最小限に抑えるか、排除すべき時間の無駄な活動です。</span>
                  </p>
                  <div class="bg-blue-50 rounded-lg p-4 text-left">
                    <h4 class="font-medium text-blue-900 mb-2">
                      💡 この領域に適したタスク例：
                    </h4>
                    <ul class="text-sm text-blue-800 space-y-1">
                      <li v-if="currentQuadrant === 'do'">
                        • プロダクトローンチ前の重大なバグ修正
                      </li>
                      <li v-if="currentQuadrant === 'do'">
                        • 明日が期限の税務申告書提出
                      </li>
                      <li v-if="currentQuadrant === 'do'">
                        • 顧客からの緊急クレーム対応
                      </li>
                      <li v-if="currentQuadrant === 'plan'">
                        • 新しいプログラミング言語の学習
                      </li>
                      <li v-if="currentQuadrant === 'plan'">
                        • 四半期チーム目標の策定
                      </li>
                      <li v-if="currentQuadrant === 'plan'">
                        • 運動と健康管理
                      </li>
                      <li v-if="currentQuadrant === 'delegate'">
                        • 重要でないメールへの返信
                      </li>
                      <li v-if="currentQuadrant === 'delegate'">
                        • 任意参加の会議への出席
                      </li>
                      <li v-if="currentQuadrant === 'delegate'">
                        • 日常的な管理業務の処理
                      </li>
                      <li v-if="currentQuadrant === 'eliminate'">
                        • 過度なSNS閲覧
                      </li>
                      <li v-if="currentQuadrant === 'eliminate'">
                        • ランダムなYouTube動画視聴
                      </li>
                      <li v-if="currentQuadrant === 'eliminate'">
                        • 既に整理済みの物の再整理
                      </li>
                    </ul>
                  </div>
                </div>
                <button
                  class="bg-gradient-to-r from-tomato to-iceberg hover:from-red-600 hover:to-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                  @click="openQuickCapture"
                >
                  ＋ 最初のタスクを追加
                </button>
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="task in quadrantTasks"
                  :key="task.id"
                  class="task-card bg-white border-2 border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        :checked="task.completed"
                        class="w-5 h-5 text-iceberg rounded focus:ring-iceberg"
                        @change="toggleCompleted(task.id)"
                      >
                      <span :class="task.completed ? 'line-through text-gray-500' : 'text-gray-900 font-medium'">
                        {{ task.title }}
                      </span>
                    </div>
                    <button class="text-gray-400 hover:text-red-500" @click="deleteTask(task.id)">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div class="flex items-center space-x-4">
                    <button
                      class="flex items-center space-x-1 px-2 py-1 rounded text-sm" :class="[
                        task.important ? 'bg-iceberg text-white' : 'bg-gray-200 text-gray-600',
                      ]"
                      @click="toggleImportant(task.id)"
                    >
                      <span>★</span>
                      <span>Important</span>
                    </button>
                    <button
                      class="flex items-center space-x-1 px-2 py-1 rounded text-sm" :class="[
                        task.urgent ? 'bg-tomato text-white' : 'bg-gray-200 text-gray-600',
                      ]"
                      @click="toggleUrgent(task.id)"
                    >
                      <span>⚡</span>
                      <span>Urgent</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <!-- Big Rocks -->
          <div class="bg-white rounded-lg shadow-md p-8 mb-8">
            <div class="flex items-center justify-between mb-8">
              <h3 class="text-lg font-semibold text-gray-900">
                最重要事項 <span class="text-sm font-normal text-gray-600">(Big Rocks)</span>
              </h3>
              <button class="text-iceberg hover:text-blue-700" @click="openBigRocks">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div class="space-y-2">
              <div v-if="allBigRocks.length === 0">
                <p class="text-gray-500 text-sm">
                  今週の最重要事項が設定されていません。
                </p>
              </div>
              <div v-else>
                <div
                  v-for="item in allBigRocks"
                  :key="`${item.role}-${item.rock}`"
                  class="bg-gray-50 p-2 rounded border-l-4 border-iceberg"
                >
                  <div class="text-xs text-gray-500 uppercase">
                    {{ item.role }}
                  </div>
                  <div class="text-sm font-medium">
                    {{ item.rock }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="bg-white rounded-lg shadow-md p-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-8">
              簡易統計 <span class="text-sm font-normal text-gray-600">(Quick Stats)</span>
            </h3>
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-600">全タスク数</span>
                <span class="font-semibold">{{ stats.totalTasks }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">今日の完了</span>
                <span class="font-semibold text-green-600">{{ stats.completedToday }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">高優先度</span>
                <span class="font-semibold text-tomato">{{ stats.highPriority }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Capture Modal -->
    <div v-show="showQuickCaptureModal" class="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-lg p-6 w-full max-w-lg border-2 border-caramel shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            新しいタスクを追加 <span class="text-sm font-normal text-gray-600">(Add New Task)</span>
          </h3>
          <form @submit.prevent="handleQuickCapture">
            <input
              id="taskInput"
              v-model="taskInput"
              type="text"
              placeholder="何をする必要がありますか？"
              class="w-full px-4 py-3 border-2 border-iceberg rounded-lg focus:outline-none focus:ring-2 focus:ring-iceberg focus:border-transparent text-lg mb-6"
              autocomplete="off"
            >

            <!-- Priority Selection -->
            <div class="mb-8">
              <p class="text-sm text-gray-600 mb-3">
                このタスクを分類しましょう：
              </p>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class="priority-toggle flex items-center justify-center py-3 px-4 border-2 rounded-lg transition-all duration-200" :class="[
                    captureImportant ? 'border-iceberg bg-iceberg text-white' : 'border-gray-200 hover:border-iceberg',
                  ]"
                  @click="toggleImportantCapture"
                >
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span class="font-medium">重要</span>
                </button>
                <button
                  type="button"
                  class="priority-toggle flex items-center justify-center py-3 px-4 border-2 rounded-lg transition-all duration-200" :class="[
                    captureUrgent ? 'border-tomato bg-tomato text-white' : 'border-gray-200 hover:border-tomato',
                  ]"
                  @click="toggleUrgentCapture"
                >
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <span class="font-medium">緊急</span>
                </button>
              </div>
              <div v-show="captureImportant || captureUrgent" class="mt-3 p-3 rounded-lg bg-gray-50">
                <div class="flex items-center">
                  <div
                    class="w-4 h-4 rounded mr-2" :class="[
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
                class="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                @click="closeQuickCapture"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
                <span>キャンセル</span>
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-iceberg hover:bg-blue-600 text-white rounded-lg font-medium flex items-center space-x-1"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                <span>タスク追加</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Big Rocks Modal -->
    <div v-show="showBigRocksModal" class="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-lg p-6 w-full max-w-2xl border-2 border-caramel max-h-[90vh] overflow-y-auto">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">
            週間最重要事項の設定 <span class="text-base font-normal text-gray-600">(Big Rocks Planner)</span>
          </h3>
          <form @submit="handleBigRocks">
            <div class="space-y-6">
              <div
                v-for="role in [
                  { key: 'work', label: '仕事', labelEn: 'Work' },
                  { key: 'family', label: '家族', labelEn: 'Family' },
                  { key: 'health', label: '健康', labelEn: 'Health' },
                  { key: 'personal', label: '個人', labelEn: 'Personal' },
                ]" :key="role.key" class="role-section"
              >
                <h4 class="font-semibold text-iceberg mb-3">
                  {{ role.label }} <span class="text-sm font-normal text-gray-600">({{ role.labelEn }})</span>
                </h4>
                <div class="space-y-2">
                  <input
                    v-for="i in 3"
                    :key="i"
                    :name="`${role.key}-${i - 1}`"
                    type="text"
                    :placeholder="`最重要事項 ${i}`"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                    :value="bigRocks[role.key]?.[i - 1] || ''"
                  >
                </div>
              </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                class="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                @click="closeBigRocks"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
                <span>キャンセル</span>
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-iceberg hover:bg-blue-600 text-white rounded-lg font-medium flex items-center space-x-1"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clip-rule="evenodd" />
                </svg>
                <span>最重要事項を保存</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Onboarding Modal -->
    <div v-show="showOnboardingModal" class="fixed inset-0 bg-black bg-opacity-60 z-50">
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-xl p-8 w-full max-w-3xl shadow-2xl">
          <!-- Step 1 -->
          <div v-show="currentOnboardingStep === 1" class="onboarding-step">
            <div class="text-center mb-8">
              <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-iceberg to-blue-500 rounded-full flex items-center justify-center">
                <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">
                Covey Todo へようこそ！ 🎉
              </h2>
              <p class="text-gray-600">
                実証済みの時間管理システムを 60 秒で学びましょう
              </p>
            </div>

            <div class="bg-gradient-to-r from-red-50 to-blue-50 rounded-lg p-6 mb-6">
              <h3 class="text-lg font-semibold mb-4">
                重要度・緊急度マトリックス (Covey Matrix)
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-red-100 border border-red-200 rounded-lg p-4">
                  <div class="flex items-center mb-2">
                    <div class="w-6 h-6 bg-tomato rounded flex items-center justify-center mr-3">
                      <span class="text-white text-sm font-bold">1</span>
                    </div>
                    <span class="font-semibold text-red-900">今すぐやる</span>
                  </div>
                  <p class="text-sm text-red-700">
                    重要 & 緊急<br>危機、緊急事態
                  </p>
                </div>
                <div class="bg-blue-100 border border-blue-200 rounded-lg p-4">
                  <div class="flex items-center mb-2">
                    <div class="w-6 h-6 bg-iceberg rounded flex items-center justify-center mr-3">
                      <span class="text-white text-sm font-bold">2</span>
                    </div>
                    <span class="font-semibold text-blue-900">計画する</span>
                  </div>
                  <p class="text-sm text-blue-700">
                    重要のみ<br>予防、計画
                  </p>
                </div>
                <div class="bg-yellow-100 border border-yellow-200 rounded-lg p-4">
                  <div class="flex items-center mb-2">
                    <div class="w-6 h-6 bg-caramel rounded flex items-center justify-center mr-3">
                      <span class="text-gray-800 text-sm font-bold">3</span>
                    </div>
                    <span class="font-semibold text-yellow-900">人に任せる</span>
                  </div>
                  <p class="text-sm text-yellow-700">
                    緊急のみ<br>割り込み、妨害
                  </p>
                </div>
                <div class="bg-gray-100 border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center mb-2">
                    <div class="w-6 h-6 bg-gray-400 rounded flex items-center justify-center mr-3">
                      <span class="text-white text-sm font-bold">4</span>
                    </div>
                    <span class="font-semibold text-gray-700">やらない</span>
                  </div>
                  <p class="text-sm text-gray-600">
                    どちらでもない<br>時間の無駄、些末
                  </p>
                </div>
              </div>
            </div>

            <div class="flex justify-center">
              <button
                class="bg-iceberg hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold"
                @click="nextOnboardingStep"
              >
                わかりました！使い方を教えてください →
              </button>
            </div>
          </div>

          <!-- Step 2 -->
          <div v-show="currentOnboardingStep === 2" class="onboarding-step">
            <div class="text-center mb-8">
              <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-tomato to-iceberg rounded-full flex items-center justify-center">
                <span class="text-white text-2xl">✨</span>
              </div>
              <h2 class="text-xl font-bold text-gray-900 mb-2">
                試してみましょう！
              </h2>
              <p class="text-gray-600">
                最初のタスクを追加して、魔法を体験してください
              </p>
            </div>

            <div class="bg-blue-50 rounded-lg p-6 mb-6">
              <div class="flex items-start space-x-4">
                <div class="w-8 h-8 bg-iceberg rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span class="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 mb-2">
                    やるべきタスクを思い浮かべてください
                  </h4>
                  <p class="text-sm text-gray-600 mb-4">
                    例：「月曜日の会議用プレゼン資料を作る」
                  </p>
                  <div class="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300">
                    <div class="flex items-center space-x-3">
                      <input
                        v-model="tutorialTaskInput"
                        type="text"
                        placeholder="ここにタスクを入力..."
                        class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-iceberg"
                      >
                      <button
                        class="bg-iceberg text-white px-4 py-2 rounded font-medium"
                        @click="addTutorialTask"
                      >
                        追加
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-between">
              <button class="text-gray-500 hover:text-gray-700" @click="prevOnboardingStep">
                ← 戻る
              </button>
              <button class="text-gray-500 hover:text-gray-700" @click="finishOnboarding">
                チュートリアルをスキップ
              </button>
            </div>
          </div>

          <!-- Step 3 -->
          <div v-show="currentOnboardingStep === 3" class="onboarding-step">
            <div class="text-center mb-8">
              <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <span class="text-green-600 text-2xl">🎯</span>
              </div>
              <h2 class="text-xl font-bold text-gray-900 mb-2">
                素晴らしい！準備が整いました
              </h2>
              <p class="text-gray-600">
                覚えておきたい主要機能：
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center mb-2">
                  <span class="text-2xl mr-3">⚡</span>
                  <span class="font-semibold">簡単追加</span>
                </div>
                <p class="text-sm text-gray-600">
                  <kbd class="px-2 py-1 bg-gray-200 rounded text-xs">N</kbd>キーまたは＋ボタンで簡単にタスク追加
                </p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center mb-2">
                  <span class="text-2xl mr-3">📊</span>
                  <span class="font-semibold">今日ビュー</span>
                </div>
                <p class="text-sm text-gray-600">
                  今日最も大切なことに集中
                </p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center mb-2">
                  <span class="text-2xl mr-3">🎯</span>
                  <span class="font-semibold">領域</span>
                </div>
                <p class="text-sm text-gray-600">
                  今すぐやる/計画する/人に任せる/やらないで切り替え
                </p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center mb-2">
                  <span class="text-2xl mr-3">🏔️</span>
                  <span class="font-semibold">重要な取り組み</span>
                </div>
                <p class="text-sm text-gray-600">
                  役割ごとに週間優先事項を設定
                </p>
              </div>
            </div>

            <div class="text-center">
              <button
                class="bg-gradient-to-r from-tomato to-iceberg hover:from-red-600 hover:to-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                @click="finishOnboarding"
              >
                さあ、生産性を向上させましょう！ 🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
