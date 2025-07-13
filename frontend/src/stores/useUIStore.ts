import type { QuadrantType, ViewType } from '@/types'
import { useToggle } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // ビュー状態
  const currentView = ref<ViewType>('today')
  const currentQuadrant = ref<QuadrantType>('do')

  // VueUseのuseToggleでモーダル状態管理
  const [showQuickCapture, toggleQuickCapture] = useToggle(false)
  const [showBigRocks, toggleBigRocks] = useToggle(false)
  const [showOnboarding, toggleOnboarding] = useToggle(false)
  const [showWeeklyReview, toggleWeeklyReview] = useToggle(false)

  // オンボーディング関連
  const currentOnboardingStep = ref(1)

  // タスク入力状態
  const taskInput = ref('')
  const tutorialTaskInput = ref('')
  const captureImportant = ref(false)
  const captureUrgent = ref(false)

  // アクセシビリティ
  const statusMessage = ref('')

  // ビュー切り替え関数
  function switchToTodayView() {
    currentView.value = 'today'
  }

  function switchToWeekView() {
    currentView.value = 'week'
  }

  function switchQuadrant(quadrant: QuadrantType) {
    currentQuadrant.value = quadrant
  }

  // タスク入力状態リセット
  function resetCaptureState() {
    captureImportant.value = false
    captureUrgent.value = false
    taskInput.value = ''
  }

  // オンボーディング制御
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

  function resetOnboarding() {
    currentOnboardingStep.value = 1
  }

  // アクセシビリティ用状態通知
  function announceStatus(message: string) {
    statusMessage.value = message
    // スクリーンリーダーに通知後、メッセージをクリア
    setTimeout(() => {
      statusMessage.value = ''
    }, 1000)
  }

  // 全モーダルを閉じる
  function closeAllModals() {
    if (showQuickCapture.value)
      toggleQuickCapture(false)
    if (showBigRocks.value)
      toggleBigRocks(false)
    if (showOnboarding.value)
      toggleOnboarding(false)
    if (showWeeklyReview.value)
      toggleWeeklyReview(false)
  }

  return {
    // 状態
    currentView,
    currentQuadrant,
    showQuickCapture,
    showBigRocks,
    showOnboarding,
    showWeeklyReview,
    currentOnboardingStep,
    taskInput,
    tutorialTaskInput,
    captureImportant,
    captureUrgent,
    statusMessage,

    // アクション
    switchToTodayView,
    switchToWeekView,
    switchQuadrant,
    toggleQuickCapture,
    toggleBigRocks,
    toggleOnboarding,
    toggleWeeklyReview,
    resetCaptureState,
    nextOnboardingStep,
    prevOnboardingStep,
    resetOnboarding,
    announceStatus,
    closeAllModals,
  }
})
