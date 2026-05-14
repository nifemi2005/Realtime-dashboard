import type { StreamEvent } from '@/types/events'

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

export function validateEvent(raw: unknown): StreamEvent | null {
  if (!isObject(raw)) return null

  // Every event needs these three fields
  if (typeof raw.timestamp !== 'number') return null
  if (typeof raw.service !== 'string') return null
  if (typeof raw.type !== 'string') return null

  // Check type-specific required fields
  switch (raw.type) {
    case 'metric':
      if (typeof raw.cpu !== 'number') return null
      if (typeof raw.memory !== 'number') return null
      if (!isObject(raw.latency)) return null
      break
    case 'log':
      if (typeof raw.severity !== 'string') return null
      if (typeof raw.message !== 'string') return null
      break
    case 'alert':
      if (typeof raw.id !== 'string') return null
      if (typeof raw.title !== 'string') return null
      break
    case 'status':
      if (typeof raw.status !== 'string') return null
      break
    default:
      return null // unknown event type
  }

  return raw as unknown as StreamEvent
}
