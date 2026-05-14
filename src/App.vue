<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { wsService } from '@/services/websocket'
import { useWebSocket } from '@/composables/useWebSocket'
import { useMetricsStore } from '@/stores/metrics'
import { useLogsStore } from '@/stores/logs'
import { useAlertsStore } from '@/stores/alerts'
import { useStatusStore } from '@/stores/status'

const { status } = useWebSocket()
const metricsStore = useMetricsStore()
const logsStore = useLogsStore()
const alertsStore = useAlertsStore()
const statusStore = useStatusStore()

onMounted(() => wsService.connect())
onUnmounted(() => wsService.disconnect())

const statusClass = computed(() => {
  switch (status.value) {
    case 'connected':
      return 'bg-green-500/20 text-green-400'
    case 'connecting':
    case 'reconnecting':
      return 'bg-yellow-500/20 text-yellow-400'
    case 'error':
      return 'bg-red-500/20 text-red-400'
    default:
      return 'bg-slate-500/20 text-slate-400'
  }
})

const severityClass = (severity: string) => {
  return {
    'text-blue-400': severity === 'info',
    'text-yellow-400': severity === 'warn',
    'text-orange-400': severity === 'error',
    'text-red-400': severity === 'critical',
  }
}

const formatTime = (ts: number) => new Date(ts).toLocaleTimeString()
</script>

<template>
  <main class="min-h-screen bg-slate-900 text-white p-8">
    <header class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold">Realtime Dashboard</h1>
      <span class="px-3 py-1 rounded-full text-sm font-medium" :class="statusClass">
        {{ status }}
      </span>
    </header>

    <!-- Top-level counters -->
    <div class="grid grid-cols-4 gap-4 mb-8">
      <div class="bg-slate-800 rounded-lg p-4">
        <div class="text-sm text-slate-400">Metrics received</div>
        <div class="text-2xl font-mono mt-1">{{ metricsStore.totalReceived }}</div>
      </div>
      <div class="bg-slate-800 rounded-lg p-4">
        <div class="text-sm text-slate-400">Logs buffered</div>
        <div class="text-2xl font-mono mt-1">{{ logsStore.logs.length }}</div>
      </div>
      <div class="bg-slate-800 rounded-lg p-4">
        <div class="text-sm text-slate-400">Active alerts</div>
        <div class="text-2xl font-mono mt-1">{{ alertsStore.activeAlerts.length }}</div>
      </div>
      <div class="bg-slate-800 rounded-lg p-4">
        <div class="text-sm text-slate-400">Services healthy</div>
        <div class="text-2xl font-mono mt-1">
          {{ statusStore.healthyCount }} / {{ statusStore.totalCount }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-8">
      <!-- Per-service buffer sizes (proves the bounded buffer works) -->
      <section>
        <h2 class="text-lg font-semibold mb-3">Metrics buffered per service</h2>
        <div class="space-y-2">
          <div
            v-for="service in metricsStore.services"
            :key="service"
            class="bg-slate-800 rounded p-3 flex justify-between items-center"
          >
            <span>{{ service }}</span>
            <span class="font-mono text-sm text-slate-400">
              {{ metricsStore.byService[service]?.length || 0 }} / 600 points
            </span>
          </div>
        </div>
      </section>

      <!-- Recent logs preview -->
      <section>
        <h2 class="text-lg font-semibold mb-3">Recent logs</h2>
        <div class="space-y-1 max-h-96 overflow-auto">
          <div
            v-for="log in logsStore.logs.slice(0, 20)"
            :key="log.timestamp + log.requestId"
            class="bg-slate-800 rounded px-3 py-2 text-sm flex gap-3 items-start"
          >
            <span class="text-xs text-slate-500 shrink-0 mt-0.5">
              {{ formatTime(log.timestamp) }}
            </span>
            <span
              class="text-xs font-medium uppercase shrink-0 w-16 mt-0.5"
              :class="severityClass(log.severity)"
            >
              {{ log.severity }}
            </span>
            <span class="truncate">{{ log.message }}</span>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
