import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LogEvent } from '@/types/events'

const BUFFER_SIZE = 500

export const useLogsStore = defineStore('logs', () => {
  // Newest-first for easier activity-feed rendering
  const logs = ref<LogEvent[]>([])
  const totalReceived = ref(0)

  function addLog(log: LogEvent) {
    logs.value.unshift(log) // add to the front
    if (logs.value.length > BUFFER_SIZE) {
      logs.value.pop() // remove from the back (oldest)
    }
    totalReceived.value++
  }

  function clear() {
    logs.value = []
    totalReceived.value = 0
  }

  return { logs, totalReceived, addLog, clear }
})
