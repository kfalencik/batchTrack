<template>
    <div class="stock-page">
        <PageHeader 
            title="Stock"
            description="Manage your brewing ingredients and finished products. Track inventory levels, expiry dates, and packaging details."
            :actions="headerActions"
            @action="handleHeaderAction"
        />

        <!-- Section Tabs -->
        <v-tabs v-model="activeTab" class="mb-4">
            <v-tab value="ingredients">
                <v-icon class="mr-2">mdi-clipboard-list-outline</v-icon>
                Ingredients
            </v-tab>
            <v-tab value="products">
                <v-icon class="mr-2">mdi-package-variant-closed</v-icon>
                Products
            </v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
            <v-window-item value="ingredients">
                <LoadingWrapper :loading="loading" text="Loading ingredients...">
                    <div class="data-table-wrapper">
                        <v-data-table
                            class="modern-data-table"
                            :headers="headers"
                            :items="displayedGroups"
                            :loading="loading"
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
                                <td></td>
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

                                    <!-- packSize removed -->

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
                                        <v-chip :color="isExpired(it) ? getStatusColor('expired') : (daysUntilExpiry(it) !== null && daysUntilExpiry(it) <= 7 ? getStatusColor('warning') : getStatusColor('ok'))" dark>
                                            <v-icon left small>{{ isExpired(it) ? getStatusIcon('expired') : (daysUntilExpiry(it) !== null && daysUntilExpiry(it) <= 7 ? getStatusIcon('warning') : getStatusIcon('ok')) }}</v-icon>
                                            <span>
                                                {{ isExpired(it) ? 'Expired' : (daysUntilExpiry(it) === null ? 'No date' : (daysUntilExpiry(it) <= 0 ? 'Expires today' : daysUntilExpiry(it) <= 7 ? `${daysUntilExpiry(it)}d` : `${daysUntilExpiry(it)}d`)) }}
                                            </span>
                                        </v-chip>
                                    </template>
                                </v-data-table>
                            </td>
                        </tr>
                    </template>
                </v-data-table>
                    </div>
                </LoadingWrapper>
            </v-window-item>

            <v-window-item value="products">
                <LoadingWrapper :loading="loadingProducts" text="Loading products...">
                    <div class="data-table-wrapper">
                        <v-data-table
                            class="modern-data-table"
                            :headers="productHeaders"
                            :items="products"
                            :loading="loadingProducts"
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
                </v-data-table>
                    </div>
                </LoadingWrapper>
            </v-window-item>
        </v-window>

        <v-dialog v-model="editDialog" width="1200">
            <v-card>
                <v-toolbar color="primary" dark>
                    <v-toolbar-title>{{ isPreview ? 'Preview Group' : (isAdding ? 'Add Group' : 'Edit Group') }}</v-toolbar-title>
                    <v-spacer />
                    <v-btn icon @click="closeEdit">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text v-if="edited">
                    <v-form ref="formRef" lazy-validation>
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <FormField
                                        v-model="edited.name"
                                        label="Group Name"
                                        type="text"
                                        :required="true"
                                        :readonly="isPreview"
                                        prepend-icon="mdi-folder"
                                    />
                                </v-col>
                            </v-row>

                            <v-divider class="my-4" />

                            <v-row>
                                <v-col cols="12">
                                    <h3 class="mb-3">Items</h3>
                                </v-col>
                                <v-col cols="12" v-for="(item, idx) in edited.items" :key="idx">
                                    <v-row class="align-center">
                                        <v-col cols="5">
                                            <FormField
                                                v-model="item.product"
                                                label="Product"
                                                type="text"
                                                :required="true"
                                                :readonly="isPreview"
                                                prepend-icon="mdi-package-variant"
                                            />
                                        </v-col>
                                        <v-col cols="2">
                                            <FormField
                                                v-model="item.quantity"
                                                label="Quantity"
                                                type="number"
                                                :required="true"
                                                :readonly="isPreview"
                                            />
                                        </v-col>
                                        <v-col cols="2">
                                            <FormField
                                                v-model="item.unit"
                                                label="Unit"
                                                type="select"
                                                :items="units"
                                                :readonly="isPreview"
                                            />
                                        </v-col>
                                        <v-col cols="2">
                                            <FormField
                                                v-model="item.price"
                                                label="Price"
                                                type="number"
                                                :readonly="isPreview"
                                                prepend-icon="mdi-currency-gbp"
                                            />
                                        </v-col>
                                        <v-col cols="1" class="d-flex align-center">
                                            <v-btn icon color="red" @click="removeItem(idx)" v-if="!isPreview"><v-icon>mdi-delete</v-icon></v-btn>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="6">
                                            <v-text-field
                                                v-model="item.dateBought"
                                                label="Date Bought"
                                                type="date"
                                                variant="outlined"
                                                class="mb-2"
                                                :readonly="isPreview"
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
                                                class="mb-2"
                                                :readonly="isPreview"
                                            >
                                                <template #prepend-inner>
                                                    <v-icon color="primary">mdi-calendar-alert</v-icon>
                                                </template>
                                            </v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                                <v-col cols="12">
                                    <v-btn text color="primary" @click="addItem" v-if="!isPreview"><v-icon class="mr-2">mdi-plus</v-icon>Add Item</v-btn>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="closeEdit">Close</v-btn>
                    <v-btn v-if="!isPreview" color="primary" @click="saveEdit" :disabled="!isFormValid">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Product Dialog -->
        <v-dialog v-model="productDialog" width="1000">
            <v-card>
                <v-toolbar color="primary" dark>
                    <v-toolbar-title>{{ isAddingProduct ? 'Add Product from Batch' : 'Edit Product' }}</v-toolbar-title>
                    <v-spacer />
                    <v-btn icon @click="closeProductDialog">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text v-if="editedProduct">
                    <v-form ref="productFormRef" lazy-validation>
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
                                                    label="Container Size"
                                                    type="number"
                                                    v-model="group.containerSize"
                                                    suffix="L"
                                                    hint="Size per container"
                                                    required
                                                    :rules="[requiredNumberRule, (v) => validateContainerInput(v, group, 'size')]"
                                                />
                                            </v-col>
                                            <v-col cols="2">
                                                <v-text-field
                                                    label="Quantity"
                                                    type="number"
                                                    v-model="group.quantity"
                                                    hint="Number of containers"
                                                    required
                                                    :rules="[requiredNumberRule, (v) => validateContainerInput(v, group, 'quantity')]"
                                                />
                                            </v-col>
                                            <v-col cols="2">
                                                <div class="text-center">
                                                    <div class="text-h6">{{ getGroupTotal(group) }}L</div>
                                                    <div class="text-caption">Total</div>
                                                </div>
                                            </v-col>
                                            <v-col cols="2">
                                                <v-text-field
                                                    label="Notes"
                                                    v-model="group.notes"
                                                    hint="Optional"
                                                />
                                            </v-col>
                                            <v-col cols="1" class="text-center">
                                                <v-btn
                                                    icon
                                                    color="red"
                                                    flat
                                                    size="small"
                                                    @click="removeContainerGroup(idx)"
                                                    :disabled="containerGroups.length <= 1"
                                                >
                                                    <v-icon>mdi-delete</v-icon>
                                                </v-btn>
                                            </v-col>
                                        </v-row>
                                    </v-card>
                                </v-col>
                            </v-row>

                            <v-row v-if="isAddingProduct && editedProduct.selectedBatch">
                                <v-col cols="12">
                                    <v-btn
                                        color="primary"
                                        outlined
                                        @click="addContainerGroup"
                                        class="mb-4"
                                    >
                                        <v-icon class="mr-2">mdi-plus</v-icon>
                                        Add Another Container Group
                                    </v-btn>
                                </v-col>
                            </v-row>

            <v-row v-if="isAddingProduct && editedProduct.selectedBatch">
                <v-col cols="12">
                    <v-alert 
                        :type="getTotalDistributed() > getTotalBatchAmount(selectedBatchData) ? 'error' : (getTotalDistributed() < getTotalBatchAmount(selectedBatchData) ? 'warning' : 'success')" 
                        class="mt-4"
                    >
                        <div><strong>Total distributed:</strong> {{ getTotalDistributed() }} L</div>
                        <div><strong>Available:</strong> {{ getTotalBatchAmount(selectedBatchData) }} L</div>
                        <div><strong>Remaining:</strong> {{ (getTotalBatchAmount(selectedBatchData) - getTotalDistributed()).toFixed(1) }} L</div>
                        
                        <div v-if="getTotalDistributed() > getTotalBatchAmount(selectedBatchData)" class="mt-2">
                            <strong class="text-red">❌ OVER-ASSIGNED: You cannot distribute more than the available brew volume!</strong>
                        </div>
                        <div v-else-if="getTotalDistributed() < getTotalBatchAmount(selectedBatchData)" class="mt-2">
                            <small>⚠️ You have remaining brew that won't be packaged. This could be intentional (testing, spillage, etc.)</small>
                        </div>
                        <div v-else class="mt-2">
                            <strong class="text-green">✅ Perfect! All available brew has been distributed.</strong>
                        </div>
                    </v-alert>
                </v-col>
            </v-row>                            <!-- Legacy single container fields (only for editing existing products) -->
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
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="closeProductDialog">Cancel</v-btn>
                    <v-btn color="primary" @click="saveProduct" :disabled="!isProductFormValid">
                        {{ isAddingProduct ? 'Create Products' : 'Save' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDataStore } from '@/stores/data'

const headers = ref([
    { title: '', value: 'data-table-expand', sortable: false, width: '48px' },
    { title: 'Group', value: 'name', sortable: true },
    { title: 'Usable', value: 'usable', sortable: false, align: 'center', width: '100px' },
    { title: 'Items', value: 'itemsCount', sortable: false, align: 'center', width: '80px' },
    { title: 'Status', value: 'status', sortable: true, align: 'center', width: '120px' },
    { title: 'Actions', value: 'actions', sortable: false, align: 'center', width: '100px' }
])

// Replaced expanded v-row/v-col listing with a nested v-data-table for cleaner tabular display of items
const itemHeaders = ref([
    { title: 'Product', value: 'product', sortable: true },
    { title: 'Quantity', value: 'quantity', sortable: true, align: 'center', width: '100px' },
    { title: 'Price', value: 'price', sortable: true, align: 'end', width: '100px' },
    { title: 'Dates', value: 'dates', sortable: false, width: '200px' },
    { title: 'Status', value: 'status', sortable: true, align: 'center', width: '100px' }
])

// Tab state
const activeTab = ref('ingredients')

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

const dataStore = useDataStore()
const loading = ref(false)
const loadingProducts = ref(false)

const editDialog = ref(false)
const edited = ref(null)
const isAdding = ref(false)
const isPreview = ref(false)
const formRef = ref(null)

// Product dialog state
const productDialog = ref(false)
const editedProduct = ref(null)
const isAddingProduct = ref(false)
const productFormRef = ref(null)

// Container groups for batch distribution
const containerGroups = ref([])

const containerTypes = ['Cans', 'Kegs', 'Bottles', 'Other']

const units = ['g','kg','ml','l','pcs']

// Header actions computed property
const headerActions = computed(() => {
    if (activeTab.value === 'ingredients') {
        return [{
            key: 'add-ingredient',
            text: 'Add Ingredient Group',
            icon: 'mdi-plus-circle',
            color: 'primary'
        }]
    } else if (activeTab.value === 'products') {
        return [{
            key: 'add-product',
            text: 'Add Product',
            icon: 'mdi-package-variant',
            color: 'primary'
        }]
    }
    return []
})

function handleHeaderAction(actionKey) {
    if (actionKey === 'add-ingredient') {
        openAdd()
    } else if (actionKey === 'add-product') {
        openAddProduct()
    }
}

function removeGroupWrapper(item) {
    removeGroup(item.id)
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

// Validation function to prevent over-assignment
function validateContainerInput(value, group, field) {
    if (!editedProduct.value?.selectedBatch) return true
    
    const availableVolume = getTotalBatchAmount(selectedBatchData.value)
    if (!availableVolume) return true
    
    // Calculate what the total would be with this change
    const tempGroup = { ...group }
    if (field === 'size') tempGroup.containerSize = value
    if (field === 'quantity') tempGroup.quantity = value
    
    const tempGroupTotal = Number(tempGroup.containerSize || 0) * Number(tempGroup.quantity || 0)
    
    // Calculate total from other groups
    const otherGroupsTotal = containerGroups.value
        .filter(g => g !== group)
        .reduce((total, g) => total + (Number(g.containerSize || 0) * Number(g.quantity || 0)), 0)
    
    const wouldBeTotal = tempGroupTotal + otherGroupsTotal
    
    if (wouldBeTotal > availableVolume) {
        return `This would exceed available brew (${availableVolume}L)`
    }
    
    return true
}

function openEdit(group) {
    edited.value = Object.assign({}, group)
    // deep copy items
    edited.value.items = (group.items || []).map(i => Object.assign({}, i))
    isAdding.value = false
    isPreview.value = false
    editDialog.value = true
}

function openAdd() {
    edited.value = { id: null, name: '', items: [] }
    isAdding.value = true
    isPreview.value = false
    editDialog.value = true
}

function closeEdit() {
    edited.value = null
    editDialog.value = false
}

function addItem() {
    edited.value.items = edited.value.items || []
    edited.value.items.push({ product: '', quantity: null, unit: 'kg', price: null, dateBought: null, expiryDate: null })
}

function removeItem(idx) {
    if (!edited.value) return
    edited.value.items.splice(idx,1)
}

async function saveEdit() {
    if (!edited.value) return
    if (formRef.value) {
        const valid = await formRef.value.validate();
        if (!valid) return
    }
    // ensure numeric coercion
    edited.value.items = (edited.value.items || []).map(i => {
        const copy = Object.assign({}, i)
        if (copy.quantity !== undefined && copy.quantity !== null && copy.quantity !== '') copy.quantity = Number(copy.quantity)
        if (copy.price !== undefined && copy.price !== null && copy.price !== '') copy.price = Number(copy.price)
    // packSize removed from item shape
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

// Product dialog methods
function openAddProduct() {
    editedProduct.value = {
        id: null,
        productName: '',
        selectedBatch: null,
        containerType: 'Cans',
        containerSize: 0.33,
        quantity: 1,
        totalVolume: 0,
        abv: '',
        packagedDate: new Date().toISOString().slice(0, 10),
        status: 'packaged',
        notes: ''
    }
    
    // Initialize container groups for batch distribution
    containerGroups.value = [{
        containerType: 'Cans',
        containerSize: 0.33,
        quantity: 1,
        notes: ''
    }]
    
    isAddingProduct.value = true
    productDialog.value = true
}

function closeProductDialog() {
    editedProduct.value = null
    containerGroups.value = []
    productDialog.value = false
}

async function saveProduct() {
    if (!editedProduct.value) return
    
    if (productFormRef.value) {
        const valid = await productFormRef.value.validate()
        if (!valid) return
    }

    if (isAddingProduct.value && editedProduct.value.selectedBatch) {
        // Handle new product from batch with container groups
        const selectedBatch = batches.value.find(b => b.id === editedProduct.value.selectedBatch)
        if (!selectedBatch) return

        const totalDistributed = getTotalDistributed()
        const totalBatchAmount = getTotalBatchAmount(selectedBatch)
        
        // CRITICAL: Prevent over-assignment - this should never happen due to validation, but double-check
        if (totalDistributed > totalBatchAmount) {
            alert(`Cannot save: Total distributed (${totalDistributed}L) exceeds available brew (${totalBatchAmount}L)`)
            return
        }

        // Check if user wants to proceed with remaining brew
        if (totalDistributed < totalBatchAmount) {
            const confirmed = confirm(
                `You are distributing ${totalDistributed}L out of ${totalBatchAmount}L available. ` +
                `${(totalBatchAmount - totalDistributed).toFixed(1)}L will remain unpackaged. ` +
                `This could be intentional (testing, spillage, etc.). Continue?`
            )
            if (!confirmed) return
        }

        // Create product entries for each container group
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
        dataStore.setNotification({
            text: `Successfully packaged batch into ${products.length} product group${products.length > 1 ? 's' : ''}`,
            color: 'success',
            delay: 5000
        })
    } else {
        // Handle legacy single product (editing existing products)
        const containerSize = Number(editedProduct.value.containerSize) || 0
        const quantity = Number(editedProduct.value.quantity) || 0
        editedProduct.value.totalVolume = containerSize * quantity

        // Ensure numeric conversions
        if (editedProduct.value.containerSize) editedProduct.value.containerSize = Number(editedProduct.value.containerSize)
        if (editedProduct.value.quantity) editedProduct.value.quantity = Number(editedProduct.value.quantity)

        if (isAddingProduct.value) {
            // Generate a unique ID for manual products
            editedProduct.value.id = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            await dataStore.addProduct(editedProduct.value)
        } else {
            await dataStore.updateProduct(editedProduct.value)
        }
    }
    
    await dataStore.getProducts()
    closeProductDialog()
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

function formatDate(d) {
    if (!d) return '-'
    const ms = Date.parse(d)
    if (Number.isNaN(ms)) return d
    const dt = new Date(ms)
    return dt.toLocaleDateString()
}

function getStatusColor(status) {
    const s = (status || '').toLowerCase()
    if (s === 'warning') return 'orange'
    if (s === 'expired') return 'red'
    return 'green'
}

function getStatusIcon(status) {
    const s = (status || '').toLowerCase()
    if (s === 'warning') return 'mdi-alert'
    if (s === 'expired') return 'mdi-alert-circle-outline'
    return 'mdi-check-circle-outline'
}

const groups = computed(() => dataStore.stockGroups || [])

const displayedGroups = computed(() => {
    return (groups.value || []).map(g => {
        const items = g.items || []
        let usable = 0
        for (const it of items) {
            if (!isExpired(it)) {
                const q = Number(it.quantity)
                if (Number.isFinite(q)) usable += q
            }
        }
        let status = 'ok'
        if (items.some(isExpired)) status = 'expired'
        else if (items.some(it => { const d = daysUntilExpiry(it); return d !== null && d <= 7 })) status = 'warning'
        return {
            id: g.id,
            name: g.name,
            items: items,
            usable,
            usableDisplay: `${usable} ${items[0] && items[0].unit ? items[0].unit : ''}`,
            status,
            raw: g
        }
    })
})

const isFormValid = computed(() => {
    if (!edited.value) return false
    if (!edited.value.name) return false
    // ensure at least one item
    if (!Array.isArray(edited.value.items) || edited.value.items.length === 0) return false
    for (const it of edited.value.items) {
        if (!it.product) return false
        const q = Number(it.quantity)
        if (!Number.isFinite(q)) return false
    }
    return true
})

const isProductFormValid = computed(() => {
    if (!editedProduct.value) return false
    if (!editedProduct.value.productName) return false
    
    if (isAddingProduct.value && editedProduct.value.selectedBatch) {
        // Validation for batch-based product creation
        if (!editedProduct.value.selectedBatch) return false
        
        // Validate all container groups
        for (const group of containerGroups.value) {
            if (!group.containerType) return false
            if (!Number.isFinite(Number(group.containerSize)) || Number(group.containerSize) <= 0) return false
            if (!Number.isFinite(Number(group.quantity)) || Number(group.quantity) <= 0) return false
        }
        
        // CRITICAL: Prevent over-assignment - total distributed cannot exceed available batch volume
        const totalDistributed = getTotalDistributed()
        const availableVolume = getTotalBatchAmount(selectedBatchData.value)
        if (totalDistributed > availableVolume) return false
        
        return true
    } else {
        // Validation for legacy single product (editing existing products)
        if (!editedProduct.value.containerType) return false
        if (!Number.isFinite(Number(editedProduct.value.containerSize)) || Number(editedProduct.value.containerSize) <= 0) return false
        if (!Number.isFinite(Number(editedProduct.value.quantity)) || Number(editedProduct.value.quantity) <= 0) return false
        if (!editedProduct.value.packagedDate) return false
        
        return true
    }
})

// Products computed properties
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

// Update onMounted to load products and batches
onMounted(async () => {
    await dataStore.getStockGroups()
    await dataStore.getProducts()
    await dataStore.getBatches()
    await dataStore.getFermenters()
})

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
    const fermenter = fermenters.value.find(f => f.id === id)
    return fermenter && fermenter.name ? `${fermenter.name} (${id})` : `Fermenter ${id}`
}

function formatBatchDate(dateObj) {
    if (!dateObj) return '-'
    if (dateObj.seconds) {
        const date = new Date(dateObj.seconds * 1000)
        return date.toLocaleDateString()
    }
    return new Date(dateObj).toLocaleDateString()
}

function getBatchWaterLiters(batch) {
    if (!batch || !batch.fermenter) return 0
    const fermenter = fermenters.value.find(f => f.id === batch.fermenter)
    if (!fermenter) return 0
    
    // Common field names: size, liters, capacity
    if (fermenter.size !== undefined) return Number(fermenter.size)
    if (fermenter.liters !== undefined) return Number(fermenter.liters)
    if (fermenter.capacity !== undefined) return Number(fermenter.capacity)
    return 0
}

function getTotalBatchAmount(batch) {
    if (!batch) return 0
    return getBatchWaterLiters(batch) || 0
}

function getABV(batch) {
    if (!batch) return ''
    
    // Calculate ABV from OG and FG if available
    if (batch.readingOG && batch.readingFG) {
        const og = Number(batch.readingOG)
        const fg = Number(batch.readingFG)
        if (Number.isFinite(og) && Number.isFinite(fg)) {
            const abv = ((og - fg) * 131.25).toFixed(1)
            return abv
        }
    }
    
    // Fallback to estimated calculation or return empty
    if (batch.readingOG) {
        const og = Number(batch.readingOG)
        const estimatedFg = 1.000 // Default assumption
        if (Number.isFinite(og)) {
            const abv = ((og - estimatedFg) * 131.25).toFixed(1)
            return abv
        }
    }
    
    return ''
}

// Container group management
function addContainerGroup() {
    containerGroups.value.push({
        containerType: 'Cans',
        containerSize: 0.33,
        quantity: 1,
        notes: ''
    })
}

function removeContainerGroup(index) {
    if (containerGroups.value.length > 1) {
        containerGroups.value.splice(index, 1)
    }
}

function getGroupTotal(group) {
    const size = Number(group.containerSize) || 0
    const qty = Number(group.quantity) || 0
    return (size * qty).toFixed(1)
}

function getTotalDistributed() {
    return containerGroups.value.reduce((total, group) => {
        return total + Number(getGroupTotal(group))
    }, 0)
}

// Batch selection handler
function onBatchSelected(batchId) {
    if (!batchId) return
    
    const batch = batches.value.find(b => b.id === batchId)
    if (!batch) return
    
    // Auto-fill product name based on fermenter
    if (!editedProduct.value.productName) {
        editedProduct.value.productName = getFermenterLabelById(batch.fermenter)
    }
}
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
    border-radius: 1rem;
    border: 1px solid rgb(226 232 240 / 0.8);
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    overflow: hidden;
    backdrop-filter: blur(8px);
}

.modern-data-table {
    background: transparent !important;
}

.modern-data-table :deep(.v-data-table__wrapper) {
    border-radius: 1rem;
}

.modern-data-table :deep(.v-data-table-header) {
    background: rgb(248 250 252);
    border-bottom: 1px solid rgb(226 232 240 / 0.5);
}

.modern-data-table :deep(.v-data-table-header .v-data-table__th) {
    font-weight: 600;
    color: rgb(71 85 105);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.75rem;
    padding: 1rem;
}

.modern-data-table :deep(.v-data-table__tr) {
    border-bottom: 1px solid rgb(226 232 240 / 0.3);
    transition: all 0.2s ease;
}

.modern-data-table :deep(.v-data-table__tr:hover) {
    background: rgb(248 250 252 / 0.5);
}

.modern-data-table :deep(.v-data-table__td) {
    padding: 1rem;
    vertical-align: middle;
}
</style>