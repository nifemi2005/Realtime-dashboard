import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ConnectionStatus } from '@/services/websocket'

export const useConnectionStore = defineStore('connection', () => {
  // State
  const status = ref<ConnectionStatus>('disconnected')
  const paused = ref(false)

  // Actions
  function setStatus(newStatus: ConnectionStatus) {
    status.value = newStatus
  }

  function togglePause() {
    paused.value = !paused.value
  }

  return { status, paused, setStatus, togglePause }
})
