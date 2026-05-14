import { computed } from 'vue'
import { useMetricsStore } from '@/stores/metrics'
import { useControlsStore, type TimeRange } from '@/stores/controls'
import type { MetricEvent } from '@/types/events'
import { refThrottled } from '@vueuse/core'

type MetricField = 'cpu' | 'memory' | 'requestsPerSec' | 'errorRate'
type LatencyField = 'p50' | 'p95' | 'p99'
type Field = MetricField | LatencyField

// How many milliseconds of history each time range shows
const TIME_RANGE_MS: Record<TimeRange, number> = {
  live: 30 * 1000,
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '10m': 10 * 60 * 1000,
}

function getValue(point: MetricEvent, field: Field): number {
  if (field === 'p50' || field === 'p95' || field === 'p99') {
    return point.latency[field]
  }
  return point[field]
}

export function useGlobalMetrics() {
  const metricsStore = useMetricsStore()
  const controlsStore = useControlsStore()

  // Current scalar values (unaffected by time range)
  const requestsPerSec = computed(() => {
    let total = 0
    for (const service of metricsStore.services) {
      const latest = metricsStore.getLatest(service)
      if (latest) total += latest.requestsPerSec
    }
    return total
  })

  const errorRate = computed(() => {
    let sum = 0
    let count = 0
    for (const service of metricsStore.services) {
      const latest = metricsStore.getLatest(service)
      if (latest) {
        sum += latest.errorRate
        count++
      }
    }
    return count > 0 ? sum / count : 0
  })

  // Time-series builder, now respects controlsStore.timeRange
  function timeSeries(field: Field, aggregate: 'avg' | 'sum'): [number, number][] {
    const arrays = Object.values(metricsStore.byService)
    if (arrays.length === 0) return []

    const minLength = Math.min(...arrays.map((a) => a.length))
    if (minLength === 0) return []

    const result: [number, number][] = []
    for (let i = 0; i < minLength; i++) {
      let sum = 0
      let count = 0
      let timestamp = 0
      for (const arr of arrays) {
        const point = arr[arr.length - minLength + i]
        if (point) {
          sum += getValue(point, field)
          timestamp = point.timestamp
          count++
        }
      }
      if (count > 0) {
        result.push([timestamp, aggregate === 'avg' ? sum / count : sum])
      }
    }

    // Apply time-range filter
    const cutoff = Date.now() - TIME_RANGE_MS[controlsStore.timeRange]
    return result.filter(([ts]) => ts >= cutoff)
  }

  // Sparklines (already 60-ish points, no need to time-filter)
  const requestsHistory = computed(() => timeSeries('requestsPerSec', 'sum').map(([, v]) => v))
  const errorRateHistory = computed(() => timeSeries('errorRate', 'avg').map(([, v]) => v))

  // Time-series for charts (filtered by selected time range)
  const cpuOverTime = computed(() => timeSeries('cpu', 'avg'))
  const memoryOverTime = computed(() => timeSeries('memory', 'avg'))
  const p50OverTime = computed(() => timeSeries('p50', 'avg'))
  const p95OverTime = computed(() => timeSeries('p95', 'avg'))
  const p99OverTime = computed(() => timeSeries('p99', 'avg'))

  // Bar chart data
  const requestsByService = computed(() =>
    metricsStore.services.map((service) => ({
      service,
      value: metricsStore.getLatest(service)?.requestsPerSec ?? 0,
    })),
  )

  const cpuOverTimeT = refThrottled(cpuOverTime, 250)
  const memoryOverTimeT = refThrottled(memoryOverTime, 250)
  const p50OverTimeT = refThrottled(p50OverTime, 250)
  const p95OverTimeT = refThrottled(p95OverTime, 250)
  const p99OverTimeT = refThrottled(p99OverTime, 250)
  const requestsByServiceT = refThrottled(requestsByService, 250)

  return {
    requestsPerSec,
    errorRate,
    requestsHistory,
    errorRateHistory,
    cpuOverTime: cpuOverTimeT,
    memoryOverTime: memoryOverTimeT,
    p50OverTime: p50OverTimeT,
    p95OverTime: p95OverTimeT,
    p99OverTime: p99OverTimeT,
    requestsByService: requestsByServiceT,
  }
}
