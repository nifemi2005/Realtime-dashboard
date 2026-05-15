<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChartLine, ChartArea } from 'lucide-vue-next'
import LineChart from './LineChart.vue'
import { useGlobalMetrics } from '@/composables/useGlobalMetrics'

const { p50OverTime, p95OverTime, p99OverTime } = useGlobalMetrics()

const chartType = ref<'area' | 'line'>('area')
const hiddenSeries = ref<Set<string>>(new Set())

function toggleSeries(name: string) {
  const next = new Set(hiddenSeries.value)
  if (next.has(name)) next.delete(name)
  else next.add(name)
  hiddenSeries.value = next
}

const allSeries = computed(() => [
  { name: 'p50', data: p50OverTime.value, color: '#a78bfa' },
  { name: 'p95', data: p95OverTime.value, color: '#8b5cf6' },
  { name: 'p99', data: p99OverTime.value, color: '#7c3aed' },
])

const visibleSeries = computed(() => allSeries.value.filter((s) => !hiddenSeries.value.has(s.name)))
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center gap-2 mb-3 shrink-0">
      <button
        v-for="s in allSeries"
        :key="s.name"
        @click="toggleSeries(s.name)"
        :class="[
          'px-2 py-0.5 text-[11px] font-medium rounded ring-1 ring-inset transition-opacity flex items-center gap-1.5',
          hiddenSeries.has(s.name)
            ? 'bg-slate-100 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600 ring-slate-200 dark:ring-slate-800 opacity-60'
            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 ring-slate-200 dark:ring-slate-700',
        ]"
      >
        <span
          class="w-2 h-2 rounded-full"
          :style="{ backgroundColor: s.color, opacity: hiddenSeries.has(s.name) ? 0.3 : 1 }"
        ></span>
        {{ s.name }}
      </button>

      <div class="flex-1"></div>

      <div class="inline-flex bg-slate-100 dark:bg-slate-800/50 rounded-md p-0.5">
        <button
          @click="chartType = 'line'"
          :class="[
            'p-1 rounded transition-colors',
            chartType === 'line'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
          ]"
          aria-label="Line chart"
          title="Line"
        >
          <ChartLine :size="14" />
        </button>
        <button
          @click="chartType = 'area'"
          :class="[
            'p-1 rounded transition-colors',
            chartType === 'area'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
          ]"
          aria-label="Area chart"
          title="Area"
        >
          <ChartArea :size="14" />
        </button>
      </div>
    </div>

    <div class="flex-1 min-h-0">
      <LineChart
        :series="visibleSeries"
        unit="ms"
        :area="chartType === 'area'"
        :stack="chartType === 'area'"
      />
    </div>
  </div>
</template>
