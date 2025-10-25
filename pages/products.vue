<template>
    <div class="products-page">
        <PageHeader 
            title="Products"
            description="Manage your finished brewing products. Track packaging details, volumes, and inventory of your completed brews."
            :actions="headerActions"
            @action="handleHeaderAction"
        />

        <EnhancedDataTable
            :headers="productHeaders"
            :items="products"
            :loading="loadingProducts"
            loading-text="Loading products..."
        >
            <template #item.productName="{ item }">
                <div>
                    <div class="text-subtitle-2">{{ item.productName }}</div>
                    <div class="text-caption text--secondary">{{ item.containerType }} - {{ item.containerSize }}L each</div>
                </div>
            </template>
            <template #item.quantity="{ item }">
                <div class="font-weight-medium">{{ item.quantity }} {{ item.containerType }}</div>
            </template>
            <template #item.totalVolume="{ item }">
                <div class="font-weight-medium">{{ item.totalVolume }}L</div>
            </template>
            <template #item.abv="{ item }">
                <div>{{ item.abv || '-' }}</div>
            </template>
            <template #item.packagedDate="{ item }">
                <div>{{ formatDate(item.packagedDate) }}</div>
            </template>
            <template #item.status="{ item }">
                <StatusChip 
                    :status="item.status"
                    type="product"
                    uppercase
                />
            </template>
            <template #item.actions="{ item }">
                <DataTableActions 
                    :item="item"
                    @edit="viewProduct"
                    @delete="removeProductWrapper"
                />
            </template>
        </EnhancedDataTable>

        <!-- Product Dialog -->
        <BaseDialog
            v-model="productDialog"
            :title="isAddingProduct ? 'Add Product from Batch' : 'Edit Product'"
            title-icon="mdi-package-variant"
            max-width="1000px"
            @close="closeProductDialog"
        >
            <v-form v-if="editedProduct" ref="productFormRef" lazy-validation>
                <v-container>
                    <!-- Batch Selection Section (only for new products) -->
                    <v-row v-if="isAddingProduct">
                        <v-col cols="12">
                            <v-select
                                :items="readyToPackBatches"
                                label="Select Batch"
                                v-model="editedProduct.selectedBatch"
                                item-title="label"
                                item-value="value"
                                required
                                :rules="[requiredRule]"
                                hint="Choose a batch that's ready to pack"
                                persistent-hint
                                @update:modelValue="onBatchSelected"
                            />
                        </v-col>
                        <v-col cols="12" v-if="editedProduct.selectedBatch">
                            <v-alert type="info" class="mb-4">
                                <div><strong>Available brew:</strong> {{ getTotalBatchAmount(selectedBatchData) }} L</div>
                                <div><strong>Batch:</strong> {{ selectedBatchData ? getFermenterLabelById(selectedBatchData.fermenter) : '' }}</div>
                                <div><strong>ABV:</strong> {{ selectedBatchData ? getABV(selectedBatchData) : '' }}%</div>
                            </v-alert>
                        </v-col>
                    </v-row>

                    <!-- Product Name -->
                    <v-row>
                        <v-col cols="12">
                            <v-text-field 
                                class="required-field" 
                                label="Product Name" 
                                v-model="editedProduct.productName" 
                                :rules="[requiredRule]" 
                                required 
                            />
                        </v-col>
                    </v-row>

                    <!-- Container Groups Section (only for new products with batch selected) -->
                    <v-row v-if="isAddingProduct && editedProduct.selectedBatch">
                        <v-col cols="12">
                            <h3 class="mb-3">Container Distribution</h3>
                            <p class="text-caption text--secondary mb-4">Distribute your brew across different container types. You can add multiple groups to split the total amount.</p>
                        </v-col>
                    </v-row>

                    <v-row v-for="(group, idx) in containerGroups" :key="idx" class="mb-4" v-if="isAddingProduct && editedProduct.selectedBatch">
                        <v-col cols="12">
                            <v-card outlined class="pa-4">
                                <v-row class="align-center">
                                    <v-col cols="3">
                                        <v-select
                                            :items="containerTypes"
                                            label="Container Type"
                                            v-model="group.containerType"
                                            required
                                            :rules="[requiredRule]"
                                        />
                                    </v-col>
                                    <v-col cols="2">
                                        <v-text-field
                                            label="Size (L)"
                                            type="number"
                                            v-model="group.containerSize"
                                            required
                                            :rules="[requiredNumberRule]"
                                        />
                                    </v-col>
                                    <v-col cols="2">
                                        <v-text-field
                                            label="Quantity"
                                            type="number"
                                            v-model="group.quantity"
                                            required
                                            :rules="[requiredNumberRule]"
                                            @input="updateTotal"
                                        />
                                    </v-col>
                                    <v-col cols="2">
                                        <v-text-field
                                            label="Total (L)"
                                            :value="getGroupTotal(group)"
                                            readonly
                                        />
                                    </v-col>
                                    <v-col cols="2">
                                        <v-text-field
                                            label="Notes"
                                            v-model="group.notes"
                                            placeholder="Optional"
                                        />
                                    </v-col>
                                    <v-col cols="1">
                                        <v-btn 
                                            icon="mdi-delete" 
                                            class="modern-btn-icon modern-btn-icon-danger" 
                                            @click="removeGroup(idx)"
                                            :disabled="containerGroups.length === 1"
                                        />
                                    </v-col>
                                </v-row>
                            </v-card>
                        </v-col>
                    </v-row>

                    <!-- Add Group Button -->
                    <v-row v-if="isAddingProduct && editedProduct.selectedBatch">
                        <v-col cols="12">
                            <v-btn 
                                prepend-icon="mdi-plus" 
                                class="modern-btn-base modern-btn-secondary modern-btn-small mb-3" 
                                @click="addGroup"
                            >
                                Add Container Group
                            </v-btn>
                        </v-col>
                    </v-row>

                    <!-- Total Display and Warning -->
                    <v-row v-if="isAddingProduct && editedProduct.selectedBatch">
                        <v-col cols="12">
                            <v-alert :type="getTotalDistributed() > getTotalBatchAmount(selectedBatchData) ? 'error' : 'info'" class="mb-4">
                                <div><strong>Total to package:</strong> {{ getTotalDistributed() }} L</div>
                                <div><strong>Available brew:</strong> {{ getTotalBatchAmount(selectedBatchData) }} L</div>
                                <div><strong>Remaining:</strong> {{ getTotalBatchAmount(selectedBatchData) - getTotalDistributed() }} L</div>
                                <div v-if="getTotalDistributed() > getTotalBatchAmount(selectedBatchData)" class="mt-2">
                                    <strong class="text-red">⚠️ You're trying to package more than available!</strong>
                                </div>
                                <div v-else-if="getTotalDistributed() < getTotalBatchAmount(selectedBatchData)" class="mt-2">
                                    <small>⚠️ You have remaining brew that won't be packaged. This could be intentional (testing, spillage, etc.)</small>
                                </div>
                                <div v-else class="mt-2">
                                    <strong class="text-green">✅ Perfect! All available brew has been distributed.</strong>
                                </div>
                            </v-alert>
                        </v-col>
                    </v-row>

                    <!-- Legacy single container fields (only for editing existing products) -->
                    <v-row v-if="!isAddingProduct">
                        <v-col cols="6">
                            <v-select
                                :items="containerTypes"
                                label="Container Type"
                                v-model="editedProduct.containerType"
                                required
                                :rules="[requiredRule]"
                            />
                        </v-col>
                        <v-col cols="6">
                            <v-text-field
                                label="Container Size"
                                type="number"
                                v-model="editedProduct.containerSize"
                                suffix="L"
                                required
                                :rules="[requiredNumberRule]"
                            />
                        </v-col>
                        <v-col cols="6">
                            <v-text-field
                                label="Quantity"
                                type="number"
                                v-model="editedProduct.quantity"
                                required
                                :rules="[requiredNumberRule]"
                            />
                        </v-col>
                        <v-col cols="6">
                            <v-text-field
                                label="ABV"
                                v-model="editedProduct.abv"
                                suffix="%"
                                hint="e.g. 5.2%"
                            />
                        </v-col>
                        <v-col cols="12">
                            <v-text-field
                                label="Packaged Date"
                                type="date"
                                v-model="editedProduct.packagedDate"
                                required
                                :rules="[requiredRule]"
                            />
                        </v-col>
                        <v-col cols="12">
                            <v-textarea
                                label="Notes"
                                v-model="editedProduct.notes"
                                hint="Optional notes about this product"
                            />
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
            
            <template #actions>
                <v-spacer />
                <v-btn 
                    class="modern-btn-base modern-btn-secondary"
                    @click="closeProductDialog"
                    prepend-icon="mdi-close"
                >
                    Cancel
                </v-btn>
                <v-btn 
                    class="modern-btn-base modern-btn-primary" 
                    @click="saveProduct" 
                    :disabled="!isProductFormValid"
                    prepend-icon="mdi-content-save"
                >
                    {{ isAddingProduct ? 'Create Products' : 'Save Product' }}
                </v-btn>
            </template>
        </BaseDialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDataStore } from '@/stores/data'
import EnhancedDataTable from '@/components/EnhancedDataTable.vue'

const dataStore = useDataStore()
const loadingProducts = ref(false)

// Product dialog state
const productDialog = ref(false)
const editedProduct = ref(null)
const isAddingProduct = ref(false)
const productFormRef = ref(null)

// Container groups for batch distribution
const containerGroups = ref([])

const containerTypes = ['Cans', 'Kegs', 'Bottles', 'Other']

// Header actions computed property
const headerActions = computed(() => {
    return [{
        key: 'add-product',
        text: 'Add Product',
        icon: 'mdi-package-variant',
        color: 'primary'
    }]
})

function handleHeaderAction(actionKey) {
    if (actionKey === 'add-product') {
        openAddProduct()
    }
}

function removeProductWrapper(item) {
    removeProduct(item.id)
}

const requiredRule = (v) => (v !== undefined && v !== null && v !== '' ) || 'Required'
const requiredNumberRule = (v) => {
    if (v === undefined || v === null || v === '') return 'Required'
    const n = Number(v)
    return Number.isFinite(n) && n >= 0 || 'Must be a number'
}

// Product headers for the products section
const productHeaders = ref([
    { title: 'Product', value: 'productName', sortable: true },
    { title: 'Quantity', value: 'quantity', sortable: true, align: 'center', width: '100px' },
    { title: 'Total Volume', value: 'totalVolume', sortable: true, align: 'center', width: '120px' },
    { title: 'ABV', value: 'abv', sortable: true, align: 'center', width: '80px' },
    { title: 'Packaged Date', value: 'packagedDate', sortable: true, width: '120px' },
    { title: 'Status', value: 'status', sortable: true, align: 'center', width: '100px' },
    { title: 'Actions', value: 'actions', sortable: false, align: 'center', width: '100px' }
])

const products = computed(() => dataStore.products || [])

const displayedProducts = computed(() => {
    return products.value || []
})

// Product-related methods
function getProductStatusColor(status) {
    const s = (status || '').toLowerCase()
    if (s === 'packaged') return 'green'
    if (s === 'sold') return 'blue'
    return 'grey'
}

function getProductStatusIcon(status) {
    const s = (status || '').toLowerCase()
    if (s === 'packaged') return 'mdi-package-variant-closed'
    if (s === 'sold') return 'mdi-cash'
    return 'mdi-help-circle-outline'
}

function viewProduct(product) {
    editedProduct.value = Object.assign({}, product)
    isAddingProduct.value = false
    productDialog.value = true
}

async function removeProduct(id) {
    if (!id) return
    if (confirm('Are you sure you want to remove this product?')) {
        await dataStore.removeProduct(id)
        await dataStore.getProducts()
    }
}

// Product dialog methods
function openAddProduct() {
    editedProduct.value = {
        id: null,
        productName: '',
        selectedBatch: null,
        containerType: '',
        containerSize: null,
        quantity: null,
        totalVolume: null,
        notes: '',
        packagedDate: new Date().toISOString().slice(0, 10),
        status: 'packaged',
        abv: ''
    }
    
    // Initialize container groups with one default group
    containerGroups.value = [{
        containerType: '',
        containerSize: null,
        quantity: null,
        notes: ''
    }]
    
    isAddingProduct.value = true
    productDialog.value = true
}

function closeProductDialog() {
    productDialog.value = false
    editedProduct.value = null
    isAddingProduct.value = false
    containerGroups.value = []
}

const isProductFormValid = computed(() => {
    if (!editedProduct.value) return false
    
    if (!editedProduct.value.productName) return false
    
    if (isAddingProduct.value) {
        // For adding products, need batch selection and valid container groups
        if (!editedProduct.value.selectedBatch) return false
        
        return containerGroups.value.every(group => 
            group.containerType && 
            Number.isFinite(Number(group.containerSize)) && Number(group.containerSize) > 0 &&
            Number.isFinite(Number(group.quantity)) && Number(group.quantity) > 0
        )
    } else {
        // For editing existing products, need basic fields
        return editedProduct.value.containerType && 
               Number.isFinite(Number(editedProduct.value.containerSize)) && Number(editedProduct.value.containerSize) > 0 &&
               Number.isFinite(Number(editedProduct.value.quantity)) && Number(editedProduct.value.quantity) > 0 &&
               editedProduct.value.packagedDate
    }
})

async function saveProduct() {
    if (!editedProduct.value) return
    
    if (isAddingProduct.value && editedProduct.value.selectedBatch) {
        // Creating multiple products from batch
        const selectedBatch = batches.value.find(b => b.id === editedProduct.value.selectedBatch)
        if (!selectedBatch) return
        
        const products = containerGroups.value.map(group => ({
            id: `${selectedBatch.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            batchId: selectedBatch.id,
            productName: `${editedProduct.value.productName} - ${group.containerType}`,
            containerType: group.containerType,
            containerSize: Number(group.containerSize),
            quantity: Number(group.quantity),
            totalVolume: Number(getGroupTotal(group)),
            notes: group.notes || '',
            packagedDate: new Date().toISOString().slice(0, 10),
            status: 'packaged',
            abv: getABV(selectedBatch),
            fermenter: selectedBatch.fermenter
        }))

        // Save all products
        for (const product of products) {
            await dataStore.addProduct(product)
        }

        // Update batch status to 'packaged'
        const updatedBatch = Object.assign({}, selectedBatch, { status: 'packaged' })
        await dataStore.updateBatch(updatedBatch)
        
        // Refresh data
        await dataStore.getBatches()
        
        // Show success message
        console.log(`Created ${products.length} products from batch`)
        
    } else {
        // Editing existing product
        // ensure numeric coercion for legacy fields
        editedProduct.value.containerSize = Number(editedProduct.value.containerSize)
        editedProduct.value.quantity = Number(editedProduct.value.quantity)
        editedProduct.value.totalVolume = Number(editedProduct.value.containerSize) * Number(editedProduct.value.quantity)
        if (editedProduct.value.abv !== undefined && editedProduct.value.abv !== null && editedProduct.value.abv !== '') {
            editedProduct.value.abv = Number(editedProduct.value.abv)
        }
        
        await dataStore.updateProduct(editedProduct.value)
    }
    
    await dataStore.getProducts()
    closeProductDialog()
}

function formatDate(d) {
    if (!d) return '-'
    const ms = Date.parse(d)
    if (Number.isNaN(ms)) return d
    const dt = new Date(ms)
    return dt.toLocaleDateString()
}

// Batch and fermenter related computed properties
const batches = computed(() => dataStore.batches || [])
const fermenters = computed(() => dataStore.fermenters || [])

// Ready to pack batches for selection
const readyToPackBatches = computed(() => {
    const readyBatches = batches.value.filter(b => (b.status || '').toLowerCase() === 'ready to pack')
    return readyBatches.map(b => ({
        value: b.id,
        label: `${getFermenterLabelById(b.fermenter)} - Started ${formatBatchDate(b.startDate)}`
    }))
})

// Selected batch data
const selectedBatchData = computed(() => {
    if (!editedProduct.value?.selectedBatch) return null
    return batches.value.find(b => b.id === editedProduct.value.selectedBatch)
})

// Helper functions
function getFermenterLabelById(id) {
    if (id === undefined || id === null) return '-'
    const f = fermenters.value.find(fermenter => fermenter.id === id)
    return f ? f.name : `Fermenter ${id}`
}

function formatBatchDate(dateStr) {
    if (!dateStr) return '-'
    const ms = Date.parse(dateStr)
    if (Number.isNaN(ms)) return dateStr
    const dt = new Date(ms)
    return dt.toLocaleDateString()
}

function getTotalBatchAmount(batch) {
    if (!batch) return 0
    const amount = Number(batch.amount)
    return Number.isFinite(amount) ? amount : 0
}

function getABV(batch) {
    if (!batch) return ''
    const og = Number(batch.originalGravity)
    const fg = Number(batch.finalGravity)
    if (!Number.isFinite(og) || !Number.isFinite(fg)) return ''
    const abv = ((og - fg) * 131.25).toFixed(1)
    return abv
}

// Container group management
function addGroup() {
    containerGroups.value.push({
        containerType: '',
        containerSize: null,
        quantity: null,
        notes: ''
    })
}

function removeGroup(index) {
    if (containerGroups.value.length > 1) {
        containerGroups.value.splice(index, 1)
    }
}

function getGroupTotal(group) {
    const size = Number(group.containerSize)
    const quantity = Number(group.quantity)
    if (Number.isFinite(size) && Number.isFinite(quantity)) {
        return (size * quantity).toFixed(1)
    }
    return '0'
}

function getTotalDistributed() {
    return containerGroups.value.reduce((total, group) => {
        const groupTotal = Number(getGroupTotal(group))
        return total + (Number.isFinite(groupTotal) ? groupTotal : 0)
    }, 0)
}

function updateTotal() {
    // This function is called when container inputs change
    // It's used to trigger reactivity for the total calculations
}

function onBatchSelected() {
    if (!editedProduct.value?.selectedBatch) return
    
    const batch = batches.value.find(b => b.id === editedProduct.value.selectedBatch)
    if (batch) {
        // Auto-populate product name with fermenter info
        editedProduct.value.productName = getFermenterLabelById(batch.fermenter)
    }
}

// Load data on mount
onMounted(async () => {
    loadingProducts.value = true
    await dataStore.getProducts()
    await dataStore.getBatches()
    await dataStore.getFermenters()
    loadingProducts.value = false
})
</script>

<style scoped>
/* Modern page layout styles */
.products-page {
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