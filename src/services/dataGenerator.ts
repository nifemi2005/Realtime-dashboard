import type { MetricEvent, LogEvent, AlertEvent, StatusEvent } from '@/types/events'
import { wsService } from './websocket'

const SERVICES = [
  'api-gateway',
  'auth-service',
  'payments-service',
  'user-service',
  'notification-service',
  'database',
]

const state: Record<
  string,
  {
    cpu: number
    memory: number
    requestsPerSec: number
    errorRate: number
    p50: number
    p95: number
    p99: number
    status: string
  }
> = {}

SERVICES.forEach((svc) => {
  state[svc] = {
    cpu: 30 + Math.random() * 20,
    memory: 40 + Math.random() * 30,
    requestsPerSec: 500 + Math.random() * 500,
    errorRate: Math.random(),
    p50: 80 + Math.random() * 30,
    p95: 250 + Math.random() * 100,
    p99: 600 + Math.random() * 200,
    status: 'healthy',
  }
})

function drift(value: number, min: number, max: number, step: number): number {
  return Math.max(min, Math.min(max, value + (Math.random() - 0.5) * 2 * step))
}

const LOG_MESSAGES = {
  info: [
    'Request processed successfully',
    'Cache hit for key user_session',
    'Health check passed',
    'Background job completed',
  ],
  warn: [
    'High memory usage detected',
    'Slow query detected (>500ms)',
    'Rate limit approaching threshold',
  ],
  error: ['JWT validation failed', 'Database connection timeout', 'Upstream service returned 500'],
  critical: ['Database connection pool exhausted', 'Service unavailable', 'Payment gateway down'],
}

const timers: ReturnType<typeof setTimeout>[] = []

export function startDataGenerator() {
  wsService.forceConnected()

  // Metric events every 1 second
  timers.push(
    setInterval(() => {
      SERVICES.forEach((service) => {
        const s = state[service]!
        s.cpu = drift(s.cpu, 10, 95, 3)
        s.memory = drift(s.memory, 20, 90, 2)
        s.requestsPerSec = drift(s.requestsPerSec, 100, 2000, 50)
        s.errorRate = drift(s.errorRate, 0, 10, 0.3)
        s.p50 = drift(s.p50, 20, 200, 10)
        s.p95 = drift(s.p95, 100, 800, 20)
        s.p99 = drift(s.p99, 200, 1500, 40)

        wsService.dispatchEvent({
          type: 'metric',
          timestamp: Date.now(),
          service,
          cpu: +s.cpu.toFixed(1),
          memory: +s.memory.toFixed(1),
          requestsPerSec: Math.round(s.requestsPerSec),
          errorRate: +s.errorRate.toFixed(2),
          latency: {
            p50: Math.round(s.p50),
            p95: Math.round(s.p95),
            p99: Math.round(s.p99),
          },
        })
      })
    }, 1000),
  )

  // Log events at random intervals
  function emitLog() {
    const r = Math.random()
    const severity = r < 0.7 ? 'info' : r < 0.9 ? 'warn' : r < 0.98 ? 'error' : 'critical'
    const service = SERVICES[Math.floor(Math.random() * SERVICES.length)]!
    const msgs = LOG_MESSAGES[severity as keyof typeof LOG_MESSAGES]

    wsService.dispatchEvent({
      type: 'log',
      timestamp: Date.now(),
      service,
      severity: severity as 'info' | 'warn' | 'error' | 'critical',
      message: msgs[Math.floor(Math.random() * msgs.length)]!,
      requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
    })

    const t = setTimeout(emitLog, 200 + Math.random() * 800)
    timers.push(t)
  }
  emitLog()

  // Status events every 5 seconds
  timers.push(
    setInterval(() => {
      SERVICES.forEach((service) => {
        const s = state[service]!
        s.status = s.errorRate > 7 ? 'down' : s.errorRate > 3 || s.cpu > 85 ? 'degraded' : 'healthy'

        wsService.dispatchEvent({
          type: 'status',
          timestamp: Date.now(),
          service,
          status: s.status as 'healthy' | 'degraded' | 'down',
          uptime: +(99 + Math.random()).toFixed(2),
        })
      })
    }, 5000),
  )

  // Alert events every 8 seconds (conditional)
  timers.push(
    setInterval(() => {
      SERVICES.forEach((service) => {
        const s = state[service]!
        if (s.errorRate > 5 && Math.random() < 0.4) {
          wsService.dispatchEvent({
            type: 'alert',
            timestamp: Date.now(),
            id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            title: `High error rate on ${service}`,
            severity: 'critical',
            service,
            metric: 'errorRate',
            value: +s.errorRate.toFixed(2),
            threshold: 5,
          })
        }
      })
    }, 8000),
  )
}

export function stopDataGenerator() {
  timers.forEach((t) => clearInterval(t as ReturnType<typeof setInterval>))
  timers.length = 0
}
