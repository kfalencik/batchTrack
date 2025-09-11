import { getFirestore, collection, query, doc, getDocs, setDoc, addDoc, deleteDoc, where } from "firebase/firestore";

export const useDataStore = defineStore('dataStore', {
    state: () => ({
        batches: [],
        loading: true, // Loader now shows immediately on first mount
        notification: null
    }),
    actions: {
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
                const batchesData = querySnapshot.docs.map(doc => doc.data());
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
        async updateBatch(batch) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
            const batchesRef = collection(db, "batches");
            const q = query(batchesRef, where('id', '==', batch.id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (doc) => await setDoc(doc.ref, batch))

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
        }
    }
})