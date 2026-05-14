import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { StatusEvent } from '@/types/events'

export const useStatusStore = defineStore('status', () => {
  // Just the latest status per service — no history needed
  const byService = ref<Record<string, StatusEvent>>({})

  function setStatus(event: StatusEvent) {
    byService.value[event.service] = event
  }

  const healthyCount = computed(
    () => Object.values(byService.value).filter((s) => s.status === 'healthy').length,
  )

  const totalCount = computed(() => Object.keys(byService.value).length)

  return { byService, setStatus, healthyCount, totalCount }
})
