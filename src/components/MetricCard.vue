<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useTransition, TransitionPresets } from '@vueuse/core'
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    label: string
    value: number
    format?: 'number' | 'percent' | 'fraction'
    fractionTotal?: number
    sparklineData?: number[]
    sparklineColor?: string
    icon?: Component
    iconColor?: string
    trendDirection?: 'higher-is-good' | 'lower-is-good' | 'neutral'
  }>(),
  {
    format: 'number',
    sparklineColor: '#3b82f6',
    trendDirection: 'higher-is-good',
  },
)

// Smoothly tween the displayed value when props.value changes
const animatedValue = useTransition(
  computed(() => props.value),
  {
    duration: 600,
    transition: TransitionPresets.easeOutCubic,
  },
)

// Format the (animated) value for display
const displayValue = computed(() => {
  const v = animatedValue.value
  if (props.format === 'percent') return v.toFixed(2) + '%'
  if (props.format === 'fraction') return `${Math.round(v)} / ${props.fractionTotal ?? 0}`
  if (v >= 1000) return (v / 1000).toFixed(1) + 'k'
  return Math.round(v).toString()
})

// Compute trend: compare first sparkline point to last
const trend = computed(() => {
  const data = props.sparklineData
  if (!data || data.length < 2) return null
  const first = data[0]
  const last = data[data.length - 1]
  if (first === 0) return null
  return ((last - first) / first) * 100
})

const trendIcon = computed(() => {
  if (trend.value === null) return null
  if (trend.value > 1) return TrendingUp
  if (trend.value < -1) return TrendingDown
  return Minus
})

const trendClass = computed(() => {
  if (trend.value === null) return 'text-slate-400'
  const up = trend.value > 1
  const down = trend.value < -1

  if (props.trendDirection === 'neutral') return 'text-slate-500 dark:text-slate-400'
  if (props.trendDirection === 'higher-is-good') {
    if (up) return 'text-green-600 dark:text-green-400'
    if (down) return 'text-red-600 dark:text-red-400'
  } else {
    if (up) return 'text-red-600 dark:text-red-400'
    if (down) return 'text-green-600 dark:text-green-400'
  }
  return 'text-slate-500 dark:text-slate-400'
})

// Build the SVG path for the sparkline
const sparklinePath = computed(() => {
  const data = props.sparklineData
  if (!data || data.length < 2) return ''

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const width = 100
  const height = 30

  return data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * height
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
})
</script>

<template>
  <div
    class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 lg:p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
  >
    <div class="flex items-start justify-between gap-2 mb-2">
      <div class="flex items-center gap-2 min-w-0">
        <component v-if="icon" :is="icon" :size="16" :class="iconColor || 'text-slate-500'" />
        <span class="text-xs lg:text-sm text-slate-500 dark:text-slate-400 truncate">
          {{ label }}
        </span>
      </div>
      <div v-if="trendIcon" class="flex items-center gap-1 text-xs shrink-0" :class="trendClass">
        <component :is="trendIcon" :size="14" />
        <span v-if="trend !== null">{{ Math.abs(trend).toFixed(1) }}%</span>
      </div>
    </div>

    <div class="text-xl lg:text-2xl font-semibold font-mono tracking-tight">
      {{ displayValue }}
    </div>

    <div v-if="sparklineData && sparklineData.length >= 2" class="mt-3">
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" class="w-full h-8">
        <path :d="sparklinePath" :stroke="sparklineColor" stroke-width="1.5" fill="none" />
      </svg>
    </div>
  </div>
</template>
