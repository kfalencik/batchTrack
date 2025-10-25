<template>
  <v-dialog 
    :model-value="modelValue" 
    :max-width="maxWidth" 
    :persistent="persistent"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card :class="cardClass">
      <v-toolbar :color="toolbarColor" dark>
        <v-toolbar-title>
          <v-icon v-if="titleIcon" class="mr-2">{{ titleIcon }}</v-icon>
          {{ title }}
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      
      <v-card-text :class="contentClass">
        <slot />
      </v-card-text>

      <v-card-actions v-if="$slots.actions" class="pa-4">
        <slot name="actions" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
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
  toolbarColor: {
    type: String,
    default: 'primary'
  },
  cardClass: {
    type: String,
    default: ''
  },
  contentClass: {
    type: String,
    default: 'pa-6'
  }
})

defineEmits(['update:modelValue', 'close'])
</script>