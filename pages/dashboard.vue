<template>
    <div class="dashboard-page">
        <PageHeader 
            title="Dashboard"
            description="Overview of your brewing operations"
        />

        <!-- Key Metrics - Streamlined -->
        <div class="metrics-section">
            <div class="primary-metrics">
                <StatCard 
                    title="Active Batches" 
                    icon="mdi-flask" 
                    color="primary" 
                    :count="stats.activeBatches"
                    :delta-text="stats.activeDelta" 
                />
                <StatCard 
                    title="Ready to Pack" 
                    icon="mdi-package-up" 
                    color="success" 
                    :count="stats.readyToPack"
                    :delta-text="stats.readyDelta" 
                />
                <StatCard 
                    title="Fermenter Usage" 
                    icon="mdi-beer" 
                    color="info" 
                    :count="`${stats.fermenterUtilization}%`"
                    :delta-text="`${fermenters.length} total`" 
                />
            </div>
            
            <!-- Secondary metrics in compact row -->
            <div class="secondary-metrics">
                <div class="metric-item">
                    <span class="metric-label">Total Batches</span>
                    <span class="metric-value">{{ stats.totalBatches }}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Products</span>
                    <span class="metric-value">{{ products.length }}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Stock Groups</span>
                    <span class="metric-value">{{ stockGroups.length }}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Available Recipes</span>
                    <span class="metric-value">{{ stats.availableRecipes }}</span>
                </div>
            </div>
        </div>

        <!-- Main Content - Improved Layout -->
        <div class="content-section">
            <div class="content-row">
                <!-- Fermenter Status -->
                <div class="content-card primary-card">
                    <FermenterStatusDashboard />
                </div>

                <!-- Quick Actions -->
                <div class="content-card secondary-card">
                    <QuickActionsDashboard />
                </div>
            </div>

            <div class="content-row">
                <!-- Production Analytics -->
                <div class="content-card full-width">
                    <ProductionAnalytics />
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="content-card activity-card">
                <ActivityTimeline :limit="8" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useDataStore } from '@/stores/data'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import ActivityTimeline from '@/components/ActivityTimeline.vue'
import FermenterStatusDashboard from '@/components/FermenterStatusDashboard.vue'
import ProductionAnalytics from '@/components/ProductionAnalytics.vue'
import QuickActionsDashboard from '@/components/QuickActionsDashboard.vue'

const dataStore = useDataStore()

// Load all data on mount
onMounted(async () => {
    await Promise.all([
        dataStore.getBatches(),
        dataStore.getFermenters(),
        dataStore.getStockGroups(),
        dataStore.getProducts(),
        dataStore.getRecipes(),
        dataStore.getLogs()
    ])
})

// Get data from store
const batches = computed(() => dataStore.batches || [])
const fermenters = computed(() => dataStore.fermenters || [])
const stockGroups = computed(() => dataStore.stockGroups || [])
const products = computed(() => dataStore.products || [])
const recipes = computed(() => dataStore.recipes || [])

// Helper function to get batch status
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
        return 'flavouring'
    }
    
    return backendStatus || 'unknown'
}

// Helper function to check if fermenter is in use
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

// Calculate statistics
const stats = computed(() => {
    const batchList = batches.value
    const totalBatches = batchList.length
    
    // Count batches by status
    const statusCounts = batchList.reduce((acc, batch) => {
        const status = getBatchStatus(batch)
        acc[status] = (acc[status] || 0) + 1
        return acc
    }, {})
    
    const activeBatches = (statusCounts.fermenting || 0) + (statusCounts.flavouring || 0)
    const readyToPack = statusCounts['ready to pack'] || 0
    const packaged = statusCounts.packaged || 0
    
    // Calculate fermenter utilization
    const inUseFermenters = fermenters.value.filter(f => isInUse(f)).length
    const fermenterUtilization = fermenters.value.length > 0 
        ? Math.round((inUseFermenters / fermenters.value.length) * 100) 
        : 0
    
    // Calculate low stock count
    const lowStockCount = stockGroups.value.filter(group => {
        const totalItems = group.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
        return totalItems < 5
    }).length
    
    // Calculate total volume produced
    const totalVolume = products.value.reduce((sum, product) => {
        return sum + (product.totalVolume || 0)
    }, 0)
    
    // Count available recipes (that can be made with current stock)
    const availableRecipes = recipes.value.filter(recipe => {
        if (!recipe.ingredients) return false
        return recipe.ingredients.every(ingredient => {
            for (const group of stockGroups.value) {
                if (group.items?.some(item => 
                    item.ingredient === ingredient.ingredient && 
                    (item.quantity || 0) >= (ingredient.amount || 0)
                )) {
                    return true
                }
            }
            return false
        })
    }).length
    
    // Calculate simple deltas
    const batchesDelta = totalBatches > 0 ? `${totalBatches} total` : 'No batches yet'
    const activeDelta = activeBatches > 0 ? `${activeBatches} in progress` : 'None active'
    const readyDelta = readyToPack > 0 ? `${readyToPack} awaiting packaging` : 'None ready'
    const packagedDelta = packaged > 0 ? `${packaged} completed` : 'None packaged'
    
    return {
        totalBatches,
        activeBatches,
        readyToPack,
        packaged,
        batchesDelta,
        activeDelta,
        readyDelta,
        packagedDelta,
        fermenterUtilization,
        lowStockCount,
        totalVolume: Math.round(totalVolume),
        availableRecipes
    }
})

// Set page metadata
definePageMeta({
    layout: 'default'
})

useHead({
    title: 'Dashboard | BatchTrack',
})
</script>

<style scoped>
.dashboard-page {
    padding: 0 1.5rem;
    max-width: 1400px;
    margin: 0 auto;
}

/* Metrics Section */
.metrics-section {
    margin-bottom: 3rem;
}

.primary-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.secondary-metrics {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    padding: 1.5rem 2rem;
    background: rgb(248 250 252);
    border-radius: 1rem;
    border: 1px solid rgb(226 232 240 / 0.4);
}

.metric-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 0;
    flex: 1;
}

.metric-label {
    font-size: 0.875rem;
    color: rgb(100 116 139);
    margin-bottom: 0.5rem;
    text-align: center;
}

.metric-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: rgb(15 23 42);
}

/* Content Section */
.content-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.content-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
}

.content-card {
    background: white;
    border-radius: 1rem;
    border: 1px solid rgb(226 232 240 / 0.4);
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    overflow: hidden;
    transition: all 0.2s ease;
}

.content-card:hover {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.full-width {
    grid-column: 1 / -1;
}

.activity-card {
    margin-top: 1rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
    .content-row {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
    
    .secondary-metrics {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
        padding: 1.25rem;
    }
    
    .metric-item {
        align-items: flex-start;
    }
}

@media (max-width: 768px) {
    .dashboard-page {
        padding: 0 1rem;
    }
    
    .primary-metrics {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .secondary-metrics {
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 1rem;
    }
    
    .content-section {
        gap: 1.5rem;
    }
}

@media (max-width: 480px) {
    .dashboard-page {
        padding: 0 0.75rem;
    }
    
    .secondary-metrics {
        padding: 0.75rem;
    }
    
    .metric-value {
        font-size: 1.25rem;
    }
}
</style>