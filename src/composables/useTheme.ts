import { ref, computed, watch } from 'vue'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'hawkeye-theme'

// ===== Module-level state (shared across all useTheme() calls) =====

function getInitialTheme(): Theme {
  // 1. Did the user pick one previously?
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored

  // 2. Otherwise, follow their OS preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const theme = ref<Theme>(getInitialTheme())

function applyTheme(value: Theme) {
  document.documentElement.classList.toggle('dark', value === 'dark')
}

// Apply immediately when this module is first imported — before Vue mounts.
// This prevents a flash of light theme on page load.
applyTheme(theme.value)

// Whenever theme changes, re-apply it and save the preference.
watch(theme, (newTheme) => {
  applyTheme(newTheme)
  localStorage.setItem(STORAGE_KEY, newTheme)
})

// ===== Public composable =====

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark')

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function setTheme(value: Theme) {
    theme.value = value
  }

  return { theme, isDark, toggle, setTheme }
}
