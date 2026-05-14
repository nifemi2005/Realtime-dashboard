<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { useTheme } from '@/composables/useTheme'

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
  }>(),
  { area: false, stack: false },
)

const { isDark } = useTheme()

const textColor = computed(() => (isDark.value ? '#94a3b8' : '#64748b'))
const axisColor = computed(() => (isDark.value ? '#334155' : '#e2e8f0'))
const splitColor = computed(() => (isDark.value ? '#1e293b' : '#f1f5f9'))
const tooltipBg = computed(() => (isDark.value ? '#0f172a' : '#ffffff'))

const option = computed(() => ({
  animation: true,
  animationDuration: 300,
  grid: { top: 20, right: 24, bottom: 36, left: 50 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: tooltipBg.value,
    borderColor: axisColor.value,
    borderWidth: 1,
    textStyle: { color: isDark.value ? '#f1f5f9' : '#0f172a', fontSize: 12 },
  },
  legend: {
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
</script>

<template>
  <v-chart :option="option" autoresize class="w-full h-full" />
</template>
