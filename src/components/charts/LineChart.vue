<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { useTheme } from '@/composables/useTheme'
import { Loader2 } from 'lucide-vue-next'

interface Series {
  name: string
  data: [number, number][]
  color: string
}
const props = withDefaults(
  defineProps<{
    series: Series[]
    unit?: string
    yMin?: number
    yMax?: number
    area?: boolean
    stack?: boolean
    showLegend?: boolean
  }>(),
  { area: false, stack: false, showLegend: false },
)

const { isDark } = useTheme()

const textColor = computed(() => (isDark.value ? '#94a3b8' : '#64748b'))
const axisColor = computed(() => (isDark.value ? '#334155' : '#e2e8f0'))
const splitColor = computed(() => (isDark.value ? '#1e293b' : '#f1f5f9'))
const tooltipBg = computed(() => (isDark.value ? '#0f172a' : '#ffffff'))

const option = computed(() => ({
  animation: true,
  animationDuration: 300,
  grid: { top: 20, right: 24, bottom: props.showLegend ? 36 : 16, left: 50 },
  // ... (other props unchanged) ...
  legend: {
    show: props.showLegend,
    data: props.series.map((s) => s.name),
    bottom: 0,
    icon: 'circle',
    itemWidth: 8,
    itemHeight: 8,
    textStyle: { color: textColor.value, fontSize: 11 },
  },
  xAxis: {
    type: 'time',
    axisLabel: { color: textColor.value, fontSize: 10, hideOverlap: true },
    axisLine: { lineStyle: { color: axisColor.value } },
    axisTick: { show: false },
    splitLine: { show: false },
  },
  yAxis: {
    type: 'value',
    min: props.yMin,
    max: props.yMax,
    axisLabel: {
      color: textColor.value,
      fontSize: 10,
      formatter: props.unit ? `{value}${props.unit}` : '{value}',
    },
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: splitColor.value, type: 'dashed' } },
  },
  series: props.series.map((s) => ({
    name: s.name,
    type: 'line',
    showSymbol: false,
    smooth: true,
    stack: props.stack ? 'stacked' : undefined,
    lineStyle: { color: s.color, width: 2 },
    itemStyle: { color: s.color },
    areaStyle: props.area ? { color: s.color, opacity: props.stack ? 0.6 : 0.15 } : undefined,
    data: s.data,
  })),
}))

const hasData = computed(() => props.series.some((s) => s.data && s.data.length > 0))
</script>

<template>
  <div
    v-if="!hasData"
    class="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-600"
  >
    <Loader2 :size="20" class="animate-spin opacity-60" />
    <span class="text-xs">Waiting for data…</span>
  </div>
  <v-chart v-else :option="option" autoresize class="w-full h-full" />
</template>
