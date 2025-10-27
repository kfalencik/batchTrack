<template>
    <div class="stock-page">
        <PageHeader 
            title="Ingredients"
            description="Manage your brewing ingredients and raw materials. Track inventory levels, expiry dates, and stock groups."
            :actions="headerActions"
            @action="handleHeaderAction"
        />

        <EnhancedDataTable
            :headers="headers"
            :items="displayedGroups"
            :loading="loading"
            loading-text="Loading ingredients..."
        >
            <template #item.usable="{ item }">
                <span>{{ item.usableDisplay }}</span>
            </template>
            <template #item.itemsCount="{ item }">
                <span>{{ item.items.length }}</span>
            </template>
            <template #item.status="{ item }">
                <StatusChip 
                    :status="item.status"
                    type="stock"
                    uppercase
                />
            </template>
            <template #item.actions="{ item }">
                <DataTableActions 
                    :item="item.raw"
                    @edit="openEdit"
                    @delete="removeGroup"
                />
            </template>
            
            <template v-slot:expanded-row="{ item }">
                <tr>
                    <td :colspan="headers.length" style="padding: 0" class="bg-lightGrey pa-3">
                        <div v-if="!item.items || item.items.length === 0" class="text--secondary">No items in this group.</div>
                        <v-data-table
                            v-else
                            :headers="itemHeaders"
                            :items="item.items"
                            class="elevation-0 w-100 rounded-md"
                            style="width: 100%"
                            dense
                            hide-default-header
                            hide-default-footer=""
                        >
                        <template #item.product="{ item: it }">
                            <div>
                                <div class="text-subtitle-2">{{ it.product }}</div>
                                <div class="text-caption text--secondary">{{ it.description || '' }}</div>
                            </div>
                        </template>

                        <template #item.quantity="{ item: it }">
                            <div class="font-weight-medium">{{ it.quantity ?? '-' }} {{ it.unit || '' }}</div>
                        </template>

                        <template #item.price="{ item: it }">
                            <div>{{ it.price !== undefined && it.price !== null && it.price !== '' ? `£${Number(it.price).toFixed(2)}` : '-' }}</div>
                        </template>

                        <template #item.dates="{ item: it }">
                            <div>
                                <div>Bought: <span class="text--secondary">{{ formatDate(it.dateBought) }}</span></div>
                                <div>Expiry: <span class="text--secondary">{{ formatDate(it.expiryDate) }}</span></div>
                            </div>
                        </template>

                        <template #item.status="{ item: it }">
                            <StatusChip 
                                :status="getItemStatusInfo(it).text"
                                type="stock"
                                size="small"
                            />
                        </template>
                    </v-data-table>
                </td>
            </tr>
        </template>
        </EnhancedDataTable>

        <BaseDialog
            v-model="editDialog"
            :title="isPreview ? 'Preview Group' : (isAdding ? 'Add Group' : 'Edit Group')"
            title-icon="mdi-folder"
            max-width="1200px"
            @close="closeEdit"
        >
            <v-form v-if="edited" ref="formRef" lazy-validation>
                <v-container>
                    <!-- Help Section -->
                    <v-row v-if="!isPreview">
                        <v-col cols="12">
                            <v-card variant="flat" class="help-card mb-6">
                                <v-card-title class="help-card-title">
                                    <v-icon class="help-icon">mdi-lightbulb-on</v-icon>
                                    <span>Stock Management Guidelines</span>
                                    <v-spacer />
                                    <v-btn
                                        variant="text"
                                        size="small"
                                        @click="showHelp = !showHelp"
                                        :color="showHelp ? 'white' : 'rgba(255,255,255,0.7)'"
                                    >
                                        {{ showHelp ? 'Hide' : 'Show' }} Help
                                        <v-icon :class="{ 'rotate-180': showHelp }">mdi-chevron-down</v-icon>
                                    </v-btn>
                                </v-card-title>
                                <v-expand-transition>
                                    <v-card-text v-show="showHelp" class="help-card-content">
                                        <div class="help-grid">
                                            <div class="help-item">
                                                <div class="help-item-header">
                                                    <v-avatar size="40" class="help-avatar">
                                                        <v-icon color="white">mdi-folder</v-icon>
                                                    </v-avatar>
                                                    <h4>Stock Groups</h4>
                                                </div>
                                                <p>Organize inventory by type, supplier, or usage. Examples: "Brewing Ingredients", "Hops & Spices", "Packaging Supplies".</p>
                                            </div>
                                            
                                            <div class="help-item">
                                                <div class="help-item-header">
                                                    <v-avatar size="40" class="help-avatar">
                                                        <v-icon color="white">mdi-package-variant</v-icon>
                                                    </v-avatar>
                                                    <h4>Product Names</h4>
                                                </div>
                                                <p>Use clear, descriptive names. Include brand names or specifications when relevant for consistency.</p>
                                            </div>
                                            
                                            <div class="help-item">
                                                <div class="help-item-header">
                                                    <v-avatar size="40" class="help-avatar">
                                                        <v-icon color="white">mdi-ruler</v-icon>
                                                    </v-avatar>
                                                    <h4>Units & Quantities</h4>
                                                </div>
                                                <p>Be consistent with units across similar ingredients. Common units: g, kg, ml, L. This ensures accurate recipe calculations.</p>
                                            </div>
                                            
                                            <div class="help-item">
                                                <div class="help-item-header">
                                                    <v-avatar size="40" class="help-avatar">
                                                        <v-icon color="white">mdi-currency-gbp</v-icon>
                                                    </v-avatar>
                                                    <h4>Cost Tracking</h4>
                                                </div>
                                                <p>Track prices to monitor batch costs and profitability. Include dates to track price changes over time.</p>
                                            </div>
                                        </div>
                                    </v-card-text>
                                </v-expand-transition>
                            </v-card>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12">
                            <FormField
                                v-model="edited.name"
                                label="Group Name"
                                type="text"
                                :required="true"
                                :readonly="isPreview"
                                placeholder="e.g. Brewing Ingredients, Hops, Grains..."
                                hint="Name for this stock group"
                                prepend-icon="mdi-folder"
                            />
                        </v-col>
                    </v-row>

                    <v-divider class="my-4" />

                    <v-row>
                        <v-col cols="12">
                            <div class="d-flex align-center mb-3">
                                <v-icon color="primary" class="mr-2">mdi-package-variant-closed</v-icon>
                                <h3>Stock Items</h3>
                            </div>
                        </v-col>
                        <v-col cols="12" v-for="(item, idx) in edited.items" :key="idx">
                            <v-card variant="outlined" class="pa-4 mb-4 stock-item-card">
                                <div class="d-flex align-center justify-space-between mb-3">
                                    <h4 class="text-h6">Item {{ idx + 1 }}</h4>
                                    <v-btn 
                                        v-if="!isPreview && edited.items.length > 1"
                                        icon="mdi-delete" 
                                        color="red" 
                                        variant="text" 
                                        size="small"
                                        @click="removeItem(idx)"
                                    />
                                </div>
                                <v-row class="align-center">
                                    <v-col cols="12">
                                        <FormField
                                            v-model="item.product"
                                            label="Product Name"
                                            type="text"
                                            :required="true"
                                            :readonly="isPreview"
                                            placeholder="e.g. Ginger Root, Organic Sugar..."
                                            hint="Product or ingredient name"
                                            prepend-icon="mdi-package-variant"
                                        />
                                    </v-col>
                                    <v-col cols="4">
                                        <FormField
                                            v-model="item.quantity"
                                            label="Quantity"
                                            type="number"
                                            :required="true"
                                            :readonly="isPreview"
                                            placeholder="e.g. 500"
                                            hint="Amount in stock"
                                            prepend-icon="mdi-counter"
                                        />
                                    </v-col>
                                    <v-col cols="4">
                                        <FormField
                                            v-model="item.unit"
                                            label="Unit"
                                            type="select"
                                            :items="units"
                                            :readonly="isPreview"
                                            hint="Unit of measurement"
                                            prepend-icon="mdi-ruler"
                                        />
                                    </v-col>
                                    <v-col cols="4">
                                        <FormField
                                            v-model="item.price"
                                            label="Price (£)"
                                            type="number"
                                            :readonly="isPreview"
                                            placeholder="e.g. 12.50"
                                            hint="Cost per unit (optional)"
                                            prepend-icon="mdi-currency-gbp"
                                        />
                                    </v-col>
                                    <v-col cols="6">
                                        <v-text-field
                                            v-model="item.dateBought"
                                            label="Date Bought"
                                            type="date"
                                            variant="outlined"
                                            class="mb-2 modern-field"
                                            :readonly="isPreview"
                                            hint="Purchase date (optional)"
                                            persistent-hint
                                        >
                                            <template #prepend-inner>
                                                <v-icon color="primary">mdi-calendar</v-icon>
                                            </template>
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-text-field
                                            v-model="item.expiryDate"
                                            label="Expiry Date"
                                            type="date"
                                            variant="outlined"
                                            class="mb-2 modern-field"
                                            :readonly="isPreview"
                                            hint="Best before date (optional)"
                                            persistent-hint
                                        >
                                            <template #prepend-inner>
                                                <v-icon color="primary">mdi-calendar-alert</v-icon>
                                            </template>
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                            </v-card>
                        </v-col>
                        <v-col cols="12">
                            <v-btn 
                                class="modern-btn-base modern-btn-secondary modern-btn-small" 
                                @click="addItem" 
                                v-if="!isPreview"
                                prepend-icon="mdi-plus"
                            >
                                Add Item
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
            
            <template #actions>
                <v-spacer />
                <v-btn 
                    class="modern-btn-base modern-btn-secondary"
                    @click="closeEdit"
                    prepend-icon="mdi-close"
                >
                    {{ isPreview ? 'Close' : 'Cancel' }}
                </v-btn>
                <v-btn 
                    v-if="!isPreview" 
                    class="modern-btn-base modern-btn-primary" 
                    @click="saveEdit" 
                    :disabled="!isFormValid"
                    prepend-icon="mdi-content-save"
                >
                    {{ isAdding ? 'Create Group' : 'Update Group' }}
                </v-btn>
            </template>
        </BaseDialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDataStore } from '@/stores/data'
import EnhancedDataTable from '@/components/EnhancedDataTable.vue'

const headers = ref([
    { title: '', value: 'data-table-expand', sortable: false, width: '48px' },
    { title: 'Group', value: 'name', sortable: true },
    { title: 'Usable', value: 'usable', sortable: false, align: 'center', width: '100px' },
    { title: 'Items', value: 'itemsCount', sortable: false, align: 'center', width: '80px' },
    { title: 'Status', value: 'status', sortable: true, align: 'center', width: '120px' },
    { title: 'Actions', value: 'actions', sortable: false, align: 'center', width: '100px' }
])

const itemHeaders = ref([
    { title: 'Product', value: 'product', sortable: true },
    { title: 'Quantity', value: 'quantity', sortable: true, align: 'center', width: '100px' },
    { title: 'Price', value: 'price', sortable: true, align: 'end', width: '100px' },
    { title: 'Dates', value: 'dates', sortable: false, width: '200px' },
    { title: 'Status', value: 'status', sortable: true, align: 'center', width: '100px' }
])

const showHelp = ref(false)

const dataStore = useDataStore()
const loading = ref(false)

const editDialog = ref(false)
const edited = ref(null)
const isAdding = ref(false)
const isPreview = ref(false)
const formRef = ref(null)

const units = ['g','kg','ml','l','pcs']

// Header actions computed property
const headerActions = computed(() => {
    return [{
        key: 'add-ingredient',
        text: 'Add Ingredient Group',
        icon: 'mdi-plus-circle',
        color: 'primary'
    }]
})

function handleHeaderAction(actionKey) {
    if (actionKey === 'add-ingredient') {
        openAdd()
    }
}

function removeGroupWrapper(item) {
    removeGroup(item.id)
}

const requiredRule = (v) => (v !== undefined && v !== null && v !== '' ) || 'Required'
const requiredNumberRule = (v) => {
    if (v === undefined || v === null || v === '') return 'Required'
    const n = Number(v)
    return Number.isFinite(n) && n >= 0 || 'Must be a number'
}

function isExpired(item) {
    if (!item || !item.expiryDate) return false
    const ms = Date.parse(item.expiryDate)
    if (Number.isNaN(ms)) return false
    return Date.now() > ms
}

function daysUntilExpiry(item) {
    if (!item || !item.expiryDate) return null
    const ms = Date.parse(item.expiryDate)
    if (Number.isNaN(ms)) return null
    const diff = Math.ceil((ms - Date.now()) / (1000*60*60*24))
    return diff
}

function getItemStatusInfo(item) {
    if (isExpired(item)) {
        return {
            status: 'expired',
            text: 'Expired',
            color: 'red',
            icon: 'mdi-close-circle'
        }
    }
    
    const days = daysUntilExpiry(item)
    
    if (days === null) {
        return {
            status: 'no date',
            text: 'No expiry date',
            color: 'grey',
            icon: 'mdi-calendar-question'
        }
    }
    
    if (days <= 0) {
        return {
            status: 'expired',
            text: 'Expires today',
            color: 'red',
            icon: 'mdi-clock-alert'
        }
    }
    
    if (days === 1) {
        return {
            status: 'expiring soon',
            text: 'Expires tomorrow',
            color: 'amber',
            icon: 'mdi-clock-alert'
        }
    }
    
    if (days <= 3) {
        return {
            status: 'expiring soon',
            text: `Expires in ${days} days`,
            color: 'amber',
            icon: 'mdi-clock-alert'
        }
    }
    
    if (days <= 30) {
        return {
            status: 'warning',
            text: `Expires in ${days} days`,
            color: 'orange',
            icon: 'mdi-alert'
        }
    }
    
    if (days <= 60) {
        return {
            status: 'good',
            text: `Expires in ${days} days`,
            color: 'green',
            icon: 'mdi-check-circle'
        }
    }
    
    return {
        status: 'fresh',
        text: `Fresh (${days} days)`,
        color: 'green',
        icon: 'mdi-leaf'
    }
}

function formatDate(d) {
    if (!d) return '-'
    const ms = Date.parse(d)
    if (Number.isNaN(ms)) return d
    const dt = new Date(ms)
    return dt.toLocaleDateString()
}

const groups = computed(() => dataStore.stockGroups || [])

const displayedGroups = computed(() => {
    return (groups.value || []).map(g => {
        const items = g.items || []
        let usable = 0
        const unitCounts = new Map() // Track quantities by unit
        
        for (const it of items) {
            if (!isExpired(it)) {
                const q = Number(it.quantity)
                const unit = (it.unit || '').trim()
                if (Number.isFinite(q) && q > 0) {
                    usable += q
                    if (unit) {
                        unitCounts.set(unit, (unitCounts.get(unit) || 0) + q)
                    }
                }
            }
        }
        
        // Create display string with units
        let usableDisplay = '-'
        if (usable > 0) {
            if (unitCounts.size === 0) {
                // No units specified
                usableDisplay = usable.toString()
            } else if (unitCounts.size === 1) {
                // Single unit type
                const [unit, quantity] = unitCounts.entries().next().value
                usableDisplay = `${quantity} ${unit}`
            } else {
                // Multiple units - show breakdown
                const unitBreakdown = Array.from(unitCounts.entries())
                    .map(([unit, qty]) => `${qty} ${unit}`)
                    .join(', ')
                usableDisplay = unitBreakdown
            }
        }
        
        // More descriptive group status logic
        let status = 'good'
        const expiredItems = items.filter(isExpired)
        const expiringItems = items.filter(it => {
            const d = daysUntilExpiry(it)
            return d !== null && d <= 30 && d > 0
        })
        const noDateItems = items.filter(it => !it.expiryDate)
        
        if (items.length === 0) {
            status = 'no items'
        } else if (expiredItems.length === items.length) {
            status = 'expired'
        } else if (expiredItems.length > 0) {
            status = 'needs attention'
        } else if (expiringItems.length > 0) {
            status = 'expiring soon'
        } else if (noDateItems.length === items.length) {
            status = 'no date'
        } else if (noDateItems.length > 0) {
            status = 'mixed'
        } else {
            status = 'fresh'
        }
        
        return {
            id: g.id,
            name: g.name,
            items: items,
            usable,
            usableDisplay,
            status,
            raw: g
        }
    })
})

function openAdd() {
    edited.value = {
        id: null,
        name: '',
        items: [
            {
                product: '',
                quantity: null,
                unit: '',
                price: null,
                dateBought: '',
                expiryDate: '',
                description: ''
            }
        ]
    }
    isAdding.value = true
    isPreview.value = false
    editDialog.value = true
}

function openEdit(item) {
    edited.value = JSON.parse(JSON.stringify(item))
    isAdding.value = false
    isPreview.value = false
    editDialog.value = true
}

function openPreview(item) {
    edited.value = JSON.parse(JSON.stringify(item))
    isAdding.value = false
    isPreview.value = true
    editDialog.value = true
}

function closeEdit() {
    editDialog.value = false
    edited.value = null
    isAdding.value = false
    isPreview.value = false
}

const isFormValid = computed(() => {
    if (!edited.value) return false
    if (!edited.value.name) return false
    return edited.value.items.every(item => 
        item.product && 
        Number.isFinite(Number(item.quantity)) && Number(item.quantity) >= 0
    )
})

function addItem() {
    if (!edited.value.items) edited.value.items = []
    edited.value.items.push({
        product: '',
        quantity: null,
        unit: '',
        price: null,
        dateBought: '',
        expiryDate: '',
        description: ''
    })
}

function removeItem(index) {
    if (edited.value.items.length > 1) {
        edited.value.items.splice(index, 1)
    }
}

async function saveEdit() {
    if (!edited.value) return
    
    // ensure numeric coercion
    edited.value.items = (edited.value.items || []).map(i => {
        const copy = Object.assign({}, i)
        if (copy.quantity !== undefined && copy.quantity !== null && copy.quantity !== '') copy.quantity = Number(copy.quantity)
        if (copy.price !== undefined && copy.price !== null && copy.price !== '') copy.price = Number(copy.price)
        return copy
    })

    if (isAdding.value) {
        // simple id assignment; can be replaced with Firestore id handling
        edited.value.id = String(Date.now())
        await dataStore.addStockGroup(edited.value)
    } else {
        await dataStore.updateStockGroup(edited.value)
    }
    await dataStore.getStockGroups()
    closeEdit()
}

async function removeGroup(id) {
    if (!id) return
    await dataStore.removeStockGroup(id)
    await dataStore.getStockGroups()
}

// Load data on mount
onMounted(async () => {
    loading.value = true
    await dataStore.getStockGroups()
    loading.value = false
})
</script>

<style scoped>
/* Modern page layout styles */
.stock-page {
    padding: 0 1rem;
    max-width: 1400px;
    margin: 0 auto;
}

.data-table-wrapper {
    background: white;
    border-radius: 1.5rem;
    border: 1px solid rgb(226 232 240 / 0.6);
    box-shadow: 
        0 4px 6px -1px rgb(0 0 0 / 0.1), 
        0 2px 4px -2px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(255 255 255 / 0.05);
    overflow: hidden;
    backdrop-filter: blur(12px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin: 2rem 0;
}

.modern-field {
    transition: all 0.2s ease;
}

.modern-field:hover {
    transform: translateY(-1px);
}

.required-field {
    position: relative;
}

.required-field::after {
    content: '*';
    color: red;
    position: absolute;
    top: 8px;
    right: 8px;
}

.help-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 1rem;
}

.help-card-title {
    display: flex;
    align-items: center;
    padding: 1.5rem;
    padding-bottom: 1rem;
}

.help-card-content {
    padding: 0 1.5rem 1.5rem;
}

.help-icon {
    margin-right: 0.75rem;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
}

.help-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}

.help-item {
    background: rgba(255, 255, 255, 0.1);
    padding: 1.5rem;
    border-radius: 0.75rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.help-item-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

.help-item-header h4 {
    margin: 0 0 0 1rem;
    font-size: 1.1rem;
    font-weight: 600;
}

.help-avatar {
    background: rgba(255, 255, 255, 0.2) !important;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.help-item p {
    margin: 0;
    line-height: 1.5;
    opacity: 0.9;
}

.rotate-180 {
    transform: rotate(180deg);
}

.stock-item-card {
    transition: all 0.2s ease;
    border: 1px solid #e0e0e0;
}

.stock-item-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-1px);
}
</style>