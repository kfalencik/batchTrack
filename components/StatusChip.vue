<template>
  <v-chip 
    :color="chipColor" 
    :variant="variant"
    :size="size"
    :dark="dark"
    :class="chipClass"
  >
    <v-icon v-if="icon" :class="iconClass">{{ icon }}</v-icon>
    <span v-if="showText" :class="textClass">{{ displayText }}</span>
  </v-chip>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'default', // 'batch', 'stock', 'product', 'availability', 'default'
  },
  size: {
    type: String,
    default: 'default'
  },
  variant: {
    type: String,
    default: 'elevated'
  },
  dark: {
    type: Boolean,
    default: true
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  showText: {
    type: Boolean,
    default: true
  },
  uppercase: {
    type: Boolean,
    default: false
  }
})

const statusConfigs = {
  // Batch statuses
  batch: {
    'fermenting': { color: 'blue', icon: 'mdi-flask' },
    'flavouring': { color: 'orange', icon: 'mdi-leaf' },
    'failed': { color: 'red', icon: 'mdi-alert-circle-outline' },
    'ready to pack': { color: 'purple', icon: 'mdi-package-up' },
    'packaged': { color: 'green', icon: 'mdi-package-variant-closed' }
  },
  // Stock statuses
  stock: {
    'ok': { color: 'green', icon: 'mdi-check-circle' },
    'low': { color: 'orange', icon: 'mdi-alert' },
    'expired': { color: 'red', icon: 'mdi-close-circle' },
    'warning': { color: 'amber', icon: 'mdi-alert-circle' }
  },
  // Product statuses
  product: {
    'packaged': { color: 'green', icon: 'mdi-package-variant-closed' },
    'sold': { color: 'blue', icon: 'mdi-cash' },
    'in stock': { color: 'green', icon: 'mdi-check' }
  },
  // Availability statuses
  availability: {
    'available': { color: 'green', icon: 'mdi-check' },
    'missing ingredients': { color: 'red', icon: 'mdi-close' },
    'out of stock': { color: 'red', icon: 'mdi-alert-circle' }
  }
}

const config = computed(() => {
  const typeConfig = statusConfigs[props.type] || statusConfigs.default || {}
  const statusKey = props.status.toLowerCase()
  return typeConfig[statusKey] || { color: 'grey', icon: 'mdi-help-circle' }
})

const chipColor = computed(() => config.value.color)
const icon = computed(() => props.showIcon ? config.value.icon : null)

const displayText = computed(() => {
  return props.uppercase ? props.status.toUpperCase() : props.status
})

const chipClass = computed(() => {
  return props.uppercase ? 'text-uppercase' : ''
})

const iconClass = computed(() => {
  return props.showText ? 'mr-2' : ''
})

const textClass = computed(() => {
  return props.uppercase ? 'text-uppercase' : ''
})
</script>