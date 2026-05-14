<script setup lang="ts">
import { computed } from 'vue'
import { WifiOff, RefreshCw } from 'lucide-vue-next'
import { useWebSocket } from '@/composables/useWebSocket'

const { status, reconnectAttempts } = useWebSocket()

const visible = computed(
  () =>
    status.value === 'disconnected' || status.value === 'reconnecting' || status.value === 'error',
)

const message = computed(() => {
  switch (status.value) {
    case 'reconnecting':
      return `Reconnecting to server… (attempt ${reconnectAttempts.value})`
    case 'disconnected':
      return 'Disconnected from server'
    case 'error':
      return 'Connection error — retrying'
    default:
      return ''
  }
})

const icon = computed(() => (status.value === 'reconnecting' ? RefreshCw : WifiOff))

const variantClass = computed(() => {
  if (status.value === 'reconnecting') {
    return 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
  }
  return 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
})
</script>

<template>
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="-translate-y-full"
    leave-active-class="transition-transform duration-300 ease-in"
    leave-to-class="-translate-y-full"
  >
    <div v-if="visible" class="border-b" :class="variantClass">
      <div class="px-4 lg:px-8 py-2.5 flex items-center gap-2 text-sm">
        <component :is="icon" :size="16" :class="status === 'reconnecting' ? 'animate-spin' : ''" />
        <span class="font-medium">{{ message }}</span>
      </div>
    </div>
  </Transition>
</template>
