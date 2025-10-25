<template>
  <div class="page-header">
    <div class="page-header__title-section">
      <h1 class="page-header__title">{{ title }}</h1>
      <p v-if="description" class="page-header__description">{{ description }}</p>
    </div>
    
    <div v-if="actions && actions.length" class="page-header__actions">
      <v-btn 
        v-for="action in actions" 
        :key="action.key || action.text"
        :color="action.color || 'primary'" 
        :variant="action.variant || 'flat'"
        :size="action.size || 'default'"
        class="action-btn"
        @click="$emit('action', action.key || action.text)"
      >
        <v-icon v-if="action.icon" class="mr-2" size="18">{{ action.icon }}</v-icon>
        {{ action.text }}
      </v-btn>
    </div>
    
    <v-btn 
      v-else-if="actionText"
      :color="actionColor || 'primary'" 
      variant="flat"
      class="action-btn"
      @click="$emit('action')"
    >
      <v-icon v-if="actionIcon" class="mr-2" size="18">{{ actionIcon }}</v-icon>
      {{ actionText }}
    </v-btn>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  actionText: {
    type: String,
    default: null
  },
  actionIcon: {
    type: String,
    default: null
  },
  actionColor: {
    type: String,
    default: 'primary'
  },
  actions: {
    type: Array,
    default: null
  }
})

defineEmits(['action'])
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgb(226 232 240 / 0.5);
}

.page-header__title-section {
  flex: 1;
}

.page-header__title {
  font-size: 2rem;
  font-weight: 700;
  color: rgb(15 23 42);
  margin: 0;
}

.page-header__description {
  font-size: 1rem;
  color: rgb(100 116 139);
  margin: 0.5rem 0 0 0;
  line-height: 1.5;
}

.page-header__actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.action-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  letter-spacing: 0 !important;
  padding: 0.75rem 1.5rem !important;
  height: auto !important;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) !important;
  transition: all 0.2s ease !important;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
}

.action-btn :deep(.v-icon) {
  transition: transform 0.2s ease;
}

.action-btn:hover :deep(.v-icon) {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .page-header__actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .page-header__title {
    font-size: 1.5rem;
  }
}
</style>