import type { QuadrantType, ViewType } from '@/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // ビュー状態
  const currentView = ref<ViewType>('today')
  const currentQuadrant = ref<QuadrantType>('do')

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

  // アクセシビリティ用状態通知
  function announceStatus(message: string) {
    statusMessage.value = message
    // スクリーンリーダーに通知後、メッセージをクリア
    setTimeout(() => {
      statusMessage.value = ''
    }, 1000)
  }

  return {
    // 状態
    currentView,
    currentQuadrant,
    statusMessage,

    // アクション
    switchToTodayView,
    switchToWeekView,
    switchQuadrant,
    announceStatus,
  }
})
