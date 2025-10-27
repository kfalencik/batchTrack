<template>
  <div class="production-analytics">
    <div class="component-header">
      <div class="header-content">
        <h3 class="component-title">
          <v-icon class="mr-2">mdi-chart-line</v-icon>
          Production Analytics
        </h3>
        <p class="component-subtitle">Real production data and brewing insights</p>
      </div>
      <v-btn-toggle 
        v-model="selectedPeriod" 
        density="compact" 
        variant="outlined" 
        divided
        class="period-toggle"
      >
        <v-btn value="7" size="small">7 Days</v-btn>
        <v-btn value="30" size="small">30 Days</v-btn>
        <v-btn value="90" size="small">All Time</v-btn>
      </v-btn-toggle>
    </div>

    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary" />
      <p class="mt-3 text--secondary">Loading analytics...</p>
    </div>

    <div v-else class="analytics-content">
      <!-- Key Production Metrics -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">
            <v-icon color="blue">mdi-barrel</v-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ productionMetrics.totalBatches }}</div>
            <div class="metric-label">Total Batches</div>
            <div class="metric-trend">{{ productionMetrics.batchTrend }}</div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon">
            <v-icon color="purple">mdi-beaker</v-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ productionMetrics.totalVolume }}L</div>
            <div class="metric-label">Total Volume</div>
            <div class="metric-trend">{{ productionMetrics.volumeTrend }}</div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon">
            <v-icon color="orange">mdi-percent</v-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ productionMetrics.avgABV }}%</div>
            <div class="metric-label">Average ABV</div>
            <div class="metric-trend">{{ productionMetrics.abvRange }}</div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon">
            <v-icon color="green">mdi-check-circle</v-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ productionMetrics.successRate }}%</div>
            <div class="metric-label">Success Rate</div>
            <div class="metric-trend">{{ productionMetrics.successCount }}/{{ productionMetrics.totalBatches }} batches</div>
          </div>
        </div>
      </div>

      <!-- Production Timeline Chart -->
      <div class="chart-section">
        <h4 class="section-title">Production Timeline</h4>
        <div class="timeline-chart">
          <div v-if="timelineData.length === 0" class="empty-state">
            <v-icon size="48" color="grey-lighten-2">mdi-chart-timeline</v-icon>
            <p class="mt-2">No batches started in selected period</p>
          </div>
          <div v-else class="timeline-container">
            <div 
              v-for="(period, index) in timelineData" 
              :key="index"
              class="timeline-period"
            >
              <div class="period-header">
                <span class="period-label">{{ period.label }}</span>
                <span class="period-count">{{ period.batches.length }} batches</span>
              </div>
              <div class="batches-list">
                <div 
                  v-for="batch in period.batches" 
                  :key="batch.id"
                  class="batch-item"
                  :class="`batch-status--${getBatchStatus(batch)}`"
                >
                  <div class="batch-info">
                    <div class="batch-name">{{ getRecipeName(batch.recipeId) }}</div>
                    <div class="batch-details">
                      <span>{{ batch.amount || 0 }}L</span>
                      <span v-if="getABV(batch)">{{ getABV(batch) }}% ABV</span>
                      <StatusChip 
                        :status="getBatchStatus(batch)" 
                        type="batch"
                        size="small"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Distribution -->
      <div class="status-section">
        <h4 class="section-title">Current Status Distribution</h4>
        <div class="status-grid">
          <div 
            v-for="status in statusDistribution" 
            :key="status.status"
            class="status-item"
          >
            <div class="status-visual">
              <div 
                class="status-bar" 
                :style="{ 
                  width: `${status.percentage}%`,
                  backgroundColor: getStatusColor(status.status)
                }"
              ></div>
            </div>
            <div class="status-info">
              <div class="status-header">
                <span class="status-name">{{ status.name }}</span>
                <span class="status-count">{{ status.count }}</span>
              </div>
              <div class="status-percentage">{{ status.percentage }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section" v-if="recentBatches.length > 0">
        <h4 class="section-title">Recent Batch Activity</h4>
        <div class="activity-list">
          <div 
            v-for="batch in recentBatches" 
            :key="batch.id"
            class="activity-item"
          >
            <div class="activity-icon">
              <v-icon :color="getStatusColor(getBatchStatus(batch))">
                {{ getStatusIcon(getBatchStatus(batch)) }}
              </v-icon>
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ getRecipeName(batch.recipeId) }}</div>
              <div class="activity-details">
                Started {{ formatDate(batch.startDate) }} • {{ batch.amount || 0 }}L
                <StatusChip 
                  :status="getBatchStatus(batch)" 
                  type="batch"
                  size="small"
                  class="ml-2"
                />
              </div>
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
import StatusChip from '@/components/StatusChip.vue'

const dataStore = useDataStore()
const selectedPeriod = ref('30')
const loading = ref(false)

// Get data from store
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

// Helper function to get recipe name
function getRecipeName(recipeId) {
  if (!recipeId) return 'Unknown Recipe'
  const recipe = recipes.value.find(r => r.id === recipeId)
  return recipe ? recipe.name : 'Unknown Recipe'
}

// Helper function to calculate ABV
function getABV(batch) {
  if (!batch) return null
  const og = Number(batch.originalGravity)
  const fg = Number(batch.finalGravity)
  if (!Number.isFinite(og) || !Number.isFinite(fg)) return null
  return ((og - fg) * 131.25).toFixed(1)
}

// Helper function to format date
function formatDate(dateObj) {
  if (!dateObj?.seconds) return 'Unknown'
  const date = new Date(dateObj.seconds * 1000)
  const now = new Date()
  const diffTime = now - date
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

// Filter batches by selected period
const filteredBatches = computed(() => {
  if (selectedPeriod.value === '90') return batches.value // All time
  
  const days = parseInt(selectedPeriod.value)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  return batches.value.filter(batch => {
    if (!batch.startDate?.seconds) return false
    const batchDate = new Date(batch.startDate.seconds * 1000)
    return batchDate >= cutoffDate
  })
})

// Production metrics
const productionMetrics = computed(() => {
  const total = filteredBatches.value.length
  const totalVolume = filteredBatches.value.reduce((sum, batch) => sum + (batch.amount || 0), 0)
  
  // Calculate ABV for batches with gravity readings
  const batchesWithABV = filteredBatches.value.filter(batch => getABV(batch) !== null)
  const avgABV = batchesWithABV.length > 0 
    ? (batchesWithABV.reduce((sum, batch) => sum + parseFloat(getABV(batch)), 0) / batchesWithABV.length).toFixed(1)
    : '0.0'
  
  // Calculate success rate (completed batches)
  const successfulBatches = filteredBatches.value.filter(batch => {
    const status = getBatchStatus(batch)
    return ['packaged', 'sold'].includes(status)
  })
  const successRate = total > 0 ? Math.round((successfulBatches.length / total) * 100) : 0
  
  // Calculate trends based on comparison with previous period
  const previousPeriodEnd = new Date()
  previousPeriodEnd.setDate(previousPeriodEnd.getDate() - parseInt(selectedPeriod.value || 30))
  const previousPeriodStart = new Date(previousPeriodEnd)
  previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(selectedPeriod.value || 30))
  
  const previousBatches = batches.value.filter(batch => {
    if (!batch.startDate?.seconds) return false
    const batchDate = new Date(batch.startDate.seconds * 1000)
    return batchDate >= previousPeriodStart && batchDate < previousPeriodEnd
  })
  
  const previousVolume = previousBatches.reduce((sum, batch) => sum + (batch.amount || 0), 0)
  const volumeTrend = previousVolume > 0 
    ? `${totalVolume > previousVolume ? '+' : ''}${((totalVolume - previousVolume) / previousVolume * 100).toFixed(0)}% vs previous`
    : 'First period'
  
  const batchTrend = previousBatches.length > 0
    ? `${total > previousBatches.length ? '+' : ''}${total - previousBatches.length} vs previous`
    : 'First period'
  
  // ABV range
  const abvValues = batchesWithABV.map(batch => parseFloat(getABV(batch)))
  const minABV = abvValues.length > 0 ? Math.min(...abvValues).toFixed(1) : '0'
  const maxABV = abvValues.length > 0 ? Math.max(...abvValues).toFixed(1) : '0'
  const abvRange = batchesWithABV.length > 0 ? `${minABV}% - ${maxABV}%` : 'No data'
  
  return {
    totalBatches: total,
    totalVolume: Math.round(totalVolume),
    avgABV,
    successRate,
    successCount: successfulBatches.length,
    batchTrend,
    volumeTrend,
    abvRange
  }
})

// Timeline data for visual representation
const timelineData = computed(() => {
  if (filteredBatches.value.length === 0) return []
  
  // Group batches by week
  const weeks = new Map()
  
  filteredBatches.value.forEach(batch => {
    if (!batch.startDate?.seconds) return
    
    const date = new Date(batch.startDate.seconds * 1000)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split('T')[0]
    
    if (!weeks.has(weekKey)) {
      weeks.set(weekKey, {
        label: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        batches: [],
        weekStart
      })
    }
    
    weeks.get(weekKey).batches.push(batch)
  })
  
  // Convert to array and sort by date
  return Array.from(weeks.values())
    .sort((a, b) => a.weekStart - b.weekStart)
    .slice(-8) // Show last 8 weeks max
})

// Status distribution
const statusDistribution = computed(() => {
  const statusCounts = new Map()
  const total = batches.value.length
  
  batches.value.forEach(batch => {
    const status = getBatchStatus(batch)
    statusCounts.set(status, (statusCounts.get(status) || 0) + 1)
  })
  
  const statusNames = {
    'fermenting': 'Fermenting',
    'flavouring': 'Flavouring', 
    'ready to pack': 'Ready to Pack',
    'packaged': 'Packaged',
    'sold': 'Sold',
    'failed': 'Failed',
    'unknown': 'Unknown'
  }
  
  return Array.from(statusCounts.entries())
    .map(([status, count]) => ({
      status,
      name: statusNames[status] || status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
})

// Recent batches (last 5)
const recentBatches = computed(() => {
  return [...batches.value]
    .filter(batch => batch.startDate?.seconds)
    .sort((a, b) => b.startDate.seconds - a.startDate.seconds)
    .slice(0, 5)
})

// Helper functions for styling
function getStatusColor(status) {
  const colors = {
    'fermenting': '#2196F3',
    'flavouring': '#FF9800',
    'ready to pack': '#9C27B0',
    'packaged': '#4CAF50',
    'sold': '#607D8B',
    'failed': '#F44336',
    'unknown': '#9E9E9E'
  }
  return colors[status] || '#9E9E9E'
}

function getStatusIcon(status) {
  const icons = {
    'fermenting': 'mdi-flask',
    'flavouring': 'mdi-leaf',
    'ready to pack': 'mdi-package-up',
    'packaged': 'mdi-package-variant-closed',
    'sold': 'mdi-cash',
    'failed': 'mdi-alert-circle',
    'unknown': 'mdi-help-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

onMounted(() => {
  // Data is loaded by parent component
})
</script>

<style scoped>
.production-analytics {
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

.period-toggle {
  height: 32px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.analytics-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-card {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  background: white;
  border: 1px solid rgb(226 232 240);
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.metric-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.metric-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(248 250 252);
  border-radius: 0.5rem;
  margin-right: 1rem;
}

.metric-info {
  flex: 1;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(15 23 42);
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.875rem;
  color: rgb(100 116 139);
  margin-bottom: 0.25rem;
}

.metric-trend {
  font-size: 0.75rem;
  color: rgb(100 116 139);
}

/* Section Titles */
.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(15 23 42);
  margin-bottom: 1rem;
}

/* Chart Section */
.chart-section {
  background: white;
  border: 1px solid rgb(226 232 240);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.timeline-chart {
  min-height: 200px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: rgb(156 163 175);
}

.timeline-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.timeline-period {
  border-left: 3px solid rgb(59 130 246);
  padding-left: 1rem;
}

.period-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.period-label {
  font-weight: 600;
  color: rgb(15 23 42);
}

.period-count {
  font-size: 0.875rem;
  color: rgb(100 116 139);
  margin-left: auto;
}

.batches-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.batch-item {
  padding: 0.75rem;
  background: rgb(248 250 252);
  border-radius: 0.5rem;
  border-left: 3px solid transparent;
}

.batch-status--fermenting { border-left-color: #2196F3; }
.batch-status--flavouring { border-left-color: #FF9800; }
.batch-status--ready-to-pack { border-left-color: #9C27B0; }
.batch-status--packaged { border-left-color: #4CAF50; }
.batch-status--sold { border-left-color: #607D8B; }
.batch-status--failed { border-left-color: #F44336; }

.batch-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.batch-name {
  font-weight: 600;
  color: rgb(15 23 42);
}

.batch-details {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: rgb(100 116 139);
}

/* Status Section */
.status-section {
  background: white;
  border: 1px solid rgb(226 232 240);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.status-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-visual {
  height: 8px;
  background: rgb(226 232 240);
  border-radius: 4px;
  overflow: hidden;
}

.status-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.status-info {
  display: flex;
  justify-content: between;
  align-items: center;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-name {
  font-weight: 500;
  color: rgb(15 23 42);
}

.status-count {
  font-size: 0.875rem;
  color: rgb(100 116 139);
}

.status-percentage {
  font-weight: 600;
  color: rgb(15 23 42);
  margin-left: auto;
}

/* Activity Section */
.activity-section {
  background: white;
  border: 1px solid rgb(226 232 240);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgb(248 250 252);
  border-radius: 0.5rem;
}

.activity-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 0.375rem;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: rgb(15 23 42);
  margin-bottom: 0.25rem;
}

.activity-details {
  font-size: 0.875rem;
  color: rgb(100 116 139);
  display: flex;
  align-items: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .component-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .batch-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .period-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>