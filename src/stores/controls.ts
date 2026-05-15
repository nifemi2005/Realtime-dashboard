import { defineStore } from 'pinia'
import { ref } from 'vue'

export type TimeRange = 'live' | '1m' | '5m' | '10m'
export type Severity = 'info' | 'warn' | 'error' | 'critical'

const ALL_SEVERITIES: Severity[] = ['info', 'warn', 'error', 'critical']

export const useControlsStore = defineStore('controls', () => {
  const isPaused = ref(false)
  const timeRange = ref<TimeRange>('live')
  const activeSeverities = ref<Set<Severity>>(new Set(ALL_SEVERITIES))
  const excludedServices = ref<Set<string>>(new Set())

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

  function toggleServiceExclusion(service: string) {
    const next = new Set(excludedServices.value)
    if (next.has(service)) next.delete(service)
    else next.add(service)
    excludedServices.value = next
  }

  function isServiceExcluded(service: string): boolean {
    return excludedServices.value.has(service)
  }

  return {
    isPaused,
    timeRange,
    activeSeverities,
    excludedServices,
    togglePause,
    setTimeRange,
    toggleSeverity,
    isSeverityActive,
    toggleServiceExclusion,
    isServiceExcluded,
  }
})
