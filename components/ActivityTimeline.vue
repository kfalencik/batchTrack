<template>
  <div class="activity-timeline">
    <div class="component-header">
      <div class="header-content">
        <h3 class="component-title">
          <v-icon class="mr-2">mdi-history</v-icon>
          Recent Activity
        </h3>
        <p class="component-subtitle">Latest system events and changes</p>
      </div>
      <v-btn
        variant="outlined"
        size="small"
        @click="refreshLogs"
        :loading="loading"
      >
        <v-icon class="mr-2">mdi-refresh</v-icon>
        Refresh
      </v-btn>
    </div>

    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary" />
      <p class="mt-3 text--secondary">Loading activity...</p>
    </div>

    <div v-else-if="logs.length === 0" class="empty-state">
      <v-icon size="48" color="grey lighten-1">mdi-history</v-icon>
      <h4 class="text-h6 mt-3 text--secondary">No recent activity</h4>
      <p class="text--secondary">Activity will appear here as you use the system</p>
    </div>

    <div v-else class="timeline-container">
      <div class="timeline-list">
        <div 
          v-for="log in displayedLogs" 
          :key="log.id"
          class="timeline-item"
        >
          <div class="timeline-icon" :class="`timeline-icon--${getLogColor(log.action)}`">
            <v-icon size="14" color="white">{{ getLogIcon(log.action) }}</v-icon>
          </div>
          
          <div class="timeline-content">
            <div class="timeline-header">
              <div class="timeline-badges">
                <StatusChip 
                  :status="getSimpleAction(log)" 
                  :type="'action'"
                  size="small"
                />
              </div>
              <span class="timeline-time">{{ formatTime(log.timestamp) }}</span>
            </div>
            
            <div class="timeline-body">
              <div class="timeline-title">{{ getDisplayTitle(log) }}</div>
              <div class="timeline-description">{{ getDisplayDescription(log) }}</div>
              
              <div v-if="log.changes && Object.keys(log.changes).length > 0" class="timeline-changes">
                <div class="changes-detail">
                  <v-icon size="12" class="mr-1 text--secondary">mdi-arrow-right</v-icon>
                  <span class="text-caption">{{ getChangesText(log.changes) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="hasMoreLogs" class="show-more-container">
        <v-btn
          variant="outlined"
          size="small"
          block
          @click="navigateToFullLogs"
        >
          <v-icon class="mr-2">mdi-eye</v-icon>
          View All Activity Logs
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDataStore } from '@/stores/data'
import { useRouter } from 'vue-router'
import { LOG_ACTIONS } from '@/utils/logger'
import StatusChip from '@/components/StatusChip.vue'

const props = defineProps({
  limit: {
    type: Number,
    default: 10
  }
})

const dataStore = useDataStore()
const router = useRouter()
const loading = ref(false)
const logs = ref([])

// Load logs
const refreshLogs = async () => {
  loading.value = true
  try {
    logs.value = await dataStore.getLogs({ limit: props.limit * 2 }) || []
  } catch (error) {
    console.error('Failed to load logs:', error)
    logs.value = []
  } finally {
    loading.value = false
  }
}

// Helper function to get simple action for chip
function getSimpleAction(log) {
  return log.action || 'update'
}

// Helper function to get clear display title
function getDisplayTitle(log) {
  const entity = log.entity || 'item'
  const id = log.entityId || 'unknown'
  
  // Show entity type and ID clearly
  return `${entity.toUpperCase()} ${id}`
}

// Helper function to get clear description
function getDisplayDescription(log) {
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
function getChangesText(changes) {
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
const displayedLogs = computed(() => {
  // Filter out stock logs and then limit results
  const filteredLogs = logs.value.filter(log => log.entity !== 'stock')
  return filteredLogs.slice(0, props.limit)
})

const hasMoreLogs = computed(() => {
  const filteredLogs = logs.value.filter(log => log.entity !== 'stock')
  return filteredLogs.length > props.limit
})

// Helper functions
function getLogColor(action) {
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

function getLogIcon(action) {
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

function formatTime(timestamp) {
  if (!timestamp) return ''
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return date.toLocaleDateString()
}

function navigateToFullLogs() {
  // This would navigate to a full logs page if it exists
  // For now, we can navigate to a section or show more logs
  console.log('Navigate to full activity logs')
}

onMounted(() => {
  refreshLogs()
})
</script>

<style scoped>
.activity-timeline {
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
  color: rgb(156 163 175);
}

.timeline-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.timeline-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-item {
  display: flex;
  gap: 0.75rem;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 12px;
  top: 28px;
  bottom: -16px;
  width: 1px;
  background: rgb(226 232 240);
}

.timeline-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
}

.timeline-icon--success { background: #22C55E; }
.timeline-icon--warning { background: #F59E0B; }
.timeline-icon--error { background: #EF4444; }
.timeline-icon--info { background: #3B82F6; }
.timeline-icon--purple { background: #8B5CF6; }
.timeline-icon--orange { background: #F97316; }
.timeline-icon--green { background: #10B981; }
.timeline-icon--blue { background: #2563EB; }
.timeline-icon--grey { background: #6B7280; }

.timeline-content {
  flex: 1;
  min-width: 0;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.timeline-badges {
  display: flex;
  gap: 0.5rem;
}

.timeline-time {
  font-size: 0.75rem;
  color: rgb(100 116 139);
  flex-shrink: 0;
}

.timeline-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.timeline-title {
  font-weight: 600;
  color: rgb(15 23 42);
  font-size: 0.875rem;
}

.timeline-description {
  font-size: 0.75rem;
  color: rgb(100 116 139);
  line-height: 1.4;
}

.timeline-changes {
  margin-top: 0.5rem;
}

.changes-detail {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: rgb(75 85 99);
  background: rgb(249 250 251);
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid rgb(229 231 235);
  width: fit-content;
}

.show-more-container {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgb(226 232 240);
}

@media (max-width: 768px) {
  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .timeline-badges {
    order: 1;
  }
  
  .timeline-time {
    order: 0;
    align-self: flex-end;
  }
}
</style>