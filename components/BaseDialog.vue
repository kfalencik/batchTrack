<template>
  <v-dialog 
    :model-value="modelValue" 
    :max-width="maxWidth" 
    :persistent="persistent"
    @update:model-value="$emit('update:modelValue', $event)"
    transition="dialog-top-transition"
    scrollable
  >
    <v-card :class="['modern-dialog-card', cardClass]">
      <!-- Modern Header -->
      <div class="dialog-header">
        <div class="dialog-header__content">
          <div class="dialog-title">
            <v-icon v-if="titleIcon" class="dialog-title__icon" :color="iconColor">{{ titleIcon }}</v-icon>
            <h3 class="dialog-title__text">{{ title }}</h3>
          </div>
          <v-btn 
            icon
            variant="text"
            size="small"
            class="dialog-close"
            @click="$emit('close')"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
      
      <div class="dialog-content-container">
        <v-card-text :class="['dialog-content', contentClass]">
          <slot />
        </v-card-text>
      </div>

      <v-card-actions v-if="$slots.actions" class="dialog-actions">
        <slot name="actions" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  titleIcon: {
    type: String,
    default: null
  },
  maxWidth: {
    type: String,
    default: '900px'
  },
  persistent: {
    type: Boolean,
    default: true
  },
  iconColor: {
    type: String,
    default: 'primary'
  },
  cardClass: {
    type: String,
    default: ''
  },
  contentClass: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue', 'close'])
</script>

<style scoped>
.modern-dialog-card {
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.dialog-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid rgb(226 232 240 / 0.5);
  margin-bottom: 0;
  flex-shrink: 0;
}

.dialog-header__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1rem;
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dialog-title__icon {
  padding: 0.5rem;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 0.75rem;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.dialog-title__text {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(15 23 42);
  margin: 0;
}

.dialog-close {
  color: rgb(100 116 139) !important;
  transition: all 0.2s;
}

.dialog-close:hover {
  color: rgb(239 68 68) !important;
  background: rgba(239, 68, 68, 0.1) !important;
}

.dialog-content-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.dialog-content {
  padding: 1.5rem 1.5rem 0 1.5rem !important;
}

.dialog-actions {
  padding: 1rem 1.5rem 1.5rem 1.5rem !important;
  border-top: 1px solid rgb(226 232 240 / 0.5);
  gap: 0.75rem;
  justify-content: flex-end;
  flex-shrink: 0;
}

.dialog-actions :deep(.v-btn) {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
}
</style>
