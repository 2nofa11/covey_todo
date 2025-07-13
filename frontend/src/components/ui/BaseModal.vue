<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import { nextTick, onMounted, ref, watch } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  maxWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  maxWidth: 'max-w-2xl',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
}>()

// Dialog要素への参照
const dialogRef = ref<HTMLDialogElement>()
const previousFocusElement = ref<HTMLElement | null>(null)

// フォーカス可能な要素を取得するヘルパー関数
function getFocusableElements(): HTMLElement[] {
  if (!dialogRef.value)
    return []

  const focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
  ].join(', ')

  return Array.from(dialogRef.value.querySelectorAll(focusableSelectors)) as HTMLElement[]
}

// モーダルの開閉制御
watch(() => props.modelValue, (newValue, oldValue) => {
  if (newValue) {
    openModal()
  }
  else if (oldValue !== undefined) {
    // 初期化時 (oldValue === undefined) は closeModal を呼ばない
    closeModal(true)
  }
}, { immediate: true })

// マウント時に初期状態を確認
onMounted(() => {
  if (props.modelValue) {
    nextTick(() => openModal())
  }
})

function openModal() {
  if (dialogRef.value) {
    // 現在のフォーカス要素を保存
    previousFocusElement.value = document.activeElement as HTMLElement

    dialogRef.value.showModal()

    nextTick(() => {
      // モーダル内の最初のフォーカス可能な要素にフォーカス
      const firstFocusable = dialogRef.value?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) as HTMLElement

      if (firstFocusable) {
        firstFocusable.focus()
      }
    })
  }
}

function closeModal(force = false) {
  if (!force && !props.modelValue) return

  if (dialogRef.value) {
    dialogRef.value.close()
  }

  // フォーカスを元の位置に戻す
  if (previousFocusElement.value) {
    previousFocusElement.value.focus()
    previousFocusElement.value = null
  }

  emit('close')
  emit('update:modelValue', false)
}

// Escapeキーでモーダルを閉じる
onKeyStroke('Escape', () => {
  if (props.modelValue) {
    closeModal(true)
  }
})

// フォーカストラップ：Tab/Shift+Tabキーでのフォーカス管理
onKeyStroke('Tab', (e) => {
  if (!props.modelValue)
    return

  const focusableElements = getFocusableElements()
  if (focusableElements.length === 0)
    return

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (e.shiftKey) {
    // Shift+Tab: 後方移動
    if (document.activeElement === firstElement) {
      e.preventDefault()
      lastElement.focus()
    }
  }
  else {
    // Tab: 前方移動
    if (document.activeElement === lastElement) {
      e.preventDefault()
      firstElement.focus()
    }
  }
})

// backdrop クリックでモーダルを閉じる
function handleBackdropClick(event: MouseEvent) {
  if (event.target === dialogRef.value) {
    closeModal(true)
  }
}
</script>

<template>
  <dialog
    ref="dialogRef"
    class="bg-white rounded-lg p-6 w-full border-2 border-caramel shadow-xl m-auto"
    :class="maxWidth"
    @click="handleBackdropClick"
  >
    <div @click.stop>
      <!-- Header -->
      <div v-if="title || $slots.header" class="flex items-center justify-between mb-4">
        <div v-if="$slots.header">
          <slot name="header" />
        </div>
        <h2 v-else-if="title" class="text-lg font-semibold text-gray-900">
          {{ title }}
        </h2>

        <button
          class="text-gray-400 hover:text-gray-600 p-1"
          type="button"
          aria-label="モーダルを閉じる"
          @click="() => closeModal(true)"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="modal-content">
        <slot />
      </div>

      <!-- Footer -->
      <div v-if="$slots.footer" class="mt-6">
        <slot name="footer" />
      </div>
    </div>
  </dialog>
</template>

<style scoped>
/* ダイアログの背景を半透明に設定 */
dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
}

/* フォールバック用（古いブラウザ対応） */
dialog[open] {
  animation: modal-appear 0.2s ease-out;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 縮小モーション設定対応 */
@media (prefers-reduced-motion: reduce) {
  dialog[open] {
    animation: none;
  }
}
</style>
