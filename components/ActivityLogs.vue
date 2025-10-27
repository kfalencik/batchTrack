<template>
  <div class="activity-logs">
    <div class="logs-header">
      <h3 class="text-h6 font-weight-medium mb-3">
        <v-icon class="mr-2">mdi-history</v-icon>
        Recent Activity
      </h3>
      
      <!-- Filters -->
      <div class="filters-row mb-4">
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="entityFilter"
              :items="entityOptions"
              label="Filter by Type"
              dense
              outlined
              clearable
              @update:model-value="applyFilters"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="actionFilter"
              :items="actionOptions"
              label="Filter by Action"
              dense
              outlined
              clearable
              @update:model-value="applyFilters"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              label="Search logs..."
              dense
              outlined
              clearable
              prepend-inner-icon="mdi-magnify"
              @input="applyFilters"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn
              color="primary"
              outlined
              @click="refreshLogs"
              :loading="loading"
            >
              <v-icon left>mdi-refresh</v-icon>
              Refresh
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
      <p class="mt-3 text--secondary">Loading activity logs...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredLogs.length === 0" class="text-center py-8">
      <v-icon size="64" color="grey lighten-1">mdi-history</v-icon>
      <h4 class="text-h6 mt-3 text--secondary">No activity logs found</h4>
      <p class="text--secondary">
        {{ logs.length === 0 ? 'Start using the system to see activity logs here.' : 'Try adjusting your filters to see more results.' }}
      </p>
    </div>

    <!-- Logs list -->
    <div v-else class="logs-container">
      <v-timeline density="compact" align="start" class="timeline-custom">
        <v-timeline-item
          v-for="log in paginatedLogs"
          :key="log.id"
          :dot-color="getLogColor(log.action)"
          size="small"
        >
          <template #icon>
            <v-icon size="16" color="white">{{ getLogIcon(log.action) }}</v-icon>
          </template>
          
          <div class="log-entry">
            <div class="log-header d-flex align-center justify-space-between mb-1">
              <div class="d-flex align-center">
                <StatusChip 
                  :status="getSimpleAction(log)" 
                  :type="'action'"
                  class="mr-2"
                />
              </div>
              <span class="text-caption text--secondary">
                {{ formatTime(log.timestamp) }}
              </span>
            </div>
            
            <div class="log-content">
              <p class="text-body-2 mb-1">
                <strong>{{ getDisplayTitle(log) }}</strong>
              </p>
              <p class="text-body-2 text--secondary mb-2">
                {{ getDisplayDescription(log) }}
              </p>
              
              <!-- Changes display -->
              <div v-if="log.changes && Object.keys(log.changes).length > 0" class="changes-section mb-2">
                <div class="changes-summary">
                  <v-icon size="12" class="mr-1 text--secondary">mdi-arrow-right</v-icon>
                  <span class="text-caption">{{ getChangesText(log.changes) }}</span>
                </div>
              </div>
              
              <!-- Metadata display -->
              <div v-if="log.metadata && Object.keys(log.metadata).length > 0" class="metadata-section">
                <v-expansion-panels variant="accordion" class="metadata-panels">
                  <v-expansion-panel>
                    <v-expansion-panel-title class="text-caption text--secondary py-1">
                      <v-icon size="14" class="mr-1">mdi-information-outline</v-icon>
                      Additional Details
                    </v-expansion-panel-title>
                    <v-expansion-panel-text class="py-2">
                      <div class="metadata-content">
                        <div 
                          v-for="(value, key) in filteredMetadata(log.metadata)" 
                          :key="key"
                          class="metadata-item text-caption d-flex"
                        >
                          <span class="metadata-key">{{ formatMetadataKey(key) }}:</span>
                          <span class="metadata-value ml-2">{{ formatMetadataValue(value) }}</span>
                        </div>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>
            </div>
          </div>
        </v-timeline-item>
      </v-timeline>

      <!-- Pagination -->
      <div v-if="filteredLogs.length > itemsPerPage" class="pagination-section mt-4">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          @update:model-value="scrollToTop"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDataStore } from '@/stores/data'
import { LOG_ACTIONS, LOG_ENTITIES, getActionDescription, getEntityDisplayName, formatChanges } from '@/utils/logger'

const dataStore = useDataStore()

// Reactive state
const logs = ref([])
const loading = ref(false)
const entityFilter = ref(null)
const actionFilter = ref(null)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(20)

// Options for filters
const entityOptions = computed(() => [
  { title: 'All Types', value: null },
  ...Object.values(LOG_ENTITIES)
    .filter(entity => entity !== 'stock') // Remove stock from filter options
    .map(entity => ({
      title: getEntityDisplayName(entity),
      value: entity
    }))
])

const actionOptions = computed(() => [
  { title: 'All Actions', value: null },
  ...Object.values(LOG_ACTIONS).map(action => ({
    title: getActionDescription(action),
    value: action
  }))
])

// Helper function to get simple action for chip
const getSimpleAction = (log) => {
  return log.action || 'update'
}

// Helper function to get clear display title
const getDisplayTitle = (log) => {
  const entity = log.entity || 'item'
  const id = log.entityId || 'unknown'
  
  // Show entity type and ID clearly
  return `${entity.toUpperCase()} ${id}`
}

// Helper function to get clear description
const getDisplayDescription = (log) => {
  const action = log.action || 'updated'
  
  // Show what actually happened
  if (log.changes && log.changes.status) {
    const newStatus = log.changes.status.after || log.changes.status
    return `Status changed to: ${newStatus}`
  }
  
  if (action === 'create') return 'Created'
  if (action === 'update') return 'Updated'
  if (action === 'delete') return 'Deleted'
  if (action === 'status_change') return 'Status changed'
  if (action === 'transfer') return 'Transferred'
  if (action === 'deduct') return 'Stock deducted'
  if (action === 'add_stock') return 'Stock added'
  if (action === 'batch_progress') return 'Progress updated'
  
  return action
}

// Helper function to show what changed
const getChangesText = (changes) => {
  if (!changes || typeof changes !== 'object') return ''
  
  const changeList = Object.keys(changes).map(key => {
    const change = changes[key]
    if (typeof change === 'object' && change.after !== undefined) {
      return `${key}: ${change.before || 'none'} → ${change.after}`
    }
    return `${key}: ${change}`
  })
  
  return changeList.join(' • ')
}

// Computed properties
const filteredLogs = computed(() => {
  // Start by filtering out stock logs
  let filtered = logs.value.filter(log => log.entity !== 'stock')

  // Filter by entity type
  if (entityFilter.value) {
    filtered = filtered.filter(log => log.entity === entityFilter.value)
  }

  // Filter by action type
  if (actionFilter.value) {
    filtered = filtered.filter(log => log.action === actionFilter.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(log => 
      getDisplayDescription(log).toLowerCase().includes(query) ||
      getDisplayTitle(log).toLowerCase().includes(query) ||
      (log.changes && getChangesText(log.changes).toLowerCase().includes(query))
    )
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / itemsPerPage.value))

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredLogs.value.slice(start, end)
})

// Methods
const refreshLogs = async () => {
  loading.value = true
  try {
    logs.value = await dataStore.getLogs({ limit: 200 })
  } catch (error) {
    console.error('Failed to load logs:', error)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  currentPage.value = 1 // Reset to first page when filtering
}

const scrollToTop = () => {
  // Scroll to top of logs container when page changes
  const container = document.querySelector('.logs-container')
  if (container) {
    container.scrollIntoView({ behavior: 'smooth' })
  }
}

const getLogColor = (action) => {
  const colors = {
    [LOG_ACTIONS.CREATE]: 'success',
    [LOG_ACTIONS.UPDATE]: 'info',
    [LOG_ACTIONS.DELETE]: 'error',
    [LOG_ACTIONS.STATUS_CHANGE]: 'info',
    [LOG_ACTIONS.TRANSFER]: 'purple',
    [LOG_ACTIONS.DEDUCT]: 'orange',
    [LOG_ACTIONS.ADD_STOCK]: 'green',
    [LOG_ACTIONS.BATCH_PROGRESS]: 'blue'
  }
  return colors[action] || 'grey'
}

const getLogIcon = (action) => {
  const icons = {
    [LOG_ACTIONS.CREATE]: 'mdi-plus',
    [LOG_ACTIONS.UPDATE]: 'mdi-pencil',
    [LOG_ACTIONS.DELETE]: 'mdi-delete',
    [LOG_ACTIONS.STATUS_CHANGE]: 'mdi-swap-horizontal',
    [LOG_ACTIONS.TRANSFER]: 'mdi-truck-delivery',
    [LOG_ACTIONS.DEDUCT]: 'mdi-minus',
    [LOG_ACTIONS.ADD_STOCK]: 'mdi-package-variant-plus',
    [LOG_ACTIONS.BATCH_PROGRESS]: 'mdi-progress-clock'
  }
  return icons[action] || 'mdi-circle'
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

const filteredMetadata = (metadata) => {
  // Filter out sensitive or internal metadata
  const excludeKeys = ['userId', 'internalId', 'createdAt']
  return Object.fromEntries(
    Object.entries(metadata).filter(([key]) => !excludeKeys.includes(key))
  )
}

const formatMetadataKey = (key) => {
  // Convert camelCase to readable format
  return key.replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
}

const formatMetadataValue = (value) => {
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return value
}

// Watch for filter changes to reset pagination
watch([entityFilter, actionFilter, searchQuery], () => {
  currentPage.value = 1
})

// Initialize
onMounted(() => {
  refreshLogs()
})
</script>

<style scoped>
.activity-logs {
  max-width: 100%;
}

.filters-row {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  padding: 16px;
}

.timeline-custom {
  padding-left: 0;
}

.log-entry {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.log-entry:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.2s ease;
}

.changes-section {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  padding: 8px;
}

.change-item {
  margin-bottom: 4px;
}

.change-item:last-child {
  margin-bottom: 0;
}

.metadata-panels {
  box-shadow: none;
}

.metadata-panels :deep(.v-expansion-panel) {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.metadata-item {
  margin-bottom: 4px;
}

.metadata-key {
  font-weight: 500;
  min-width: 100px;
}

.metadata-value {
  color: rgba(0, 0, 0, 0.7);
}

.pagination-section {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

/* Timeline customization */
:deep(.v-timeline-item__body) {
  width: 100%;
}

:deep(.v-timeline-item__opposite) {
  display: none;
}
</style>