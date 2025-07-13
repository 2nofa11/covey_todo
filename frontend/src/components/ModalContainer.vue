<script setup lang="ts">
import { useModal } from '@/composables/useModal'
import BaseModal from './ui/BaseModal.vue'

const modal = useModal()
const modalState = modal.state

function handleClose() {
  modal.close()
}
</script>

<template>
  <BaseModal
    v-if="modalState.component && modalState.isOpen"
    :model-value="modalState.isOpen"
    @update:model-value="handleClose"
    @close="handleClose"
  >
    <component
      :is="modalState.component"
      v-bind="modalState.props"
    />
  </BaseModal>
</template>
