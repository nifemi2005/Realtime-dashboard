import type { StreamEvent } from '@/types/events'
import { validateEvent } from './validators'

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'

type EventHandler = (event: StreamEvent) => void
type StatusHandler = (status: ConnectionStatus) => void

class WebSocketService {
  private socket: WebSocket | null = null
  private url: string
  private eventHandlers = new Set<EventHandler>()
  private statusHandlers = new Set<StatusHandler>()
  private status: ConnectionStatus = 'disconnected'
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private shouldReconnect = true

  constructor(url: string) {
    this.url = url
  }

  // ===== Public API =====

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return

    this.shouldReconnect = true
    this.setStatus(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting')

    try {
      this.socket = new WebSocket(this.url)
    } catch (err) {
      console.error('[WS] Failed to create socket:', err)
      this.setStatus('error')
      this.scheduleReconnect()
      return
    }

    this.socket.onopen = () => {
      console.log('[WS] Connected')
      this.reconnectAttempts = 0
      this.setStatus('connected')
    }

    this.socket.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data)
        const event = validateEvent(parsed)
        if (event) {
          this.eventHandlers.forEach((handler) => handler(event))
        } else {
          console.warn('[WS] Dropped malformed event:', parsed)
        }
      } catch (err) {
        console.warn('[WS] Failed to parse message:', err)
      }
    }

    this.socket.onerror = () => {
      console.error('[WS] Socket error')
      this.setStatus('error')
    }

    this.socket.onclose = () => {
      console.log('[WS] Closed')
      this.socket = null
      this.setStatus('disconnected')
      if (this.shouldReconnect) this.scheduleReconnect()
    }
  }

  disconnect() {
    this.shouldReconnect = false
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.socket?.close()
    this.socket = null
  }

  // Subscribe to events. Returns a function to unsubscribe.
  onEvent(handler: EventHandler): () => void {
    this.eventHandlers.add(handler)
    return () => this.eventHandlers.delete(handler)
  }

  // Subscribe to connection status changes.
  onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler)
    handler(this.status) // give the new subscriber the current status immediately
    return () => this.statusHandlers.delete(handler)
  }

  // ===== Private helpers =====

  private setStatus(status: ConnectionStatus) {
    this.status = status
    this.statusHandlers.forEach((handler) => handler(status))
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return // already scheduled

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, capped at 30s
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000)
    this.reconnectAttempts++

    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }
}

// Singleton — one instance shared across the whole app
export const wsService = new WebSocketService('ws://localhost:8080')
