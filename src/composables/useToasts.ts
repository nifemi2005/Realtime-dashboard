import { ref } from 'vue'

export interface Toast {
  id: string
  title: string
  message?: string
  variant: 'info' | 'warning' | 'critical'
  timestamp: number
}

const toasts = ref<Toast[]>([])

export function useToasts() {
  function add(toast: Omit<Toast, 'id' | 'timestamp'>) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    const fullToast: Toast = { ...toast, id, timestamp: Date.now() }
    toasts.value = [...toasts.value, fullToast]
    setTimeout(() => remove(id), 5000)
  }

  function remove(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, add, remove }
}
