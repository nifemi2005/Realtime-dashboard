<script setup lang="ts">
import { computed } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { useLogsStore } from '@/stores/logs'
import { useControlsStore, type Severity } from '@/stores/controls'
import type { LogEvent } from '@/types/events'
import { refThrottled } from '@vueuse/core'

const logsStore = useLogsStore()
const controlsStore = useControlsStore()

const severities: Severity[] = ['info', 'warn', 'error', 'critical']

interface LogRow extends LogEvent {
  id: string
}

const itemsRaw = computed<LogRow[]>(() =>
  logsStore.logs
    .filter((log) => controlsStore.activeSeverities.has(log.severity as Severity))
    .map((log) => ({
      ...log,
      id: `${log.timestamp}-${log.requestId}`,
    })),
)

const items = refThrottled(itemsRaw, 200)

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false })
}

function severityClass(sev: string, active = true) {
  if (!active) {
    return 'bg-slate-100 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600 ring-slate-200 dark:ring-slate-800'
  }
  switch (sev) {
    case 'info':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-blue-500/30'
    case 'warn':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-500/30'
    case 'error':
      return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 ring-orange-500/30'
    case 'critical':
      return 'bg-red-500/10 text-red-700 dark:text-red-400 ring-red-500/30'
    default:
      return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 ring-slate-500/30'
  }
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Severity filter pills -->
    <div class="flex flex-wrap gap-1.5 mb-3 shrink-0">
      <button
        v-for="sev in severities"
        :key="sev"
        @click="controlsStore.toggleSeverity(sev)"
        :class="[
          'px-2 py-0.5 text-[10px] font-medium uppercase rounded ring-1 ring-inset transition-opacity',
          severityClass(sev, controlsStore.isSeverityActive(sev)),
        ]"
      >
        {{ sev }}
      </button>
    </div>

    <!-- Virtualized log list -->
    <div class="flex-1 min-h-0">
      <div
        v-if="items.length === 0"
        class="h-full flex items-center justify-center text-sm text-slate-500"
      >
        No matching events
      </div>
      <RecycleScroller
        v-else
        :items="items"
        :item-size="40"
        key-field="id"
        class="h-full"
        v-slot="{ item }"
      >
        <div
          class="px-3 h-10 flex gap-3 items-center border-b border-slate-100 dark:border-slate-800/50"
        >
          <span class="text-xs text-slate-500 font-mono shrink-0 w-16">
            {{ formatTime(item.timestamp) }}
          </span>
          <span
            class="text-[10px] font-medium uppercase shrink-0 px-1.5 py-0.5 rounded ring-1 ring-inset w-16 text-center"
            :class="severityClass(item.severity)"
          >
            {{ item.severity }}
          </span>
          <span class="text-xs text-slate-600 dark:text-slate-400 shrink-0 w-28 truncate font-mono">
            {{ item.service }}
          </span>
          <span class="text-xs text-slate-700 dark:text-slate-300 truncate flex-1">
            {{ item.message }}
          </span>
        </div>
      </RecycleScroller>
    </div>
  </div>
</template>
