import { onMounted, onUnmounted } from 'vue'

interface Shortcut {
  code: string // KeyboardEvent.code, e.g. 'Space', 'KeyT'
  handler: (e: KeyboardEvent) => void
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  function onKeyDown(e: KeyboardEvent) {
    // Don't intercept while user is typing in an input/textarea
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }
    const match = shortcuts.find((s) => s.code === e.code)
    if (match) {
      e.preventDefault()
      match.handler(e)
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown))
  onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
}
