import { getFirestore, collection, query, doc, getDocs, setDoc, addDoc, deleteDoc, where } from "firebase/firestore";
import { playNotificationSound } from '@/utils/sound'

export const useDataStore = defineStore('dataStore', {
    state: () => ({
        batches: [],
        stockGroups: [],
        fermenters: [],
        products: [],
        recipes: [],
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
            this.setNotification({ text: 'Stock group added', color: 'success', delay: 3000 })
        },
        async updateStockGroup(group) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const stockRef = collection(db, "stock");
            const q = query(stockRef, where('id', '==', group.id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (doc) => await setDoc(doc.ref, group))
            this.setNotification({ text: 'Stock group updated', color: 'success', delay: 3000 })
        },
        async removeStockGroup(id) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const stockRef = collection(db, "stock");
            const q = query(stockRef, where('id', '==', id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach( async (doc) => await deleteDoc(doc.ref))
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
            await addDoc(batchesRef, batch);
            this.setNotification({
                text: 'Batch successfully created!',
                color: 'success',
                delay: 5000
            })
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

            this.setNotification({
                text: 'Fermenter successfully updated!',
                color: 'success',
                delay: 5000
            })
        },
        async removeFermenter(id) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const fermentersRef = collection(db, "fermenters");
            const q = query(fermentersRef, where('id', '==', id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach( async (doc) => await deleteDoc(doc.ref))

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
            
            // Create a copy of the batch without the id field since Firestore document ID is separate
            const { id, ...batchData } = batch;
            
            // Update the document directly using the document ID
            const docRef = doc(db, "batches", id);
            await setDoc(docRef, batchData);
            
            console.log(`Batch ${id} updated successfully`);

            this.setNotification({
                text: 'Batch successfully updated!',
                color: 'success',
                delay: 5000
            })
        },
        async removeBatch(id) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const batchesRef = collection(db, "batches");
            const q = query(batchesRef, where('id', '==', id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach( async (doc) => await deleteDoc(doc.ref))

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

            this.setNotification({
                text: 'Product successfully updated!',
                color: 'success',
                delay: 3000
            })
        },
        async removeProduct(id) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const productsRef = collection(db, "products");
            const q = query(productsRef, where('id', '==', id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach( async (doc) => await deleteDoc(doc.ref))

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

            this.setNotification({
                text: 'Recipe successfully updated!',
                color: 'success',
                delay: 3000
            })
        },
        async removeRecipe(id) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const recipesRef = collection(db, "recipes");
            const q = query(recipesRef, where('id', '==', id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach( async (doc) => await deleteDoc(doc.ref))

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
                    
                    // Update the stock group in Firebase
                    await this.updateStockGroup(targetGroup)
                }
            }
        }
    }
})