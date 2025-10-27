<template>
  <div class="fermenter-status-container">
    <v-tooltip :text="tooltipText" location="top">
      <template #activator="{ props }">
        <div v-bind="props" class="status-indicator-wrapper">
          <v-chip
            :color="statusColor"
            :variant="isInUse ? 'flat' : 'outlined'"
            size="small"
            class="status-chip"
            :class="{ 'pulse': isInUse }"
          >
            <v-icon 
              :icon="statusIcon" 
              size="16" 
              class="mr-1"
            />
            {{ statusText }}
          </v-chip>
        </div>
      </template>
    </v-tooltip>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  fermenter: {
    type: Object,
    required: true
  },
  batches: {
    type: Array,
    default: () => []
  },
  recipes: {
    type: Array,
    default: () => []
  }
})

// Find active batch in this fermenter
const activeBatch = computed(() => {
  if (!props.fermenter?.id || !props.batches?.length) return null
  
  return props.batches.find(batch => {
    if (!batch.fermenter) return false
    
    // Match fermenter ID (handle both string and number types)
    const batchFermenter = String(batch.fermenter)
    const fermenterIds = [
      String(props.fermenter.id),
      props.fermenter.id
    ]
    
    if (!fermenterIds.some(id => String(id) === batchFermenter)) return false
    
    // Check if batch is still active (not finished)
    const status = getBatchStatus(batch)
    return !['packaged', 'failed', 'sold'].includes(status)
  })
})

const isInUse = computed(() => !!activeBatch.value)

const statusColor = computed(() => {
  if (!isInUse.value) return 'grey-lighten-2'
  
  const status = getBatchStatus(activeBatch.value)
  switch (status) {
    case 'fermenting': return 'blue'
    case 'flavouring': return 'orange'
    case 'ready to pack': return 'purple'
    default: return 'grey'
  }
})

const statusIcon = computed(() => {
  if (!isInUse.value) return 'mdi-check-circle-outline'
  
  const status = getBatchStatus(activeBatch.value)
  switch (status) {
    case 'fermenting': return 'mdi-flask'
    case 'flavouring': return 'mdi-leaf'
    case 'ready to pack': return 'mdi-package-up'
    default: return 'mdi-progress-clock'
  }
})

const statusText = computed(() => {
  if (!isInUse.value) return 'Available'
  
  const status = getBatchStatus(activeBatch.value)
  switch (status) {
    case 'fermenting': return 'Fermenting'
    case 'flavouring': return 'Flavouring'
    case 'ready to pack': return 'Ready'
    default: return 'In Use'
  }
})

const tooltipText = computed(() => {
  if (!isInUse.value) {
    return `This fermenter is available for new batches`
  }
  
  const batch = activeBatch.value
  const status = getBatchStatus(batch)
  const recipeName = getRecipeName(batch.recipeId)
  
  let details = `${status.charAt(0).toUpperCase() + status.slice(1)}`
  details += `\nRecipe: ${recipeName}`
  
  if (batch.fermentationDays && status === 'fermenting') {
    const endDate = getEstimatedEndDate(batch)
    if (endDate) {
      details += `\nEstimated end: ${endDate.toLocaleDateString()}`
    }
  }
  
  return details
})

// Helper function to determine batch status (copied from batches.vue logic)
function getBatchStatus(batch) {
  if (!batch) return 'unknown'
  
  // If backend provided a definitive status, use it
  const backendStatus = batch.status
  const backendSet = backendStatus && ['failed', 'ready to pack', 'packaged', 'sold'].includes(backendStatus)
  if (backendSet) return backendStatus

  // Otherwise compute based on dates
  if (batch.startDate?.seconds && Number.isFinite(batch.fermentationDays)) {
    const now = Date.now()
    const endSecs = batch.startDate.seconds + (Number(batch.fermentationDays) * 86400)
    const endMs = endSecs * 1000
    if (now < endMs) return 'fermenting'
    // after fermentation - automatically becomes flavouring status
    return 'flavouring'
  }

  return backendStatus || 'unknown'
}

function getEstimatedEndDate(batch) {
  if (!batch.startDate?.seconds || !Number.isFinite(batch.fermentationDays)) return null
  
  const endSecs = batch.startDate.seconds + (Number(batch.fermentationDays) * 86400)
  return new Date(endSecs * 1000)
}

function getRecipeName(recipeId) {
  if (!recipeId || !props.recipes?.length) return 'Unknown Recipe'
  
  const recipe = props.recipes.find(r => r.id === recipeId)
  return recipe ? recipe.name : 'Unknown Recipe'
}
</script>

<style scoped>
.fermenter-status-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.status-indicator-wrapper {
  cursor: pointer;
}

.status-chip {
  font-weight: 600;
  transition: all 0.3s ease;
}

.status-chip:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-on-surface), 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(var(--v-theme-on-surface), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-on-surface), 0);
  }
}

/* Specific color pulses for different statuses */
.status-chip.text-blue .pulse {
  animation: pulse-blue 2s infinite;
}

.status-chip.text-orange .pulse {
  animation: pulse-orange 2s infinite;
}

.status-chip.text-purple .pulse {
  animation: pulse-purple 2s infinite;
}

@keyframes pulse-blue {
  0% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(33, 150, 243, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
  }
}

@keyframes pulse-orange {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(255, 152, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0);
  }
}

@keyframes pulse-purple {
  0% {
    box-shadow: 0 0 0 0 rgba(156, 39, 176, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(156, 39, 176, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(156, 39, 176, 0);
  }
}
</style>