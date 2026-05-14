import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MetricEvent } from '@/types/events'

// How many metric points to keep per service.
// At 1 metric/sec, 600 points = 10 minutes of history per service.
const BUFFER_SIZE = 600

export const useMetricsStore = defineStore('metrics', () => {
  // Organized by service: { 'api-gateway': [metric, metric, ...], ... }
  const byService = ref<Record<string, MetricEvent[]>>({})
  const totalReceived = ref(0)

  function addMetric(metric: MetricEvent) {
    // Get or create the array for this service
    const series =
      byService.value[metric.service] ?? (byService.value[metric.service] = [])

    // Push new metric onto the end (newest)
    series.push(metric)

    // If we're over capacity, drop the oldest (front)
    if (series.length > BUFFER_SIZE) {
      series.shift()
    }

    totalReceived.value++
  }

  function clear() {
    byService.value = {}
    totalReceived.value = 0
  }

  // ===== Getters (computed = derived state that auto-updates) =====

  const services = computed(() => Object.keys(byService.value))

  // Get a service's series, optionally filtered to last N milliseconds
  function getSeries(service: string, sinceMs?: number): MetricEvent[] {
    const series = byService.value[service] ?? []
    if (sinceMs === undefined) return series
    const cutoff = Date.now() - sinceMs
    return series.filter((m) => m.timestamp >= cutoff)
  }

  // Latest metric for a service (or null if none)
  function getLatest(service: string): MetricEvent | null {
    const series = byService.value[service]
    return series?.[series.length - 1] ?? null
  }

  return {
    byService,
    totalReceived,
    services,
    addMetric,
    clear,
    getSeries,
    getLatest,
  }
})
