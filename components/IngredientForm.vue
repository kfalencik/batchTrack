<template>
  <div class="ingredient-form">
    <div class="d-flex align-center mb-4">
      <v-icon color="primary" class="mr-2">mdi-clipboard-list</v-icon>
      <h3 class="text-h6">{{ title }}</h3>
    </div>
    
    <div v-for="(ingredient, index) in modelValue" :key="index" class="ingredient-row mb-4">
      <v-card variant="outlined" class="pa-4 ingredient-card">
        <div class="d-flex align-center justify-space-between mb-3">
          <h4 class="text-h6">{{ itemLabel }} {{ index + 1 }}</h4>
          <v-btn 
            v-if="!readonly && modelValue.length > 1"
            icon="mdi-delete" 
            color="red" 
            variant="text" 
            size="small"
            @click="removeIngredient(index)"
          />
        </div>
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="ingredient.itemId"
              :items="availableItems"
              item-title="label"
              item-value="value"
              :label="selectLabel"
              :required="required"
              variant="outlined"
              class="mb-2 modern-select"
              :hint="selectHint"
              persistent-hint
              :readonly="readonly"
              @update:model-value="(itemId) => onItemSelected(itemId, index)"
            >
              <template #prepend-inner>
                <v-icon color="primary">{{ selectIcon }}</v-icon>
              </template>
              <template #item="{ props, item }" v-if="showAvailability">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <v-chip 
                      size="x-small" 
                      :color="item.raw.available ? 'green' : 'red'"
                      class="mr-2"
                    >
                      {{ item.raw.available ? 'Available' : 'Out of Stock' }}
                    </v-chip>
                  </template>
                  <v-list-item-title>{{ item.raw.product }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ item.raw.groupName }} • {{ item.raw.quantity }}{{ item.raw.unit }} available
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>
          </v-col>
          <v-col cols="6">
            <FormField
              v-model="ingredient.amount"
              label="Amount"
              type="number"
              :required="required"
              :readonly="readonly"
              placeholder="e.g. 500"
              hint="Quantity needed"
              prepend-icon="mdi-scale"
            />
          </v-col>
          <v-col cols="6">
            <FormField
              v-model="ingredient.unit"
              label="Unit"
              type="text"
              :placeholder="getUnitPlaceholder(ingredient.itemId)"
              :readonly="true"
              :required="required"
              hint="Unit from selected item"
              prepend-icon="mdi-ruler"
            />
          </v-col>
        </v-row>
      </v-card>
    </div>
    
    <v-btn 
      v-if="!readonly"
      @click="addIngredient" 
      color="primary" 
      variant="outlined" 
      class="mt-2"
      prepend-icon="mdi-plus"
    >
      {{ addButtonText }}
    </v-btn>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue'
import FormField from './FormField.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
    default: () => []
  },
  availableItems: {
    type: Array,
    required: true,
    default: () => []
  },
  title: {
    type: String,
    default: 'Ingredients'
  },
  itemLabel: {
    type: String,
    default: 'Ingredient'
  },
  selectLabel: {
    type: String,
    default: 'Select Ingredient'
  },
  selectHint: {
    type: String,
    default: 'Choose from available items'
  },
  selectIcon: {
    type: String,
    default: 'mdi-package-variant'
  },
  addButtonText: {
    type: String,
    default: 'Add Ingredient'
  },
  showAvailability: {
    type: Boolean,
    default: true
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

const emit = defineEmits(['update:modelValue', 'item-selected'])

const addIngredient = () => {
  const newIngredients = [...props.modelValue, { itemId: null, amount: null, unit: '' }]
  emit('update:modelValue', newIngredients)
}

const removeIngredient = (index) => {
  const newIngredients = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', newIngredients)
}

const onItemSelected = (itemId, index) => {
  const newIngredients = [...props.modelValue]
  newIngredients[index].itemId = itemId
  
  // Find the selected item and auto-fill the unit
  const selectedItem = props.availableItems.find(item => item.value === itemId)
  if (selectedItem) {
    newIngredients[index].unit = selectedItem.unit || ''
  }
  
  emit('update:modelValue', newIngredients)
  emit('item-selected', itemId, index)
}

const getUnitPlaceholder = (itemId) => {
  if (!itemId) return 'Unit'
  const item = props.availableItems.find(item => item.value === itemId)
  return item?.unit || 'Unit'
}
</script>

<style scoped>
.ingredient-form {
  width: 100%;
}

.ingredient-card {
  transition: all 0.3s ease;
  border: 1px solid rgb(226 232 240 / 0.6);
}

.ingredient-card:hover {
  border-color: rgb(99 102 241 / 0.3);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.modern-select :deep(.v-field) {
  border-radius: 12px;
}
</style>