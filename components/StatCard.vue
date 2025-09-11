<template>
  <v-btn dark :variant="active ? 'text' : 'outlined'" :class="active ? `bg-${color} text-white` : `text-${color}`" @click="$emit('click')"><v-icon class="mr-3">{{ icon }}</v-icon> {{ title }} - {{ count }}</v-btn>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: 'mdi-chart-box' },
  color: { type: String, default: 'primary' },
  count: { type: [Number, String], default: 0 },
  active: { type: Boolean, default: false }
})
</script>

<style scoped>
/* small visual tweak */
.v-card { min-width: 140px; }
</style>
