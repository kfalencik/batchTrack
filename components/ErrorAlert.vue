<template>
  <v-alert
    v-if="show"
    :type="alertType"
    :variant="variant"
    :closable="closable"
    :class="alertClass"
    @click:close="$emit('close')"
  >
    <template #prepend v-if="showIcon">
      <v-icon>{{ icon }}</v-icon>
    </template>
    
    <div class="d-flex align-center justify-space-between w-100">
      <div class="alert-content">
        <div v-if="title" class="alert-title font-weight-medium mb-1">
          {{ title }}
        </div>
        <div class="alert-message">
          {{ message }}
        </div>
        <div v-if="details" class="alert-details text-caption mt-1 text--secondary">
          {{ details }}
        </div>
      </div>
      
      <div v-if="actions && actions.length" class="alert-actions ml-4">
        <v-btn
          v-for="action in actions"
          :key="action.key"
          :color="action.color || 'primary'"
          :variant="action.variant || 'text'"
          :size="action.size || 'small'"
          @click="$emit('action', action.key)"
        >
          {{ action.text }}
        </v-btn>
      </div>
    </div>
  </v-alert>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    default: 'error',
    validator: (value) => ['error', 'warning', 'success', 'info'].includes(value)
  },
  variant: {
    type: String,
    default: 'tonal'
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: ''
  },
  closable: {
    type: Boolean,
    default: true
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  actions: {
    type: Array,
    default: () => []
  },
  class: {
    type: String,
    default: ''
  }
})

defineEmits(['close', 'action'])

const alertType = computed(() => props.type)

const icon = computed(() => {
  const icons = {
    error: 'mdi-alert-circle',
    warning: 'mdi-alert',
    success: 'mdi-check-circle',
    info: 'mdi-information'
  }
  return icons[props.type] || icons.error
})

const alertClass = computed(() => {
  return `mb-4 ${props.class}`.trim()
})
</script>

<style scoped>
.alert-content {
  flex: 1;
}

.alert-title {
  font-size: 0.95rem;
}

.alert-message {
  font-size: 0.875rem;
}

.alert-details {
  font-size: 0.75rem;
  opacity: 0.8;
}

.alert-actions {
  flex-shrink: 0;
}
</style>