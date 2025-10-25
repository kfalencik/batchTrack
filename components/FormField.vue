<template>
  <v-text-field
    v-if="type === 'text' || type === 'email' || type === 'number'"
    :model-value="modelValue"
    :label="label"
    :type="type"
    :required="required"
    :rules="computedRules"
    :variant="variant"
    :class="fieldClass"
    :disabled="disabled"
    :readonly="readonly"
    :placeholder="placeholder"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #prepend-inner v-if="prependIcon">
      <v-icon :color="iconColor">{{ prependIcon }}</v-icon>
    </template>
    <template #append-inner v-if="appendIcon">
      <v-icon :color="iconColor">{{ appendIcon }}</v-icon>
    </template>
  </v-text-field>

  <v-textarea
    v-else-if="type === 'textarea'"
    :model-value="modelValue"
    :label="label"
    :required="required"
    :rules="computedRules"
    :variant="variant"
    :class="fieldClass"
    :disabled="disabled"
    :readonly="readonly"
    :placeholder="placeholder"
    :rows="rows"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #prepend-inner v-if="prependIcon">
      <v-icon :color="iconColor">{{ prependIcon }}</v-icon>
    </template>
  </v-textarea>

  <v-select
    v-else-if="type === 'select'"
    :model-value="modelValue"
    :label="label"
    :items="items"
    :required="required"
    :rules="computedRules"
    :variant="variant"
    :class="fieldClass"
    :disabled="disabled"
    :readonly="readonly"
    :placeholder="placeholder"
    :multiple="multiple"
    :clearable="clearable"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #prepend-inner v-if="prependIcon">
      <v-icon :color="iconColor">{{ prependIcon }}</v-icon>
    </template>
  </v-select>

  <v-autocomplete
    v-else-if="type === 'autocomplete'"
    :model-value="modelValue"
    :label="label"
    :items="items"
    :required="required"
    :rules="computedRules"
    :variant="variant"
    :class="fieldClass"
    :disabled="disabled"
    :readonly="readonly"
    :placeholder="placeholder"
    :multiple="multiple"
    :clearable="clearable"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #prepend-inner v-if="prependIcon">
      <v-icon :color="iconColor">{{ prependIcon }}</v-icon>
    </template>
  </v-autocomplete>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: null
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'email', 'number', 'textarea', 'select', 'autocomplete'].includes(value)
  },
  label: {
    type: String,
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  rules: {
    type: Array,
    default: () => []
  },
  variant: {
    type: String,
    default: 'outlined'
  },
  fieldClass: {
    type: String,
    default: 'mb-2'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: null
  },
  prependIcon: {
    type: String,
    default: null
  },
  appendIcon: {
    type: String,
    default: null
  },
  iconColor: {
    type: String,
    default: 'primary'
  },
  // For textarea
  rows: {
    type: Number,
    default: 3
  },
  // For select/autocomplete
  items: {
    type: Array,
    default: () => []
  },
  multiple: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])

const computedRules = computed(() => {
  const rules = [...props.rules]
  if (props.required) {
    rules.unshift(v => !!v || `${props.label} is required`)
  }
  return rules
})
</script>