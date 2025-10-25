<template>
  <div class="tab-navigation">
    <v-tabs 
      v-model="activeTab" 
      class="modern-tabs"
      :class="tabClass"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <v-tab 
        v-for="tab in tabs" 
        :key="tab.value" 
        :value="tab.value"
        class="modern-tab"
      >
        <v-icon v-if="tab.icon" class="mr-2">{{ tab.icon }}</v-icon>
        {{ tab.label }}
        <v-badge 
          v-if="tab.badge !== undefined && tab.badge !== null" 
          :content="tab.badge" 
          :color="tab.badgeColor || 'primary'"
          class="ml-2"
          inline
        />
      </v-tab>
    </v-tabs>

    <v-window v-model="activeTab" class="tab-content">
      <v-window-item 
        v-for="tab in tabs" 
        :key="tab.value" 
        :value="tab.value"
      >
        <slot :name="tab.value" />
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null
  },
  tabs: {
    type: Array,
    required: true,
    validator: (tabs) => tabs.every(tab => 
      tab.value !== undefined && tab.label
    )
  },
  tabClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const activeTab = ref(props.modelValue || (props.tabs.length > 0 ? props.tabs[0].value : null))

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue !== activeTab.value) {
    activeTab.value = newValue
  }
})

// Watch for changes to activeTab and emit
watch(activeTab, (newValue) => {
  emit('update:modelValue', newValue)
})
</script>

<style scoped>
.tab-navigation {
  margin-bottom: 2rem;
}

.modern-tabs {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.modern-tabs :deep(.v-slide-group__container) {
  background: linear-gradient(135deg, rgb(248 250 252) 0%, rgb(241 245 249) 100%);
}

.modern-tab {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.025em;
  transition: all 0.3s ease;
}

.modern-tab:hover {
  background-color: rgba(99, 102, 241, 0.1);
}

.modern-tabs :deep(.v-tab--selected) {
  background-color: rgb(99 102 241);
  color: white;
}

.modern-tabs :deep(.v-tab--selected:hover) {
  background-color: rgb(79 70 229);
}

.tab-content {
  min-height: 200px;
}
</style>