import { wsService } from '@/services/websocket'
import { useMetricsStore } from './metrics'
import { useLogsStore } from './logs'
import { useAlertsStore } from './alerts'
import { useStatusStore } from './status'

export function setupStores() {
  const metricsStore = useMetricsStore()
  const logsStore = useLogsStore()
  const alertsStore = useAlertsStore()
  const statusStore = useStatusStore()

  // Subscribe once. The WebSocket service will call this for every event.
  wsService.onEvent((event) => {
    switch (event.type) {
      case 'metric':
        metricsStore.addMetric(event)
        break
      case 'log':
        logsStore.addLog(event)
        break
      case 'alert':
        alertsStore.addAlert(event)
        break
      case 'status':
        statusStore.setStatus(event)
        break
    }
  })
}
