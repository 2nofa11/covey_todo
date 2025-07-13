import type { Component } from 'vue'
import { markRaw, ref } from 'vue'

interface ModalState {
  component: Component | null
  props: Record<string, any>
  isOpen: boolean
}

const modalState = ref<ModalState>({
  component: null,
  props: {},
  isOpen: false,
})

export function useModal() {
  function open(component: Component, props: Record<string, any> = {}) {
    modalState.value = {
      component: markRaw(component),
      props,
      isOpen: true,
    }
  }

  function close() {
    modalState.value.isOpen = false
    // アニメーション完了後にコンポーネントをクリア
    setTimeout(() => {
      if (!modalState.value.isOpen) {
        modalState.value.component = null
        modalState.value.props = {}
      }
    }, 200)
  }

  return {
    open,
    close,
    state: modalState,
  }
}
