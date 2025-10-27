<template>
  <v-chip 
    :color="chipColor" 
    :variant="variant"
    :size="size"
    :class="['modern-status-chip', chipClass]"
  >
    <v-icon 
      v-if="icon && showIcon" 
      :class="['chip-icon', iconClass]"
      :size="iconSize"
    >
      {{ icon }}
    </v-icon>
    <span v-if="showText" :class="['chip-text', textClass]">{{ displayText }}</span>
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
    'good': { color: 'green', icon: 'mdi-check-circle' },
    'fresh': { color: 'green', icon: 'mdi-leaf' },
    'low': { color: 'orange', icon: 'mdi-alert' },
    'expired': { color: 'red', icon: 'mdi-close-circle' },
    'warning': { color: 'amber', icon: 'mdi-alert-circle' },
    'expiring soon': { color: 'amber', icon: 'mdi-clock-alert' },
    'needs attention': { color: 'orange', icon: 'mdi-alert-octagon' },
    'critical': { color: 'red', icon: 'mdi-alert-circle-outline' },
    'mixed': { color: 'blue', icon: 'mdi-information' },
    'no date': { color: 'grey', icon: 'mdi-calendar-question' },
    'no items': { color: 'grey', icon: 'mdi-package-variant-closed-remove' }
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
  },
  // Duty statuses
  duty: {
    'untaxed': { color: 'orange', icon: 'mdi-clock-outline' },
    'tax paid': { color: 'green', icon: 'mdi-check-circle' },
    'destroyed': { color: 'red', icon: 'mdi-delete-outline' },
    'transferred': { color: 'blue', icon: 'mdi-truck-delivery' }
  },
  // Fermenter statuses
  fermenter: {
    'available': { color: 'green', icon: 'mdi-check-circle' },
    'fermenting': { color: 'blue', icon: 'mdi-flask' },
    'ready to pack': { color: 'purple', icon: 'mdi-package-up' },
    'failed': { color: 'red', icon: 'mdi-alert-circle-outline' },
    'packaged': { color: 'green', icon: 'mdi-package-variant-closed' }
  },
  // Entity types for activity logs
  entity: {
    'batch': { color: 'blue', icon: 'mdi-flask' },
    'fermenter': { color: 'green', icon: 'mdi-beer' },
    'stock': { color: 'orange', icon: 'mdi-package-variant' },
    'product': { color: 'purple', icon: 'mdi-bottle-soda' },
    'recipe': { color: 'amber', icon: 'mdi-book-open-page-variant' },
    'tax': { color: 'red', icon: 'mdi-receipt' }
  },
  // Action types for activity logs
  action: {
    'create': { color: 'success', icon: 'mdi-plus' },
    'update': { color: 'info', icon: 'mdi-pencil' },
    'delete': { color: 'error', icon: 'mdi-delete' },
    'status_change': { color: 'info', icon: 'mdi-swap-horizontal' },
    'transfer': { color: 'purple', icon: 'mdi-truck-delivery' },
    'deduct': { color: 'orange', icon: 'mdi-minus' },
    'add_stock': { color: 'green', icon: 'mdi-package-variant-plus' },
    'batch_progress': { color: 'blue', icon: 'mdi-progress-clock' }
  }
}

const config = computed(() => {
  const typeConfig = statusConfigs[props.type] || statusConfigs.default || {}
  const statusKey = props.status.toLowerCase()
  
  // Handle descriptive status text that contains keywords
  let matchedConfig = typeConfig[statusKey]
  
  if (!matchedConfig && props.type === 'stock') {
    // Try to match based on keywords in the status text
    if (statusKey.includes('expired') || statusKey.includes('expires today')) {
      matchedConfig = typeConfig['expired']
    } else if (statusKey.includes('expires tomorrow') || statusKey.includes('expires in')) {
      if (statusKey.includes('expires in 1') || statusKey.includes('expires in 2') || statusKey.includes('expires in 3')) {
        matchedConfig = typeConfig['expiring soon']
      } else if (statusKey.includes('expires in')) {
        matchedConfig = typeConfig['warning']
      }
    } else if (statusKey.includes('fresh')) {
      matchedConfig = typeConfig['fresh']
    } else if (statusKey.includes('no expiry') || statusKey.includes('no date')) {
      matchedConfig = typeConfig['no date']
    } else if (statusKey.includes('needs attention')) {
      matchedConfig = typeConfig['needs attention']
    } else if (statusKey.includes('expiring soon')) {
      matchedConfig = typeConfig['expiring soon']
    } else if (statusKey.includes('mixed')) {
      matchedConfig = typeConfig['mixed']
    } else if (statusKey.includes('no items')) {
      matchedConfig = typeConfig['no items']
    }
  }
  
  // Handle combined action statuses - simplified approach
  if (!matchedConfig && props.type === 'action') {
    // Just use the direct action status from our config
    matchedConfig = typeConfig[statusKey]
  }
  
  return matchedConfig || { color: 'grey', icon: 'mdi-help-circle' }
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
  return 'font-medium'
})

const iconSize = computed(() => {
  return props.size === 'small' ? '14' : '16'
})
</script>

<style scoped>
.modern-status-chip {
  font-weight: 600 !important;
  letter-spacing: 0.025em !important;
  border: 1px solid transparent !important;
  backdrop-filter: blur(8px) !important;
  transition: all 0.2s ease !important;
}

.modern-status-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
}

/* Status-specific styling */
:deep(.v-chip--color-green) {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%) !important;
  color: rgb(5, 150, 105) !important;
  border-color: rgba(16, 185, 129, 0.2) !important;
}

:deep(.v-chip--color-success) {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%) !important;
  color: rgb(5, 150, 105) !important;
  border-color: rgba(16, 185, 129, 0.2) !important;
}

:deep(.v-chip--color-red) {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(245, 101, 101, 0.05) 100%) !important;
  color: rgb(220, 38, 38) !important;
  border-color: rgba(239, 68, 68, 0.2) !important;
}

:deep(.v-chip--color-error) {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(245, 101, 101, 0.05) 100%) !important;
  color: rgb(220, 38, 38) !important;
  border-color: rgba(239, 68, 68, 0.2) !important;
}

:deep(.v-chip--color-blue) {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(96, 165, 250, 0.05) 100%) !important;
  color: rgb(37, 99, 235) !important;
  border-color: rgba(59, 130, 246, 0.2) !important;
}

:deep(.v-chip--color-info) {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(56, 189, 248, 0.05) 100%) !important;
  color: rgb(2, 132, 199) !important;
  border-color: rgba(14, 165, 233, 0.2) !important;
}

:deep(.v-chip--color-yellow) {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%) !important;
  color: rgb(217, 119, 6) !important;
  border-color: rgba(245, 158, 11, 0.2) !important;
}

:deep(.v-chip--color-purple) {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(167, 139, 250, 0.05) 100%) !important;
  color: rgb(109, 40, 217) !important;
  border-color: rgba(139, 92, 246, 0.2) !important;
}

:deep(.v-chip--color-orange) {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(254, 154, 46, 0.05) 100%) !important;
  color: rgb(234, 88, 12) !important;
  border-color: rgba(251, 146, 60, 0.2) !important;
}

:deep(.v-chip--color-amber) {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%) !important;
  color: rgb(217, 119, 6) !important;
  border-color: rgba(245, 158, 11, 0.2) !important;
}

:deep(.v-chip--color-grey) {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(156, 163, 175, 0.05) 100%) !important;
  color: rgb(75, 85, 99) !important;
  border-color: rgba(107, 114, 128, 0.2) !important;
}

.chip-icon {
  opacity: 0.9;
}

.chip-text {
  font-size: 0.875rem;
}

/* Size variations */
:deep(.v-chip--size-small) .chip-text {
  font-size: 0.75rem;
}

:deep(.v-chip--size-large) .chip-text {
  font-size: 1rem;
}
</style>