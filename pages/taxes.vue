<template>
    <div class="taxes-page">
        <PageHeader 
            title="Tax & Duty Records"
            description="Manage duty status and export records for HMRC compliance. Track duty obligations for your packaged batches."
            action-text="Add Tax Record"
            action-icon="mdi-plus-circle"
            :actions="headerActions"
            @action="handleHeaderAction"
        />

        <!-- Modern Stat cards grid -->
        <div class="stats-grid">
            <StatCard :title="'All'" icon="mdi-view-grid" color="black" :count="taxBatches?.length" :active="activeFilter === 'all'" @click="setFilter('all')" />
            <StatCard :title="'Untaxed'" icon="mdi-clock-outline" color="orange-lighten-2" :count="stats.untaxed" :active="activeFilter === 'untaxed'" @click="setFilter('untaxed')" />
            <StatCard :title="'Tax Paid'" icon="mdi-check-circle" color="green" :count="stats.taxPaid" :active="activeFilter === 'tax paid'" @click="setFilter('tax paid')" />
            <StatCard :title="'Destroyed'" icon="mdi-delete-outline" color="red" :count="stats.destroyed" :active="activeFilter === 'destroyed'" @click="setFilter('destroyed')" />
            <StatCard :title="'Transferred'" icon="mdi-truck-delivery" color="blue-lighten-1" :count="stats.transferred" :active="activeFilter === 'transferred'" @click="setFilter('transferred')" />
        </div>

        <EnhancedDataTable
            :headers="headers"
            :items="displayedBatches"
            :loading="loading"
            loading-text="Loading tax records..."
        >
            <template #item.batchId="{ item }">
                <span class="text-subtitle-2 font-weight-medium text-primary">{{ item.batchId || item.id || '-' }}</span>
            </template>
            <template #item.recipe="{ item }">
                <div>
                    <div class="text-subtitle-2">{{ getRecipeName(item.recipeId) }}</div>
                    <div class="text-caption text--secondary">{{ getBatchLabel(item) }}</div>
                </div>
            </template>
            <template #item.abv="{ item }">
                <span>{{ getABV(item) }}%</span>
            </template>
            <template #item.totalVolume="{ item }">
                <span>{{ getTotalVolume(item) }}L</span>
            </template>
            <template #item.pureAlcohol="{ item }">
                <span class="font-weight-medium text-primary">{{ getPureAlcohol(item) }}L</span>
            </template>
            <template #item.dutyStatus="{ item }">
                <StatusChip 
                    :status="getDutyStatus(item)"
                    type="duty"
                    uppercase
                />
            </template>
            <template #item.dutyPointDate="{ item }">
                <span>{{ formatDate(item.dutyPointDate) }}</span>
            </template>
            <template #item.dutyPaidDate="{ item }">
                <span>{{ formatDate(item.dutyPaidDate) }}</span>
            </template>
            <template #item.dutyReference="{ item }">
                <span>{{ item.dutyReference || '-' }}</span>
            </template>
            <template #item.actions="{ item }">
                <DataTableActions 
                    :item="item"
                    :show-delete="false"
                    edit-icon="mdi-pencil"
                    :custom-actions="getDutyActions(item)"
                    @edit="openEdit"
                    @custom-action="handleDutyAction"
                />
            </template>
        </EnhancedDataTable>

        <!-- Edit Dialog -->
        <BaseDialog
            v-model="editDialog"
            :title="isPreview ? 'Preview Tax Record' : (isAdding ? 'Add Tax Record' : 'Update Tax Record')"
            title-icon="mdi-receipt"
            max-width="800px"
            @close="closeEdit"
        >
            <v-form v-if="edited" ref="formRef" lazy-validation>
                <v-container>
                    <!-- Help Section -->
                    <v-row v-if="!isPreview">
                        <v-col cols="12">
                            <HelpSection
                                title="Duty Record Guidelines"
                                :help-items="dutyHelpItems"
                            />
                        </v-col>
                    </v-row>

                    <!-- Batch Summary -->
                    <v-row>
                        <v-col cols="12">
                            <v-card outlined class="mb-4 summary-card">
                                <v-card-text>
                                    <div class="d-flex justify-space-between align-center">
                                        <div>
                                            <div class="text-h6 font-weight-bold">{{ getBatchLabel(edited) }}</div>
                                            <div class="text-subtitle-2 text-medium-emphasis">{{ getRecipeName(edited.recipeId) }}</div>
                                        </div>
                                        <div class="text-right">
                                            <div class="text-h6 font-weight-bold text-primary">{{ getABV(edited) }}% ABV</div>
                                            <div class="text-subtitle-2 text-medium-emphasis">{{ getTotalVolume(edited) }}L Total</div>
                                            <div class="text-subtitle-1 font-weight-bold text-orange">{{ getPureAlcohol(edited) }}L Pure Alcohol</div>
                                        </div>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>

                    <!-- Form Fields -->
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-select
                                label="Duty Status"
                                v-model="edited.dutyStatus"
                                :items="dutyStatusOptions"
                                required
                                :rules="[requiredRule]"
                                :readonly="isPreview"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                label="Duty Point Date"
                                type="date"
                                v-model="edited.dutyPointDate"
                                hint="When duty became payable (e.g. packaging date)"
                                :readonly="isPreview"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                label="Duty Paid Date"
                                type="date"
                                v-model="edited.dutyPaidDate"
                                hint="When payment was submitted to HMRC"
                                :readonly="isPreview"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                label="Declaration Reference"
                                v-model="edited.dutyReference"
                                hint="Optional HMRC return reference"
                                :readonly="isPreview"
                            />
                        </v-col>
                        <v-col cols="12">
                            <v-textarea
                                label="Notes"
                                v-model="edited.dutyNotes"
                                hint="Additional notes about duty status or circumstances"
                                :readonly="isPreview"
                            />
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
            
            <template #actions v-if="!isPreview">
                <v-spacer />
                <v-btn 
                    class="modern-btn-base modern-btn-secondary"
                    @click="closeEdit"
                    prepend-icon="mdi-close"
                >
                    Cancel
                </v-btn>
                <v-btn 
                    class="modern-btn-base modern-btn-primary" 
                    @click="saveEdit" 
                    :disabled="!isFormValid"
                    prepend-icon="mdi-content-save"
                >
                    Save Changes
                </v-btn>
            </template>
        </BaseDialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDataStore } from '@/stores/data'
import StatCard from '@/components/StatCard.vue'
import EnhancedDataTable from '@/components/EnhancedDataTable.vue'
import StatusChip from '@/components/StatusChip.vue'
import DataTableActions from '@/components/DataTableActions.vue'
import BaseDialog from '@/components/BaseDialog.vue'
import HelpSection from '@/components/HelpSection.vue'
import PageHeader from '@/components/PageHeader.vue'

const dataStore = useDataStore()

// State
const loading = ref(false)
const editDialog = ref(false)
const edited = ref(null)
const isPreview = ref(false)
const activeFilter = ref('all')
const formRef = ref(null)

// Data computed properties
const batches = computed(() => dataStore.batches || [])
const fermenters = computed(() => dataStore.fermenters || [])
const recipes = computed(() => dataStore.recipes || [])
const products = computed(() => dataStore.products || [])

// Only show packaged batches in taxes section
const taxBatches = computed(() => {
    return batches.value.filter(batch => {
        const status = batch.status || getComputedStatus(batch)
        return status === 'packaged'
    })
})

// Filter and display logic
const displayedBatches = computed(() => {
    let filtered = taxBatches.value
    
    if (activeFilter.value !== 'all') {
        filtered = filtered.filter(batch => {
            const dutyStatus = getDutyStatus(batch).toLowerCase()
            return dutyStatus === activeFilter.value
        })
    }
    
    return filtered
})

// Stats for the cards
const stats = computed(() => {
    const list = taxBatches.value
    const s = { untaxed: 0, taxPaid: 0, destroyed: 0, transferred: 0 }
    
    for (const batch of list) {
        const dutyStatus = getDutyStatus(batch).toLowerCase()
        if (dutyStatus === 'untaxed') s.untaxed++
        else if (dutyStatus === 'tax paid') s.taxPaid++
        else if (dutyStatus === 'destroyed') s.destroyed++
        else if (dutyStatus === 'transferred') s.transferred++
    }
    
    return s
})

// Header actions
const headerActions = computed(() => [
    {
        key: 'export-csv',
        text: 'Export CSV',
        icon: 'mdi-download',
        color: 'primary'
    }
])

// Table headers
const headers = ref([
    { title: 'Batch ID', value: 'batchId', sortable: true, width: '150px' },
    { title: 'Recipe', value: 'recipe', sortable: true, width: '200px' },
    { title: 'ABV (%)', value: 'abv', sortable: true, align: 'center', width: '80px' },
    { title: 'Volume (L)', value: 'totalVolume', sortable: true, align: 'center', width: '100px' },
    { title: 'Pure Alcohol (L)', value: 'pureAlcohol', sortable: true, align: 'center', width: '120px' },
    { title: 'Duty Status', value: 'dutyStatus', sortable: true, align: 'center', width: '130px' },
    { title: 'Duty Point Date', value: 'dutyPointDate', sortable: true, width: '150px' },
    { title: 'Duty Paid Date', value: 'dutyPaidDate', sortable: true, width: '150px' },
    { title: 'Reference', value: 'dutyReference', sortable: true, width: '120px' },
    { title: 'Actions', value: 'actions', sortable: false, align: 'center', width: '120px' }
])

// Form options
const dutyStatusOptions = [
    { title: 'Untaxed', value: 'untaxed' },
    { title: 'Tax Paid', value: 'tax paid' },
    { title: 'Destroyed', value: 'destroyed' },
    { title: 'Transferred', value: 'transferred' }
]

// Help items
const dutyHelpItems = [
    {
        icon: 'mdi-information',
        title: 'Duty Status',
        description: 'Track when duty becomes payable and payment status. "Untaxed" means duty is owed, "Tax Paid" means submitted to HMRC.'
    },
    {
        icon: 'mdi-calendar',
        title: 'Important Dates',
        description: 'Duty Point Date: when duty became payable (usually packaging). Duty Paid Date: when you submitted payment to HMRC.'
    },
    {
        icon: 'mdi-file-document',
        title: 'Record Keeping',
        description: 'Keep declaration references and notes for audit purposes. Export CSV for your accountant or HMRC submissions.'
    }
]

// Validation rules
const requiredRule = (v) => (v !== undefined && v !== null && v !== '') || 'Required'

const isFormValid = computed(() => {
    return edited.value && edited.value.dutyStatus
})

// Helper functions
function getBatchLabel(batch) {
    if (!batch) return '-'
    const fermenter = fermenters.value.find(f => f.id === batch.fermenter)
    return fermenter ? fermenter.name : `Fermenter ${batch.fermenter}`
}

function getRecipeName(recipeId) {
    if (!recipeId) return '-'
    const recipe = recipes.value.find(r => r.id === recipeId)
    return recipe ? recipe.name : 'Unknown Recipe'
}

function getABV(batch) {
    if (!batch) return '-'
    
    // First try to get ABV from the batch's original and final gravity readings
    const og = Number(batch.originalGravity || batch.readingOG)
    const fg = Number(batch.finalGravity || batch.readingFG)
    
    if (Number.isFinite(og) && Number.isFinite(fg) && og > 0 && fg > 0) {
        const abv = ((og - fg) * 131.25).toFixed(1)
        return abv
    }
    
    // Try to get from products (packaged ABV)
    const batchProducts = products.value.filter(p => p.fermenter === batch.fermenter)
    if (batchProducts.length > 0 && batchProducts[0].abv) {
        const abv = Number(batchProducts[0].abv)
        return Number.isFinite(abv) ? abv.toFixed(1) : '-'
    }
    
    return '-'
}

function getTotalVolume(batch) {
    if (!batch) return '-'
    
    // Get volume from products (actual packaged volume)
    const batchProducts = products.value.filter(p => p.fermenter === batch.fermenter)
    if (batchProducts.length > 0) {
        const totalVolume = batchProducts.reduce((sum, product) => sum + (Number(product.totalVolume) || 0), 0)
        return totalVolume.toFixed(1)
    }
    
    // Fallback to batch amount if no products
    return Number(batch.amount || 0).toFixed(1)
}

function getPureAlcohol(batch) {
    if (!batch) return '-'
    
    const volume = Number(getTotalVolume(batch))
    const abv = Number(getABV(batch))
    
    if (!Number.isFinite(volume) || !Number.isFinite(abv) || volume <= 0 || abv <= 0) {
        return '-'
    }
    
    // Pure Alcohol (L) = Volume (L) × ABV% ÷ 100
    const pureAlcohol = (volume * abv) / 100
    return pureAlcohol.toFixed(2)
}

function getDutyStatus(batch) {
    if (!batch) return 'Untaxed'
    
    // Check explicit duty status first
    if (batch.dutyStatus) {
        return batch.dutyStatus
    }
    
    // Legacy: check taxPaid field
    if (batch.taxPaid === true) {
        return 'Tax Paid'
    }
    
    return 'Untaxed'
}

function getComputedStatus(batch) {
    // Same logic as batches.vue for computing status
    const backendStatus = batch?.status
    const backendSet = backendStatus && ['failed', 'ready to pack', 'packaged', 'sold'].includes(backendStatus)
    if (backendSet) return backendStatus

    if (batch?.startDate?.seconds && Number.isFinite(batch.fermentationDays)) {
        const now = Date.now()
        const endSecs = batch.startDate.seconds + (Number(batch.fermentationDays) * 86400)
        const endMs = endSecs * 1000
        if (now < endMs) return 'fermenting'
        return 'flavouring'
    }

    return backendStatus || 'Unknown'
}

function formatDate(dateStr) {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleDateString()
}

function getDutyActions(batch) {
    const actions = []
    const currentStatus = getDutyStatus(batch).toLowerCase()
    
    if (currentStatus === 'untaxed') {
        actions.push({
            key: 'mark-paid',
            icon: 'mdi-check-circle',
            color: 'success',
            tooltip: 'Mark as Tax Paid'
        })
    } else if (currentStatus === 'tax paid') {
        actions.push({
            key: 'mark-untaxed',
            icon: 'mdi-clock-outline',
            color: 'warning',
            tooltip: 'Mark as Untaxed'
        })
    }
    
    actions.push({
        key: 'set-destroyed',
        icon: 'mdi-delete-outline',
        color: 'error',
        tooltip: 'Mark as Destroyed'
    })
    
    return actions
}

// Event handlers
function handleHeaderAction(actionKey) {
    if (actionKey === 'export-csv') {
        exportToCSV()
    }
}

function setFilter(filter) {
    activeFilter.value = filter
}

function openEdit(batch) {
    edited.value = { ...batch }
    isPreview.value = false
    editDialog.value = true
}

function closeEdit() {
    edited.value = null
    editDialog.value = false
}

async function saveEdit() {
    if (!edited.value || !isFormValid.value) return
    
    // Validate form
    if (formRef.value) {
        const valid = await formRef.value.validate()
        if (!valid) return
    }
    
    // Auto-fill Duty Point Date when status changes to Tax Paid
    if (edited.value.dutyStatus === 'tax paid' && !edited.value.dutyPointDate) {
        // Use packaging date from products or current date
        const batchProducts = products.value.filter(p => p.fermenter === edited.value.fermenter)
        if (batchProducts.length > 0 && batchProducts[0].packagedDate) {
            edited.value.dutyPointDate = batchProducts[0].packagedDate
        } else {
            edited.value.dutyPointDate = new Date().toISOString().slice(0, 10)
        }
    }
    
    // Auto-fill Duty Paid Date when marking as Tax Paid
    if (edited.value.dutyStatus === 'tax paid' && !edited.value.dutyPaidDate) {
        edited.value.dutyPaidDate = new Date().toISOString().slice(0, 10)
    }
    
    // Update batch with duty information
    await dataStore.updateBatch(edited.value)
    await dataStore.getBatches()
    
    closeEdit()
    
    dataStore.setNotification({
        text: 'Tax record updated successfully',
        color: 'success',
        delay: 3000
    })
}

async function handleDutyAction(actionKey, batch) {
    const updatedBatch = { ...batch }
    
    switch (actionKey) {
        case 'mark-paid':
            updatedBatch.dutyStatus = 'tax paid'
            if (!updatedBatch.dutyPointDate) {
                const batchProducts = products.value.filter(p => p.fermenter === batch.fermenter)
                updatedBatch.dutyPointDate = batchProducts.length > 0 && batchProducts[0].packagedDate
                    ? batchProducts[0].packagedDate
                    : new Date().toISOString().slice(0, 10)
            }
            if (!updatedBatch.dutyPaidDate) {
                updatedBatch.dutyPaidDate = new Date().toISOString().slice(0, 10)
            }
            break
        case 'mark-untaxed':
            updatedBatch.dutyStatus = 'untaxed'
            updatedBatch.dutyPaidDate = null
            break
        case 'set-destroyed':
            updatedBatch.dutyStatus = 'destroyed'
            if (!updatedBatch.dutyPointDate) {
                updatedBatch.dutyPointDate = new Date().toISOString().slice(0, 10)
            }
            break
    }
    
    await dataStore.updateBatch(updatedBatch)
    await dataStore.getBatches()
    
    dataStore.setNotification({
        text: `Duty status updated to: ${updatedBatch.dutyStatus}`,
        color: 'success',
        delay: 3000
    })
}

function exportToCSV() {
    const csvData = taxBatches.value.map(batch => ({
        'Batch ID': batch.batchId || batch.id || '-',
        'Fermenter': getBatchLabel(batch),
        'Recipe': getRecipeName(batch.recipeId),
        'ABV (%)': getABV(batch),
        'Total Volume (L)': getTotalVolume(batch),
        'Pure Alcohol (L)': getPureAlcohol(batch),
        'Duty Status': getDutyStatus(batch),
        'Duty Point Date': formatDate(batch.dutyPointDate),
        'Duty Paid Date': formatDate(batch.dutyPaidDate),
        'Declaration Reference': batch.dutyReference || '',
        'Notes': batch.dutyNotes || ''
    }))
    
    const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `duty-records-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
    
    dataStore.setNotification({
        text: 'CSV export downloaded successfully',
        color: 'success',
        delay: 3000
    })
}

// Lifecycle
onMounted(async () => {
    await Promise.all([
        dataStore.getBatches(),
        dataStore.getFermenters(),
        dataStore.getRecipes(),
        dataStore.getProducts()
    ])
})

// Page meta
definePageMeta({ layout: 'default' })
useHead({ title: 'Tax & Duty Records | BatchTrack' })
</script>

<style scoped>
/* Modern page layout styles */
.taxes-page {
    padding: 0 1rem;
    max-width: 1400px;
    margin: 0 auto;
}

/* Stats grid styling */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

/* Summary card styling */
.summary-card {
    background: linear-gradient(135deg, rgb(248 250 252) 0%, rgb(241 245 249) 100%);
    border: 2px solid rgb(99 102 241 / 0.2) !important;
    transition: all 0.3s ease;
}

.summary-card:hover {
    border-color: rgb(99, 102, 241) !important;
    box-shadow: 0 8px 25px -5px rgb(99 102 241 / 0.15), 0 4px 6px -2px rgb(0 0 0 / 0.05);
}
</style>