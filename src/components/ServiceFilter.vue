<script setup lang="ts">
import { useMetricsStore } from '@/stores/metrics'
import { useControlsStore } from '@/stores/controls'

const metricsStore = useMetricsStore()
const controlsStore = useControlsStore()
</script>

<template>
  <div class="flex flex-wrap gap-1.5 items-center" v-if="metricsStore.services.length > 0">
    <span class="text-xs text-slate-500 dark:text-slate-400 mr-1 shrink-0">Services:</span>
    <button
      v-for="service in metricsStore.services"
      :key="service"
      @click="controlsStore.toggleServiceExclusion(service)"
      :class="[
        'px-2 py-0.5 text-xs font-mono rounded ring-1 ring-inset transition-opacity',
        controlsStore.isServiceExcluded(service)
          ? 'bg-slate-100 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600 ring-slate-200 dark:ring-slate-800 opacity-60 line-through'
          : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-blue-500/30',
      ]"
    >
      {{ service }}
    </button>
  </div>
</template>
