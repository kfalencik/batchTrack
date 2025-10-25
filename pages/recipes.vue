<template>
    <div class="recipes-page">
        <PageHeader 
            title="Recipes"
            action-text="Add Recipe"
            action-icon="mdi-plus-circle"
            @action="openAdd"
        />

        <!-- Modern Stat cards grid -->
        <div class="stats-grid">
            <StatCard 
                title="Total Recipes" 
                icon="mdi-chef-hat" 
                color="primary" 
                :count="recipes.length" 
                :active="true" 
            />
            <StatCard 
                title="Available Recipes" 
                icon="mdi-check-circle" 
                color="success" 
                :count="availableRecipes" 
                :active="false" 
            />
            <StatCard 
                title="Missing Ingredients" 
                icon="mdi-alert-circle" 
                color="error" 
                :count="unavailableRecipes" 
                :active="false" 
            />
        </div>

        <LoadingWrapper :loading="loading" text="Loading recipes...">
            <div class="data-table-wrapper">
                <v-data-table
                    class="modern-data-table"
                    :headers="headers"
                    :items="processedRecipes"
                    :loading="loading"
                    density="comfortable"
                >
                <template #item.ingredients="{ item }">
                    <ChipDisplay 
                        :items="item.ingredients"
                        :max-visible="3"
                        text-field="displayText"
                        color="blue-grey-lighten-4"
                        size="small"
                    />
                </template>
                <template #item.canMake="{ item }">
                    <StatusChip 
                        :status="canMakeRecipe(item) ? 'available' : 'missing ingredients'"
                        type="availability"
                    />
                </template>
                <template #item.estimatedCost="{ item }">
                    <div class="cost-display">£{{ calculateRecipeCost(item).toFixed(2) }}</div>
                </template>
                <template #item.actions="{ item }">
                    <DataTableActions 
                        :item="item"
                        @edit="openEdit"
                        @delete="removeRecipe"
                    />
                </template>
            </v-data-table>
            </div>
        </LoadingWrapper>

        <!-- Add/Edit Recipe Dialog -->
        <BaseDialog
            v-model="dialog"
            :title="isEditing ? 'Edit Recipe' : 'Add New Recipe'"
            title-icon="mdi-chef-hat"
            max-width="900px"
            card-class="recipe-dialog"
            @close="closeDialog"
        >
            <v-form ref="formRef" lazy-validation>
                <v-container>
                    <!-- Recipe Basic Info -->
                    <v-row>
                        <v-col cols="12">
                            <FormField
                                v-model="currentRecipe.name"
                                label="Recipe Name"
                                type="text"
                                :required="true"
                                prepend-icon="mdi-silverware-fork-knife"
                            />
                        </v-col>
                        <v-col cols="12">
                            <FormField
                                v-model="currentRecipe.description"
                                label="Description"
                                type="textarea"
                                :rows="3"
                                placeholder="Describe your recipe..."
                                prepend-icon="mdi-text"
                            />
                        </v-col>
                    </v-row>

                    <v-divider class="my-5" />

                    <!-- Ingredients Section -->
                    <v-row>
                        <v-col cols="12">
                            <div class="d-flex align-center mb-4">
                                <v-icon color="primary" class="mr-2">mdi-clipboard-list</v-icon>
                                <h3 class="text-h6">Ingredients</h3>
                            </div>
                        </v-col>
                        
                        <v-col cols="12">
                            <div v-for="(ingredient, index) in currentRecipe.ingredients" :key="index" class="ingredient-row mb-4">
                                <v-card variant="outlined" class="pa-4">
                                    <v-row align="center">
                                        <v-col cols="5">
                                            <v-select
                                                v-model="ingredient.itemId"
                                                :items="ingredientItemOptions"
                                                item-title="label"
                                                item-value="value"
                                                label="Select Ingredient"
                                                required
                                                variant="outlined"
                                                class="mb-2"
                                                @update:model-value="(itemId) => onIngredientItemSelected(itemId, index)"
                                            >
                                                <template #prepend-inner>
                                                    <v-icon color="primary">mdi-package-variant</v-icon>
                                                </template>
                                                <template #item="{ props, item }">
                                                    <v-list-item v-bind="props">
                                                        <template #prepend>
                                                            <v-chip 
                                                                size="x-small" 
                                                                :color="item.raw.available ? 'green' : 'red'"
                                                                class="mr-2"
                                                            >
                                                                {{ item.raw.available ? 'Available' : 'Out of Stock' }}
                                                            </v-chip>
                                                        </template>
                                                        <v-list-item-title>{{ item.raw.product }}</v-list-item-title>
                                                        <v-list-item-subtitle>
                                                            {{ item.raw.groupName }} • {{ item.raw.quantity }}{{ item.raw.unit }} available
                                                        </v-list-item-subtitle>
                                                    </v-list-item>
                                                </template>
                                            </v-select>
                                        </v-col>
                                        <v-col cols="3">
                                            <FormField
                                                v-model="ingredient.amount"
                                                label="Amount"
                                                type="number"
                                                :required="true"
                                            />
                                        </v-col>
                                        <v-col cols="2">
                                            <FormField
                                                v-model="ingredient.unit"
                                                label="Unit"
                                                type="text"
                                                :placeholder="getIngredientPlaceholderUnit(ingredient.itemId)"
                                                :readonly="true"
                                                :required="true"
                                            />
                                        </v-col>
                                        <v-col cols="2" class="d-flex justify-center">
                                            <v-btn 
                                                icon 
                                                color="red" 
                                                variant="outlined"
                                                size="small" 
                                                @click="removeIngredient(index)"
                                                :disabled="currentRecipe.ingredients.length === 1"
                                            >
                                                <v-icon>mdi-delete</v-icon>
                                            </v-btn>
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </div>
                            
                            <v-btn 
                                @click="addIngredient" 
                                color="primary" 
                                variant="outlined" 
                                class="mt-2"
                                prepend-icon="mdi-plus"
                            >
                                Add Ingredient
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
            
            <template #actions>
                <v-spacer />
                <v-btn 
                    variant="outlined" 
                    @click="closeDialog"
                    class="mr-2"
                >
                    Cancel
                </v-btn>
                <v-btn 
                    color="primary" 
                    @click="saveRecipe" 
                    :disabled="!isFormValid"
                    prepend-icon="mdi-content-save"
                >
                    {{ isEditing ? 'Update Recipe' : 'Create Recipe' }}
                </v-btn>
            </template>
        </BaseDialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { generateId } from '@/helpers/rules'

const dataStore = useDataStore()

// Data
const recipes = ref([])
const stockGroups = ref([])
const loading = ref(false)
const dialog = ref(false)
const isEditing = ref(false)
const currentRecipe = ref({
    id: '',
    name: '',
    description: '',
    ingredients: [{ itemId: '', groupId: '', amount: '', unit: '' }]
})

// Headers for data table
const headers = [
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Description', key: 'description', sortable: true },
    { title: 'Ingredients', key: 'ingredients', sortable: false, width: '200px' },
    { title: 'Can Make', key: 'canMake', sortable: false, align: 'center', width: '120px' },
    { title: 'Est. Cost', key: 'estimatedCost', sortable: true, align: 'end' },
    { title: 'Actions', key: 'actions', sortable: false, align: 'center', width: '100px' }
]

// Computed properties
const stockGroupOptions = computed(() => {
    return stockGroups.value.map(group => ({
        label: group.name,
        value: group.id
    }))
})

const ingredientItemOptions = computed(() => {
    const options = []
    stockGroups.value.forEach(group => {
        if (group.items && group.items.length > 0) {
            group.items.forEach(item => {
                if (item.product && item.quantity) {
                    const available = !isExpired(item) && parseFloat(item.quantity) > 0
                    options.push({
                        label: `${item.product} (${group.name})`,
                        value: item.id || `${group.id}_${item.product}`,
                        product: item.product,
                        groupName: group.name,
                        groupId: group.id,
                        unit: item.unit || '',
                        quantity: item.quantity || 0,
                        available: available
                    })
                }
            })
        }
    })
    return options.sort((a, b) => {
        // Sort available items first
        if (a.available && !b.available) return -1
        if (!a.available && b.available) return 1
        return a.label.localeCompare(b.label)
    })
})

const availableRecipes = computed(() => {
    return recipes.value.filter(recipe => canMakeRecipe(recipe)).length
})

const unavailableRecipes = computed(() => {
    return recipes.value.filter(recipe => !canMakeRecipe(recipe)).length
})

const processedRecipes = computed(() => {
    return recipes.value.map(recipe => ({
        ...recipe,
        ingredients: recipe.ingredients.map(ingredient => ({
            ...ingredient,
            displayText: `${getIngredientItemName(ingredient.itemId)} (${ingredient.amount}${ingredient.unit})`
        }))
    }))
})

const isFormValid = computed(() => {
    return currentRecipe.value.name && 
           currentRecipe.value.ingredients.length > 0 &&
           currentRecipe.value.ingredients.every(ing => ing.itemId && ing.amount && ing.unit)
})

// Methods
function openAdd() {
    isEditing.value = false
    currentRecipe.value = {
        id: '',
        name: '',
        description: '',
        ingredients: [{ itemId: '', groupId: '', amount: '', unit: '' }]
    }
    dialog.value = true
}

function openEdit(recipe) {
    isEditing.value = true
    currentRecipe.value = { ...recipe, ingredients: [...recipe.ingredients] }
    dialog.value = true
}

function closeDialog() {
    dialog.value = false
    currentRecipe.value = {
        id: '',
        name: '',
        description: '',
        ingredients: [{ itemId: '', groupId: '', amount: '', unit: '' }]
    }
}

function addIngredient() {
    currentRecipe.value.ingredients.push({ itemId: '', groupId: '', amount: '', unit: '' })
}

function onIngredientItemSelected(itemId, index) {
    const selectedItem = ingredientItemOptions.value.find(item => item.value === itemId)
    if (selectedItem) {
        currentRecipe.value.ingredients[index].groupId = selectedItem.groupId
        currentRecipe.value.ingredients[index].unit = selectedItem.unit
    }
}

function getIngredientPlaceholderUnit(itemId) {
    const selectedItem = ingredientItemOptions.value.find(item => item.value === itemId)
    return selectedItem ? selectedItem.unit || 'unit' : 'unit'
}

function removeIngredient(index) {
    if (currentRecipe.value.ingredients.length > 1) {
        currentRecipe.value.ingredients.splice(index, 1)
    }
}

async function saveRecipe() {
    try {
        const recipe = {
            ...currentRecipe.value,
            ingredients: currentRecipe.value.ingredients.filter(ing => ing.itemId && ing.amount && ing.unit)
        }

        if (!isEditing.value) {
            recipe.id = generateId()
            await dataStore.addRecipe(recipe)
            recipes.value.push(recipe)
        } else {
            await dataStore.updateRecipe(recipe)
            const index = recipes.value.findIndex(r => r.id === recipe.id)
            if (index !== -1) {
                recipes.value[index] = recipe
            }
        }
        closeDialog()
    } catch (error) {
        console.error('Error saving recipe:', error)
    }
}

async function removeRecipe(item) {
    if (confirm('Are you sure you want to delete this recipe?')) {
        try {
            await dataStore.removeRecipe(item.id)
            recipes.value = recipes.value.filter(recipe => recipe.id !== item.id)
        } catch (error) {
            console.error('Error removing recipe:', error)
        }
    }
}

function getIngredientGroupName(groupId) {
    const group = stockGroups.value.find(g => g.id === groupId)
    return group ? group.name : 'Unknown'
}

function getIngredientItemName(itemId) {
    const item = ingredientItemOptions.value.find(i => i.value === itemId)
    return item ? item.product : 'Unknown'
}

function canMakeRecipe(recipe) {
    return recipe.ingredients.every(ingredient => {
        // Find the specific item in the ingredients options
        const itemOption = ingredientItemOptions.value.find(i => i.value === ingredient.itemId)
        if (!itemOption) return false
        
        // Find the actual item in the stock groups
        const group = stockGroups.value.find(g => g.id === itemOption.groupId)
        if (!group || !group.items) return false
        
        const item = group.items.find(item => 
            (item.id === itemOption.value) || 
            (`${group.id}_${item.product}` === itemOption.value)
        )
        
        if (!item || !item.quantity || isExpired(item)) return false
        
        return parseFloat(item.quantity) >= parseFloat(ingredient.amount)
    })
}

function calculateRecipeCost(recipe) {
    return recipe.ingredients.reduce((total, ingredient) => {
        const itemOption = ingredientItemOptions.value.find(i => i.value === ingredient.itemId)
        if (!itemOption) return total
        
        const group = stockGroups.value.find(g => g.id === itemOption.groupId)
        if (!group || !group.items) return total
        
        const item = group.items.find(item => 
            (item.id === itemOption.value) || 
            (`${group.id}_${item.product}` === itemOption.value)
        )
        
        if (!item || !item.price || !item.quantity) return total
        
        const costPerUnit = parseFloat(item.price) / parseFloat(item.quantity)
        return total + (costPerUnit * parseFloat(ingredient.amount))
    }, 0)
}

function isExpired(item) {
    if (!item.expiryDate) return false
    return new Date(item.expiryDate) < new Date()
}

// Lifecycle
onMounted(async () => {
    loading.value = true
    try {
        await Promise.all([
            dataStore.getRecipes(),
            dataStore.getStockGroups()
        ])
        recipes.value = dataStore.recipes || []
        stockGroups.value = dataStore.stockGroups || []
    } catch (error) {
        console.error('Error loading recipes data:', error)
    } finally {
        loading.value = false
    }
})
</script>

<style scoped>
.v-chip {
    max-width: 200px;
}

.recipe-dialog {
    border-radius: 12px !important;
}

.recipe-dialog .v-toolbar {
    border-radius: 12px 12px 0 0 !important;
}

.ingredient-row .v-card {
    border-radius: 8px;
    transition: all 0.2s ease;
}

.ingredient-row .v-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.v-text-field.v-input--is-focused .v-field__outline {
    --v-field-border-width: 2px;
}

/* Modern page layout styles */
.recipes-page {
    padding: 0 1rem;
    max-width: 1400px;
    margin: 0 auto;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0 3rem 0;
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

.cost-display {
    font-weight: 600;
    color: rgb(15 23 42);
    font-feature-settings: 'tnum';
}

@media (max-width: 768px) {
    .recipes-page {
        padding: 0 0.5rem;
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
        margin: 1.5rem 0 2rem 0;
    }
}
</style>
.v-select.v-input--is-focused .v-field__outline {
    --v-field-border-width: 2px;
}

.v-card-actions {
    background-color: #fafafa;
}

.v-divider {
    border-color: rgba(0, 0, 0, 0.08);
}

.text-h6 {
    color: #1976d2;
    font-weight: 600;
}