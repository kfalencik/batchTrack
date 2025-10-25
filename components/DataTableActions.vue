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
    <v-btn
      v-for="action in customActions"
      :key="action.key"
      icon
      :color="action.color || 'primary'"
      flat
      size="x-small"
      class="mr-1"
      @click="$emit('custom-action', action.key, item)"
    >
      <v-icon>{{ action.icon }}</v-icon>
    </v-btn>
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