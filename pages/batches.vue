<template>
    <div>
        <div class="d-flex justify-between mb-3">
            <h2 class="mb-5">Batches</h2>
            <v-btn color="primary" @click="openAdd">
                <v-icon left>mdi-plus</v-icon>
                Add Batch
            </v-btn>
        </div>

        <!-- Stat cards -->
        <v-row class="mb-15 mt-10" dense>
            <v-col cols="12">
                <v-row>
                    <StatCard :title="'All'" icon="mdi-view-grid" color="black darken-1" :count="batches.length" :active="activeFilter === 'all'" @click="setFilter('all')" class="mr-2" />
                    <StatCard :title="'Fermenting'" icon="mdi-flask" color="blue-lighten-1" :count="stats.fermenting" :active="activeFilter === 'fermenting'" @click="setFilter('fermenting')" class="mr-2" />
                    <StatCard :title="'Flavouring'" icon="mdi-leaf" color="orange-lighten-2" :count="stats.flavouring" :active="activeFilter === 'flavouring'" @click="setFilter('flavouring')" class="mr-2" />
                    <StatCard :title="'Complete'" icon="mdi-check-circle-outline" color="success" :count="stats.complete" :active="activeFilter === 'complete'" @click="setFilter('complete')" class="mr-2" />
                    <StatCard :title="'Failed'" icon="mdi-alert-circle-outline" color="red" :count="stats.failed" :active="activeFilter === 'failed'" @click="setFilter('failed')" class="mr-2" />
                    <StatCard :title="'Packaged'" icon="mdi-package-variant-closed" color="purple" :count="stats.packaged" :active="activeFilter === 'packaged'" @click="setFilter('packaged')" class="mr-2" />
                </v-row>
            </v-col>
        </v-row>

         <v-data-table
            class="text-sm"
            :headers="headers"
            :items="displayedBatches"
        >
            <template #item.startDate="{ item }">
                <span>{{ formatValue(item, 'startDate') }}</span>
            </template>
                <template #item.fermenter="{ item }">
                    <span>{{ getFermenterLabelById(item && item.fermenter) }}</span>
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
                    <v-icon class="mr-2">{{ getStatusIcon(getStatus(item)) }}</v-icon>
                    <span class="uppercase">{{ getStatus(item) }}</span>
                </v-chip>
            </template>
            <template #item.actions="{ item }">
                <v-btn icon color="info" flat size="x-small" class="mr-2" @click="openEdit(item)" :title="item && item.status ? 'Preview' : 'Edit'">
                    <v-icon>{{ item && item.status ? 'mdi-eye' : 'mdi-pencil' }}</v-icon>
                </v-btn>
                <v-menu offset-y>
                    <template #activator="{ props }">
                        <v-btn v-bind="props" icon flat size="x-small">
                            <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item @click="setStatus(item, 'complete')">
                            <v-list-item-content>
                                <v-list-item-title class="align-center text-success text-sm"><v-icon color="success" class="mr-2" small>mdi-check-circle-outline</v-icon> Mark Complete</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item @click="setStatus(item, 'failed')">
                            <v-list-item-content>
                                <v-list-item-title class="align-center text-red text-sm"><v-icon color="red" class="mr-2" small>mdi-alert-circle-outline</v-icon> Mark Failed</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item @click="setStatus(item, 'packaged')">
                            <v-list-item-content>
                                <v-list-item-title class="align-center text-purple text-sm"><v-icon color="purple" class="mr-2" small>mdi-package-variant-closed</v-icon> Mark Packaged</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
        </v-data-table>
        <v-dialog v-model="editDialog" width="1200">
            <template #activator="{ props }"></template>
            <v-card>
                <v-toolbar color="primary" dark>
                    <v-toolbar-title>{{ isPreview ? 'Preview Batch' : (isAdding ? 'Add Batch' : 'Update Batch') }}</v-toolbar-title>
                    <spacer />
                    <v-btn icon @click="closeEdit">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text v-if="edited">
                    <v-form ref="formRef" lazy-validation>
                        <v-container>
                            <v-row>
                                <v-col cols="6">
                                    <v-select
                                        label="Fermenter"
                                        v-model="edited.fermenter"
                                        :items="visibleFermenterOptions"
                                        item-title="label"
                                        item-value="value"
                                        :item-disabled="(opt) => !!opt.disabled"
                                        hint="Select fermenter"
                                        persistent-hint
                                        dense
                                        :rules="[requiredRule]"
                                         :readonly="isPreview"
                                    />
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field label="Fermentation Days" type="number" v-model="edited.fermentationDays" hint="Number of days (e.g. 10)" persistent-hint :rules="[requiredNumberRule]" :readonly="isPreview" />
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field label="OG" v-model="edited.readingOG" hint="Original Gravity — format 1.030" persistent-hint placeholder="1.030" :rules="[ogRule]" :readonly="isPreview" />
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field label="Start Date" type="date" v-model="edited.startDateDate" hint="YYYY-MM-DD" persistent-hint :rules="[requiredRule]" :readonly="isPreview" />
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field label="FG" v-model="edited.readingFG" hint="Final Gravity — format 1.000 (assumed if empty)" persistent-hint placeholder="1.000" :readonly="isPreview" />
                                </v-col>
                                <!-- Water removed: fermenter size is used instead -->
                                <v-col cols="6">
                                    <v-text-field label="Sugar (kg)" type="number" v-model="edited.sugar" hint="Kilograms of sugar (e.g. 1)" persistent-hint :rules="[requiredNumberRule]" :readonly="isPreview" />
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field label="Tea (kg)" type="number" v-model="edited.tea" hint="Kilograms of tea" persistent-hint :rules="[requiredNumberRule]" :readonly="isPreview" />
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field label="Temp (°C)" type="number" v-model="edited.temp" hint="Temperature in °C (e.g. 20)" persistent-hint :rules="[requiredNumberRule]" :readonly="isPreview" />
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field label="Yeast (g)" type="number" v-model="edited.yeast" hint="Yeast weight in grams (e.g. 40)" persistent-hint :rules="[requiredNumberRule]" :readonly="isPreview" />
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field label="Yeast Nutrients (g)" type="number" v-model="edited.yeastNutrients" hint="Nutrients in grams" persistent-hint :rules="[requiredNumberRule]" :readonly="isPreview" />
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field label="Flavouring Tea (kg)" type="number" v-model="edited.flavouringTea" hint="Kilograms" persistent-hint :readonly="isPreview" />
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field label="Flavouring Sweetener (g)" type="number" v-model="edited.flavouringSweetener" hint="Grams" persistent-hint :readonly="isPreview" />
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field label="Flavouring Essence (ml)" type="number" v-model="edited.flavouringEssence" hint="Milliliters" persistent-hint :readonly="isPreview" />
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
import { ref, computed, onMounted, watch } from 'vue';
import StatCard from '@/components/StatCard.vue'
    const headers = ref([
        { title: 'Fermenter', value: 'fermenter', prefix: 'Fermenter #', sortable: true },
        { title: 'Fermentation Days', value: 'fermentationDays', suffix: ' days', sortable: true },
        { title: 'Batch Start Date', value: 'startDate', sortable: true },
        { title: 'Batch End Date', value: 'endDate', sortable: true },
        { title: 'OG (°)', value: 'readingOG', suffix: '°', align: 'center', sortable: true },
        { title: 'FG (°)', value: 'readingFG', suffix: '°', align: 'center', sortable: true },
        { title: 'ABV', value: 'abv', align: 'center', sortable: true, align: 'center' },
        { title: 'Status', value: 'status', sortable: true },
        { title: 'Actions', value: 'actions', align: 'center' }
    ]);

    // UI state for filtering & sorting
    const search = ref('')
    const activeFilter = ref('all')
    const sortDesc = ref(true)

    // Expose component
    const components = { StatCard }

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
            if (now < endMs) return 'fermenting';
            // after fermentation
            // if flavouring fields present, mark as Flavouring
            if (item.flavouringEssence || item.flavouringTea || item.flavouringSweetener) return 'flavouring';
            return 'complete';
        }

        return backendStatus || 'Unknown';
    }

    function getStatusColor(status) {
        const s = (status || '').toLowerCase();
        if (s === 'fermenting') return 'blue';
        if (s === 'flavouring') return 'orange';
        if (s === 'failed') return 'red';
        if (s === 'packaged') return 'purple';
        if (s === 'complete') return 'green';
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
        // if sugar present and fermenter has size, we can compute
        if (item && (item.sugar !== undefined)) {
            const waterFromFermenter = getBatchWaterLiters(item);
            if (waterFromFermenter && Number(waterFromFermenter) > 0) return true;
        }
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

    // If OG not present, try estimate from sugar + fermenter size (water comes from fermenter)
    const waterLRaw = getBatchWaterLiters(item);
    if (item && (item.sugar !== undefined) && Number(waterLRaw) > 0) {
            // sugar may be grams or kg? user example uses sugar:1 (assume kg). We'll treat <=20 as kg, >20 as grams
            let sugarKg = Number(item.sugar);
            if (sugarKg > 20) sugarKg = sugarKg / 1000; // treat as grams -> kg
            const waterL = Number(waterLRaw);
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

    // Resolve water liters for a batch from its fermenter entry when batch.water is not set.
    function getBatchWaterLiters(item) {
        if (!item || item.fermenter === undefined || !fermenters.value) return null;
        const fId = item.fermenter;
        const list = fermenters.value || [];
        const found = list.find(f => (f && (f.id === fId || String(f.id) === String(fId))));
        if (!found) return null;
        // Common field names: size, liters, capacity
        if (found.size !== undefined) return Number(found.size);
        if (found.liters !== undefined) return Number(found.liters);
        if (found.capacity !== undefined) return Number(found.capacity);
        return null;
    }

    // Editor dialog state
    const editDialog = ref(false)
    const edited = ref(null)
    const isAdding = ref(false)
    const isPreview = ref(false)
    const formRef = ref(null)

    // Validation rules
    const requiredRule = (v) => (v !== undefined && v !== null && v !== '' ) || 'Required'
    const requiredNumberRule = (v) => {
        if (v === undefined || v === null || v === '') return 'Required'
        const n = Number(v)
        return Number.isFinite(n) && n >= 0 || 'Must be a number'
    }
    const ogRule = (v) => {
        if (v === undefined || v === null || v === '') return 'Required'
        const n = Number(v)
        return Number.isFinite(n) && n >= 1 && n < 2 || 'OG must be a gravity like 1.040'
    }

    const isFormValid = computed(() => {
        if (!edited.value) return false;
        const e = edited.value;
        // fermenter
        if (e.fermenter === undefined || e.fermenter === null || e.fermenter === '') return false;
        // fermentationDays
        const fd = Number(e.fermentationDays);
        if (!Number.isFinite(fd)) return false;
        // OG
        const og = Number(e.readingOG);
        if (!Number.isFinite(og) || og < 1 || og >= 2) return false;
        // sugar, tea, temp, yeast, yeastNutrients
        const requiredNums = ['sugar','tea','temp','yeast','yeastNutrients'];
        for (const k of requiredNums) {
            const n = Number(e[k]);
            if (!Number.isFinite(n)) return false;
        }
        // start date
        if (!e.startDateDate) return false;
        const ms = Date.parse(e.startDateDate);
        if (Number.isNaN(ms)) return false;
        return true;
    })

    function openEdit(item) {
        // shallow copy to avoid mutating table until save
        edited.value = Object.assign({}, item)
        // prefill startDateDate if timestamp exists
        if (item && item.startDate && item.startDate.seconds) {
            const d = new Date(item.startDate.seconds * 1000);
            // YYYY-MM-DD for date input
            edited.value.startDateDate = d.toISOString().slice(0,10);
        }
    isAdding.value = false
    // if the batch already has a status, open in preview mode (read-only)
    isPreview.value = !!(item && item.status)
    editDialog.value = true
    }

    function openAdd() {
        edited.value = {
            // default fields for new batch
            id: null,
            fermenter: null,
            fermentationDays: null,
            readingOG: null,
            readingFG: null,
            sugar: null,
            tea: null,
            temp: null,
            yeast: null,
            yeastNutrients: null,
            flavouringTea: null,
            flavouringSweetener: null,
            flavouringEssence: null,
            pasteurised: false,
            taxPaid: false,
            startDateDate: null
        }
        isAdding.value = true
    isPreview.value = false
    editDialog.value = true
    }

    function closeEdit() {
        edited.value = null
        editDialog.value = false
    }

    async function saveEdit() {
        if (!edited.value) return
        // validate form
        if (formRef.value) {
            const valid = await formRef.value.validate();
            if (!valid) return;
        }
        // Ensure numeric conversions where appropriate
        if (edited.value.fermentationDays) edited.value.fermentationDays = Number(edited.value.fermentationDays)
        if (edited.value.readingOG) edited.value.readingOG = Number(edited.value.readingOG)
        if (edited.value.readingFG) edited.value.readingFG = Number(edited.value.readingFG)
        // other numeric fields
    ['sugar','tea','temp','yeast','yeastNutrients','flavouringTea','flavouringSweetener','flavouringEssence'].forEach(k => {
            if (edited.value[k] !== undefined && edited.value[k] !== null && edited.value[k] !== '') edited.value[k] = Number(edited.value[k])
        })
        // convert date input to Firestore-like timestamp
        if (edited.value.startDateDate) {
            const ms = Date.parse(edited.value.startDateDate);
            if (!Number.isNaN(ms)) {
                edited.value.startDate = { seconds: Math.floor(ms/1000), nanoseconds: 0 }
            }
        }
        // call store to persist
        if (isAdding.value) {
            await dataStore.addBatch(edited.value)
        } else {
            await dataStore.updateBatch(edited.value)
        }
        // refresh list
        await dataStore.getBatches()
        updateABVEstimatedFlag()
        closeEdit()
    }

    async function setStatus(item, status) {
        console.log(item, status)
        if (!item || !item.id) return;
        const copy = Object.assign({}, item, { status });
        console.log(copy)
        await dataStore.updateBatch(copy);
        await dataStore.getBatches();
    }

    const dataStore = useDataStore()

    onMounted(async () => {
        await dataStore.getFermenters()
        await dataStore.getBatches()
        updateABVEstimatedFlag()
    })

    const fermenters = computed(() => dataStore.fermenters)
    const batches = computed(() => dataStore.batches)

    // Small helpers / computed state for UI
    const stats = computed(() => {
        const list = batches.value || [];
        const s = { fermenting: 0, flavouring: 0, complete: 0 };
        for (const b of list) {
            const st = getStatus(b) || '';
            const key = String(st).toLowerCase();
            if (key === 'fermenting') s.fermenting++;
            else if (key === 'flavouring') s.flavouring++;
            else if (key === 'complete' || key === 'packaged' || key === 'sold') s.complete++;
        }
        return s;
    })

    function setFilter(val) {
        activeFilter.value = val
    }

    const displayedBatches = computed(() => {
        let list = (batches.value || []).slice();

        // filter by activeFilter
        if (activeFilter.value && activeFilter.value !== 'all') {
            list = list.filter(b => getStatus(b) === activeFilter.value)
        }

        // search
        if (search.value && search.value.trim() !== '') {
            const q = String(search.value).toLowerCase();
            list = list.filter(b => {
                // check fermenter label, id, status, and numeric fields
                const fLabel = getFermenterLabelById(b && b.fermenter).toLowerCase();
                const status = (getStatus(b) || '').toLowerCase();
                const idStr = b && b.id ? String(b.id).toLowerCase() : '';
                return fLabel.includes(q) || status.includes(q) || idStr.includes(q);
            })
        }

        return list;
    })

    const fermenterOptions = computed(() => {
        const list = fermenters.value || [];
        // Expect fermenter objects to have an `id` property. Fallback to index if missing.
        const currentBatchId = edited.value && edited.value.id ? edited.value.id : null;
    return list.map((f, idx) => {
            const idVal = f && f.id !== undefined ? f.id : idx;
            // find if this fermenter has an active batch (no status) other than the one we're editing
            const occupied = (batches.value || []).some(b => b && (b.fermenter === idVal || String(b.fermenter) === String(idVal)) && (!b.status || b.status === '') && (!currentBatchId || b.id !== currentBatchId));
            return {
                value: idVal,
                label: f && f.name ? `${f.name} (${idVal})${occupied ? ' — IN USE' : ''}` : `Fermenter ${idVal}${occupied ? ' — IN USE' : ''}`,
                disabled: !!occupied
            }
        })
    })

    // Items shown to pick from — exclude disabled ones so they can't be selected
    const visibleFermenterOptions = computed(() => (fermenterOptions.value || []).filter(o => !o.disabled))

    function getFermenterLabelById(id) {
        if (id === undefined || id === null) return '-';
        const list = fermenters.value || [];
        const found = list.find(f => f && (f.id === id || String(f.id) === String(id)));
        if (!found) return `Fermenter #${id}`;
        return found.name ? `${found.name}` : `Fermenter #${found.id}`;
    }

    // update header when batches change
    watch(batches, () => {
        updateABVEstimatedFlag()
    }, { immediate: true, deep: true })

    

    definePageMeta({
        layout: 'default'
    })
    useHead({
        title: 'Batches | BatchTrack',
    })
</script>