import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AlertEvent } from '@/types/events'

const BUFFER_SIZE = 100

export const useAlertsStore = defineStore('alerts', () => {
  const alerts = ref<AlertEvent[]>([])
  const acknowledged = ref<Set<string>>(new Set())

  function addAlert(alert: AlertEvent) {
    alerts.value.unshift(alert)
    if (alerts.value.length > BUFFER_SIZE) {
      alerts.value.pop()
    }
  }

  function acknowledge(id: string) {
    acknowledged.value.add(id)
  }

  // Only alerts the user hasn't dismissed yet
  const activeAlerts = computed(() => alerts.value.filter((a) => !acknowledged.value.has(a.id)))

  return { alerts, acknowledged, activeAlerts, addAlert, acknowledge }
})
