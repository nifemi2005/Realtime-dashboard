<script setup lang="ts">
import {
  Activity,
  AlertTriangle,
  ServerCog,
  Zap,
  BarChart3,
  AreaChart,
  History,
} from 'lucide-vue-next'
import { useGlobalMetrics } from '@/composables/useGlobalMetrics'
import { useAlertsStore } from '@/stores/alerts'
import { useStatusStore } from '@/stores/status'
import MetricCard from '@/components/MetricCard.vue'
import TimeRangeSelector from '@/components/TimeRangeSelector.vue'
import CpuMemoryChart from '@/components/charts/CpuMemoryChart.vue'
import RequestsBarChart from '@/components/charts/RequestsBarChart.vue'
import LatencyChart from '@/components/charts/LatencyChart.vue'
import ActivityFeed from '@/components/ActivityFeed.vue'
import ServiceFilter from '@/components/ServiceFilter.vue'

const { requestsPerSec, errorRate, requestsHistory, errorRateHistory } = useGlobalMetrics()
const alertsStore = useAlertsStore()
const statusStore = useStatusStore()
</script>

<template>
  <div class="p-4 lg:p-8 space-y-4 lg:space-y-6">
    <!-- KPI strip -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <MetricCard
        label="Requests/sec"
        :value="requestsPerSec"
        :sparkline-data="requestsHistory"
        :icon="Zap"
        icon-color="text-blue-500"
        sparkline-color="#3b82f6"
        trend-direction="neutral"
      />
      <MetricCard
        label="Error rate"
        :value="errorRate"
        format="percent"
        :sparkline-data="errorRateHistory"
        :icon="AlertTriangle"
        icon-color="text-amber-500"
        sparkline-color="#f59e0b"
        trend-direction="lower-is-good"
      />
      <MetricCard
        label="Services healthy"
        :value="statusStore.healthyCount"
        format="fraction"
        :fraction-total="statusStore.totalCount"
        :icon="ServerCog"
        icon-color="text-green-500"
        trend-direction="higher-is-good"
      />
      <MetricCard
        label="Active alerts"
        :value="alertsStore.activeAlerts.length"
        :icon="Activity"
        icon-color="text-red-500"
        trend-direction="lower-is-good"
      />
    </div>

    <!-- Time range selector -->
    <!-- Controls row -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <ServiceFilter />
      <TimeRangeSelector />
    </div>

    <!-- Chart row 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      <div
        class="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5"
      >
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">CPU & memory</h3>
            <p class="text-xs text-slate-500 mt-0.5">Average across services</p>
          </div>
          <Activity :size="18" class="text-slate-400" />
        </div>
        <div class="h-64"><CpuMemoryChart /></div>
      </div>

      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5"
      >
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Requests per service
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">Current rate</p>
          </div>
          <BarChart3 :size="18" class="text-slate-400" />
        </div>
        <div class="h-64"><RequestsBarChart /></div>
      </div>
    </div>

    <!-- Chart row 2 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      <div
        class="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5"
      >
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Latency percentiles
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">p50 · p95 · p99 (ms)</p>
          </div>
          <AreaChart :size="18" class="text-slate-400" />
        </div>
        <div class="h-64"><LatencyChart /></div>
      </div>

      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col"
      >
        <div class="flex items-center justify-between mb-3 shrink-0">
          <div>
            <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">Activity feed</h3>
            <p class="text-xs text-slate-500 mt-0.5">Recent events</p>
          </div>
          <History :size="18" class="text-slate-400" />
        </div>
        <div class="flex-1 min-h-0 h-72"><ActivityFeed /></div>
      </div>
    </div>
  </div>
</template>
