<template>
    <div>
        <h2 class="mb-5">Batches</h2>
        <v-data-table
            class="text-sm"
            :headers="headers"
            :items="batches"
        >
            <template #item.startDate="{ item }">
                <span>{{ formatValue(item, 'startDate') }}</span>
            </template>
                <template #item.fermenter="{ item }">
                    <span>{{ formatValue(item, 'fermenter') }}</span>
                </template>
                <template #item.fermentationDays="{ item }">
                    <span>{{ formatValue(item, 'fermentationDays') }}</span>
                </template>
                <template #item.readingOG="{ item }">
                    <span>{{ formatValue(item, 'readingOG') }}</span>
                </template>
                <template #item.readingFG="{ item }">
                    <span>{{ formatValue(item, 'readingFG') }}</span>
                </template>
            <template #item.abv="{ item }">
                <span>{{ getABV(item) }}</span>
            </template>
            <template #item.endDate="{ item }">
                <span>
                    {{ getEndDate(item) }}
                </span>
            </template>
            <template #item.status="{ item }">
                <v-chip
                    :color="getStatusColor(getStatus(item))"
                    dark
                >
                    <v-icon size="small" class="mr-2">{{ getStatusIcon(getStatus(item)) }}</v-icon>
                    {{ getStatus(item) }}
                </v-chip>
            </template>
            <template #item.pasteurised="{ item }">
                <span v-if="item.pasteurised === true"><v-icon color="green">mdi-check</v-icon></span>
                <span v-else-if="item.pasteurised === false"><v-icon color="grey">mdi-close</v-icon></span>
                <span v-else>-</span>
            </template>
            <template #item.taxPaid="{ item }">
                <span v-if="item.taxPaid === true"><v-icon color="green">mdi-check</v-icon></span>
                <span v-else-if="item.taxPaid === false"><v-icon color="grey">mdi-close</v-icon></span>
                <span v-else>-</span>
            </template>
            <template #item.actions="{ item }">
                <v-btn icon size="small" @click="openEdit(item)">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
            </template>
        </v-data-table>
        
        <v-dialog v-model="editDialog" width="600">
            <template #activator="{ props }"></template>
            <v-card>
                <v-toolbar color="primary" dark>
                    <v-toolbar-title>Update Batch</v-toolbar-title>
                    <spacer />
                    <v-btn icon @click="closeEdit">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text v-if="edited">
                    <v-container>
                        <v-row>
                            <v-col cols="6">
                                <v-text-field label="Fermenter" v-model="edited.fermenter" />
                            </v-col>
                            <v-col cols="6">
                                <v-text-field label="Fermentation Days" type="number" v-model="edited.fermentationDays" />
                            </v-col>
                            <v-col cols="6">
                                <v-text-field label="OG" v-model="edited.readingOG" />
                            </v-col>
                            <v-col cols="6">
                                <v-text-field label="FG" v-model="edited.readingFG" />
                            </v-col>
                            <v-col cols="6">
                                <v-switch label="Pasteurised" v-model="edited.pasteurised" />
                            </v-col>
                            <v-col cols="6">
                                <v-switch label="Tax Paid" v-model="edited.taxPaid" />
                            </v-col>
                            <v-col cols="12">
                                <v-select :items="['failed','complete','packaged','sold']" label="Status (backend statuses)" v-model="edited.status" />
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="closeEdit">Cancel</v-btn>
                    <v-btn color="primary" @click="saveEdit">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
    const headers = ref([
        { title: 'Fermenter', value: 'fermenter', prefix: 'Fermentor #' },
        { title: 'Status', value: 'status' },
        { title: 'Fermentation Days', value: 'fermentationDays', suffix: ' days' },
        { title: 'Batch Start Date', value: 'startDate' },
        { title: 'Batch End Date', value: 'endDate' },
        
        { title: 'OG (°)', value: 'readingOG', suffix: '°', align: 'center' },
        { title: 'FG (°)', value: 'readingFG', suffix: '°', align: 'center' },
        { title: 'ABV', value: 'abv', align: 'center' },
        { title: 'Pasteurised', value: 'pasteurised', align: 'center' },
        { title: 'Tax Paid',  value: 'taxPaid', align: 'center' },
        { title: 'Actions', value: 'actions' }
    ]);

    function getEndDate(item) {
        if (item && item.startDate && item.startDate.seconds && Number.isFinite(item.fermentationDays)) {
            const secs = item.startDate.seconds + (Number(item.fermentationDays) * 86400);
            return new Date(secs * 1000).toLocaleDateString();
        }
        return '-';
    }

    function getStatus(item) {
        // If backend provided a definitive status, use it
        const backendStatus = item && item.status;
        const backendSet = backendStatus && ['failed', 'complete', 'packaged', 'sold'].includes(backendStatus);
        if (backendSet) return backendStatus;

        // Otherwise compute based on dates
        if (item && item.startDate && item.startDate.seconds && Number.isFinite(item.fermentationDays)) {
            const now = Date.now();
            const endSecs = item.startDate.seconds + (Number(item.fermentationDays) * 86400);
            const endMs = endSecs * 1000;
            if (now < endMs) return 'Fermenting';
            // after fermentation
            // if flavouring fields present, mark as Flavouring
            if (item.flavouringEssence || item.flavouringTea || item.flavouringSweetener) return 'Flavouring';
            return 'Complete';
        }

        return backendStatus || 'Unknown';
    }

    function getStatusColor(status) {
        const s = (status || '').toLowerCase();
        if (s === 'fermenting') return 'blue';
        if (s === 'flavouring') return 'orange';
        if (s === 'failed') return 'red';
        if (s === 'complete' || s === 'packaged' || s === 'sold') return 'green';
        return 'grey';
    }

        function formatValue(item, key) {
        const header = (headers.value || headers).find(h => h.value === key);
            let raw = undefined;

            if (!item) return '';

            // special handling for startDate (object with seconds)
            if (key === 'startDate') {
                if (item.startDate && item.startDate.seconds) {
                    raw = new Date(item.startDate.seconds * 1000).toLocaleDateString();
                }
            } else if (Object.prototype.hasOwnProperty.call(item, key)) {
                raw = item[key];
            } else {
                raw = item[key];
            }

        if (raw === null || raw === undefined || raw === '') return '-';

            // Special numeric formatting for OG/FG (always x.xxx)
            if (key === 'readingOG' || key === 'readingFG') {
                const n = Number(raw);
                if (!Number.isFinite(n)) return '-';
                const formatted = n.toFixed(3);
                const prefix = header && header.prefix ? header.prefix : '';
                const suffix = header && header.suffix ? header.suffix : '';
                return `${prefix}${formatted}${suffix}`;
            }

            // coerce to string for all other types
            const str = String(raw);
            const prefix = header && header.prefix ? header.prefix : '';
            const suffix = header && header.suffix ? header.suffix : '';
            return `${prefix}${str}${suffix}`;
        }

    function getStatusIcon(status) {
        const s = (status || '').toLowerCase();
        if (s === 'fermenting') return 'mdi-flask';
        if (s === 'flavouring') return 'mdi-leaf';
        if (s === 'failed') return 'mdi-alert-circle-outline';
        if (s === 'complete') return 'mdi-check-circle-outline';
        if (s === 'packaged') return 'mdi-package-variant-closed';
        if (s === 'sold') return 'mdi-cash';
        return 'mdi-help-circle-outline';
    }

    // ABV estimation:
    // Preferred: use readingOG and readingFG when available: ABV = (OG - FG) * 131.25
    // Fallback: estimate OG from sugar and water using a simple conversion: sugar grams per liter -> potential gravity
    //   Rough estimate: 1 g sugar per L -> 0.004 gravity points (i.e., 1.004)
    //   For sugar in kg and water in L: gravityPoints = (sugar_kg * 1000 / water_L) * 0.004
    //   OG = 1 + gravityPoints
    // Estimate FG by applying an attenuation factor influenced by yeast amount. Use a default apparent attenuation of 0.75.
    const isABVEstimated = ref(false)

    function updateABVEstimatedFlag() {
        const list = batches.value || [];
        isABVEstimated.value = list.some(i => isABVComputed(i) && !i.readingFG);
        // update header title
        const abvHeader = (headers.value || headers).find(h => h.value === 'abv');
        if (abvHeader) abvHeader.title = isABVEstimated.value ? 'ABV (est.)' : 'ABV';
    }

    function isABVComputed(item) {
        // computed when OG present but FG missing, or when sugar+water used
        const ogRaw = item && (item.readingOG || item.readingOG === 0);
        const fgRaw = item && (item.readingFG || item.readingFG === 0);
        if (ogRaw && !fgRaw) return true;
        if (item && (item.sugar !== undefined) && (item.water !== undefined)) return true;
        return false;
    }

    function getABV(item) {
        // Use final readings if present
        const ogRaw = item && (item.readingOG || item.readingOG === 0) ? Number(item.readingOG) : null;
        const fgRaw = item && (item.readingFG || item.readingFG === 0) ? Number(item.readingFG) : null;

    if (ogRaw && fgRaw) {
            const abv = (ogRaw - fgRaw) * 131;
            return `${abv.toFixed(1)}%`;
        }

        // If we have OG but no FG, assume FG = 1.000 per spec
        if (ogRaw && !fgRaw) {
            const fgAssumed = 1.000;
            const abv = (ogRaw - fgAssumed) * 131;
            return `${abv.toFixed(1)}%`;
        }

        // If OG not present, try estimate from sugar + water
        if (item && (item.sugar !== undefined) && (item.water !== undefined) && Number(item.water) > 0) {
            // sugar may be grams or kg? user example uses sugar:1 (assume kg). We'll treat <=20 as kg, >20 as grams
            let sugarKg = Number(item.sugar);
            if (sugarKg > 20) sugarKg = sugarKg / 1000; // treat as grams -> kg
            const waterL = Number(item.water);
            if (!Number.isFinite(sugarKg) || !Number.isFinite(waterL) || waterL === 0) return '-';
            const gravityPoints = (sugarKg * 1000 / waterL) * 0.004; // unitless points
            const ogEst = 1 + gravityPoints;
            const attenuation = estimateAttenuation(item);
            const fgEst = ogEst - ((ogEst - 1) * attenuation);
            const abv = (ogEst - fgEst) * 131;
            return `${abv.toFixed(1)}%`;
        }

        return '-';
    }

    function estimateAttenuation(item) {
        // Base apparent attenuation
        let attenuation = 0.75;
        // Increase attenuation slightly with more yeast (normalized)
        if (item && item.yeast) {
            const y = Number(item.yeast);
            if (Number.isFinite(y)) {
                // assume typical yeast grams between 5 and 100; map to 0.65..0.85
                const clamped = Math.max(5, Math.min(100, y));
                attenuation = 0.65 + ((clamped - 5) / (100 - 5)) * 0.2;
            }
        }
        return attenuation;
    }

    // Editor dialog state
    const editDialog = ref(false)
    const edited = ref(null)

    function openEdit(item) {
        // shallow copy to avoid mutating table until save
        edited.value = Object.assign({}, item)
        editDialog.value = true
    }

    function closeEdit() {
        edited.value = null
        editDialog.value = false
    }

    async function saveEdit() {
        if (!edited.value) return
        // Ensure numeric conversions where appropriate
        if (edited.value.fermentationDays) edited.value.fermentationDays = Number(edited.value.fermentationDays)
        if (edited.value.readingOG) edited.value.readingOG = Number(edited.value.readingOG)
        if (edited.value.readingFG) edited.value.readingFG = Number(edited.value.readingFG)
        // call store to persist
        await dataStore.updateBatch(edited.value)
        // refresh list
        await dataStore.getBatches()
        closeEdit()
    }

    const dataStore = useDataStore()

    onMounted(async () => {
        await dataStore.getBatches()
        updateABVEstimatedFlag()
    })

    const batches = computed(() => dataStore.batches)

    // update header when batches change
    watch(batches, () => updateABVEstimatedFlag(), { immediate: true, deep: true })

    

    definePageMeta({
        layout: 'default'
    })
    useHead({
        title: 'Batches | BatchTrack',
    })
</script>