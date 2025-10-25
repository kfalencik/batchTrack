<template>
  <div class="loading-wrapper" :class="wrapperClass">
    <div v-if="loading" class="loading-overlay" :class="overlayClass">
      <v-progress-circular 
        :size="size" 
        :width="width"
        :color="color"
        indeterminate
      />
      <div v-if="text" class="loading-text mt-3" :class="textClass">
        {{ text }}
      </div>
    </div>
    <div :class="contentClass">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: ''
  },
  size: {
    type: [String, Number],
    default: 40
  },
  width: {
    type: [String, Number],
    default: 4
  },
  color: {
    type: String,
    default: 'primary'
  },
  overlay: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: true
  }
})

const wrapperClass = computed(() => ({
  'position-relative': props.overlay
}))

const overlayClass = computed(() => ({
  'loading-overlay--absolute': props.overlay,
  'loading-overlay--relative': !props.overlay,
  'd-flex': true,
  'flex-column': true,
  'align-center': true,
  'justify-center': true
}))

const contentClass = computed(() => ({
  'loading-content--disabled': props.loading && props.disabled
}))

const textClass = computed(() => ({
  'text-center': true,
  'text-body-2': true
}))
</script>

<style scoped>
.loading-wrapper {
  min-height: inherit;
}

.loading-overlay--absolute {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.loading-overlay--relative {
  padding: 2rem;
}

.loading-content--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.loading-text {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.875rem;
}
</style>