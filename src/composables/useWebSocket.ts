import { ref, onUnmounted } from 'vue'
import { wsService, type ConnectionStatus } from '@/services/websocket'
import type { StreamEvent } from '@/types/events'

export function useWebSocket() {
  const status = ref<ConnectionStatus>('disconnected')
  const lastEvent = ref<StreamEvent | null>(null)
  const eventCount = ref(0)

  // Subscribe to status changes
  const unsubscribeStatus = wsService.onStatusChange((s) => {
    status.value = s
  })

  // Subscribe to events
  const unsubscribeEvent = wsService.onEvent((event) => {
    lastEvent.value = event
    eventCount.value++
  })

  // Clean up subscriptions when the component using this composable unmounts
  onUnmounted(() => {
    unsubscribeEvent()
    unsubscribeStatus()
  })

  return { status, lastEvent, eventCount }
}
