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
              <v-avatar size="40" class="help-avatar">
                <v-icon color="white">{{ item.icon }}</v-icon>
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
  background: linear-gradient(135deg, rgb(99 102 241) 0%, rgb(139 92 246) 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.2);
}

.help-card-title {
  color: white;
  padding: 1.5rem 2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.help-icon {
  font-size: 1.5rem;
  color: rgb(255 255 255 / 0.9);
}

.help-card-content {
  padding: 2rem;
  color: white;
}

.help-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.help-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.help-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.help-item-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.help-avatar {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.help-item h4 {
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
}

.help-item p {
  color: rgb(255 255 255 / 0.9);
  line-height: 1.6;
  margin: 0;
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>