<template>
  <div class="action-buttons-container">
    <v-btn 
      v-if="showEdit"
      icon 
      :color="editColor" 
      class="modern-btn-icon modern-btn-icon-primary action-btn edit-btn" 
      size="small"
      @click="$emit('edit', item)"
    >
      <v-icon size="18">{{ editIcon }}</v-icon>
    </v-btn>
    
    <v-btn 
      v-if="showDelete"
      icon 
      :color="deleteColor" 
      class="modern-btn-icon modern-btn-icon-danger action-btn delete-btn" 
      size="small"
      @click="$emit('delete', item)"
    >
      <v-icon size="18">{{ deleteIcon }}</v-icon>
    </v-btn>
    
    <template v-for="action in customActions" :key="action.key">
      <!-- Special handling for menu action -->
      <v-menu v-if="action.key === 'menu'" offset-y>
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            class="modern-btn-icon action-btn menu-btn"
            size="small"
          >
            <v-icon size="18">{{ action.icon }}</v-icon>
          </v-btn>
        </template>
        <v-list class="modern-menu">
          <v-list-item
            @click="$emit('custom-action', 'set-status', item, 'ready to pack')"
            class="modern-menu-item"
          >
            <template #prepend>
              <div class="menu-icon-container purple">
                <v-icon size="16">mdi-package-up</v-icon>
              </div>
            </template>
            <div class="menu-content">
              <div class="menu-title">Ready to Pack</div>
              <div class="menu-subtitle">Mark as ready for packaging</div>
            </div>
          </v-list-item>
          
          <v-list-item
            @click="$emit('custom-action', 'set-status', item, 'failed')"
            class="modern-menu-item"
          >
            <template #prepend>
              <div class="menu-icon-container red">
                <v-icon size="16">mdi-alert-circle-outline</v-icon>
              </div>
            </template>
            <div class="menu-content">
              <div class="menu-title">Mark as Failed</div>
              <div class="menu-subtitle">Batch did not complete successfully</div>
            </div>
          </v-list-item>
          
          <v-divider class="menu-divider"></v-divider>
          
          <v-list-item
            @click="$emit('custom-action', 'set-status', item, 'fermenting')"
            class="modern-menu-item"
          >
            <template #prepend>
              <div class="menu-icon-container blue">
                <v-icon size="16">mdi-flask</v-icon>
              </div>
            </template>
            <div class="menu-content">
              <div class="menu-title">Back to Fermenting</div>
              <div class="menu-subtitle">Reset to fermenting status</div>
            </div>
          </v-list-item>
          
          <v-list-item
            @click="$emit('custom-action', 'set-status', item, 'flavouring')"
            class="modern-menu-item"
          >
            <template #prepend>
              <div class="menu-icon-container orange">
                <v-icon size="16">mdi-leaf</v-icon>
              </div>
            </template>
            <div class="menu-content">
              <div class="menu-title">Back to Flavouring</div>
              <div class="menu-subtitle">Reset to flavouring status</div>
            </div>
          </v-list-item>
        </v-list>
      </v-menu>
      
      <!-- Regular custom actions -->
      <v-btn
        v-else
        icon
        :class="getActionButtonClass(action)"
        size="small"
        @click="$emit('custom-action', action.key, item)"
      >
        <v-icon size="18">{{ action.icon }}</v-icon>
      </v-btn>
    </template>
  </div>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true
  },
  showEdit: {
    type: Boolean,
    default: true
  },
  showDelete: {
    type: Boolean,
    default: true
  },
  editIcon: {
    type: String,
    default: 'mdi-pencil'
  },
  deleteIcon: {
    type: String,
    default: 'mdi-delete'
  },
  editColor: {
    type: String,
    default: 'info'
  },
  deleteColor: {
    type: String,
    default: 'red'
  },
  customActions: {
    type: Array,
    default: () => []
  }
})

defineEmits(['edit', 'delete', 'custom-action'])

const getActionButtonClass = (action) => {
  const baseClass = 'modern-btn-icon action-btn'
  
  switch (action.type || action.color) {
    case 'primary':
    case 'success':
      return `${baseClass} modern-btn-icon-primary`
    case 'danger':
    case 'error':
    case 'red':
      return `${baseClass} modern-btn-icon-danger`
    default:
      return baseClass
  }
}
</script>

<style scoped>
/* Action Buttons Container */
.action-buttons-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-end;
}

/* Modern Action Buttons */
.action-btn {
  border-radius: 0.5rem !important;
  width: 36px !important;
  height: 36px !important;
  min-width: 36px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04) !important;
}

.action-btn:hover {
  transform: scale(1.05) !important;
}

/* Edit Button */
.edit-btn {
  background: rgba(54, 163, 103, 0.1) !important;
  color: #36a367 !important;
}

.edit-btn:hover {
  background: #36a367 !important;
  color: white !important;
  box-shadow: 0 4px 8px rgba(54, 163, 103, 0.25) !important;
}

/* Delete Button */
.delete-btn {
  background: rgba(239, 68, 68, 0.1) !important;
  color: #ef4444 !important;
}

.delete-btn:hover {
  background: #ef4444 !important;
  color: white !important;
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.25) !important;
}

/* Menu Button */
.menu-btn {
  background: rgba(107, 114, 128, 0.1) !important;
  color: #6b7280 !important;
}

.menu-btn:hover {
  background: rgba(107, 114, 128, 0.2) !important;
  color: #374151 !important;
}

/* Modern Menu */
.modern-menu {
  min-width: 280px;
  border-radius: 0.75rem !important;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1) !important;
  background: white;
  overflow: hidden;
}

.modern-menu-item {
  padding: 0.75rem 1rem !important;
  transition: all 0.2s ease !important;
  border-radius: 0 !important;
  margin: 0 !important;
  cursor: pointer;
}

.modern-menu-item:hover {
  background: #f8fafc !important;
}

.menu-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 0.5rem;
  margin-right: 0.75rem;
}

.menu-icon-container.purple {
  background: rgba(147, 51, 234, 0.1);
  color: #9333ea;
}

.menu-icon-container.red {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.menu-icon-container.blue {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.menu-icon-container.orange {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.menu-content {
  flex: 1;
}

.menu-title {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
  line-height: 1.25;
  margin-bottom: 0.125rem;
}

.menu-subtitle {
  color: #6b7280;
  font-size: 0.75rem;
  line-height: 1.25;
}

.menu-divider {
  margin: 0.5rem 0 !important;
  background-color: #e5e7eb !important;
  opacity: 1 !important;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .action-btn {
    width: 32px !important;
    height: 32px !important;
    min-width: 32px !important;
  }
  
  .action-buttons-container {
    gap: 0.25rem;
  }
}
</style>