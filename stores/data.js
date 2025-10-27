import { getFirestore, collection, query, doc, getDocs, setDoc, addDoc, deleteDoc, where } from "firebase/firestore";
import { playNotificationSound } from '@/utils/sound'
import { 
    createLogEntry, 
    getLogs, 
    logBatchActivity, 
    logStockActivity, 
    logFermenterActivity, 
    logProductActivity, 
    logRecipeActivity, 
    logTaxActivity,
    LOG_ACTIONS, 
    LOG_ENTITIES 
} from '@/utils/logger'

export const useDataStore = defineStore('dataStore', {
    state: () => ({
        batches: [],
        stockGroups: [],
        fermenters: [],
        products: [],
        recipes: [],
        logs: [],
        loading: true, // Loader now shows immediately on first mount
        notification: null
    }),
    actions: {
        // Stock (inventory) CRUD
        async getStockGroups() {
            this.loading = true
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const stockRef = collection(db, "stock");
            const q = query(stockRef);
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const data = querySnapshot.docs.map(doc => doc.data());
                this.stockGroups = data
            } else {
                this.stockGroups = null
            }
            this.loading = false
        },
        async addStockGroup(group) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const stockRef = collection(db, "stock");
            await addDoc(stockRef, group);
            
            // Log the activity
            await logStockActivity({
                action: LOG_ACTIONS.CREATE,
                stockId: group.id,
                stockName: group.name || group.product,
                description: `Added new stock group: ${group.name || group.product}`,
                metadata: {
                    groupType: group.type,
                    totalItems: group.items?.length || 0
                }
            })
            
            this.setNotification({ text: 'Stock group added', color: 'success', delay: 3000 })
        },
        async updateStockGroup(group) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const stockRef = collection(db, "stock");
            const q = query(stockRef, where('id', '==', group.id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (doc) => await setDoc(doc.ref, group))
            
            // Log the activity
            await logStockActivity({
                action: LOG_ACTIONS.UPDATE,
                stockId: group.id,
                stockName: group.name || group.product,
                description: `Updated stock group: ${group.name || group.product}`,
                metadata: {
                    groupType: group.type,
                    totalItems: group.items?.length || 0
                }
            })
            
            this.setNotification({ text: 'Stock group updated', color: 'success', delay: 3000 })
        },
        async removeStockGroup(id) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const stockRef = collection(db, "stock");
            const q = query(stockRef, where('id', '==', id));
            const querySnapshot = await getDocs(q);
            
            // Get the group name before deletion for logging
            let groupName = id
            if (!querySnapshot.empty) {
                const groupData = querySnapshot.docs[0].data()
                groupName = groupData.name || groupData.product || id
            }
            
            querySnapshot.forEach( async (doc) => await deleteDoc(doc.ref))
            
            // Log the activity
            await logStockActivity({
                action: LOG_ACTIONS.DELETE,
                stockId: id,
                stockName: groupName,
                description: `Removed stock group: ${groupName}`,
                metadata: { deletedAt: new Date().toISOString() }
            })
            
            this.setNotification({ text: 'Stock group removed', color: 'warning', delay: 3000 })
        },
        // Resets filters to a consistent default set
        resetFilters() {
            this.filters.vermarktungsart = 'Alle'
            this.filters.houseType = 'Alle'
            this.filters.priceRange = [500000, 4500000]
            this.filters.sortBy = 'newest'
            this.filters.keyword = ''
            this.filters.referenceType = ''
        },
        setNotification (notification) {
            this.notification = notification
            // play sound when notification appears (best-effort)
            playNotificationSound()
            setTimeout(() => {
                this.notification = null
            }, notification.delay || 3000)
        },
        async getBatches() {
            this.loading = true
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const batchesRef = collection(db, "batches");
            const q = query(batchesRef);
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const batchesData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    // Include the Firestore document ID as the batch ID
                    return { ...data, id: doc.id };
                });
                console.log('Loaded batches from database:', batchesData);
                // Log which batches have status fields
                batchesData.forEach(batch => {
                    if (batch.status) {
                        console.log(`Batch ${batch.id} has status: ${batch.status}`);
                    } else {
                        console.log(`Batch ${batch.id} has no status field`);
                    }
                });
                this.batches = batchesData
            } else {
                this.batches = null
            }
            this.loading = false
        },
        async addBatch(batch) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const batchesRef = collection(db, "batches");
            
            // Generate batch ID if not provided
            if (!batch.batchId) {
                batch.batchId = await this.generateBatchId();
            }
            
            await addDoc(batchesRef, batch);
            
            // Log the activity
            await logBatchActivity({
                action: LOG_ACTIONS.CREATE,
                batchId: batch.batchId,
                batchName: batch.name || batch.batchId,
                description: `Created new batch: ${batch.batchId}`,
                metadata: {
                    recipeId: batch.recipeId,
                    status: batch.status || 'planning',
                    volume: batch.totalVolume,
                    fermenterId: batch.fermenterId
                }
            })
            
            this.setNotification({
                text: 'Batch successfully created!',
                color: 'success',
                delay: 5000
            })
        },
        
        // Generate batch ID in format YYYY-MM[A-Z]
        async generateBatchId() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const prefix = `${year}-${month}`;
            
            // Get existing batches for this month
            const existingBatches = this.batches || [];
            const monthlyBatches = existingBatches.filter(batch => 
                batch.batchId && batch.batchId.startsWith(prefix)
            );
            
            // Find the next available letter
            const usedLetters = monthlyBatches.map(batch => {
                const match = batch.batchId.match(/^(\d{4}-\d{2})([A-Z])$/);
                return match ? match[2] : null;
            }).filter(Boolean);
            
            // Generate next letter (A, B, C, ...)
            let nextLetter = 'A';
            for (let i = 0; i < 26; i++) {
                const letter = String.fromCharCode(65 + i); // A=65, B=66, etc.
                if (!usedLetters.includes(letter)) {
                    nextLetter = letter;
                    break;
                }
            }
            
            return `${prefix}${nextLetter}`;
        },
        // Fermenter CRUD
        async getFermenters() {
            this.loading = true
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const fermentersRef = collection(db, "fermenters");
            const q = query(fermentersRef);
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const data = querySnapshot.docs.map(doc => doc.data());
                this.fermenters = data
            } else {
                this.fermenters = null
            }
            this.loading = false
        },
        async addFermenter(fermenter) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const fermentersRef = collection(db, "fermenters");
            await addDoc(fermentersRef, fermenter);
            
            // Log the activity
            await logFermenterActivity({
                action: LOG_ACTIONS.CREATE,
                fermenterId: fermenter.id,
                fermenterName: fermenter.name || fermenter.id,
                description: `Created new fermenter: ${fermenter.name || fermenter.id}`,
                metadata: {
                    capacity: fermenter.capacity,
                    type: fermenter.type,
                    status: fermenter.status || 'available'
                }
            })
            
            this.setNotification({
                text: 'Fermenter successfully created!',
                color: 'success',
                delay: 5000
            })
        },
        async updateFermenter(fermenter) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const fermentersRef = collection(db, "fermenters");
            const q = query(fermentersRef, where('id', '==', fermenter.id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (doc) => await setDoc(doc.ref, fermenter))

            // Log the activity
            await logFermenterActivity({
                action: LOG_ACTIONS.UPDATE,
                fermenterId: fermenter.id,
                fermenterName: fermenter.name || fermenter.id,
                description: `Updated fermenter: ${fermenter.name || fermenter.id}`,
                metadata: {
                    capacity: fermenter.capacity,
                    type: fermenter.type,
                    status: fermenter.status
                }
            })

            this.setNotification({
                text: 'Fermenter successfully updated!',
                color: 'success',
                delay: 5000
            })
        },
        async removeFermenter(id) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            
            // Get fermenter data before deletion for logging
            const fermenterToDelete = this.fermenters.find(f => f.id === id)
            const fermenterName = fermenterToDelete?.name || id
            
            const fermentersRef = collection(db, "fermenters");
            const q = query(fermentersRef, where('id', '==', id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach( async (doc) => await deleteDoc(doc.ref))

            // Log the activity
            await logFermenterActivity({
                action: LOG_ACTIONS.DELETE,
                fermenterId: id,
                fermenterName: fermenterName,
                description: `Removed fermenter: ${fermenterName}`,
                metadata: {
                    deletedAt: new Date().toISOString(),
                    capacity: fermenterToDelete?.capacity,
                    type: fermenterToDelete?.type
                }
            })

            this.setNotification({
                text: 'Fermenter successfully removed!',
                color: 'success',
                delay: 5000
            })
        },
        async updateBatch(batch) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            
            if (!batch.id) {
                console.error('Cannot update batch: missing ID', batch);
                return;
            }
            
            // Get the old batch data for change tracking
            const oldBatch = this.batches.find(b => b.id === batch.id)
            
            // Create a copy of the batch without the id field since Firestore document ID is separate
            const { id, ...batchData } = batch;
            
            // Update the document directly using the document ID
            const docRef = doc(db, "batches", id);
            await setDoc(docRef, batchData);
            
            console.log(`Batch ${id} updated successfully`);

            // Log the activity with change tracking
            const changes = {}
            if (oldBatch) {
                // Track key field changes
                const keyFields = ['status', 'fermenterId', 'totalVolume', 'startDate', 'endDate']
                keyFields.forEach(field => {
                    if (oldBatch[field] !== batch[field]) {
                        changes[field] = {
                            before: oldBatch[field],
                            after: batch[field]
                        }
                    }
                })
            }
            
            await logBatchActivity({
                action: Object.keys(changes).length > 0 ? LOG_ACTIONS.UPDATE : LOG_ACTIONS.BATCH_PROGRESS,
                batchId: batch.batchId || id,
                batchName: batch.name || batch.batchId || id,
                changes: Object.keys(changes).length > 0 ? changes : null,
                description: `Updated batch: ${batch.batchId || id}`,
                metadata: {
                    status: batch.status,
                    fermenterId: batch.fermenterId,
                    volume: batch.totalVolume
                }
            })

            this.setNotification({
                text: 'Batch successfully updated!',
                color: 'success',
                delay: 5000
            })
        },
        async removeBatch(id) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            
            // Get batch data before deletion for logging
            const batchToDelete = this.batches.find(b => b.id === id)
            const batchName = batchToDelete?.batchId || batchToDelete?.name || id
            
            const batchesRef = collection(db, "batches");
            const q = query(batchesRef, where('id', '==', id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach( async (doc) => await deleteDoc(doc.ref))

            // Log the activity
            await logBatchActivity({
                action: LOG_ACTIONS.DELETE,
                batchId: batchToDelete?.batchId || id,
                batchName: batchName,
                description: `Removed batch: ${batchName}`,
                metadata: {
                    deletedAt: new Date().toISOString(),
                    status: batchToDelete?.status,
                    recipeId: batchToDelete?.recipeId
                }
            })

            this.setNotification({
                text: 'Batch successfully removed!',
                color: 'success',
                delay: 5000
            })
        },
        // Product CRUD
        async getProducts() {
            this.loading = true
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const productsRef = collection(db, "products");
            const q = query(productsRef);
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const data = querySnapshot.docs.map(doc => doc.data());
                this.products = data
            } else {
                this.products = []
            }
            this.loading = false
        },
        async addProduct(product) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const productsRef = collection(db, "products");
            await addDoc(productsRef, product);
            
            // Log the activity
            await logProductActivity({
                action: LOG_ACTIONS.CREATE,
                productId: product.id,
                productName: product.name || product.id,
                description: `Created new product: ${product.name || product.id}`,
                metadata: {
                    type: product.type,
                    category: product.category,
                    abv: product.abv
                }
            })
            
            this.setNotification({
                text: 'Product successfully added!',
                color: 'success',
                delay: 3000
            })
        },
        async updateProduct(product) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const productsRef = collection(db, "products");
            const q = query(productsRef, where('id', '==', product.id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (doc) => await setDoc(doc.ref, product))

            // Log the activity
            await logProductActivity({
                action: LOG_ACTIONS.UPDATE,
                productId: product.id,
                productName: product.name || product.id,
                description: `Updated product: ${product.name || product.id}`,
                metadata: {
                    type: product.type,
                    category: product.category,
                    abv: product.abv
                }
            })

            this.setNotification({
                text: 'Product successfully updated!',
                color: 'success',
                delay: 3000
            })
        },
        async removeProduct(id) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            
            // Get product data before deletion for logging
            const productToDelete = this.products.find(p => p.id === id)
            const productName = productToDelete?.name || id
            
            const productsRef = collection(db, "products");
            const q = query(productsRef, where('id', '==', id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach( async (doc) => await deleteDoc(doc.ref))

            // Log the activity
            await logProductActivity({
                action: LOG_ACTIONS.DELETE,
                productId: id,
                productName: productName,
                description: `Removed product: ${productName}`,
                metadata: {
                    deletedAt: new Date().toISOString(),
                    type: productToDelete?.type,
                    category: productToDelete?.category
                }
            })

            this.setNotification({
                text: 'Product successfully removed!',
                color: 'success',
                delay: 3000
            })
        },
        // Recipe CRUD
        async getRecipes() {
            this.loading = true
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const recipesRef = collection(db, "recipes");
            const q = query(recipesRef);
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const data = querySnapshot.docs.map(doc => doc.data());
                this.recipes = data
            } else {
                this.recipes = []
            }
            this.loading = false
        },
        async addRecipe(recipe) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const recipesRef = collection(db, "recipes");
            await addDoc(recipesRef, recipe);
            
            // Log the activity
            await logRecipeActivity({
                action: LOG_ACTIONS.CREATE,
                recipeId: recipe.id,
                recipeName: recipe.name || recipe.id,
                description: `Created new recipe: ${recipe.name || recipe.id}`,
                metadata: {
                    type: recipe.type,
                    ingredientCount: recipe.ingredients?.length || 0,
                    abv: recipe.targetABV
                }
            })
            
            this.setNotification({
                text: 'Recipe successfully added!',
                color: 'success',
                delay: 3000
            })
        },
        async updateRecipe(recipe) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const recipesRef = collection(db, "recipes");
            const q = query(recipesRef, where('id', '==', recipe.id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (doc) => await setDoc(doc.ref, recipe))

            // Log the activity
            await logRecipeActivity({
                action: LOG_ACTIONS.UPDATE,
                recipeId: recipe.id,
                recipeName: recipe.name || recipe.id,
                description: `Updated recipe: ${recipe.name || recipe.id}`,
                metadata: {
                    type: recipe.type,
                    ingredientCount: recipe.ingredients?.length || 0,
                    abv: recipe.targetABV
                }
            })

            this.setNotification({
                text: 'Recipe successfully updated!',
                color: 'success',
                delay: 3000
            })
        },
        async removeRecipe(id) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            
            // Get recipe data before deletion for logging
            const recipeToDelete = this.recipes.find(r => r.id === id)
            const recipeName = recipeToDelete?.name || id
            
            const recipesRef = collection(db, "recipes");
            const q = query(recipesRef, where('id', '==', id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach( async (doc) => await deleteDoc(doc.ref))

            // Log the activity
            await logRecipeActivity({
                action: LOG_ACTIONS.DELETE,
                recipeId: id,
                recipeName: recipeName,
                description: `Removed recipe: ${recipeName}`,
                metadata: {
                    deletedAt: new Date().toISOString(),
                    type: recipeToDelete?.type,
                    ingredientCount: recipeToDelete?.ingredients?.length || 0
                }
            })

            this.setNotification({
                text: 'Recipe successfully removed!',
                color: 'success',
                delay: 3000
            })
        },
        // Helper method to deduct ingredients from stock when creating a batch
        async deductIngredientsFromStock(recipeIngredients) {
            // Import unit conversion utilities
            const { isAmountSufficient, convertToBaseUnit, areUnitsCompatible } = await import('@/utils/units.js')
            
            for (const ingredient of recipeIngredients) {
                // Find the specific item and its group
                let targetGroup = null
                let targetItem = null
                
                // Search through all stock groups to find the item
                for (const group of this.stockGroups) {
                    if (group.items) {
                        const item = group.items.find(item => 
                            (item.id === ingredient.itemId) || 
                            (`${group.id}_${item.product}` === ingredient.itemId)
                        )
                        if (item) {
                            targetGroup = group
                            targetItem = item
                            break
                        }
                    }
                }
                
                if (!targetGroup || !targetItem) continue

                const deductAmount = parseFloat(ingredient.amount)
                const currentQuantity = parseFloat(targetItem.quantity) || 0
                const originalQuantity = currentQuantity
                
                // Check if we have sufficient amount considering units
                if (isAmountSufficient(currentQuantity, targetItem.unit, deductAmount, ingredient.unit)) {
                    // If units are compatible, convert the deduction amount to the stock item's unit
                    if (areUnitsCompatible(targetItem.unit, ingredient.unit)) {
                        const stockInBase = convertToBaseUnit(currentQuantity, targetItem.unit)
                        const deductInBase = convertToBaseUnit(deductAmount, ingredient.unit)
                        const remainingInBase = stockInBase - deductInBase
                        
                        // Convert back to the stock item's original unit
                        const conversionFactor = convertToBaseUnit(1, targetItem.unit)
                        const remainingInOriginalUnit = remainingInBase / conversionFactor
                        
                        targetItem.quantity = Math.max(0, remainingInOriginalUnit).toString()
                    } else {
                        // If units are incompatible, use simple subtraction (fallback)
                        targetItem.quantity = Math.max(0, currentQuantity - deductAmount).toString()
                    }
                    
                    // Log the stock deduction
                    await logStockActivity({
                        action: LOG_ACTIONS.DEDUCT,
                        stockId: targetGroup.id,
                        stockName: `${targetGroup.name || targetGroup.product} - ${targetItem.product}`,
                        description: `Deducted ${deductAmount} ${ingredient.unit} of ${targetItem.product} for batch production`,
                        changes: {
                            quantity: {
                                before: `${originalQuantity} ${targetItem.unit}`,
                                after: `${targetItem.quantity} ${targetItem.unit}`
                            }
                        },
                        metadata: {
                            deductedAmount: deductAmount,
                            deductedUnit: ingredient.unit,
                            itemId: targetItem.id || targetItem.product,
                            reason: 'batch_production'
                        }
                    })
                    
                    // Update the stock group in Firebase
                    await this.updateStockGroup(targetGroup)
                }
            }
        },
        
        // Logging methods
        async getLogs(filters = {}) {
            try {
                this.loading = true
                this.logs = await getLogs(filters)
                this.loading = false
                return this.logs
            } catch (error) {
                console.error('Failed to get logs:', error)
                this.loading = false
                throw error
            }
        },
        
        async createLog(logData) {
            try {
                return await createLogEntry(logData)
            } catch (error) {
                console.error('Failed to create log:', error)
                throw error
            }
        }
    }
})