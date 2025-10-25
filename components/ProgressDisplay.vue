<template>
  <div class="progress-display" v-tooltip="tooltipText">
    <v-progress-linear 
      :buffer-value="progress.percent" 
      height="10" 
      rounded 
      :color="color" 
      :striped="striped"
    />
    <div v-if="showLabel" class="progress-label mt-1">
      {{ progress.label }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  progress: {
    type: Object,
    required: true,
    validator: (progress) => {
      return progress && 
        typeof progress.percent === 'number' && 
        typeof progress.label === 'string'
    }
  },
  color: {
    type: String,
    default: 'success'
  },
  striped: {
    type: Boolean,
    default: true
  },
  showLabel: {
    type: Boolean,
    default: false
  },
  tooltip: {
    type: String,
    default: ''
  }
})

const tooltipText = computed(() => {
  return props.tooltip || props.progress.label
})
</script>

<style scoped>
.progress-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.progress-label {
  font-size: 0.75rem;
  color: rgb(107 114 128);
  font-weight: 500;
  text-align: center;
}
</style>