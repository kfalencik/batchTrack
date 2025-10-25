<template>
  <div class="d-flex justify-between mb-3">
    <h2 class="mb-5">{{ title }}</h2>
    <div v-if="actions && actions.length" class="d-flex gap-2">
      <v-btn 
        v-for="action in actions" 
        :key="action.key || action.text"
        :color="action.color || 'primary'" 
        :variant="action.variant || 'elevated'"
        @click="$emit('action', action.key || action.text)"
      >
        <v-icon v-if="action.icon" class="mr-2">{{ action.icon }}</v-icon>
        {{ action.text }}
      </v-btn>
    </div>
    <v-btn 
      v-else-if="actionText"
      :color="actionColor || 'primary'" 
      @click="$emit('action')"
    >
      <v-icon v-if="actionIcon" class="mr-2">{{ actionIcon }}</v-icon>
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