<script setup lang="ts">
import { computed } from 'vue'
import LineChart from './LineChart.vue'
import { useGlobalMetrics } from '@/composables/useGlobalMetrics'

const { cpuOverTime, memoryOverTime } = useGlobalMetrics()

const series = computed(() => [
  { name: 'CPU', data: cpuOverTime.value, color: '#3b82f6' },
  { name: 'Memory', data: memoryOverTime.value, color: '#10b981' },
])
</script>

<template>
  <LineChart :series="series" unit="%" :y-min="0" :y-max="100" />
</template>
