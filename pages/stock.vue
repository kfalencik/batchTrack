<template>
    <div>
        <div class="d-flex justify-between mb-3">
            <h2 class="mb-5">Stock</h2>
            <v-btn color="primary" @click="openAdd">
                <v-icon class="mr-2">mdi-plus-circle</v-icon>
                Add Group
            </v-btn>
        </div>

        <v-data-table
            class="text-sm"
            :headers="headers"
            :items="displayedGroups"
        >
            <template #item.usable="{ item }">
                <span>{{ item.usableDisplay }}</span>
            </template>
            <template #item.itemsCount="{ item }">
                <span>{{ item.items.length }}</span>
            </template>
            <template #item.status="{ item }">
                <v-chip :color="getStatusColor(item.status)" dark>
                    <v-icon class="mr-2">{{ getStatusIcon(item.status) }}</v-icon>
                    <span class="uppercase">{{ item.status }}</span>
                </v-chip>
            </template>
            <template #item.actions="{ item }">
                <v-btn icon color="info" flat size="x-small" class="mr-2" @click="openEdit(item.raw)">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon color="red" flat size="x-small" @click="removeGroup(item.id)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
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
                                <v-col cols="6">
                                    <v-text-field class="required-field" label="Group Name" v-model="edited.name" :readonly="isPreview" :rules="[requiredRule]" required />
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field label="Description" v-model="edited.description" :readonly="isPreview" />
                                </v-col>
                            </v-row>

                            <v-divider class="my-4" />

                            <v-row>
                                <v-col cols="12">
                                    <h3 class="mb-3">Items</h3>
                                </v-col>
                                <v-col cols="12" v-for="(item, idx) in edited.items" :key="idx">
                                    <v-row class="align-center">
                                        <v-col cols="3">
                                            <v-text-field class="required-field" label="Product" v-model="item.product" :readonly="isPreview" :rules="[requiredRule]" required />
                                        </v-col>
                                        <v-col cols="2">
                                            <v-text-field class="required-field" label="Quantity" type="number" v-model="item.quantity" :readonly="isPreview" :rules="[requiredNumberRule]" required />
                                        </v-col>
                                        <v-col cols="2">
                                            <v-select :items="units" label="Unit" v-model="item.unit" :readonly="isPreview" />
                                        </v-col>
                                        <v-col cols="2">
                                            <v-text-field label="Price" type="number" v-model="item.price" prefix="£" :readonly="isPreview" />
                                        </v-col>
                                        <!-- packSize field removed -->
                                        <v-col cols="1">
                                            <v-btn icon color="red" @click="removeItem(idx)" v-if="!isPreview"><v-icon>mdi-delete</v-icon></v-btn>
                                        </v-col>
                                        <v-col cols="3">
                                            <v-text-field label="Date Bought" type="date" v-model="item.dateBought" :readonly="isPreview" />
                                        </v-col>
                                        <v-col cols="3">
                                            <v-text-field label="Expiry Date" type="date" v-model="item.expiryDate" :readonly="isPreview" />
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
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDataStore } from '@/stores/data'

const headers = ref([
    { text: '', value: 'data-table-expand', sortable: false, width: '48px' },
    { text: 'Group', value: 'name', sortable: true },
    { text: 'Usable', value: 'usable', align: 'center' },
    { text: 'Items', value: 'itemsCount', align: 'center' },
    { text: 'Status', value: 'status', sortable: true },
    { text: 'Actions', value: 'actions', align: 'center' }
])

// Replaced expanded v-row/v-col listing with a nested v-data-table for cleaner tabular display of items
const itemHeaders = ref([
    { text: 'Product', value: 'product' },
    { text: 'Quantity', value: 'quantity', align: 'center' },
    { text: 'Price', value: 'price', align: 'right' },
    { text: 'Dates', value: 'dates' },
    { text: 'Status', value: 'status', align: 'center' }
])

const dataStore = useDataStore()

const editDialog = ref(false)
const edited = ref(null)
const isAdding = ref(false)
const isPreview = ref(false)
const formRef = ref(null)

const units = ['g','kg','ml','l','pcs']

const requiredRule = (v) => (v !== undefined && v !== null && v !== '' ) || 'Required'
const requiredNumberRule = (v) => {
    if (v === undefined || v === null || v === '') return 'Required'
    const n = Number(v)
    return Number.isFinite(n) && n >= 0 || 'Must be a number'
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
    edited.value = { id: null, name: '', description: '', items: [] }
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

onMounted(async () => {
    await dataStore.getStockGroups()
})

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
            description: g.description,
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
</script>