<template>
  <div class="quick-actions-dashboard">
    <div class="component-header">
      <div class="header-content">
        <h3 class="component-title">
          <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
          Quick Actions
        </h3>
        <p class="component-subtitle">Common tasks and important notifications</p>
      </div>
    </div>

    <div class="actions-content">
      <!-- Alerts Section -->
      <div v-if="alerts.length > 0" class="alerts-section">
        <h4 class="section-title">
          <v-icon class="mr-1" color="warning">mdi-alert</v-icon>
          Alerts & Notifications
        </h4>
        <div class="alerts-list">
          <v-alert
            v-for="alert in alerts"
            :key="alert.id"
            :type="alert.type"
            :icon="alert.icon"
            variant="tonal"
            class="alert-item"
            closable
            @click:close="dismissAlert(alert.id)"
          >
            <div class="alert-content">
              <div class="alert-title">{{ alert.title }}</div>
              <div class="alert-message">{{ alert.message }}</div>
              <v-btn
                v-if="alert.action"
                :color="alert.type"
                size="small"
                variant="outlined"
                class="mt-2"
                @click="handleAlertAction(alert)"
              >
                {{ alert.action.text }}
              </v-btn>
            </div>
          </v-alert>
        </div>
      </div>

      <!-- Primary Actions -->
      <div class="primary-actions-section">
        <h4 class="section-title">
          <v-icon class="mr-1">mdi-star</v-icon>
          Primary Actions
        </h4>
        <div class="action-buttons">
          <v-btn
            color="primary"
            size="large"
            variant="flat"
            class="action-btn"
            @click="navigateTo('/batches')"
            :disabled="availableFermenters === 0"
          >
            <v-icon class="mr-2">mdi-plus-circle</v-icon>
            <div class="btn-content">
              <div class="btn-title">Add New Batch</div>
              <div class="btn-subtitle">{{ availableFermenters }} fermenters available</div>
            </div>
          </v-btn>

          <v-btn
            color="success"
            size="large"
            variant="flat"
            class="action-btn"
            @click="navigateTo('/batches?filter=ready-to-pack')"
            :disabled="readyToPackCount === 0"
          >
            <v-icon class="mr-2">mdi-package-up</v-icon>
            <div class="btn-content">
              <div class="btn-title">Package Batches</div>
              <div class="btn-subtitle">{{ readyToPackCount }} ready to pack</div>
            </div>
          </v-btn>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="quick-links-section">
        <h4 class="section-title">
          <v-icon class="mr-1">mdi-link</v-icon>
          Quick Access
        </h4>
        <div class="quick-links-grid">
          <div 
            v-for="link in quickLinks"
            :key="link.path"
            class="quick-link-item"
            @click="navigateTo(link.path)"
          >
            <div class="link-icon">
              <v-icon :color="link.color">{{ link.icon }}</v-icon>
            </div>
            <div class="link-content">
              <div class="link-title">{{ link.title }}</div>
              <div class="link-subtitle">{{ link.subtitle }}</div>
            </div>
            <div class="link-arrow">
              <v-icon size="16" color="grey-lighten-1">mdi-chevron-right</v-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Summary -->
      <div class="status-summary-section">
        <h4 class="section-title">
          <v-icon class="mr-1">mdi-chart-pie</v-icon>
          Status Summary
        </h4>
        <div class="status-cards">
          <div 
            v-for="status in statusSummary"
            :key="status.key"
            class="status-card"
            :class="`status-card--${status.color}`"
          >
            <div class="status-icon">
              <v-icon :color="status.color">{{ status.icon }}</v-icon>
            </div>
            <div class="status-info">
              <div class="status-count">{{ status.count }}</div>
              <div class="status-label">{{ status.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useDataStore } from '@/stores/data'
import { useRouter } from 'vue-router'

const dataStore = useDataStore()
const router = useRouter()
const dismissedAlerts = ref(new Set())

// Get data from store
const batches = computed(() => dataStore.batches || [])
const fermenters = computed(() => dataStore.fermenters || [])
const stockGroups = computed(() => dataStore.stockGroups || [])
const products = computed(() => dataStore.products || [])

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

// Check if fermenter is in use
function isInUse(fermenter) {
  if (!fermenter?.id || !batches.value?.length) return false
  
  return batches.value.some(batch => {
    if (!batch.fermenter) return false
    
    const batchFermenter = String(batch.fermenter)
    const fermenterIds = [String(fermenter.id), fermenter.id]
    
    if (!fermenterIds.some(id => String(id) === batchFermenter)) return false
    
    const status = getBatchStatus(batch)
    return !['packaged', 'failed', 'sold'].includes(status)
  })
}

// Calculate key metrics
const availableFermenters = computed(() => {
  return fermenters.value.filter(f => !isInUse(f)).length
})

const readyToPackCount = computed(() => {
  return batches.value.filter(batch => getBatchStatus(batch) === 'ready to pack').length
})

const lowStockCount = computed(() => {
  // Simple heuristic for low stock - groups with less than 5 total items
  return stockGroups.value.filter(group => {
    const totalItems = group.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
    return totalItems < 5
  }).length
})

const failedBatchesCount = computed(() => {
  return batches.value.filter(batch => getBatchStatus(batch) === 'failed').length
})

// Generate alerts
const alerts = computed(() => {
  const alertList = []
  
  // Ready to pack alert
  if (readyToPackCount.value > 0 && !dismissedAlerts.value.has('ready-to-pack')) {
    alertList.push({
      id: 'ready-to-pack',
      type: 'success',
      icon: 'mdi-package-up',
      title: 'Batches Ready for Packaging',
      message: `${readyToPackCount.value} batch${readyToPackCount.value > 1 ? 'es are' : ' is'} ready to be packaged.`,
      action: {
        text: 'View Batches',
        handler: () => navigateTo('/batches?filter=ready-to-pack')
      }
    })
  }
  
  // Low stock alert
  if (lowStockCount.value > 0 && !dismissedAlerts.value.has('low-stock')) {
    alertList.push({
      id: 'low-stock',
      type: 'warning',
      icon: 'mdi-package-variant',
      title: 'Low Stock Warning',
      message: `${lowStockCount.value} stock group${lowStockCount.value > 1 ? 's have' : ' has'} low inventory levels.`,
      action: {
        text: 'Check Stock',
        handler: () => navigateTo('/stock')
      }
    })
  }
  
  // Failed batches alert
  if (failedBatchesCount.value > 0 && !dismissedAlerts.value.has('failed-batches')) {
    alertList.push({
      id: 'failed-batches',
      type: 'error',
      icon: 'mdi-alert-circle',
      title: 'Failed Batches',
      message: `${failedBatchesCount.value} batch${failedBatchesCount.value > 1 ? 'es have' : ' has'} failed and need attention.`,
      action: {
        text: 'Review Batches',
        handler: () => navigateTo('/batches?filter=failed')
      }
    })
  }
  
  // No available fermenters alert
  if (availableFermenters.value === 0 && fermenters.value.length > 0 && !dismissedAlerts.value.has('no-fermenters')) {
    alertList.push({
      id: 'no-fermenters',
      type: 'warning',
      icon: 'mdi-beer',
      title: 'All Fermenters in Use',
      message: 'All fermenters are currently occupied. New batches cannot be started.',
      action: {
        text: 'View Fermenters',
        handler: () => navigateTo('/fermenters')
      }
    })
  }
  
  return alertList
})

// Quick links configuration
const quickLinks = computed(() => [
  {
    title: 'View Recipes',
    subtitle: `${dataStore.recipes?.length || 0} available`,
    icon: 'mdi-chef-hat',
    color: 'orange',
    path: '/recipes'
  },
  {
    title: 'Manage Stock',
    subtitle: `${stockGroups.value.length} groups`,
    icon: 'mdi-package-variant',
    color: 'purple',
    path: '/stock'
  },
  {
    title: 'View Products',
    subtitle: `${products.value.length} products`,
    icon: 'mdi-bottle-wine',
    color: 'indigo',
    path: '/products'
  },
  {
    title: 'Tax Reports',
    subtitle: 'Compliance tracking',
    icon: 'mdi-calculator',
    color: 'teal',
    path: '/taxes'
  }
])

// Status summary
const statusSummary = computed(() => {
  const statusCounts = batches.value.reduce((acc, batch) => {
    const status = getBatchStatus(batch)
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})
  
  return [
    {
      key: 'fermenting',
      label: 'Fermenting',
      count: statusCounts.fermenting || 0,
      icon: 'mdi-flask',
      color: 'blue'
    },
    {
      key: 'flavouring',
      label: 'Flavouring',
      count: statusCounts.flavouring || 0,
      icon: 'mdi-leaf',
      color: 'orange'
    },
    {
      key: 'packaged',
      label: 'Packaged',
      count: statusCounts.packaged || 0,
      icon: 'mdi-package-variant-closed',
      color: 'purple'
    },
    {
      key: 'failed',
      label: 'Failed',
      count: statusCounts.failed || 0,
      icon: 'mdi-alert-circle',
      color: 'red'
    }
  ].filter(status => status.count > 0)
})

// Methods
function navigateTo(path) {
  router.push(path)
}

function dismissAlert(alertId) {
  dismissedAlerts.value.add(alertId)
}

function handleAlertAction(alert) {
  if (alert.action?.handler) {
    alert.action.handler()
  }
}

onMounted(() => {
  // Data is loaded by parent component
})
</script>

<style scoped>
.quick-actions-dashboard {
  padding: 1.5rem;
  height: 100%;
}

.component-header {
  margin-bottom: 1.5rem;
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

.actions-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(15 23 42);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

/* Alerts Section */
.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alert-item {
  border-radius: 0.75rem;
}

.alert-content {
  display: flex;
  flex-direction: column;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.alert-message {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Primary Actions */
.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.action-btn {
  height: auto !important;
  padding: 1rem !important;
  text-transform: none !important;
  justify-content: flex-start !important;
  border-radius: 0.75rem !important;
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.btn-title {
  font-weight: 600;
  font-size: 0.875rem;
}

.btn-subtitle {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 0.125rem;
}

/* Quick Links */
.quick-links-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.quick-link-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: rgb(248 250 252);
  border: 1px solid rgb(226 232 240);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-link-item:hover {
  background: rgb(241 245 249);
  transform: translateX(2px);
}

.link-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 0.375rem;
  margin-right: 0.75rem;
}

.link-content {
  flex: 1;
}

.link-title {
  font-weight: 600;
  color: rgb(15 23 42);
  font-size: 0.875rem;
}

.link-subtitle {
  font-size: 0.75rem;
  color: rgb(100 116 139);
}

.link-arrow {
  margin-left: 0.5rem;
}

/* Status Summary */
.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.status-card {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(226 232 240);
  background: white;
}

.status-card--blue { border-color: rgb(147 197 253); background: rgb(239 246 255); }
.status-card--orange { border-color: rgb(251 191 36); background: rgb(255 251 235); }
.status-card--purple { border-color: rgb(196 181 253); background: rgb(245 243 255); }
.status-card--red { border-color: rgb(252 165 165); background: rgb(254 242 242); }

.status-icon {
  margin-right: 0.5rem;
}

.status-info {
  text-align: center;
  flex: 1;
}

.status-count {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(15 23 42);
}

.status-label {
  font-size: 0.75rem;
  color: rgb(100 116 139);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (max-width: 768px) {
  .action-buttons {
    grid-template-columns: 1fr;
  }
  
  .status-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>