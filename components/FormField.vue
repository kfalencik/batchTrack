<template>
  <div class="form-field-wrapper" :class="wrapperClass">
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
      :hint="hint"
      :persistent-hint="!!hint"
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
      :hint="hint"
      :persistent-hint="!!hint"
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
      :hint="hint"
      :persistent-hint="!!hint"
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
      :hint="hint"
      :persistent-hint="!!hint"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template #prepend-inner v-if="prependIcon">
        <v-icon :color="iconColor">{{ prependIcon }}</v-icon>
      </template>
    </v-autocomplete>
  </div>
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
  wrapperClass: {
    type: String,
    default: ''
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
  hint: {
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

<style scoped>
.form-field-wrapper {
  margin-bottom: 1rem;
}

/* Enhanced field styling */
:deep(.v-text-field) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-text-field .v-field) {
  background: rgb(248 250 252);
  border: 1px solid rgb(226 232 240);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

:deep(.v-text-field .v-field:hover) {
  border-color: rgb(148 163 184);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  transform: translateY(-1px);
}

:deep(.v-text-field.v-input--focused .v-field) {
  border-color: rgb(99, 102, 241);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1), 0 4px 6px -1px rgb(0 0 0 / 0.1);
  background: white;
  transform: translateY(-1px);
}

:deep(.v-text-field .v-field__input) {
  font-weight: 500;
  color: rgb(15 23 42);
  font-size: 1rem;
}

:deep(.v-text-field .v-label) {
  color: rgb(100 116 139);
  font-weight: 600;
  font-size: 0.95rem;
}

:deep(.v-text-field.v-input--focused .v-label) {
  color: rgb(99, 102, 241);
}

:deep(.v-textarea .v-field) {
  background: rgb(248 250 252);
  border: 1px solid rgb(226 232 240);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

:deep(.v-textarea .v-field:hover) {
  border-color: rgb(148 163 184);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  transform: translateY(-1px);
}

:deep(.v-textarea.v-input--focused .v-field) {
  border-color: rgb(99, 102, 241);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1), 0 4px 6px -1px rgb(0 0 0 / 0.1);
  background: white;
  transform: translateY(-1px);
}

:deep(.v-select .v-field) {
  background: rgb(248 250 252);
  border: 1px solid rgb(226 232 240);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

:deep(.v-select .v-field:hover) {
  border-color: rgb(148 163 184);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  transform: translateY(-1px);
}

:deep(.v-select.v-input--focused .v-field) {
  border-color: rgb(99, 102, 241);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1), 0 4px 6px -1px rgb(0 0 0 / 0.1);
  background: white;
  transform: translateY(-1px);
}

:deep(.v-autocomplete .v-field) {
  background: rgb(248 250 252);
  border: 1px solid rgb(226 232 240);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

:deep(.v-autocomplete .v-field:hover) {
  border-color: rgb(148 163 184);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  transform: translateY(-1px);
}

:deep(.v-autocomplete.v-input--focused .v-field) {
  border-color: rgb(99, 102, 241);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1), 0 4px 6px -1px rgb(0 0 0 / 0.1);
  background: white;
  transform: translateY(-1px);
}

/* Enhanced hint styling */
:deep(.v-messages) {
  margin-top: 0.5rem;
}

:deep(.v-messages__message) {
  color: rgb(107 114 128);
  font-weight: 500;
  font-size: 0.875rem;
}

/* Error message styling */
:deep(.v-text-field.v-input--error .v-messages__message) {
  color: rgb(239, 68, 68);
}

/* Required asterisk styling */
:deep(.v-label:has-text(*)) {
  position: relative;
}

/* Disabled state styling */
:deep(.v-input--disabled .v-field) {
  background: rgb(241 245 249) !important;
  color: rgb(148 163 184) !important;
  border-color: rgb(203 213 225) !important;
  opacity: 0.7;
}

/* Focus ring animation */
@keyframes focus-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.3);
  }
  100% {
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
}

:deep(.v-input--focused .v-field) {
  animation: focus-ring 0.2s ease-out;
}
</style>