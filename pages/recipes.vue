<template>
    <div class="recipes-page">
        <PageHeader 
            title="Recipes"
            description="Create and manage your brewing recipes. Track ingredient requirements and availability for consistent brewing results."
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

        <EnhancedDataTable
            :headers="headers"
            :items="processedRecipes"
            :loading="loading"
            loading-text="Loading recipes..."
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
        </EnhancedDataTable>

        <!-- Add/Edit Recipe Dialog -->
        <BaseDialog
            v-model="dialog"
            :title="isEditing ? 'Edit Recipe' : 'Add New Recipe'"
            title-icon="mdi-chef-hat"
            max-width="1000px"
            card-class="recipe-dialog"
            @close="closeDialog"
        >
            <v-form ref="formRef" lazy-validation>
                <v-container>
                    <!-- Help Section -->
                    <v-row>
                        <v-col cols="12">
                            <HelpSection
                                title="Recipe Creation Guidelines"
                                :help-items="recipeHelpItems"
                            />
                        </v-col>
                    </v-row>

                    <!-- Recipe Basic Info -->
                    <v-row>
                        <v-col cols="12">
                            <FormField
                                v-model="currentRecipe.name"
                                label="Recipe Name"
                                type="text"
                                :required="true"
                                placeholder="e.g. Traditional Ginger Beer"
                                hint="Give your recipe a memorable name"
                                prepend-icon="mdi-silverware-fork-knife"
                            />
                        </v-col>
                        <v-col cols="12">
                            <FormField
                                v-model="currentRecipe.description"
                                label="Description"
                                type="textarea"
                                :rows="3"
                                placeholder="Describe your recipe, brewing notes, flavor profile..."
                                hint="Optional detailed description"
                                prepend-icon="mdi-text"
                            />
                        </v-col>
                    </v-row>

                    <v-divider class="my-5" />

                    <!-- Ingredients Section -->
                    <v-row>
                        <v-col cols="12">
                            <IngredientForm
                                v-model="currentRecipe.ingredients"
                                :available-items="ingredientItemOptions"
                                @item-selected="onIngredientItemSelected"
                            />
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
            
            <template #actions>
                <v-spacer />
                <v-btn 
                    variant="outlined" 
                    @click="closeDialog"
                    prepend-icon="mdi-close"
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
import HelpSection from '@/components/HelpSection.vue'
import EnhancedDataTable from '@/components/EnhancedDataTable.vue'
import IngredientForm from '@/components/IngredientForm.vue'

// Help items for recipe creation
const recipeHelpItems = ref([
    {
        icon: 'mdi-silverware-fork-knife',
        title: 'Recipe Naming',
        description: 'Use descriptive names that include style, strength, or key ingredients. Examples: "Traditional Ginger Beer", "Spiced Apple Cider", "Hoppy Pale Ale".'
    },
    {
        icon: 'mdi-clipboard-list',
        title: 'Ingredients',
        description: 'Select ingredients from your stock inventory. Green badges show available items, red badges indicate out-of-stock items. Units are automatically set from your inventory.'
    },
    {
        icon: 'mdi-scale',
        title: 'Quantities',
        description: 'Enter amounts needed for one batch. The system will track stock usage and alert you when ingredients run low.'
    },
    {
        icon: 'mdi-text',
        title: 'Recipe Notes',
        description: 'Include brewing instructions, flavor profiles, fermentation notes, or serving suggestions in the description.'
    }
])

const dataStore = useDataStore()

// Data
const recipes = ref([])
const stockGroups = ref([])
const loading = ref(false)
const dialog = ref(false)
const isEditing = ref(false)
const showHelp = ref(false)
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

/* Help section styling */
.help-card {
    background: linear-gradient(135deg, rgb(99 102 241) 0%, rgb(139 92 246) 100%);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.2);
}

.help-card-title {
    color: white;
    padding: 1.5rem 2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.help-icon {
    font-size: 1.5rem;
    color: rgb(255 255 255 / 0.9);
}

.help-card-content {
    background: white;
    padding: 2rem;
}

.help-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}

.help-item {
    background: rgb(248 250 252);
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid rgb(226 232 240);
    transition: all 0.3s ease;
}

.help-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: rgb(99 102 241);
}

.help-item-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.help-avatar {
    background: linear-gradient(135deg, rgb(99 102 241), rgb(139 92 246));
    flex-shrink: 0;
}

.help-item h4 {
    color: rgb(30 41 59);
    font-weight: 600;
    margin: 0;
    font-size: 1.1rem;
}

.help-item p {
    color: rgb(71 85 105);
    margin: 0;
    line-height: 1.6;
    font-size: 0.95rem;
}

.rotate-180 {
    transform: rotate(180deg);
    transition: transform 0.3s ease;
}

/* Modern form styling */
.modern-select :deep(.v-field) {
    background: rgb(248 250 252);
    border: 1px solid rgb(226 232 240);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.modern-select :deep(.v-field:hover) {
    border-color: rgb(148 163 184);
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    transform: translateY(-1px);
}

.modern-select :deep(.v-input--focused .v-field) {
    border-color: rgb(99, 102, 241);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1), 0 4px 6px -1px rgb(0 0 0 / 0.1);
    background: white;
    transform: translateY(-1px);
}

/* Ingredient card styling */
.ingredient-card {
    border: 2px solid rgb(226 232 240) !important;
    transition: all 0.3s ease;
    background: rgb(248 250 252);
}

.ingredient-card:hover {
    border-color: rgb(99, 102, 241) !important;
    box-shadow: 0 8px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);
    transform: translateY(-2px);
}

/* Enhanced field styling */
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

.data-table-wrapper:hover {
    box-shadow: 
        0 10px 15px -3px rgb(0 0 0 / 0.1),
        0 4px 6px -4px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(99 102 241 / 0.1);
    border-color: rgb(99 102 241 / 0.2);
}

.modern-data-table {
    background: transparent !important;
}

.modern-data-table :deep(.v-data-table__wrapper) {
    border-radius: 1.5rem;
}

.modern-data-table :deep(.v-data-table-header) {
    background: linear-gradient(135deg, rgb(248 250 252) 0%, rgb(241 245 249) 100%);
    border-bottom: 2px solid rgb(226 232 240 / 0.6);
}

.modern-data-table :deep(.v-data-table-header .v-data-table__th) {
    font-weight: 700;
    color: rgb(51 65 85);
    text-transform: uppercase;
    letter-spacing: 0.075em;
    font-size: 0.8rem;
    padding: 1.5rem 1.25rem;
    border-bottom: none;
    position: relative;
}

.modern-data-table :deep(.v-data-table-header .v-data-table__th:first-child) {
    padding-left: 2rem;
}

.modern-data-table :deep(.v-data-table-header .v-data-table__th:last-child) {
    padding-right: 2rem;
}

.modern-data-table :deep(.v-data-table__tr) {
    border-bottom: 1px solid rgb(226 232 240 / 0.4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modern-data-table :deep(.v-data-table__tr:nth-child(even)) {
    background: rgb(248 250 252 / 0.4);
}

.modern-data-table :deep(.v-data-table__tr:hover) {
    background: linear-gradient(135deg, rgb(99 102 241 / 0.08) 0%, rgb(79 70 229 / 0.05) 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);
}

.modern-data-table :deep(.v-data-table__td) {
    padding: 1.5rem 1.25rem;
    vertical-align: middle;
    font-weight: 500;
    color: rgb(15 23 42);
    border-bottom: none;
}

.modern-data-table :deep(.v-data-table__td:first-child) {
    padding-left: 2rem;
}

.modern-data-table :deep(.v-data-table__td:last-child) {
    padding-right: 2rem;
}

/* Mobile responsiveness for tables */
@media (max-width: 768px) {
    .recipes-page {
        padding: 0 0.5rem;
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
        margin: 1.5rem 0 2rem 0;
    }
    
    .data-table-wrapper {
        border-radius: 1rem;
        margin: 1rem 0;
        overflow-x: auto;
    }
    
    .modern-data-table :deep(.v-data-table-header .v-data-table__th) {
        padding: 1rem 0.75rem;
        font-size: 0.7rem;
    }
    
    .modern-data-table :deep(.v-data-table-header .v-data-table__th:first-child) {
        padding-left: 1rem;
    }
    
    .modern-data-table :deep(.v-data-table-header .v-data-table__th:last-child) {
        padding-right: 1rem;
    }
    
    .modern-data-table :deep(.v-data-table__td) {
        padding: 1rem 0.75rem;
    }
    
    .modern-data-table :deep(.v-data-table__td:first-child) {
        padding-left: 1rem;
    }
    
    .modern-data-table :deep(.v-data-table__td:last-child) {
        padding-right: 1rem;
    }
    
    .modern-data-table :deep(.v-data-table__tr:hover) {
        transform: none;
        box-shadow: 0 2px 8px -2px rgb(0 0 0 / 0.1);
    }
}

/* Extra small devices */
@media (max-width: 480px) {
    .modern-data-table :deep(.v-data-table-header .v-data-table__th) {
        padding: 0.75rem 0.5rem;
        font-size: 0.65rem;
    }
    
    .modern-data-table :deep(.v-data-table__td) {
        padding: 0.75rem 0.5rem;
        font-size: 0.875rem;
    }
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