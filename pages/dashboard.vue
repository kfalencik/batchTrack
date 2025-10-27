<template>
    <div class="dashboard-page">
        <PageHeader 
            title="Dashboard"
            description="Overview of your brewing operations. Monitor production, track inventory, and view recent activity."
        />

        <!-- Quick Stats Grid -->
        <div class="stats-section mb-6">
            <h2 class="section-title">Production Overview</h2>
            <div class="stats-grid">
                <StatCard 
                    title="Total Batches" 
                    icon="mdi-barrel" 
                    color="primary" 
                    :count="stats.totalBatches"
                    :delta-text="stats.batchesDelta" 
                />
                <StatCard 
                    title="Active Batches" 
                    icon="mdi-flask" 
                    color="blue" 
                    :count="stats.activeBatches"
                    :delta-text="stats.activeDelta" 
                />
                <StatCard 
                    title="Ready to Pack" 
                    icon="mdi-package-up" 
                    color="green" 
                    :count="stats.readyToPack"
                    :delta-text="stats.readyDelta" 
                />
                <StatCard 
                    title="Packaged" 
                    icon="mdi-package-variant-closed" 
                    color="purple" 
                    :count="stats.packaged"
                    :delta-text="stats.packagedDelta" 
                />
            </div>
        </div>

        <!-- Secondary Stats Grid -->
        <div class="stats-section mb-6">
            <h2 class="section-title">System Overview</h2>
            <div class="stats-grid-secondary">
                <StatCard 
                    title="Fermenters" 
                    icon="mdi-beer" 
                    color="indigo" 
                    :count="fermenters.length"
                    :delta-text="`${stats.fermenterUtilization}% utilization`" 
                />
                <StatCard 
                    title="Stock Groups" 
                    icon="mdi-package-variant" 
                    color="orange" 
                    :count="stockGroups.length"
                    :delta-text="`${stats.lowStockCount} low stock`" 
                />
                <StatCard 
                    title="Products" 
                    icon="mdi-bottle-wine" 
                    color="teal" 
                    :count="products.length"
                    :delta-text="`${stats.totalVolume}L produced`" 
                />
                <StatCard 
                    title="Recipes" 
                    icon="mdi-chef-hat" 
                    color="pink" 
                    :count="recipes.length"
                    :delta-text="`${stats.availableRecipes} available`" 
                />
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="dashboard-grid">
            <!-- Fermenter Status -->
            <div class="dashboard-card">
                <FermenterStatusDashboard />
            </div>

            <!-- Production Analytics -->
            <div class="dashboard-card">
                <ProductionAnalytics />
            </div>

            <!-- Quick Actions -->
            <div class="dashboard-card">
                <QuickActionsDashboard />
            </div>

            <!-- Recent Activity -->
            <div class="dashboard-card">
                <ActivityTimeline :limit="10" />
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
    padding: 0 1rem;
    max-width: 1400px;
    margin: 0 auto;
}

.stats-section {
    margin-bottom: 2rem;
}

.section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: rgb(15 23 42);
    margin-bottom: 1rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stats-grid-secondary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
}

.dashboard-card {
    background: white;
    border-radius: 1.5rem;
    border: 1px solid rgb(226 232 240 / 0.6);
    box-shadow: 
        0 4px 6px -1px rgb(0 0 0 / 0.1), 
        0 2px 4px -2px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(255 255 255 / 0.05);
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dashboard-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .stats-grid-secondary {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
    
    .dashboard-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .dashboard-page {
        padding: 0 0.5rem;
    }
}
</style>