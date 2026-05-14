import { defineStore } from 'pinia'
import { ref } from 'vue'

export type TimeRange = 'live' | '1m' | '5m' | '10m'
export type Severity = 'info' | 'warn' | 'error' | 'critical'

const ALL_SEVERITIES: Severity[] = ['info', 'warn', 'error', 'critical']

export const useControlsStore = defineStore('controls', () => {
  const isPaused = ref(false)
  const timeRange = ref<TimeRange>('live')
  const activeSeverities = ref<Set<Severity>>(new Set(ALL_SEVERITIES))

  function togglePause() {
    isPaused.value = !isPaused.value
  }

  function setTimeRange(range: TimeRange) {
    timeRange.value = range
  }

  function toggleSeverity(sev: Severity) {
    const next = new Set(activeSeverities.value)
    if (next.has(sev)) next.delete(sev)
    else next.add(sev)
    activeSeverities.value = next
  }

  function isSeverityActive(sev: Severity): boolean {
    return activeSeverities.value.has(sev)
  }

  return {
    isPaused,
    timeRange,
    activeSeverities,
    togglePause,
    setTimeRange,
    toggleSeverity,
    isSeverityActive,
  }
})
