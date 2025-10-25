<template>
  <div class="enhanced-data-table">
    <LoadingWrapper :loading="loading" :text="loadingText">
      <div class="data-table-wrapper" :class="wrapperClass">
        <v-data-table
          class="modern-data-table"
          :headers="headers"
          :items="items"
          :loading="loading"
          v-bind="$attrs"
          v-on="$listeners"
        >
          <!-- Pass through all slots -->
          <template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope || {}" />
          </template>
        </v-data-table>
      </div>
    </LoadingWrapper>
  </div>
</template>

<script setup>
import LoadingWrapper from './LoadingWrapper.vue'

defineProps({
  headers: {
    type: Array,
    required: true
  },
  items: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: 'Loading...'
  },
  wrapperClass: {
    type: String,
    default: ''
  }
})

// Inherit all v-data-table props and events
defineOptions({
  inheritAttrs: false
})
</script>

<style scoped>
.enhanced-data-table {
  margin: 2rem 0;
}

.data-table-wrapper {
  background: white;
  border-radius: 1.5rem;
  border: 1px solid rgb(226 232 240 / 0.6);
  box-shadow: 
    0 4px 6px -1px rgb(0 0 0 / 0.1), 
    0 2px 4px -2px rgb(0 0 0 / 0.1),
    0 0 0 1px rgb(255 255 255 / 0.05);
  overflow: hidden;
  backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.data-table-wrapper:hover {
  box-shadow: 
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1),
    0 0 0 1px rgb(99 102 241 / 0.1);
  border-color: rgb(99 102 241 / 0.2);
}

.modern-data-table {
  background: transparent !important;
}

.modern-data-table :deep(.v-data-table__wrapper) {
  border-radius: 1.5rem;
}

.modern-data-table :deep(.v-data-table-header) {
  background: linear-gradient(135deg, rgb(248 250 252) 0%, rgb(241 245 249) 100%);
  border-bottom: 2px solid rgb(226 232 240 / 0.6);
}

.modern-data-table :deep(.v-data-table-header th) {
  font-weight: 600;
  color: rgb(51 65 85);
  letter-spacing: 0.025em;
  text-transform: uppercase;
  font-size: 0.75rem;
  padding: 1rem 1.25rem;
}

.modern-data-table :deep(.v-data-table__tbody tr) {
  transition: all 0.2s ease;
}

.modern-data-table :deep(.v-data-table__tbody tr:hover) {
  background-color: rgb(248 250 252 / 0.5) !important;
}

.modern-data-table :deep(.v-data-table__tbody td) {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgb(226 232 240 / 0.4);
}

.modern-data-table :deep(.v-data-table__tbody tr:last-child td) {
  border-bottom: none;
}
</style>