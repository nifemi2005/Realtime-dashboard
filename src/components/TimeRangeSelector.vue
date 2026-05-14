<script setup lang="ts">
import { useControlsStore, type TimeRange } from '@/stores/controls'

const controlsStore = useControlsStore()

const options: { label: string; value: TimeRange }[] = [
  { label: 'Live', value: 'live' },
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '10m', value: '10m' },
]
</script>

<template>
  <div
    class="inline-flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 ring-1 ring-inset ring-slate-200 dark:ring-slate-800"
  >
    <button
      v-for="opt in options"
      :key="opt.value"
      @click="controlsStore.setTimeRange(opt.value)"
      :class="[
        'px-3 py-1 text-xs font-medium rounded-md transition-colors',
        controlsStore.timeRange === opt.value
          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200',
      ]"
    >
      {{ opt.label }}
    </button>
  </div>
</template>
