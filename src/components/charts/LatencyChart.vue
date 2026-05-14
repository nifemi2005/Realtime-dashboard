<script setup lang="ts">
import { computed } from 'vue'
import LineChart from './LineChart.vue'
import { useGlobalMetrics } from '@/composables/useGlobalMetrics'

const { p50OverTime, p95OverTime, p99OverTime } = useGlobalMetrics()

const series = computed(() => [
  { name: 'p50', data: p50OverTime.value, color: '#a78bfa' },
  { name: 'p95', data: p95OverTime.value, color: '#8b5cf6' },
  { name: 'p99', data: p99OverTime.value, color: '#7c3aed' },
])
</script>

<template>
  <LineChart :series="series" unit="ms" area />
</template>
