import { ref, onUnmounted } from 'vue'
import { wsService, type ConnectionStatus } from '@/services/websocket'
import type { StreamEvent } from '@/types/events'

export function useWebSocket() {
  const status = ref<ConnectionStatus>('disconnected')
  const reconnectAttempts = ref(0)
  const lastEvent = ref<StreamEvent | null>(null)
  const eventCount = ref(0)

  const unsubscribeStatus = wsService.onStatusChange((s, attempts) => {
    status.value = s
    reconnectAttempts.value = attempts
  })

  const unsubscribeEvent = wsService.onEvent((event) => {
    lastEvent.value = event
    eventCount.value++
  })

  onUnmounted(() => {
    unsubscribeEvent()
    unsubscribeStatus()
  })

  return { status, reconnectAttempts, lastEvent, eventCount }
}
