<template>
  <v-card 
    class="stat-card" 
    :class="[
      'transition-all duration-300 hover:scale-105 cursor-pointer',
      active ? 'stat-card--active' : 'stat-card--inactive'
    ]"
    @click="$emit('click')"
  >
    <div class="stat-card__gradient" :class="`stat-card__gradient--${color}`"></div>
    <v-card-text class="pa-6 position-relative">
      <div class="d-flex justify-space-between align-start">
        <div class="stat-body flex-grow-1">
          <div class="stat-title mb-2">{{ title }}</div>
          <div class="stat-count mb-3">{{ formattedCount }}</div>
          <div v-if="deltaText" class="stat-delta" :class="deltaClass">
            <v-icon size="14" class="mr-1">{{ deltaIcon }}</v-icon>
            <span>{{ deltaText }}</span>
          </div>
        </div>

        <div class="stat-icon">
          <div class="icon-wrapper" :class="`icon-wrapper--${color}`">
            <v-icon :color="iconColor" size="24">{{ icon }}</v-icon>
          </div>
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
  if (t.trim().startsWith('-')) return 'text-red-500'
  if (t.trim().startsWith('+')) return 'text-green-500'
  return 'text-grey-500'
})

const deltaIcon = computed(() => {
  const t = props.deltaText || ''
  if (t.trim().startsWith('-')) return 'mdi-trending-down'
  if (t.trim().startsWith('+')) return 'mdi-trending-up'
  return 'mdi-trending-neutral'
})

const iconColor = computed(() => {
  if (props.active) return 'white'
  return props.color
})
</script>

<style scoped>
.stat-card {
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

.stat-card--active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.stat-card__gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0.8;
}

.stat-card__gradient--primary {
  background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
}

.stat-card__gradient--secondary {
  background: linear-gradient(90deg, #06b6d4 0%, #22d3ee 100%);
}

.stat-card__gradient--success {
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
}

.stat-card__gradient--warning {
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
}

.stat-card__gradient--error {
  background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
}

.stat-card__gradient--info {
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
}

.stat-card__gradient--blue-lighten-1 {
  background: linear-gradient(90deg, #60a5fa 0%, #93c5fd 100%);
}

.stat-card__gradient--green {
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
}

.stat-card__gradient--red {
  background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
}

.stat-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(100 116 139);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-count {
  font-size: 2rem;
  font-weight: 700;
  color: rgb(15 23 42);
  line-height: 1.2;
}

.stat-delta {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 500;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.icon-wrapper--primary {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.icon-wrapper--secondary {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%);
  border: 1px solid rgba(6, 182, 212, 0.1);
}

.icon-wrapper--success, .icon-wrapper--green {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
  border: 1px solid rgba(16, 185, 129, 0.1);
}

.icon-wrapper--warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
  border: 1px solid rgba(245, 158, 11, 0.1);
}

.icon-wrapper--error, .icon-wrapper--red {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
  border: 1px solid rgba(239, 68, 68, 0.1);
}

.icon-wrapper--info, .icon-wrapper--blue-lighten-1 {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
  border: 1px solid rgba(59, 130, 246, 0.1);
}
</style>

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
