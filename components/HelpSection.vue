<template>
  <v-card variant="flat" class="help-card mb-6">
    <v-card-title class="help-card-title">
      <v-icon class="help-icon">mdi-lightbulb-on</v-icon>
      <span>{{ title }}</span>
      <v-spacer />
      <v-btn
        variant="text"
        size="small"
        @click="toggleHelp"
        :color="isVisible ? 'white' : 'rgba(255,255,255,0.7)'"
      >
        {{ isVisible ? 'Hide' : 'Show' }} Help
        <v-icon :class="{ 'rotate-180': isVisible }">mdi-chevron-down</v-icon>
      </v-btn>
    </v-card-title>
    <v-expand-transition>
      <v-card-text v-show="isVisible" class="help-card-content">
        <div class="help-grid">
          <div 
            v-for="(item, index) in helpItems" 
            :key="index" 
            class="help-item"
          >
            <div class="help-item-header">
              <v-avatar size="32" class="help-avatar">
                <v-icon color="white" size="small">{{ item.icon }}</v-icon>
              </v-avatar>
              <h4>{{ item.title }}</h4>
            </div>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </v-card-text>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  helpItems: {
    type: Array,
    required: true,
    validator: (items) => items.every(item => 
      item.icon && item.title && item.description
    )
  },
  initiallyVisible: {
    type: Boolean,
    default: false
  }
})

const isVisible = ref(props.initiallyVisible)

const toggleHelp = () => {
  isVisible.value = !isVisible.value
}
</script>

<style scoped>
/* Help section styling */
.help-card {
  background: linear-gradient(135deg, rgb(99 102 241 / 0.8) 0%, rgb(139 92 246 / 0.8) 100%);
  border-radius: 8px !important;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.1);
}

.help-card-title {
  color: white;
  padding: 1rem 1.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.help-icon {
  font-size: 1.25rem;
  color: rgb(255 255 255 / 0.8);
}

.help-card-content {
  padding: 1.5rem;
  color: white;
}

.help-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.help-item {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s ease;
}

.help-item:hover {
  background: rgba(255, 255, 255, 0.12);
}

.help-item-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.help-avatar {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.help-item h4 {
  color: white;
  font-weight: 500;
  font-size: 1rem;
  margin: 0;
}

.help-item p {
  color: rgb(255 255 255 / 0.85);
  line-height: 1.5;
  margin: 0;
  font-size: 0.95rem;
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>