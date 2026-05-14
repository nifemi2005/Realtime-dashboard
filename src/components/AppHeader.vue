<script setup lang="ts">
import { computed } from 'vue'
import { Menu, Pause, Play } from 'lucide-vue-next'
import { useWebSocket } from '@/composables/useWebSocket'
import { useSidebar } from '@/composables/useSidebar'
import { useControlsStore } from '@/stores/controls'
import ThemeToggle from './ThemeToggle.vue'

const { status } = useWebSocket()
const { open } = useSidebar()
const controlsStore = useControlsStore()

const statusClass = computed(() => {
  switch (status.value) {
    case 'connected':
      return 'bg-green-500/10 text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-500/30'
    case 'connecting':
    case 'reconnecting':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-500/30'
    case 'error':
      return 'bg-red-500/10 text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-500/30'
    default:
      return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 ring-1 ring-inset ring-slate-500/30'
  }
})
</script>

<template>
  <header
    class="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800"
  >
    <div class="flex items-center justify-between px-4 lg:px-8 py-3.5">
      <div class="flex items-center gap-3">
        <button
          @click="open"
          class="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open menu"
        >
          <Menu :size="20" />
        </button>
        <div>
          <h1 class="text-base font-semibold leading-tight">Overview</h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">Live service monitoring</p>
        </div>
      </div>

      <div class="flex items-center gap-2 lg:gap-3">
        <span
          class="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
          :class="statusClass"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
          {{ controlsStore.isPaused ? 'paused' : status }}
        </span>

        <button
          @click="controlsStore.togglePause"
          :aria-label="controlsStore.isPaused ? 'Resume streaming' : 'Pause streaming'"
          :title="controlsStore.isPaused ? 'Resume' : 'Pause'"
          class="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Play v-if="controlsStore.isPaused" :size="18" />
          <Pause v-else :size="18" />
        </button>

        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
