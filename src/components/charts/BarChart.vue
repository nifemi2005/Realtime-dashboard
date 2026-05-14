<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { useTheme } from '@/composables/useTheme'

const props = withDefaults(
  defineProps<{
    categories: string[]
    values: number[]
    color?: string
    unit?: string
  }>(),
  { color: '#3b82f6' },
)

const { isDark } = useTheme()
const textColor = computed(() => (isDark.value ? '#94a3b8' : '#64748b'))
const axisColor = computed(() => (isDark.value ? '#334155' : '#e2e8f0'))
const splitColor = computed(() => (isDark.value ? '#1e293b' : '#f1f5f9'))
const tooltipBg = computed(() => (isDark.value ? '#0f172a' : '#ffffff'))

const option = computed(() => ({
  animation: true,
  animationDuration: 300,
  grid: { top: 20, right: 16, bottom: 60, left: 48 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: tooltipBg.value,
    borderColor: axisColor.value,
    borderWidth: 1,
    textStyle: { color: isDark.value ? '#f1f5f9' : '#0f172a', fontSize: 12 },
  },
  xAxis: {
    type: 'category',
    data: props.categories,
    axisLabel: {
      color: textColor.value,
      fontSize: 10,
      rotate: 30,
      interval: 0,
    },
    axisLine: { lineStyle: { color: axisColor.value } },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: textColor.value,
      fontSize: 10,
      formatter: props.unit ? `{value}${props.unit}` : '{value}',
    },
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: splitColor.value, type: 'dashed' } },
  },
  series: [
    {
      type: 'bar',
      data: props.values,
      barWidth: '50%',
      itemStyle: { color: props.color, borderRadius: [4, 4, 0, 0] },
    },
  ],
}))
</script>

<template>
  <v-chart :option="option" autoresize class="w-full h-full" />
</template>
