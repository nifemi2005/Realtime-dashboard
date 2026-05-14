import { ref, computed } from 'vue'

// Module-level state — shared everywhere useSidebar() is called
const isMobileOpen = ref(false)

export function useSidebar() {
  return {
    isMobileOpen: computed(() => isMobileOpen.value),
    open: () => {
      isMobileOpen.value = true
    },
    close: () => {
      isMobileOpen.value = false
    },
    toggle: () => {
      isMobileOpen.value = !isMobileOpen.value
    },
  }
}
