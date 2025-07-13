import { useMagicKeys, whenever } from '@vueuse/core'
import { useUIStore } from '@/stores/useUIStore'

export function useKeyboardShortcuts() {
  const uiStore = useUIStore()

  // VueUseのuseMagicKeysで宣言的にキーボードショートカットを定義
  const { n, escape, t, w, _1, _2, _3, _4 } = useMagicKeys({
    passive: false,
    onEventFired(e) {
      // 入力フィールドでは一部のショートカットを無効化
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // Escapeキーのみ許可（モーダルを閉じるため）
        if (e.key !== 'Escape') {
          return
        }
      }
      
      // 定義されているショートカットキーのみpreventDefaultを実行
      const definedKeys = ['n', 'escape', 't', 'w', '1', '2', '3', '4']
      if (definedKeys.includes(e.key.toLowerCase())) {
        e.preventDefault()
      }
    },
  })

  // ショートカットの動作を定義
  whenever(n, () => {
    uiStore.toggleQuickCapture(true)
  })

  whenever(escape, () => {
    uiStore.closeAllModals()
  })

  whenever(t, () => {
    uiStore.switchToTodayView()
  })

  whenever(w, () => {
    uiStore.switchToWeekView()
  })

  // 週間ビューでのクワドラント切り替え（1-4キー）
  whenever(_1, () => {
    if (uiStore.currentView === 'week') {
      uiStore.switchQuadrant('do')
    }
  })

  whenever(_2, () => {
    if (uiStore.currentView === 'week') {
      uiStore.switchQuadrant('plan')
    }
  })

  whenever(_3, () => {
    if (uiStore.currentView === 'week') {
      uiStore.switchQuadrant('delegate')
    }
  })

  whenever(_4, () => {
    if (uiStore.currentView === 'week') {
      uiStore.switchQuadrant('eliminate')
    }
  })

  return {
    // 必要に応じてキーの状態を返すことも可能
    keys: { n, escape, t, w, _1, _2, _3, _4 },
  }
}
