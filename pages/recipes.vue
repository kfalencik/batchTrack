<template>
    <div>
        <div class="d-flex justify-between mb-3">
            <h2 class="mb-5">Recipes</h2>
            <v-btn color="primary" @click="openAdd">
                <v-icon class="mr-2">mdi-plus-circle</v-icon>
                Add Recipe
            </v-btn>
        </div>

        <!-- Stat cards -->
        <v-row class="mb-15 mt-10" dense>
            <v-col cols="12">
                <v-row>
                    <StatCard :title="'Total Recipes'" icon="mdi-chef-hat" color="blue-lighten-1" :count="recipes.length" :active="true" class="mr-2" />
                    <StatCard :title="'Available Recipes'" icon="mdi-check-circle" color="green" :count="availableRecipes" :active="false" class="mr-2" />
                    <StatCard :title="'Missing Ingredients'" icon="mdi-alert-circle" color="red" :count="unavailableRecipes" :active="false" class="mr-2" />
                </v-row>
            </v-col>
        </v-row>

        <v-data-table
            class="text-sm"
            :headers="headers"
            :items="recipes"
        >
            <template #item.ingredients="{ item }">
                <div class="py-2">
                    <v-chip 
                        v-for="ingredient in item.ingredients.slice(0, 3)" 
                        :key="ingredient.itemId"
                        size="small"
                        class="mr-1 mb-1"
                        color="blue-grey-lighten-4"
                    >
                        {{ getIngredientItemName(ingredient.itemId) }} ({{ ingredient.amount }}{{ ingredient.unit }})
                    </v-chip>
                    <v-chip 
                        v-if="item.ingredients.length > 3"
                        size="small"
                        color="grey-lighten-2"
                        class="mr-1"
                    >
                        +{{ item.ingredients.length - 3 }} more
                    </v-chip>
                </div>
            </template>
            <template #item.canMake="{ item }">
                <v-chip :color="canMakeRecipe(item) ? 'green' : 'red'" dark>
                    <v-icon class="mr-2">{{ canMakeRecipe(item) ? 'mdi-check' : 'mdi-close' }}</v-icon>
                    {{ canMakeRecipe(item) ? 'Available' : 'Missing Ingredients' }}
                </v-chip>
            </template>
            <template #item.estimatedCost="{ item }">
                <span>£{{ calculateRecipeCost(item).toFixed(2) }}</span>
            </template>
            <template #item.actions="{ item }">
                <v-btn icon color="info" flat size="x-small" class="mr-2" @click="openEdit(item)">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon color="red" flat size="x-small" @click="removeRecipe(item.id)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </template>
        </v-data-table>

        <!-- Add/Edit Recipe Dialog -->
        <v-dialog v-model="dialog" max-width="900px" persistent>
            <v-card class="recipe-dialog">
                <v-toolbar color="primary" dark>
                    <v-toolbar-title>
                        <v-icon class="mr-2">mdi-chef-hat</v-icon>
                        {{ isEditing ? 'Edit Recipe' : 'Add New Recipe' }}
                    </v-toolbar-title>
                    <v-spacer />
                    <v-btn icon @click="closeDialog">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-toolbar>
                
                <v-card-text class="pa-6">
                    <v-form ref="formRef" lazy-validation>
                        <v-container>
                            <!-- Recipe Basic Info -->
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field
                                        v-model="currentRecipe.name"
                                        label="Recipe Name"
                                        required
                                        :rules="[v => !!v || 'Recipe name is required']"
                                        variant="outlined"
                                        class="mb-2"
                                    >
                                        <template #prepend-inner>
                                            <v-icon color="primary">mdi-silverware-fork-knife</v-icon>
                                        </template>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-textarea
                                        v-model="currentRecipe.description"
                                        label="Description"
                                        rows="3"
                                        variant="outlined"
                                        placeholder="Describe your recipe..."
                                    >
                                        <template #prepend-inner>
                                            <v-icon color="primary">mdi-text</v-icon>
                                        </template>
                                    </v-textarea>
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
                                                        @update:model-value="(itemId) => onIngredientItemSelected(itemId, index)"
                                                    >
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
                                                    <v-text-field
                                                        v-model="ingredient.amount"
                                                        label="Amount"
                                                        type="number"
                                                        step="0.1"
                                                        required
                                                        variant="outlined"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col cols="2">
                                                    <v-text-field
                                                        v-model="ingredient.unit"
                                                        label="Unit"
                                                        :placeholder="getIngredientPlaceholderUnit(ingredient.itemId)"
                                                        readonly
                                                        required
                                                        variant="outlined"
                                                    ></v-text-field>
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
                </v-card-text>
                
                <v-divider />
                
                <v-card-actions class="pa-4">
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
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { generateId } from '@/helpers/rules'

const dataStore = useDataStore()

// Data
const recipes = ref([])
const stockGroups = ref([])
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
    { title: 'Name', key: 'name' },
    { title: 'Description', key: 'description' },
    { title: 'Ingredients', key: 'ingredients', sortable: false },
    { title: 'Can Make', key: 'canMake', sortable: false },
    { title: 'Est. Cost', key: 'estimatedCost' },
    { title: 'Actions', key: 'actions', sortable: false }
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

async function removeRecipe(id) {
    if (confirm('Are you sure you want to delete this recipe?')) {
        try {
            await dataStore.removeRecipe(id)
            recipes.value = recipes.value.filter(recipe => recipe.id !== id)
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
    try {
        await Promise.all([
            dataStore.getRecipes(),
            dataStore.getStockGroups()
        ])
        recipes.value = dataStore.recipes || []
        stockGroups.value = dataStore.stockGroups || []
    } catch (error) {
        console.error('Error loading recipes data:', error)
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
</style>