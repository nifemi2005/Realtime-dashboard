# HawkEye

A real-time monitoring dashboard built with Vue 3, TypeScript, and ECharts. Streams live service metrics, logs, alerts, and health status over a WebSocket and visualizes them with smooth charts, animated metric cards, and a virtualized activity feed.

## Tech stack

- **Vue 3** with the Composition API (`<script setup>`)
- **TypeScript**
- **Vite** for the build tool
- **Pinia** for state management
- **Tailwind CSS v4** for styling
- **ECharts** (via `vue-echarts`) for charts
- **vue-virtual-scroller** for the activity feed
- **@vueuse/core** for utilities (`useTransition`, `refThrottled`)
- **Lucide Vue Next** for icons
- **ws** for the mock Node.js WebSocket server

## Features

- Live WebSocket data streaming with auto-reconnect and exponential backoff
- 4 metric cards with animated counters, mini sparklines, and trend indicators
- 3 live charts: CPU/memory line, requests-per-service bar, latency percentile area
- Virtualized activity feed handling 500+ log entries with no lag
- Pause/resume streaming
- Time-range selector (Live / 1m / 5m / 10m)
- Severity filter on the activity feed
- Dark/light mode with system-preference detection and localStorage persistence
- Fully responsive: drawer sidebar on mobile/tablet, icon column on desktop
- Connection-state banner with reconnect-attempt counter
- Toast notifications for critical alerts
- Keyboard shortcuts (Space pauses, T toggles theme)

## Setup

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm

### Install

```bash
git clone https://github.com/nifemi2005/Realtime-dashboard.git
cd realtime-dashboard
npm install
```

### Run

Two terminals required:

```bash
# Terminal 1 — Vue app
npm run dev

# Terminal 2 — mock WebSocket server
npm run mock-server
```

Open <http://localhost:5173>.

## Architecture

The codebase is split into clear layers, each only depending on layers beneath it:

```
mock-server/      Node.js WebSocket server — broadcasts simulated data
src/
├── services/    Framework-agnostic: WebSocket client, validator, ECharts setup
├── stores/      Pinia stores: one per event type + UI controls + wiring
├── composables/ Reactive logic shared between components
├── components/  Reusable UI building blocks
├── views/       Page-level component (DashboardView)
└── types/       Shared TypeScript types
```

The **WebSocket service** has zero knowledge of Pinia. **Stores** have zero knowledge of components. **Components** have zero knowledge of the WebSocket service. The only place they meet is `stores/setup.ts`, a small wiring file that subscribes to the service and dispatches each event to the right store. That separation means any layer could be swapped without changing the others.

## Data streaming approach

The mock server emits four event types:

| Type     | Frequency             | Purpose                                                    |
| -------- | --------------------- | ---------------------------------------------------------- |
| `metric` | every 1s per service  | CPU, memory, requests/sec, error rate, latency percentiles |
| `log`    | random 200ms–1s       | Severity-tagged log entries                                |
| `alert`  | every 8s, conditional | Fires when error rate >5% or CPU >85%                      |
| `status` | every 5s per service  | Service health (healthy/degraded/down)                     |

Values drift smoothly between ticks via a `drift(value, min, max, maxStep)` helper rather than being randomly regenerated each second. That's what makes the dashboard feel like a real system rather than statistical noise.

The client uses the native `WebSocket` API wrapped in a service class that handles:

- Connection establishment
- Automatic reconnect with exponential backoff (1s, 2s, 4s, 8s, capped at 30s)
- Payload validation (drops malformed events without crashing)
- Subscriber pattern so multiple components can listen

## State management strategy

Five Pinia stores, each shaped to its data:

| Store      | Shape                                                 | Bounded?                               |
| ---------- | ----------------------------------------------------- | -------------------------------------- |
| `metrics`  | `Record<service, MetricEvent[]>`                      | 600 points per service (~10 min @ 1Hz) |
| `logs`     | `LogEvent[]` (newest first)                           | 500 logs                               |
| `alerts`   | `AlertEvent[]` + `Set<string>` ack'd IDs              | 100 alerts                             |
| `status`   | `Record<service, StatusEvent>`                        | Latest only                            |
| `controls` | UI state: `isPaused`, `timeRange`, `activeSeverities` | n/a                                    |

**Bounded buffers** prevent unbounded memory growth. Every store uses `push() + shift()` (or `unshift() + pop()`) to maintain a fixed maximum length. Same idea as a ring buffer; simpler code; sufficient performance for our throughput.

**Derived data lives in composables.** `useGlobalMetrics` reads from the metrics store and produces the aggregates and time-series the cards/charts need. The stores stay focused on raw data; the composable handles transformations.

**Setup-store syntax** (Pinia's newer Composition API style) is used throughout for better TypeScript support and consistency with the rest of the codebase.

## Rendering optimization decisions

| Optimization                                 | Where                            | Impact                                         |
| -------------------------------------------- | -------------------------------- | ---------------------------------------------- |
| Bounded buffers                              | All event stores                 | Memory stays constant indefinitely             |
| Virtualized list (`RecycleScroller`)         | Activity feed                    | ~12 row DOM nodes regardless of buffer size    |
| Throttled chart data (`refThrottled`, 250ms) | `useGlobalMetrics`               | Chart re-renders capped at 4Hz                 |
| Throttled feed items (200ms)                 | `ActivityFeed`                   | Feed re-renders capped at 5Hz                  |
| Canvas-renderer ECharts                      | All charts                       | GPU-accelerated drawing of thousands of points |
| Tree-shaken ECharts (`use([...])`)           | `services/echarts.ts`            | Bundle ~150KB instead of ~1MB                  |
| `computed` memoization                       | Every derived value              | Re-runs only when deps change                  |
| `onUnmounted` cleanup                        | Every composable that subscribes | No memory leaks from orphaned listeners        |
| Theme applied at module load                 | `useTheme.ts`                    | No flash of incorrect theme on first paint     |

The metric cards aren't throttled because they already smooth via `useTransition`'s requestAnimationFrame tween — double-throttling would feel sluggish.

## Trade-offs

**Single global time-range.** All time-series charts share one time-range selector rather than allowing per-chart ranges. Operators usually want sync'd views, and the complexity wasn't worth the alternative.

**Aggregate-only charts.** Charts show metrics averaged across all services. A service selector is the obvious next feature — would just need a `selectedService` ref in the controls store and per-service filters in `useGlobalMetrics`.

**No persistence except theme.** Data is in-memory only. Refresh = blank dashboard until new data flows in. A production version would persist recent history to IndexedDB.

**Manual payload validation.** Hand-written type guards in `services/validators.ts` rather than Zod. Smaller bundle; more verbose code. A larger app would use a declarative schema library.

**Web Workers skipped.** The heaviest aggregation runs at ~6Hz with sub-millisecond cost on the main thread. Moving it to a Worker would be over-engineering at this data scale. At 100+ events/sec it'd start to matter.

**Mock server, not a real backend.** Obvious for a demo. The frontend is production-shaped — it could connect to any backend that speaks the documented event schema over WebSocket or SSE.

## Possible next steps

- Per-service selector for line/area charts
- Persistence to IndexedDB for offline-capable history
- Real backend behind the WebSocket
- Command palette (cmd-K) for quick navigation
- Drag-and-drop customizable widget layout
- Service detail page (route per service)
- Authentication and user accounts
- Browser-native notifications
- Replay mode (scrub a time range)
- Data export (CSV, JSON)

## Project structure

```
realtime-dashboard/
├── mock-server/
│   └── server.js
├── src/
│   ├── assets/
│   │   └── main.css
│   ├── components/
│   │   ├── ActivityFeed.vue
│   │   ├── AppHeader.vue
│   │   ├── AppSidebar.vue
│   │   ├── ConnectionBanner.vue
│   │   ├── MetricCard.vue
│   │   ├── ThemeToggle.vue
│   │   ├── TimeRangeSelector.vue
│   │   ├── Toasts.vue
│   │   ├── WidgetPlaceholder.vue
│   │   └── charts/
│   │       ├── BarChart.vue
│   │       ├── CpuMemoryChart.vue
│   │       ├── LatencyChart.vue
│   │       ├── LineChart.vue
│   │       └── RequestsBarChart.vue
│   ├── composables/
│   │   ├── useAlertToasts.ts
│   │   ├── useGlobalMetrics.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useSidebar.ts
│   │   ├── useTheme.ts
│   │   ├── useToasts.ts
│   │   └── useWebSocket.ts
│   ├── services/
│   │   ├── echarts.ts
│   │   ├── validators.ts
│   │   └── websocket.ts
│   ├── stores/
│   │   ├── alerts.ts
│   │   ├── controls.ts
│   │   ├── logs.ts
│   │   ├── metrics.ts
│   │   ├── setup.ts
│   │   └── status.ts
│   ├── types/
│   │   └── events.ts
│   ├── views/
│   │   └── DashboardView.vue
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## License

MIT
