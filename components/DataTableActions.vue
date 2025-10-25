<template>
  <div class="d-flex gap-1">
    <v-btn 
      v-if="showEdit"
      icon 
      :color="editColor" 
      flat 
      size="x-small" 
      class="mr-2" 
      @click="$emit('edit', item)"
    >
      <v-icon>{{ editIcon }}</v-icon>
    </v-btn>
    <v-btn 
      v-if="showDelete"
      icon 
      :color="deleteColor" 
      flat 
      size="x-small" 
      @click="$emit('delete', item)"
    >
      <v-icon>{{ deleteIcon }}</v-icon>
    </v-btn>
    <template v-for="action in customActions" :key="action.key">
      <!-- Special handling for menu action -->
      <v-menu v-if="action.key === 'menu'" offset-y>
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            :color="action.color || 'default'"
            flat
            size="x-small"
            class="mr-1"
          >
            <v-icon>{{ action.icon }}</v-icon>
          </v-btn>
        </template>
        <v-list class="status-menu">
          <v-list-item
            @click="$emit('custom-action', 'set-status', item, 'ready to pack')"
            class="menu-item"
          >
            <template #prepend>
              <v-icon color="purple" class="mr-3">mdi-package-up</v-icon>
            </template>
            <v-list-item-title class="menu-title">Ready to Pack</v-list-item-title>
            <v-list-item-subtitle class="menu-subtitle">Mark as ready for packaging</v-list-item-subtitle>
          </v-list-item>
          <v-list-item
            @click="$emit('custom-action', 'set-status', item, 'failed')"
            class="menu-item"
          >
            <template #prepend>
              <v-icon color="red" class="mr-3">mdi-alert-circle-outline</v-icon>
            </template>
            <v-list-item-title class="menu-title">Mark as Failed</v-list-item-title>
            <v-list-item-subtitle class="menu-subtitle">Batch did not complete successfully</v-list-item-subtitle>
          </v-list-item>
          <v-divider class="my-2"></v-divider>
          <v-list-item
            @click="$emit('custom-action', 'set-status', item, 'fermenting')"
            class="menu-item"
          >
            <template #prepend>
              <v-icon color="blue" class="mr-3">mdi-flask</v-icon>
            </template>
            <v-list-item-title class="menu-title">Back to Fermenting</v-list-item-title>
            <v-list-item-subtitle class="menu-subtitle">Reset to fermenting status</v-list-item-subtitle>
          </v-list-item>
          <v-list-item
            @click="$emit('custom-action', 'set-status', item, 'flavouring')"
            class="menu-item"
          >
            <template #prepend>
              <v-icon color="orange" class="mr-3">mdi-leaf</v-icon>
            </template>
            <v-list-item-title class="menu-title">Back to Flavouring</v-list-item-title>
            <v-list-item-subtitle class="menu-subtitle">Reset to flavouring status</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-menu>
      <!-- Regular custom actions -->
      <v-btn
        v-else
        icon
        :color="action.color || 'primary'"
        flat
        size="x-small"
        class="mr-1"
        @click="$emit('custom-action', action.key, item)"
      >
        <v-icon>{{ action.icon }}</v-icon>
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
</script>

<style scoped>
.status-menu {
  min-width: 280px;
  border-radius: 12px;
  border: 1px solid rgb(226 232 240);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  background: white;
}

.menu-item {
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 0.25rem;
}

.menu-item:hover {
  background: rgb(248 250 252);
  transform: translateX(4px);
}

.menu-title {
  font-weight: 600;
  color: rgb(15 23 42);
  font-size: 0.9rem;
}

.menu-subtitle {
  color: rgb(100 116 139);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.v-divider {
  margin: 0.5rem 0.75rem;
  background-color: rgb(226 232 240);
}
</style>