<template>
  <div class="production-analytics">
    <div class="component-header">
      <div class="header-content">
        <h3 class="component-title">
          <v-icon class="mr-2">mdi-chart-line</v-icon>
          Production Analytics
        </h3>
        <p class="component-subtitle">Track batch production trends and performance metrics</p>
      </div>
      <v-btn-toggle 
        v-model="selectedPeriod" 
        density="compact" 
        variant="outlined" 
        divided
        class="period-toggle"
      >
        <v-btn value="7d" size="small">7D</v-btn>
        <v-btn value="30d" size="small">30D</v-btn>
        <v-btn value="90d" size="small">90D</v-btn>
      </v-btn-toggle>
    </div>

    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary" />
      <p class="mt-3 text--secondary">Loading analytics...</p>
    </div>

    <div v-else class="analytics-content">
      <!-- Key Metrics Row -->
      <div class="metrics-row">
        <div class="metric-card">
          <div class="metric-value">{{ totalProduction }}L</div>
          <div class="metric-label">Total Volume</div>
          <div class="metric-change" :class="volumeChangeClass">
            <v-icon size="12">{{ volumeChangeIcon }}</v-icon>
            {{ volumeChange }}
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-value">{{ averageABV }}%</div>
          <div class="metric-label">Avg ABV</div>
          <div class="metric-change positive">
            <v-icon size="12">mdi-trending-up</v-icon>
            Target range
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-value">{{ completionRate }}%</div>
          <div class="metric-label">Success Rate</div>
          <div class="metric-change" :class="successChangeClass">
            <v-icon size="12">{{ successChangeIcon }}</v-icon>
            {{ successChange }}
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-value">{{ averageFermentationDays }}</div>
          <div class="metric-label">Avg Fermentation</div>
          <div class="metric-change neutral">
            <v-icon size="12">mdi-calendar</v-icon>
            days
          </div>
        </div>
      </div>

      <!-- Production Chart -->
      <div class="chart-container">
        <h4 class="chart-title">Batch Production Timeline</h4>
        <div class="chart-wrapper">
          <div v-if="chartData.length === 0" class="empty-chart">
            <v-icon size="48" color="grey lighten-1">mdi-chart-line-variant</v-icon>
            <p class="mt-2 text--secondary">No production data for selected period</p>
          </div>
          <div v-else class="chart-bars">
            <div 
              v-for="(item, index) in chartData" 
              :key="index"
              class="chart-bar-container"
            >
              <div 
                class="chart-bar" 
                :style="{ 
                  height: `${(item.count / maxCount) * 100}%`,
                  backgroundColor: getBarColor(item.count)
                }"
                @mouseover="showTooltip(item, $event)"
                @mouseleave="hideTooltip"
              />
              <div class="chart-label">{{ item.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Breakdown -->
      <div class="status-breakdown">
        <h4 class="breakdown-title">Current Status Distribution</h4>
        <div class="status-items">
          <div 
            v-for="status in statusBreakdown" 
            :key="status.name"
            class="status-item"
          >
            <div class="status-indicator" :style="{ backgroundColor: status.color }"></div>
            <div class="status-info">
              <div class="status-name">{{ status.name }}</div>
              <div class="status-count">{{ status.count }} batches</div>
            </div>
            <div class="status-percentage">{{ status.percentage }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tooltip -->
    <div 
      v-if="tooltip.visible" 
      class="chart-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="tooltip-content">
        <div class="tooltip-title">{{ tooltip.title }}</div>
        <div class="tooltip-value">{{ tooltip.value }} batches</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useDataStore } from '@/stores/data'

const dataStore = useDataStore()
const selectedPeriod = ref('30d')
const loading = ref(false)
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  title: '',
  value: ''
})

// Get data from store
const batches = computed(() => dataStore.batches || [])

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

// Filter batches by selected period
const filteredBatches = computed(() => {
  const days = parseInt(selectedPeriod.value)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  return batches.value.filter(batch => {
    if (!batch.startDate?.seconds) return false
    const batchDate = new Date(batch.startDate.seconds * 1000)
    return batchDate >= cutoffDate
  })
})

// Calculate total production volume
const totalProduction = computed(() => {
  const total = filteredBatches.value.reduce((sum, batch) => {
    return sum + (batch.totalVolume || 0)
  }, 0)
  return Math.round(total)
})

// Calculate average ABV
const averageABV = computed(() => {
  const batchesWithABV = filteredBatches.value.filter(batch => batch.abv)
  if (batchesWithABV.length === 0) return '0.0'
  
  const totalABV = batchesWithABV.reduce((sum, batch) => sum + parseFloat(batch.abv || 0), 0)
  return (totalABV / batchesWithABV.length).toFixed(1)
})

// Calculate completion rate
const completionRate = computed(() => {
  if (filteredBatches.value.length === 0) return 0
  
  const completedBatches = filteredBatches.value.filter(batch => {
    const status = getBatchStatus(batch)
    return ['packaged', 'sold'].includes(status)
  })
  
  return Math.round((completedBatches.length / filteredBatches.value.length) * 100)
})

// Calculate average fermentation days
const averageFermentationDays = computed(() => {
  const batchesWithDays = filteredBatches.value.filter(batch => batch.fermentationDays)
  if (batchesWithDays.length === 0) return '0'
  
  const totalDays = batchesWithDays.reduce((sum, batch) => sum + (batch.fermentationDays || 0), 0)
  return Math.round(totalDays / batchesWithDays.length)
})

// Generate chart data
const chartData = computed(() => {
  const days = parseInt(selectedPeriod.value)
  const data = []
  const now = new Date()
  
  // Group batches by week for 30d+ or by day for 7d
  const groupByWeek = days >= 30
  const groupSize = groupByWeek ? 7 : 1
  const periods = Math.ceil(days / groupSize)
  
  for (let i = periods - 1; i >= 0; i--) {
    const endDate = new Date(now)
    endDate.setDate(endDate.getDate() - (i * groupSize))
    
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - groupSize)
    
    const batchesInPeriod = filteredBatches.value.filter(batch => {
      if (!batch.startDate?.seconds) return false
      const batchDate = new Date(batch.startDate.seconds * 1000)
      return batchDate >= startDate && batchDate <= endDate
    })
    
    let label
    if (groupByWeek) {
      label = `${startDate.getMonth() + 1}/${startDate.getDate()}`
    } else {
      label = `${endDate.getMonth() + 1}/${endDate.getDate()}`
    }
    
    data.push({
      label,
      count: batchesInPeriod.length,
      date: endDate
    })
  }
  
  return data
})

const maxCount = computed(() => {
  return Math.max(...chartData.value.map(item => item.count), 1)
})

// Status breakdown
const statusBreakdown = computed(() => {
  const statusCounts = {}
  const total = batches.value.length
  
  batches.value.forEach(batch => {
    const status = getBatchStatus(batch)
    statusCounts[status] = (statusCounts[status] || 0) + 1
  })
  
  const statusColors = {
    'fermenting': '#2196F3',
    'flavouring': '#FF9800',
    'ready to pack': '#4CAF50',
    'packaged': '#9C27B0',
    'failed': '#F44336',
    'sold': '#607D8B',
    'unknown': '#9E9E9E'
  }
  
  return Object.entries(statusCounts)
    .map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      color: statusColors[status] || '#9E9E9E'
    }))
    .sort((a, b) => b.count - a.count)
})

// Chart helpers
function getBarColor(count) {
  const intensity = count / maxCount.value
  return `rgba(33, 150, 243, ${0.3 + intensity * 0.7})`
}

function showTooltip(item, event) {
  tooltip.value = {
    visible: true,
    x: event.clientX + 10,
    y: event.clientY - 30,
    title: item.label,
    value: item.count
  }
}

function hideTooltip() {
  tooltip.value.visible = false
}

// Computed change indicators (mock data for now)
const volumeChange = computed(() => '+12%')
const volumeChangeClass = computed(() => 'positive')
const volumeChangeIcon = computed(() => 'mdi-trending-up')

const successChange = computed(() => '+5%')
const successChangeClass = computed(() => 'positive')
const successChangeIcon = computed(() => 'mdi-trending-up')

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

.metrics-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  text-align: center;
  padding: 1rem;
  background: rgb(248 250 252);
  border-radius: 0.75rem;
  border: 1px solid rgb(226 232 240);
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(15 23 42);
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.75rem;
  color: rgb(100 116 139);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-change {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.metric-change.positive { color: #059669; }
.metric-change.negative { color: #DC2626; }
.metric-change.neutral { color: #6B7280; }

.chart-container {
  margin-bottom: 2rem;
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(15 23 42);
  margin-bottom: 1rem;
}

.chart-wrapper {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-chart {
  text-align: center;
  color: rgb(156 163 175);
}

.chart-bars {
  display: flex;
  align-items: end;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  gap: 0.5rem;
  padding: 0 1rem;
}

.chart-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.chart-bar {
  width: 100%;
  max-width: 32px;
  border-radius: 4px 4px 0 0;
  transition: all 0.2s;
  cursor: pointer;
  min-height: 4px;
}

.chart-bar:hover {
  opacity: 0.8;
  transform: scaleY(1.05);
}

.chart-label {
  font-size: 0.75rem;
  color: rgb(100 116 139);
  margin-top: 0.5rem;
  text-align: center;
}

.status-breakdown {
  border-top: 1px solid rgb(226 232 240);
  padding-top: 1.5rem;
}

.breakdown-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(15 23 42);
  margin-bottom: 1rem;
}

.status-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-info {
  flex: 1;
}

.status-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(15 23 42);
}

.status-count {
  font-size: 0.75rem;
  color: rgb(100 116 139);
}

.status-percentage {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(15 23 42);
  min-width: 40px;
  text-align: right;
}

.chart-tooltip {
  position: fixed;
  background: rgb(15 23 42);
  color: white;
  padding: 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tooltip-title {
  font-weight: 600;
}

@media (max-width: 768px) {
  .component-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .metrics-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-bars {
    gap: 0.25rem;
    padding: 0 0.5rem;
  }
}
</style>