<template>
  <v-card class="stat-card" :elevation="active ? 2 : 1" :class="active ? `bg-${color} text-white` : ''" @click="$emit('click')" outlined>
    <v-card-text class="d-flex justify-space-between align-center">
      <div class="stat-body">
        <div class="stat-title text-caption text-uppercase" :class="active ? 'text-white' : `text-${color}`">{{ title }}</div>
        <div class="stat-count" :class="active ? 'text-white' : `text-${color}`">{{ formattedCount }}</div>
        <div v-if="deltaText" class="stat-delta text-sm" :class="deltaClass">
          <v-icon small class="mr-2">{{ deltaIcon }}</v-icon>
          <span class="delta-text">{{ deltaText }}</span>
        </div>
      </div>

      <div class="stat-icon" :class="active ? 'text-white' : ''">
        <div class="icon-circle" :class="active ? `bg-white` : `bg-${color} bg-opacity-10`">
          <v-icon :color="active ? color : 'white'">{{ icon }}</v-icon>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: 'mdi-chart-box' },
  color: { type: String, default: 'primary' },
  count: { type: [Number, String], default: 0 },
  active: { type: Boolean, default: false },
  // Optional delta text e.g. "-2% vs last 28 days"
  deltaText: { type: String, default: '' }
})

const formattedCount = computed(() => {
  const c = props.count
  if (c === null || c === undefined || c === '') return '-'
  if (typeof c === 'number') return c.toLocaleString()
  // try parse number-like string
  const n = Number(String(c).replace(/,/g, ''))
  if (!Number.isNaN(n)) return n.toLocaleString()
  return String(c)
})

const deltaClass = computed(() => {
  const t = props.deltaText || ''
  if (t.trim().startsWith('-')) return 'text-red'
  if (t.trim().startsWith('+')) return 'text-green'
  return ''
})

const deltaIcon = computed(() => {
  const t = props.deltaText || ''
  if (t.trim().startsWith('-')) return 'mdi-arrow-down-bold'
  if (t.trim().startsWith('+')) return 'mdi-arrow-up-bold'
  return 'mdi-trending-neutral'
})
</script>

<style scoped>
.stat-card { min-width: 180px; cursor: pointer; }
.stat-body { display: flex; flex-direction: column; }
.stat-title { color: rgba(0,0,0,0.6); margin-bottom: 6px; }
.stat-count { font-size: 28px; font-weight: 700; line-height: 1; }
.stat-delta { margin-top: 6px; display: flex; align-items: center; }
.stat-delta .v-icon { font-size: 14px; }
.stat-icon { display:flex; align-items:center; }
.icon-circle { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
.bg-opacity-10 { opacity: 0.12; }
.text-red { color: #e53935 !important; }
.text-green { color: #43a047 !important; }
</style>
