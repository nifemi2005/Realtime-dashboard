<script setup lang="ts">
import { Eye, LayoutDashboard, X } from 'lucide-vue-next'
import { useSidebar } from '@/composables/useSidebar'

const { isMobileOpen, close } = useSidebar()

const navItems = [{ icon: LayoutDashboard, label: 'Overview', active: true }]
</script>

<template>
  <!-- Backdrop: only on mobile, only when open -->
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-200"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isMobileOpen"
      @click="close"
      class="lg:hidden fixed inset-0 bg-black/50 z-40"
      aria-hidden="true"
    ></div>
  </Transition>

  <!-- Sidebar -->
  <aside
    :class="[
      'fixed lg:sticky top-0 left-0 h-screen z-50 shrink-0',
      'bg-white dark:bg-slate-900',
      'border-r border-slate-200 dark:border-slate-800',
      'transition-transform duration-200 ease-out',
      'w-64 lg:w-20',
      isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
  >
    <!-- Logo / drawer header -->
    <div
      class="flex items-center justify-between lg:justify-center px-5 lg:px-0 py-5 border-b border-slate-200 dark:border-slate-800"
    >
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
          <Eye :size="20" class="text-white" />
        </div>
        <span class="font-semibold lg:hidden">HawkEye</span>
      </div>
      <button
        @click="close"
        class="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Close menu"
      >
        <X :size="18" />
      </button>
    </div>

    <!-- Nav -->
    <nav class="p-3 space-y-1">
      <a
        v-for="item in navItems"
        :key="item.label"
        href="#"
        :title="item.label"
        @click="close"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
          'lg:justify-center lg:px-2',
          item.active
            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
        ]"
      >
        <component :is="item.icon" :size="20" class="shrink-0" />
        <span class="lg:hidden">{{ item.label }}</span>
      </a>
    </nav>
  </aside>
</template>
