<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { wsService } from '@/services/websocket'
import AppSidebar from '@/components/AppSidebar.vue'
import AppHeader from '@/components/AppHeader.vue'
import DashboardView from '@/views/DashboardView.vue'

onMounted(() => wsService.connect())
onUnmounted(() => wsService.disconnect())
</script>

<template>
  <div
    class="flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 min-h-screen transition-colors"
  >
    <AppSidebar />

    <div class="flex-1 flex flex-col min-w-0">
      <AppHeader />
      <DashboardView />
    </div>
  </div>
</template>
