<template>
  <v-card variant="outlined" class="pa-4 mb-4 stock-item-card">
    <div class="d-flex align-center justify-space-between mb-3">
      <h4 class="text-h6">{{ title }}</h4>
      <v-btn 
        v-if="!readonly && showDelete"
        icon="mdi-delete" 
        color="red" 
        variant="text" 
        size="small"
        @click="$emit('delete')"
      />
    </div>
    <v-row class="align-center">
      <v-col cols="12">
        <FormField
          v-model="localItem.product"
          label="Product Name"
          type="text"
          :required="required"
          :readonly="readonly"
          :placeholder="productPlaceholder"
          hint="Product or ingredient name"
          prepend-icon="mdi-package-variant"
          @update:model-value="updateItem"
        />
      </v-col>
      <v-col cols="4">
        <FormField
          v-model="localItem.quantity"
          label="Quantity"
          type="number"
          :required="required"
          :readonly="readonly"
          placeholder="e.g. 500"
          hint="Amount in stock"
          prepend-icon="mdi-counter"
          @update:model-value="updateItem"
        />
      </v-col>
      <v-col cols="4">
        <FormField
          v-model="localItem.unit"
          label="Unit"
          type="select"
          :items="units"
          :readonly="readonly"
          :required="required"
          hint="Unit of measurement"
          prepend-icon="mdi-ruler"
          @update:model-value="updateItem"
        />
      </v-col>
      <v-col cols="4">
        <FormField
          v-model="localItem.price"
          label="Price (£)"
          type="number"
          :readonly="readonly"
          placeholder="e.g. 12.50"
          hint="Cost per item"
          prepend-icon="mdi-currency-gbp"
          @update:model-value="updateItem"
        />
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="localItem.dateBought"
          label="Purchase Date"
          type="date"
          variant="outlined"
          class="modern-field"
          :readonly="readonly"
          hint="When this item was purchased"
          persistent-hint
          @update:model-value="updateItem"
        >
          <template #prepend-inner>
            <v-icon color="primary">mdi-calendar</v-icon>
          </template>
        </v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="localItem.expiryDate"
          label="Expiry Date"
          type="date"
          variant="outlined"
          class="modern-field"
          :readonly="readonly"
          hint="When this item expires"
          persistent-hint
          @update:model-value="updateItem"
        >
          <template #prepend-inner>
            <v-icon color="primary">mdi-calendar-alert</v-icon>
          </template>
        </v-text-field>
      </v-col>
      <v-col cols="12">
        <FormField
          v-model="localItem.description"
          label="Description"
          type="textarea"
          :rows="2"
          :readonly="readonly"
          placeholder="Optional notes about this item..."
          hint="Additional details or notes"
          prepend-icon="mdi-text"
          @update:model-value="updateItem"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import FormField from './FormField.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      product: '',
      quantity: null,
      unit: '',
      price: null,
      dateBought: '',
      expiryDate: '',
      description: ''
    })
  },
  title: {
    type: String,
    default: 'Stock Item'
  },
  units: {
    type: Array,
    required: true,
    default: () => []
  },
  productPlaceholder: {
    type: String,
    default: 'e.g. Ginger Root, Organic Sugar...'
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
  }
})

const emit = defineEmits(['update:modelValue', 'delete'])

const localItem = ref({ ...props.modelValue })

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  localItem.value = { ...newValue }
}, { deep: true })

const updateItem = () => {
  emit('update:modelValue', { ...localItem.value })
}
</script>

<style scoped>
.stock-item-card {
  transition: all 0.3s ease;
  border: 1px solid rgb(226 232 240 / 0.6);
  border-radius: 16px;
}

.stock-item-card:hover {
  border-color: rgb(99 102 241 / 0.3);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.modern-field :deep(.v-field) {
  border-radius: 12px;
}
</style>