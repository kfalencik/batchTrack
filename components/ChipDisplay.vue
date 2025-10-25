<template>
  <div class="chip-display">
    <v-chip 
      v-for="(item, index) in displayItems" 
      :key="getItemKey(item, index)"
      :size="size"
      :color="getItemColor(item)"
      :variant="variant"
      class="mr-1 mb-1"
      :dark="dark"
    >
      <v-icon v-if="getItemIcon(item)" :class="iconClass">{{ getItemIcon(item) }}</v-icon>
      {{ getItemText(item) }}
    </v-chip>
    
    <v-chip 
      v-if="showMoreCount > 0"
      :size="size"
      :color="moreColor"
      :variant="moreVariant"
      class="mr-1"
    >
      +{{ showMoreCount }} more
    </v-chip>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  maxVisible: {
    type: Number,
    default: 3
  },
  size: {
    type: String,
    default: 'small'
  },
  variant: {
    type: String,
    default: 'elevated'
  },
  dark: {
    type: Boolean,
    default: false
  },
  textField: {
    type: String,
    default: null // If provided, use this field from object items
  },
  colorField: {
    type: String,
    default: null // If provided, use this field from object items for color
  },
  iconField: {
    type: String,
    default: null // If provided, use this field from object items for icon
  },
  defaultColor: {
    type: String,
    default: 'blue-grey-lighten-4'
  },
  moreColor: {
    type: String,
    default: 'grey-lighten-2'
  },
  moreVariant: {
    type: String,
    default: 'elevated'
  },
  iconClass: {
    type: String,
    default: 'mr-2'
  }
})

const displayItems = computed(() => {
  return props.items.slice(0, props.maxVisible)
})

const showMoreCount = computed(() => {
  return Math.max(0, props.items.length - props.maxVisible)
})

const getItemKey = (item, index) => {
  if (typeof item === 'object' && item.id) return item.id
  if (typeof item === 'object' && item.key) return item.key
  return index
}

const getItemText = (item) => {
  if (typeof item === 'string') return item
  if (props.textField && item[props.textField]) return item[props.textField]
  if (item.text) return item.text
  if (item.name) return item.name
  if (item.label) return item.label
  return String(item)
}

const getItemColor = (item) => {
  if (typeof item === 'string') return props.defaultColor
  if (props.colorField && item[props.colorField]) return item[props.colorField]
  if (item.color) return item.color
  return props.defaultColor
}

const getItemIcon = (item) => {
  if (typeof item === 'string') return null
  if (props.iconField && item[props.iconField]) return item[props.iconField]
  if (item.icon) return item.icon
  return null
}
</script>