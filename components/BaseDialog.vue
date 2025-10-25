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
    default: '1000px'
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
  padding: 1.25rem 1.5rem 1.5rem 1.5rem !important;
  border-top: 1px solid rgb(226 232 240 / 0.5);
  gap: 1rem;
  justify-content: flex-end;
  flex-shrink: 0;
  background: rgb(248 250 252 / 0.5);
}

.dialog-actions :deep(.v-btn) {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0;
  padding: 0.75rem 1.5rem;
  height: auto;
  border-radius: 0.75rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.dialog-actions :deep(.v-btn:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.dialog-actions :deep(.v-btn[variant="outlined"]) {
  border-color: rgb(226 232 240);
  color: rgb(71 85 105);
  background: white;
}

.dialog-actions :deep(.v-btn[variant="outlined"]:hover) {
  border-color: rgb(148 163 184);
  background: rgb(248 250 252);
}

.dialog-actions :deep(.v-btn[color="primary"]) {
  background: rgb(99 102 241);
  color: white;
}

.dialog-actions :deep(.v-btn[color="primary"]:hover) {
  background: rgb(79 70 229);
}

.dialog-actions :deep(.v-btn .v-icon) {
  margin-right: 0.5rem;
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.dialog-actions :deep(.v-btn:hover .v-icon) {
  transform: scale(1.1);
}

.dialog-actions :deep(.v-btn[variant="outlined"] .v-icon) {
  color: rgb(71 85 105);
}

.dialog-actions :deep(.v-btn[color="primary"] .v-icon) {
  color: white;
}

/* Mobile responsive dialog actions */
@media (max-width: 768px) {
  .dialog-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
  
  .dialog-actions :deep(.v-btn) {
    width: 100%;
    justify-content: center;
  }
  
  .dialog-actions :deep(.v-spacer) {
    display: none;
  }
}

@media (max-width: 480px) {
  .dialog-header {
    padding: 1rem 1rem 0 1rem;
  }
  
  .dialog-content {
    padding: 1rem 1rem 0 1rem !important;
  }
  
  .dialog-actions {
    padding: 1rem 1rem 1rem 1rem !important;
  }
  
  .dialog-title__text {
    font-size: 1.125rem;
  }
}
</style>
