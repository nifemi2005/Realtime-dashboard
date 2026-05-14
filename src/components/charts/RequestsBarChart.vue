<script setup lang="ts">
import { computed } from 'vue'
import BarChart from './BarChart.vue'
import { useGlobalMetrics } from '@/composables/useGlobalMetrics'

const { requestsByService } = useGlobalMetrics()

const categories = computed(() => requestsByService.value.map((r) => r.service))
const values = computed(() => requestsByService.value.map((r) => Math.round(r.value)))
</script>

<template>
  <BarChart :categories="categories" :values="values" color="#3b82f6" />
</template>
