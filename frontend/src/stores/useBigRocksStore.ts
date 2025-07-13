import type { BigRocks } from '@/types'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed } from 'vue'

export const useBigRocksStore = defineStore('bigRocks', () => {
  // VueUseで自動永続化
  const bigRocks = useLocalStorage<BigRocks>('coveyBigRocks', {})

  // 全てのBig Rocksを平坦化して取得する計算プロパティ
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

  // Big Rocksを更新する関数
  function updateBigRocks(newBigRocks: BigRocks) {
    bigRocks.value = newBigRocks
  }

  // 特定の役割にBig Rockを追加
  function addBigRock(role: string, rock: string) {
    if (!bigRocks.value[role]) {
      bigRocks.value[role] = []
    }
    bigRocks.value[role].push(rock)
  }

  // 特定の役割のBig Rockを削除
  function removeBigRock(role: string, index: number) {
    if (bigRocks.value[role]) {
      bigRocks.value[role].splice(index, 1)
      if (bigRocks.value[role].length === 0) {
        delete bigRocks.value[role]
      }
    }
  }

  return {
    bigRocks,
    allBigRocks,
    updateBigRocks,
    addBigRock,
    removeBigRock,
  }
})
