// Every event has these in common
interface BaseEvent {
  timestamp: number
  service: string
}

export interface MetricEvent extends BaseEvent {
  type: 'metric'
  cpu: number
  memory: number
  requestsPerSec: number
  errorRate: number
  latency: {
    p50: number
    p95: number
    p99: number
  }
}

export interface LogEvent extends BaseEvent {
  type: 'log'
  severity: 'info' | 'warn' | 'error' | 'critical'
  message: string
  requestId: string
}

export interface AlertEvent extends BaseEvent {
  type: 'alert'
  id: string
  title: string
  severity: 'warning' | 'critical'
  metric: string
  value: number
  threshold: number
}

export interface StatusEvent extends BaseEvent {
  type: 'status'
  status: 'healthy' | 'degraded' | 'down'
  uptime: number
}

// A union of all possible events — this is what flows through the WebSocket
export type StreamEvent = MetricEvent | LogEvent | AlertEvent | StatusEvent
