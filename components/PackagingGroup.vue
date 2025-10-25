<template>
  <v-card outlined class="pa-4 packaging-group-card">
    <div class="d-flex align-center justify-space-between mb-3">
      <v-btn 
        v-if="showDelete"
        icon="mdi-delete" 
        class="modern-btn-icon modern-btn-icon-danger"
        size="small"
        @click="$emit('delete')"
      />
      <v-spacer v-else />
    </div>
    <v-row class="align-center">
      <v-col cols="12" md="6">
        <v-select
          :items="containerTypes"
          label="Container Type"
          v-model="localGroup.containerType"
          variant="outlined"
          :required="required"
          :rules="required ? [requiredRule] : []"
          hint="Choose container type"
          persistent-hint
          class="modern-select"
          :readonly="readonly"
          @update:model-value="updateGroup"
        >
          <template #prepend-inner>
            <v-icon color="primary">mdi-cup</v-icon>
          </template>
        </v-select>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          label="Container Size"
          type="number"
          v-model="localGroup.containerSize"
          suffix="L"
          variant="outlined"
          hint="Volume per container"
          persistent-hint
          :required="required"
          :rules="required ? [containerSizeRule] : []"
          class="modern-field"
          :readonly="readonly"
          @update:model-value="updateGroup"
        >
          <template #prepend-inner>
            <v-icon color="primary">mdi-resize</v-icon>
          </template>
        </v-text-field>
      </v-col>
    </v-row>
    <v-row class="align-center">
      <v-col cols="12" md="4">
        <v-text-field
          label="Quantity"
          type="number"
          v-model="localGroup.quantity"
          variant="outlined"
          hint="Number of containers"
          persistent-hint
          :required="required"
          :rules="required ? [quantityRule] : []"
          class="modern-field"
          :readonly="readonly"
          @update:model-value="updateGroup"
        >
          <template #prepend-inner>
            <v-icon color="primary">mdi-counter</v-icon>
          </template>
        </v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          label="Total Volume"
          :model-value="totalVolume"
          suffix="L"
          variant="outlined"
          readonly
          hint="Auto-calculated"
          persistent-hint
          class="calculated-field"
        >
          <template #prepend-inner>
            <v-icon color="success">mdi-calculator</v-icon>
          </template>
        </v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          label="Notes"
          v-model="localGroup.notes"
          variant="outlined"
          hint="Optional notes for this group"
          persistent-hint
          :placeholder="notesPlaceholder"
          class="modern-field"
          :readonly="readonly"
          @update:model-value="updateGroup"
        >
          <template #prepend-inner>
            <v-icon color="primary">mdi-note-text</v-icon>
          </template>
        </v-text-field>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      containerType: '',
      containerSize: null,
      quantity: null,
      notes: ''
    })
  },
  containerTypes: {
    type: Array,
    required: true,
    default: () => []
  },
  showDelete: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: true
  },
  readonly: {
    type: Boolean,
    default: false
  },
  notesPlaceholder: {
    type: String,
    default: 'e.g., Gift bottles, Personal stock...'
  }
})

const emit = defineEmits(['update:modelValue', 'delete'])

const localGroup = ref({ ...props.modelValue })

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  localGroup.value = { ...newValue }
}, { deep: true })

const totalVolume = computed(() => {
  const size = Number(localGroup.value.containerSize) || 0
  const quantity = Number(localGroup.value.quantity) || 0
  return (size * quantity).toFixed(1)
})

const updateGroup = () => {
  emit('update:modelValue', { ...localGroup.value })
}

// Validation rules
const requiredRule = (value) => {
  return !!value || 'This field is required'
}

const containerSizeRule = (value) => {
  const num = Number(value)
  if (!value) return 'Container size is required'
  if (isNaN(num) || num <= 0) return 'Container size must be a positive number'
  return true
}

const quantityRule = (value) => {
  const num = Number(value)
  if (!value) return 'Quantity is required'
  if (isNaN(num) || num <= 0) return 'Quantity must be a positive number'
  if (num % 1 !== 0) return 'Quantity must be a whole number'
  return true
}
</script>

<style scoped>
.packaging-group-card {
  transition: all 0.3s ease;
  border: 1px solid rgb(226 232 240 / 0.6);
  border-radius: 16px;
}

.packaging-group-card:hover {
  border-color: rgb(99 102 241 / 0.3);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.modern-select :deep(.v-field),
.modern-field :deep(.v-field) {
  border-radius: 12px;
}

.calculated-field :deep(.v-field) {
  border-radius: 12px;
  background-color: rgb(248 250 252);
}

.calculated-field :deep(.v-field--disabled) {
  opacity: 1;
}
</style>