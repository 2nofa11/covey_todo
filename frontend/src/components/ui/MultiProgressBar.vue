<script setup lang="ts">
import { computed } from 'vue'

interface ProgressSegment {
  percentage: number
  color: string
  label: string
}

interface Props {
  segments: ProgressSegment[]
  showLabels?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabels: true,
})

// 合計が100%を超える場合は正規化
const normalizedSegments = computed(() => {
  const total = props.segments.reduce((sum, segment) => sum + segment.percentage, 0)
  if (total === 0)
    return props.segments

  return props.segments.map(segment => ({
    ...segment,
    percentage: total > 100 ? (segment.percentage / total) * 100 : segment.percentage,
  }))
})
</script>

<template>
  <div class="space-y-2">
    <!-- プログレスバー -->
    <div class="flex bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        v-for="(segment, index) in normalizedSegments"
        :key="index"
        class="transition-all duration-500 ease-out"
        :class="segment.color"
        :style="{ width: `${segment.percentage}%` }"
      />
    </div>

    <!-- ラベル -->
    <div v-if="showLabels" class="flex flex-wrap gap-3 text-xs">
      <div
        v-for="(segment, index) in normalizedSegments"
        :key="index"
        class="flex items-center gap-1"
      >
        <div
          class="w-3 h-3 rounded"
          :class="segment.color"
        />
        <span class="text-gray-700">{{ segment.label }}</span>
        <span class="text-gray-500 font-medium">{{ Math.round(segment.percentage) }}%</span>
      </div>
    </div>
  </div>
</template>
