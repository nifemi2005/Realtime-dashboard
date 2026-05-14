<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { wsService } from '@/services/websocket'
import { useControlsStore } from '@/stores/controls'
import { useTheme } from '@/composables/useTheme'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useAlertToasts } from '@/composables/useAlertToasts'
import AppSidebar from '@/components/AppSidebar.vue'
import AppHeader from '@/components/AppHeader.vue'
import ConnectionBanner from '@/components/ConnectionBanner.vue'
import Toasts from '@/components/Toasts.vue'
import DashboardView from '@/views/DashboardView.vue'

const controlsStore = useControlsStore()
const { toggle: toggleTheme } = useTheme()

// Critical alerts → toast notifications
useAlertToasts()

// Keyboard shortcuts: Space = pause/resume, T = theme
useKeyboardShortcuts([
  { code: 'Space', handler: () => controlsStore.togglePause() },
  { code: 'KeyT', handler: () => toggleTheme() },
])

onMounted(() => wsService.connect())
onUnmounted(() => wsService.disconnect())
</script>

<template>
  <div
    class="flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 min-h-screen transition-colors"
  >
    <AppSidebar />

    <div class="flex-1 flex flex-col min-w-0">
      <ConnectionBanner />
      <AppHeader />
      <DashboardView />
    </div>

    <Toasts />
  </div>
</template>
