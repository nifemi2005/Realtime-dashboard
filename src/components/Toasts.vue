<script setup lang="ts">
import { AlertOctagon, X } from 'lucide-vue-next'
import { useToasts } from '@/composables/useToasts'

const { toasts, remove } = useToasts()
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    <TransitionGroup
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-x-8"
      leave-active-class="transition-all duration-200 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto bg-white dark:bg-slate-900 border border-red-500/30 rounded-lg shadow-lg p-3 pr-10 max-w-sm flex gap-3 items-start relative"
      >
        <AlertOctagon :size="18" class="text-red-500 shrink-0 mt-0.5" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ toast.title }}</p>
          <p v-if="toast.message" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ toast.message }}
          </p>
        </div>
        <button
          @click="remove(toast.id)"
          class="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600"
          aria-label="Dismiss"
        >
          <X :size="14" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
