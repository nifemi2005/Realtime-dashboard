import { WebSocketServer } from 'ws'

const PORT = 8080
const wss = new WebSocketServer({ port: PORT })

const services = [
  'api-gateway',
  'auth-service',
  'payments-service',
  'user-service',
  'notification-service',
  'database',
]

const state = {}
services.forEach((svc) => {
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

function drift(value, min, max, maxStep) {
  const next = value + (Math.random() - 0.5) * 2 * maxStep
  return Math.max(min, Math.min(max, next))
}

function broadcast(event) {
  const payload = JSON.stringify(event)
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      // 1 = OPEN — only send if the connection is ready
      client.send(payload)
    }
  })
}

wss.on('connection', (socket) => {
  console.log('Client connected. Total:', wss.clients.size)
  socket.on('close', () => {
    console.log('Client disconnected. Total:', wss.clients.size)
  })
})

setInterval(() => {
  services.forEach((service) => {
    const s = state[service]
    s.cpu = drift(s.cpu, 10, 95, 3)
    s.memory = drift(s.memory, 20, 90, 2)
    s.requestsPerSec = drift(s.requestsPerSec, 100, 2000, 50)
    s.errorRate = drift(s.errorRate, 0, 10, 0.3)
    s.p50 = drift(s.p50, 20, 200, 10)
    s.p95 = drift(s.p95, 100, 800, 20)
    s.p99 = drift(s.p99, 200, 1500, 40)

    broadcast({
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
}, 1000)

const logMessages = {
  info: [
    'Request processed successfully',
    'Cache hit for key user_session',
    'Health check passed',
    'Background job completed',
    'New session created',
  ],
  warn: [
    'High memory usage detected',
    'Slow query detected (>500ms)',
    'Rate limit approaching threshold',
    'Deprecated API endpoint accessed',
  ],
  error: [
    'JWT validation failed',
    'Database connection timeout',
    'Failed to send notification',
    'Upstream service returned 500',
  ],
  critical: ['Database connection pool exhausted', 'Service unavailable', 'Payment gateway down'],
}

function pickSeverity() {
  const r = Math.random()
  if (r < 0.7) return 'info'
  if (r < 0.9) return 'warn'
  if (r < 0.98) return 'error'
  return 'critical'
}

function emitLog() {
  const severity = pickSeverity()
  const service = services[Math.floor(Math.random() * services.length)]
  const messages = logMessages[severity]
  const message = messages[Math.floor(Math.random() * messages.length)]

  broadcast({
    type: 'log',
    timestamp: Date.now(),
    service,
    severity,
    message,
    requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
  })

  setTimeout(emitLog, 200 + Math.random() * 800)
}
emitLog()

setInterval(() => {
  services.forEach((service) => {
    const s = state[service]
    if (s.errorRate > 7) s.status = 'down'
    else if (s.errorRate > 3 || s.cpu > 85) s.status = 'degraded'
    else s.status = 'healthy'

    broadcast({
      type: 'status',
      timestamp: Date.now(),
      service,
      status: s.status,
      uptime: +(99 + Math.random()).toFixed(2),
    })
  })
}, 5000)

// ===== 9. Occasionally emit alerts when thresholds are crossed =====
setInterval(() => {
  services.forEach((service) => {
    const s = state[service]
    if (s.errorRate > 5 && Math.random() < 0.4) {
      broadcast({
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
    if (s.cpu > 85 && Math.random() < 0.3) {
      broadcast({
        type: 'alert',
        timestamp: Date.now(),
        id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: `High CPU on ${service}`,
        severity: 'warning',
        service,
        metric: 'cpu',
        value: +s.cpu.toFixed(1),
        threshold: 85,
      })
    }
  })
}, 8000)

console.log(`Mock WebSocket server running on ws://localhost:${PORT}`)
console.log(`Streaming data from ${services.length} services...`)
