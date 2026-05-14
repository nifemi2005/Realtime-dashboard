import { watch } from 'vue'
import { useAlertsStore } from '@/stores/alerts'
import { useToasts } from './useToasts'

export function useAlertToasts() {
  const alertsStore = useAlertsStore()
  const { add } = useToasts()

  watch(
    () => alertsStore.alerts.length,
    (newLen, oldLen = 0) => {
      if (newLen > oldLen) {
        const newest = alertsStore.alerts[0]
        if (newest && newest.severity === 'critical') {
          add({
            title: newest.title,
            message: `${newest.service} · ${newest.metric} = ${newest.value} (threshold ${newest.threshold})`,
            variant: 'critical',
          })
        }
      }
    },
  )
}
