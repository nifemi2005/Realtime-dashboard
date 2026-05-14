<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  subtitle?: string
  icon?: Component
  previewType?: 'line' | 'bar' | 'area' | 'feed'
}>()
</script>

<template>
  <div
    class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5"
  >
    <div class="flex items-start justify-between mb-4">
      <div>
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
          {{ subtitle }}
        </p>
      </div>
      <component v-if="icon" :is="icon" :size="18" class="text-slate-400 shrink-0" />
    </div>

    <div
      class="relative h-40 lg:h-48 rounded-lg bg-slate-50 dark:bg-slate-950/50 overflow-hidden flex items-center justify-center"
    >
      <svg
        v-if="previewType === 'line'"
        viewBox="0 0 400 120"
        preserveAspectRatio="none"
        class="absolute inset-0 w-full h-full opacity-25"
      >
        <path
          d="M 0 80 L 50 65 L 100 70 L 150 45 L 200 55 L 250 35 L 300 40 L 350 25 L 400 32"
          stroke="#3b82f6"
          stroke-width="1.5"
          fill="none"
        />
        <path
          d="M 0 95 L 50 92 L 100 85 L 150 88 L 200 75 L 250 78 L 300 70 L 350 73 L 400 65"
          stroke="#10b981"
          stroke-width="1.5"
          fill="none"
        />
      </svg>

      <svg
        v-else-if="previewType === 'bar'"
        viewBox="0 0 240 120"
        preserveAspectRatio="none"
        class="absolute inset-0 w-full h-full opacity-25"
      >
        <rect x="10" y="50" width="25" height="70" fill="#3b82f6" />
        <rect x="45" y="20" width="25" height="100" fill="#3b82f6" />
        <rect x="80" y="65" width="25" height="55" fill="#3b82f6" />
        <rect x="115" y="35" width="25" height="85" fill="#3b82f6" />
        <rect x="150" y="55" width="25" height="65" fill="#3b82f6" />
        <rect x="185" y="40" width="25" height="80" fill="#3b82f6" />
      </svg>

      <svg
        v-else-if="previewType === 'area'"
        viewBox="0 0 400 120"
        preserveAspectRatio="none"
        class="absolute inset-0 w-full h-full opacity-30"
      >
        <path
          d="M 0 95 L 50 90 L 100 93 L 150 80 L 200 83 L 250 75 L 300 80 L 350 70 L 400 75 L 400 120 L 0 120 Z"
          fill="#a78bfa"
        />
        <path
          d="M 0 80 L 50 75 L 100 77 L 150 65 L 200 68 L 250 60 L 300 65 L 350 55 L 400 60 L 400 120 L 0 120 Z"
          fill="#8b5cf6"
        />
        <path
          d="M 0 65 L 50 60 L 100 62 L 150 50 L 200 53 L 250 45 L 300 50 L 350 40 L 400 45 L 400 120 L 0 120 Z"
          fill="#7c3aed"
        />
      </svg>

      <div v-else-if="previewType === 'feed'" class="absolute inset-0 p-4 space-y-2 opacity-30">
        <div class="flex items-center gap-2 text-xs">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          <span class="text-slate-500 font-mono">12:34:56</span>
          <span class="text-slate-600 truncate">Request processed</span>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span class="text-slate-500 font-mono">12:34:54</span>
          <span class="text-slate-600 truncate">Slow query detected</span>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          <span class="text-slate-500 font-mono">12:34:52</span>
          <span class="text-slate-600 truncate">JWT validation failed</span>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          <span class="text-slate-500 font-mono">12:34:50</span>
          <span class="text-slate-600 truncate">Cache hit</span>
        </div>
      </div>

      <span
        class="relative z-10 text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest px-2.5 py-1 rounded-md bg-white/70 dark:bg-slate-900/70 ring-1 ring-slate-200 dark:ring-slate-800"
      >
        Placeholder
      </span>
    </div>
  </div>
</template>
