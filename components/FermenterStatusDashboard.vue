<template>
  <div class="fermenter-status-dashboard">
    <div class="component-header">
      <div class="header-content">
        <h3 class="component-title">
          <v-icon class="mr-2">mdi-beer</v-icon>
          Fermenter Status
        </h3>
        <p class="component-subtitle">Monitor vessel utilization and batch progress</p>
      </div>
      <div class="capacity-summary">
        <span class="capacity-label">Utilization:</span>
        <span class="capacity-value">{{ utilizationPercentage }}%</span>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary" />
      <p class="mt-3 text--secondary">Loading fermenter data...</p>
    </div>

    <div v-else class="fermenter-content">
      <!-- Utilization Overview -->
      <div class="utilization-bar-container">
        <div class="utilization-bar">
          <div 
            class="utilization-fill" 
            :style="{ width: utilizationPercentage + '%' }"
          ></div>
        </div>
        <div class="utilization-stats">
          <span class="stat">
            <v-icon size="16" color="success">mdi-check-circle</v-icon>
            {{ availableFermenters }} Available
          </span>
          <span class="stat">
            <v-icon size="16" color="warning">mdi-clock</v-icon>
            {{ inUseFermenters }} In Use
          </span>
          <span class="stat">
            <v-icon size="16" color="info">mdi-sigma</v-icon>
            {{ totalCapacity }}L Total
          </span>
        </div>
      </div>

      <!-- Fermenter List -->
      <div class="fermenter-list">
        <div 
          v-for="fermenter in sortedFermenters" 
          :key="fermenter.id"
          class="fermenter-item"
          :class="{ 'fermenter-item--in-use': isInUse(fermenter) }"
        >
          <div class="fermenter-info">
            <div class="fermenter-header">
              <div class="fermenter-name">
                {{ fermenter.name || `Fermenter #${fermenter.id}` }}
              </div>
              <StatusChip 
                :status="getFermenterStatus(fermenter)" 
                :type="'fermenter'"
                size="small"
              />
            </div>
            
            <div class="fermenter-details">
              <div class="detail-item">
                <v-icon size="14" class="mr-1">mdi-cup-water</v-icon>
                {{ fermenter.size || 0 }}L capacity
              </div>
              
              <div v-if="isInUse(fermenter)" class="detail-item active-batch">
                <v-icon size="14" class="mr-1">mdi-barrel</v-icon>
                {{ getActiveBatchInfo(fermenter) }}
              </div>
              
              <div v-if="getEstimatedCompletion(fermenter)" class="detail-item">
                <v-icon size="14" class="mr-1">mdi-calendar-clock</v-icon>
                Completes {{ getEstimatedCompletion(fermenter) }}
              </div>
            </div>
          </div>
          
          <div class="fermenter-progress">
            <div v-if="isInUse(fermenter)" class="progress-info">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ 
                    width: getBatchProgress(fermenter) + '%',
                    backgroundColor: getProgressColor(fermenter)
                  }"
                ></div>
              </div>
              <div class="progress-text">{{ getBatchProgress(fermenter) }}%</div>
            </div>
            <div v-else class="available-indicator">
              <v-icon color="success">mdi-check-circle</v-icon>
              <span>Available</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="fermenter-actions">
        <v-btn
          color="primary"
          variant="outlined"
          size="small"
          @click="navigateToFermenters"
        >
          <v-icon class="mr-2">mdi-beer</v-icon>
          Manage Fermenters
        </v-btn>
        
        <v-btn
          color="success"
          variant="outlined"
          size="small"
          @click="navigateToBatches"
          :disabled="availableFermenters === 0"
        >
          <v-icon class="mr-2">mdi-plus</v-icon>
          Add Batch
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useDataStore } from '@/stores/data'
import { useRouter } from 'vue-router'
import StatusChip from '@/components/StatusChip.vue'

const dataStore = useDataStore()
const router = useRouter()
const loading = ref(false)

// Get data from store
const fermenters = computed(() => dataStore.fermenters || [])
const batches = computed(() => dataStore.batches || [])
const recipes = computed(() => dataStore.recipes || [])

// Helper function to get batch status
function getBatchStatus(batch) {
  if (!batch) return 'unknown'
  
  const backendStatus = batch.status
  const backendSet = backendStatus && ['failed', 'ready to pack', 'packaged', 'sold'].includes(backendStatus)
  if (backendSet) return backendStatus
  
  if (batch.startDate?.seconds && Number.isFinite(batch.fermentationDays)) {
    const now = Date.now()
    const endSecs = batch.startDate.seconds + (Number(batch.fermentationDays) * 86400)
    const endMs = endSecs * 1000
    if (now < endMs) return 'fermenting'
    return 'flavouring'
  }
  
  return backendStatus || 'unknown'
}

// Find active batch for a fermenter
function getActiveBatch(fermenter) {
  if (!fermenter?.id || !batches.value?.length) return null
  
  return batches.value.find(batch => {
    if (!batch.fermenter) return false
    
    const batchFermenter = String(batch.fermenter)
    const fermenterIds = [String(fermenter.id), fermenter.id]
    
    if (!fermenterIds.some(id => String(id) === batchFermenter)) return false
    
    const status = getBatchStatus(batch)
    return !['packaged', 'failed', 'sold'].includes(status)
  })
}

// Check if fermenter is in use
function isInUse(fermenter) {
  return !!getActiveBatch(fermenter)
}

// Get fermenter status
function getFermenterStatus(fermenter) {
  const activeBatch = getActiveBatch(fermenter)
  if (!activeBatch) return 'available'
  
  return getBatchStatus(activeBatch)
}

// Get active batch info
function getActiveBatchInfo(fermenter) {
  const activeBatch = getActiveBatch(fermenter)
  if (!activeBatch) return ''
  
  const recipe = recipes.value.find(r => r.id === activeBatch.recipeId)
  const recipeName = recipe ? recipe.name : 'Unknown Recipe'
  
  return `${recipeName} (${activeBatch.batchId || 'No ID'})`
}

// Get estimated completion date
function getEstimatedCompletion(fermenter) {
  const activeBatch = getActiveBatch(fermenter)
  if (!activeBatch || !activeBatch.startDate?.seconds || !activeBatch.fermentationDays) return null
  
  const endSecs = activeBatch.startDate.seconds + (Number(activeBatch.fermentationDays) * 86400)
  const endDate = new Date(endSecs * 1000)
  const now = new Date()
  
  // Calculate days remaining
  const diffTime = endDate - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'Overdue'
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  return `in ${diffDays} days`
}

// Calculate batch progress
function getBatchProgress(fermenter) {
  const activeBatch = getActiveBatch(fermenter)
  if (!activeBatch || !activeBatch.startDate?.seconds || !activeBatch.fermentationDays) return 0
  
  const now = Date.now()
  const startMs = activeBatch.startDate.seconds * 1000
  const durationMs = Number(activeBatch.fermentationDays) * 86400 * 1000
  const elapsedMs = now - startMs
  
  const progress = Math.min(Math.max((elapsedMs / durationMs) * 100, 0), 100)
  return Math.round(progress)
}

// Get progress color based on status
function getProgressColor(fermenter) {
  const status = getFermenterStatus(fermenter)
  switch (status) {
    case 'fermenting': return '#2196F3'
    case 'flavouring': return '#FF9800'
    case 'ready to pack': return '#4CAF50'
    default: return '#9E9E9E'
  }
}

// Sort fermenters by status (in-use first)
const sortedFermenters = computed(() => {
  return [...fermenters.value].sort((a, b) => {
    const aInUse = isInUse(a)
    const bInUse = isInUse(b)
    
    if (aInUse && !bInUse) return -1
    if (!aInUse && bInUse) return 1
    
    // Sort by ID if same status
    return (a.id || 0) - (b.id || 0)
  })
})

// Calculate utilization stats
const inUseFermenters = computed(() => {
  return fermenters.value.filter(f => isInUse(f)).length
})

const availableFermenters = computed(() => {
  return fermenters.value.length - inUseFermenters.value
})

const utilizationPercentage = computed(() => {
  if (fermenters.value.length === 0) return 0
  return Math.round((inUseFermenters.value / fermenters.value.length) * 100)
})

const totalCapacity = computed(() => {
  return fermenters.value.reduce((sum, f) => sum + (f.size || 0), 0)
})

// Navigation methods
function navigateToFermenters() {
  router.push('/fermenters')
}

function navigateToBatches() {
  router.push('/batches')
}

onMounted(() => {
  // Data is loaded by parent component
})
</script>

<style scoped>
.fermenter-status-dashboard {
  padding: 1.5rem;
  height: 100%;
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-content {
  flex: 1;
}

.component-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(15 23 42);
  margin: 0;
  display: flex;
  align-items: center;
}

.component-subtitle {
  font-size: 0.875rem;
  color: rgb(100 116 139);
  margin: 0.25rem 0 0 0;
}

.capacity-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.capacity-label {
  font-size: 0.875rem;
  color: rgb(100 116 139);
}

.capacity-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: rgb(15 23 42);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.utilization-bar-container {
  margin-bottom: 1.5rem;
}

.utilization-bar {
  height: 8px;
  background: rgb(226 232 240);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.utilization-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50 0%, #2196F3 50%, #FF9800 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.utilization-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: rgb(100 116 139);
}

.fermenter-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.fermenter-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgb(248 250 252);
  border: 1px solid rgb(226 232 240);
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.fermenter-item--in-use {
  background: rgb(239 246 255);
  border-color: rgb(191 219 254);
}

.fermenter-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.fermenter-info {
  flex: 1;
}

.fermenter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.fermenter-name {
  font-weight: 600;
  color: rgb(15 23 42);
}

.fermenter-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: rgb(100 116 139);
}

.detail-item.active-batch {
  color: rgb(37 99 235);
  font-weight: 500;
}

.fermenter-progress {
  margin-left: 1rem;
  min-width: 100px;
}

.progress-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  width: 80px;
  height: 6px;
  background: rgb(226 232 240);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(15 23 42);
}

.available-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgb(22 163 74);
  justify-content: center;
}

.fermenter-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgb(226 232 240);
}

@media (max-width: 768px) {
  .component-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .utilization-stats {
    gap: 0.5rem;
  }
  
  .fermenter-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .fermenter-progress {
    margin-left: 0;
    min-width: auto;
  }
  
  .fermenter-actions {
    flex-direction: column;
  }
}
</style>