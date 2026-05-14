<script setup lang="ts">
import { useMetricsStore } from '@/stores/metrics'
import { useLogsStore } from '@/stores/logs'
import { useAlertsStore } from '@/stores/alerts'
import { useStatusStore } from '@/stores/status'

const metricsStore = useMetricsStore()
const logsStore = useLogsStore()
const alertsStore = useAlertsStore()
const statusStore = useStatusStore()

const severityClass = (severity: string) => ({
  'text-blue-500': severity === 'info',
  'text-amber-500': severity === 'warn',
  'text-orange-500': severity === 'error',
  'text-red-500': severity === 'critical',
})

const formatTime = (ts: number) => new Date(ts).toLocaleTimeString()
</script>

<template>
  <div class="p-4 lg:p-8">
    <!-- KPI grid: 2 cols on mobile/tablet, 4 cols on desktop -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4"
      >
        <div class="text-xs lg:text-sm text-slate-500 dark:text-slate-400">Metrics received</div>
        <div class="text-xl lg:text-2xl font-semibold font-mono mt-1">
          {{ metricsStore.totalReceived }}
        </div>
      </div>
      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4"
      >
        <div class="text-xs lg:text-sm text-slate-500 dark:text-slate-400">Logs buffered</div>
        <div class="text-xl lg:text-2xl font-semibold font-mono mt-1">
          {{ logsStore.logs.length }}
        </div>
      </div>
      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4"
      >
        <div class="text-xs lg:text-sm text-slate-500 dark:text-slate-400">Active alerts</div>
        <div class="text-xl lg:text-2xl font-semibold font-mono mt-1">
          {{ alertsStore.activeAlerts.length }}
        </div>
      </div>
      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4"
      >
        <div class="text-xs lg:text-sm text-slate-500 dark:text-slate-400">Services healthy</div>
        <div class="text-xl lg:text-2xl font-semibold font-mono mt-1">
          {{ statusStore.healthyCount }} / {{ statusStore.totalCount }}
        </div>
      </div>
    </div>

    <!-- Two-column area: stacks on mobile, side-by-side on desktop -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      <section
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5"
      >
        <h2 class="text-base font-semibold mb-3">Metrics buffered per service</h2>
        <div class="space-y-2">
          <div
            v-for="service in metricsStore.services"
            :key="service"
            class="flex justify-between items-center px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950/50"
          >
            <span class="text-sm">{{ service }}</span>
            <span class="font-mono text-xs text-slate-500 dark:text-slate-400">
              {{ metricsStore.byService[service]?.length || 0 }} / 600
            </span>
          </div>
        </div>
      </section>

      <section
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5"
      >
        <h2 class="text-base font-semibold mb-3">Recent logs</h2>
        <div class="space-y-1 max-h-96 overflow-auto">
          <div
            v-for="log in logsStore.logs.slice(0, 20)"
            :key="log.timestamp + log.requestId"
            class="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950/50 text-sm flex gap-3 items-start"
          >
            <span class="text-xs text-slate-500 shrink-0 mt-0.5">{{
              formatTime(log.timestamp)
            }}</span>
            <span
              class="text-xs font-medium uppercase shrink-0 w-16 mt-0.5"
              :class="severityClass(log.severity)"
            >
              {{ log.severity }}
            </span>
            <span class="truncate text-slate-700 dark:text-slate-300">{{ log.message }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
