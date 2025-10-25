<template>
    <div>
        <div class="d-flex justify-between mb-3">
            <h2 class="mb-5">Batches</h2>
            <v-btn color="primary" @click="openAdd">
                <v-icon class="mr-2">mdi-plus-circle</v-icon>
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
                    <StatCard :title="'Failed'" icon="mdi-alert-circle-outline" color="red" :count="stats.failed" :active="activeFilter === 'failed'" @click="setFilter('failed')" class="mr-2" />
                    <StatCard :title="'Ready to Pack'" icon="mdi-package-up" color="purple" :count="stats.readyToPack" :active="activeFilter === 'ready to pack'" @click="setFilter('ready to pack')" class="mr-2" />
                    <StatCard :title="'Packaged'" icon="mdi-package-variant-closed" color="green" :count="stats.packaged" :active="activeFilter === 'packaged'" @click="setFilter('packaged')" class="mr-2" />
                </v-row>
            </v-col>
        </v-row>

         <v-data-table
            class="text-sm"
            :headers="headers"
            :items="displayedBatches"
        >
            <template #item.recipe="{ item }">
                <span>{{ getRecipeName(item.recipeId) }}</span>
            </template>
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
                <span>{{ getABV(item) }} {{ item.readingFG ? '' : '(est.)' }}</span>
            </template>
            <template #item.endDate="{ item }">
                <span>
                    {{ getEndDate(item) }}
                </span>
            </template>
             <template #item.progress="{ item }">
                <div v-tooltip:top="getProgress(item).label">
                    <v-progress-linear :buffer-value="getProgress(item).percent" height="10" rounded color="success" striped></v-progress-linear>
                </div>
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
                <v-btn icon color="info" flat size="x-small" class="mr-2" @click="openEdit(item)" :title="(item && item.status) || getStatus(item) === 'packaged' ? 'Preview' : 'Edit'">
                    <v-icon>{{ (item && item.status) || getStatus(item) === 'packaged' ? 'mdi-eye' : 'mdi-pencil' }}</v-icon>
                </v-btn>
                <v-btn 
                    v-if="getStatus(item) === 'ready to pack'" 
                    icon 
                    color="primary" 
                    flat 
                    size="x-small" 
                    class="mr-2" 
                    @click="openPackDialog(item)"
                    title="Pack this batch"
                >
                    <v-icon>mdi-package-variant</v-icon>
                </v-btn>
                <v-menu offset-y v-if="getStatus(item) !== 'packaged'">
                    <template #activator="{ props }">
                        <v-btn v-bind="props" icon flat size="x-small">
                            <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item @click="setStatus(item, 'failed')">
                            <v-list-item-content>
                                <v-list-item-title class="align-center text-red text-sm"><v-icon color="red" class="mr-2" small>mdi-alert-circle-outline</v-icon> Mark Failed</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item @click="setStatus(item, 'ready to pack')">
                            <v-list-item-content>
                                <v-list-item-title class="align-center text-purple text-sm"><v-icon color="purple" class="mr-2" small>mdi-package-up</v-icon> Mark Ready to Pack</v-list-item-title>
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
                                        label="Recipe"
                                        v-model="edited.recipeId"
                                        :items="recipeOptions"
                                        item-title="label"
                                        item-value="value"
                                        :item-disabled="(opt) => !!opt.disabled"
                                        hint="Select a recipe for this batch"
                                        persistent-hint
                                        dense
                                        :rules="[requiredRule]"
                                        required
                                        class="required-field"
                                        :readonly="isPreview"
                                        @update:model-value="onRecipeSelected"
                                    />
                                </v-col>
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
                                        required
                                        class="required-field"
                                        :readonly="isPreview"
                                    />
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field class="required-field" label="Fermentation Days" type="number" v-model="edited.fermentationDays" hint="Number of days (e.g. 10)" persistent-hint :rules="[requiredNumberRule]" :readonly="isPreview" required />
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field class="required-field" label="OG" v-model="edited.readingOG" hint="Original Gravity — format 1.030" persistent-hint placeholder="1.030" :rules="[ogRule]" :readonly="isPreview" required />
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field class="required-field" label="Start Date" type="date" v-model="edited.startDateDate" hint="YYYY-MM-DD" persistent-hint :rules="[requiredRule]" :readonly="isPreview" required />
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field label="FG" v-model="edited.readingFG" hint="Final Gravity — format 1.000 (assumed if empty)" persistent-hint placeholder="1.000" :readonly="isPreview" />
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field class="required-field" label="Temp (°C)" type="number" v-model="edited.temp" hint="Temperature in °C (e.g. 20)" persistent-hint :rules="[requiredNumberRule]" :readonly="isPreview" required />
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
                    <div class="text-right">
                        <v-btn text @click="closeEdit">Close</v-btn>
                        <v-btn v-if="!isPreview" color="primary" @click="saveEdit" :disabled="!isFormValid">Save</v-btn>
                    </div>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Packaging Dialog -->
        <v-dialog v-model="packDialog" width="1000">
            <v-card>
                <v-toolbar color="primary" dark>
                    <v-toolbar-title>Pack Batch: {{ packingBatch ? getFermenterLabelById(packingBatch.fermenter) : '' }}</v-toolbar-title>
                    <v-spacer />
                    <v-btn icon @click="closePackDialog">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text v-if="packingBatch">
                    <v-form ref="packFormRef" lazy-validation>
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <v-alert type="info" class="mb-4">
                                        <div><strong>Available brew:</strong> {{ getTotalBrewAmount(packingBatch) }} L</div>
                                        <div><strong>Batch:</strong> {{ getFermenterLabelById(packingBatch.fermenter) }}</div>
                                    </v-alert>
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="12">
                                    <h3 class="mb-3">Packaging Groups</h3>
                                    <p class="text-caption text--secondary mb-4">Split your brew into different container types. You can add multiple groups to distribute the total amount.</p>
                                </v-col>
                            </v-row>

                            <v-row v-for="(group, idx) in packagingGroups" :key="idx" class="mb-4">
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
                                                    :rules="[requiredNumberRule]"
                                                />
                                            </v-col>
                                            <v-col cols="2">
                                                <v-text-field
                                                    label="Quantity"
                                                    type="number"
                                                    v-model="group.quantity"
                                                    hint="Number of containers"
                                                    required
                                                    :rules="[requiredNumberRule]"
                                                />
                                            </v-col>
                                            <v-col cols="2">
                                                <v-text-field
                                                    label="Total Volume"
                                                    :value="getGroupTotal(group)"
                                                    suffix="L"
                                                    readonly
                                                    hint="Auto-calculated"
                                                />
                                            </v-col>
                                            <v-col cols="2">
                                                <v-text-field
                                                    label="Notes"
                                                    v-model="group.notes"
                                                    hint="Optional"
                                                />
                                            </v-col>
                                            <v-col cols="1" class="d-flex align-center">
                                                <v-btn icon color="red" @click="removePackagingGroup(idx)" v-if="packagingGroups.length > 1">
                                                    <v-icon>mdi-delete</v-icon>
                                                </v-btn>
                                            </v-col>
                                        </v-row>
                                    </v-card>
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="12">
                                    <v-btn text color="primary" @click="addPackagingGroup">
                                        <v-icon class="mr-2">mdi-plus</v-icon>
                                        Add Another Container Group
                                    </v-btn>
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="12">
                                    <v-alert 
                                        :type="getTotalPackaged() < getTotalBrewAmount(packingBatch) ? 'warning' : 'success'" 
                                        class="mt-4"
                                    >
                                        <div><strong>Total packaged:</strong> {{ getTotalPackaged() }} L</div>
                                        <div><strong>Remaining:</strong> {{ (getTotalBrewAmount(packingBatch) - getTotalPackaged()).toFixed(1) }} L</div>
                                        <div v-if="getTotalPackaged() < getTotalBrewAmount(packingBatch)" class="mt-2">
                                            <small>⚠️ You have remaining brew that won't be packaged. This could be intentional (testing, spillage, etc.)</small>
                                        </div>
                                    </v-alert>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="closePackDialog">Cancel</v-btn>
                    <v-btn color="primary" @click="savePackaging" :disabled="!isPackFormValid">
                        Complete Packaging
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import StatCard from '@/components/StatCard.vue'
    const headers = ref([
        { title: 'Recipe', value: 'recipe', sortable: true },
        { title: 'Fermenter', value: 'fermenter', prefix: 'Fermenter #', sortable: true },
        { title: 'Fermentation Days', value: 'fermentationDays', suffix: ' days', sortable: true },
        { title: 'Batch Start Date', value: 'startDate', sortable: true },
        { title: 'Batch End Date', value: 'endDate', sortable: true },
        { title: 'OG (°)', value: 'readingOG', suffix: '°', align: 'center', sortable: true },
        { title: 'FG (°)', value: 'readingFG', suffix: '°', align: 'center', sortable: true },
        { title: 'ABV', value: 'abv', align: 'center', sortable: true, align: 'center' },
        { title: 'Progress', value: 'progress', width: '160px', align: 'center', sortable: false },
        { title: 'Status', value: 'status', sortable: true },
        { title: '', value: 'actions', align: 'right' }
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
        const backendSet = backendStatus && ['failed', 'ready to pack', 'packaged', 'sold'].includes(backendStatus);
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
            return 'ready to pack';
        }

        return backendStatus || 'Unknown';
    }

    function getStatusColor(status) {
        const s = (status || '').toLowerCase();
        if (s === 'fermenting') return 'blue';
        if (s === 'flavouring') return 'orange';
        if (s === 'failed') return 'red';
        if (s === 'ready to pack') return 'purple';
        if (s === 'packaged') return 'green';
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
        if (s === 'ready to pack') return 'mdi-package-up';
        if (s === 'packaged') return 'mdi-package-variant-closed';
        return 'mdi-help-circle-outline';
    }

    function getProgress(item) {
        // Returns object { percent: Number 0-100, label: 'xx%' or '-' }
        if (!item || !item.startDate || !item.startDate.seconds || !Number.isFinite(Number(item.fermentationDays))) {
            return { percent: 0, label: '-' };
        }
        const startMs = item.startDate.seconds * 1000;
        const days = Number(item.fermentationDays);
        if (!Number.isFinite(days) || days <= 0) return { percent: 0, label: '-' };
        const endMs = startMs + (days * 86400 * 1000);
        const now = Date.now();
        const elapsed = Math.max(0, Math.min(now - startMs, endMs - startMs));
        const percent = Math.round((elapsed / (endMs - startMs)) * 100);
        const bounded = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0));
        return { percent: bounded, label: `${bounded}%` };
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

    // Packaging dialog state
    const packDialog = ref(false)
    const packingBatch = ref(null)
    const packagingGroups = ref([])
    const packFormRef = ref(null)
    
    const containerTypes = ['Cans', 'Kegs', 'Bottles', 'Other']

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
        // recipe (required)
        if (!e.recipeId) return false;
        // fermenter
        if (e.fermenter === undefined || e.fermenter === null || e.fermenter === '') return false;
        // fermentationDays
        const fd = Number(e.fermentationDays);
        if (!Number.isFinite(fd)) return false;
        // OG
        const og = Number(e.readingOG);
        if (!Number.isFinite(og) || og < 1 || og >= 2) return false;
        // temp (only required field now, ingredients come from recipe)
        const temp = Number(e.temp);
        if (!Number.isFinite(temp)) return false;
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
    // if the batch already has a status or is packaged, open in preview mode (read-only)
    isPreview.value = !!(item && (item.status || getStatus(item) === 'packaged'))
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

    // Packaging dialog methods
    function openPackDialog(batch) {
        packingBatch.value = batch
        // Initialize with one packaging group
        packagingGroups.value = [{
            containerType: 'Cans',
            containerSize: 0.33,
            quantity: 1,
            notes: ''
        }]
        packDialog.value = true
    }

    function closePackDialog() {
        packingBatch.value = null
        packagingGroups.value = []
        packDialog.value = false
    }

    function addPackagingGroup() {
        packagingGroups.value.push({
            containerType: 'Cans',
            containerSize: 0.33,
            quantity: 1,
            notes: ''
        })
    }

    function removePackagingGroup(index) {
        if (packagingGroups.value.length > 1) {
            packagingGroups.value.splice(index, 1)
        }
    }

    function getTotalBrewAmount(batch) {
        if (!batch) return 0
        // Get the fermenter size as the total brew amount
        const waterLiters = getBatchWaterLiters(batch)
        return waterLiters || 0
    }

    function getGroupTotal(group) {
        const size = Number(group.containerSize) || 0
        const qty = Number(group.quantity) || 0
        return (size * qty).toFixed(1)
    }

    function getTotalPackaged() {
        return packagingGroups.value.reduce((total, group) => {
            return total + Number(getGroupTotal(group))
        }, 0)
    }

    const isPackFormValid = computed(() => {
        if (!packagingGroups.value || packagingGroups.value.length === 0) return false
        
        for (const group of packagingGroups.value) {
            if (!group.containerType) return false
            if (!Number.isFinite(Number(group.containerSize)) || Number(group.containerSize) <= 0) return false
            if (!Number.isFinite(Number(group.quantity)) || Number(group.quantity) <= 0) return false
        }
        
        return true
    })

    async function savePackaging() {
        if (!packingBatch.value || !isPackFormValid.value) return
        
        if (packFormRef.value) {
            const valid = await packFormRef.value.validate()
            if (!valid) return
        }

        // Check if user hasn't used all brew and show warning
        const totalBrew = getTotalBrewAmount(packingBatch.value)
        const totalPackaged = getTotalPackaged()
        
        if (totalPackaged < totalBrew) {
            const confirmed = confirm(
                `You are packaging ${totalPackaged}L out of ${totalBrew}L available. ` +
                `${(totalBrew - totalPackaged).toFixed(1)}L will remain unpackaged. ` +
                `This could be intentional (testing, spillage, etc.). Continue?`
            )
            if (!confirmed) return
        }

        // Create product entries for the packaged items
        const products = packagingGroups.value.map(group => ({
            id: `${packingBatch.value.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            batchId: packingBatch.value.id,
            productName: `${getFermenterLabelById(packingBatch.value.fermenter)} - ${group.containerType}`,
            containerType: group.containerType,
            containerSize: Number(group.containerSize),
            quantity: Number(group.quantity),
            totalVolume: Number(getGroupTotal(group)),
            notes: group.notes || '',
            packagedDate: new Date().toISOString().slice(0, 10),
            status: 'packaged',
            abv: getABV(packingBatch.value),
            fermenter: packingBatch.value.fermenter
        }))

        // Save products to data store
        for (const product of products) {
            await dataStore.addProduct(product)
        }

        // Update batch status to 'packaged'
        const updatedBatch = Object.assign({}, packingBatch.value, { status: 'packaged' })
        await dataStore.updateBatch(updatedBatch)
        
        // Refresh batches
        await dataStore.getBatches()
        
        // Close dialog
        closePackDialog()
        
        // Show success message
        dataStore.setNotification({
            text: `Successfully packaged batch into ${products.length} product group${products.length > 1 ? 's' : ''}`,
            color: 'success',
            delay: 5000
        })
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
        // other numeric fields (only temp and flavoring fields now)
        ;['temp','flavouringTea','flavouringSweetener','flavouringEssence'].forEach(k => {
            if (edited.value[k] !== undefined && edited.value[k] !== null && edited.value[k] !== '') edited.value[k] = Number(edited.value[k])
        })
        // convert date input to Firestore-like timestamp
        if (edited.value.startDateDate) {
            const ms = Date.parse(edited.value.startDateDate);
            if (!Number.isNaN(ms)) {
                edited.value.startDate = { seconds: Math.floor(ms/1000), nanoseconds: 0 }
            }
        }

        // Recipe is now required - deduct ingredients from stock
        if (edited.value.recipeId) {
            const recipe = recipes.value?.find(r => r.id === edited.value.recipeId)
            if (recipe && recipe.ingredients) {
                // For new batches, check availability and deduct ingredients
                if (isAdding.value) {
                    // Check if we still have enough ingredients before deducting
                    const canMake = canMakeRecipe(recipe)
                    if (!canMake) {
                        dataStore.setNotification({
                            text: 'Insufficient ingredients to make this recipe!',
                            color: 'error',
                            delay: 5000
                        })
                        return
                    }
                    
                    // Deduct ingredients from stock
                    try {
                        await dataStore.deductIngredientsFromStock(recipe.ingredients)
                        dataStore.setNotification({
                            text: 'Ingredients deducted from stock for recipe: ' + recipe.name,
                            color: 'success',
                            delay: 3000
                        })
                    } catch (error) {
                        console.error('Error deducting ingredients:', error)
                        dataStore.setNotification({
                            text: 'Error deducting ingredients from stock',
                            color: 'error',
                            delay: 5000
                        })
                        return
                    }
                }
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
        if (isAdding.value) {
            // Refresh stock groups after ingredient deduction (recipe is always required now)
            await dataStore.getStockGroups()
        }
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
        await dataStore.getRecipes()
        await dataStore.getStockGroups()
        updateABVEstimatedFlag()
    })

    const fermenters = computed(() => dataStore.fermenters)
    const batches = computed(() => dataStore.batches)
    const recipes = computed(() => dataStore.recipes)
    const stockGroups = computed(() => dataStore.stockGroups)

    // Small helpers / computed state for UI
    const stats = computed(() => {
        const list = batches.value || [];
        const s = { fermenting: 0, flavouring: 0, failed: 0, readyToPack: 0, packaged: 0 };
        for (const b of list) {
            const st = getStatus(b) || '';
            const key = String(st).toLowerCase();
            if (key === 'fermenting') s.fermenting++;
            else if (key === 'flavouring') s.flavouring++;
            else if (key === 'ready to pack') s.readyToPack++;
            else if (key === 'packaged') s.packaged++;
            else if (key === 'failed') s.failed++;
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

    // Recipe options - only show available recipes since they're required
    const recipeOptions = computed(() => {
        const list = recipes.value || [];
        return list
            .filter(recipe => canMakeRecipe(recipe)) // Only show available recipes
            .map(recipe => ({
                value: recipe.id,
                label: recipe.name,
                disabled: false
            }))
    })

    function canMakeRecipe(recipe) {
        if (!recipe || !recipe.ingredients) return false
        return recipe.ingredients.every(ingredient => {
            // Find the specific item in stock groups
            for (const group of stockGroups.value || []) {
                if (group.items) {
                    const item = group.items.find(item => 
                        (item.id === ingredient.itemId) || 
                        (`${group.id}_${item.product}` === ingredient.itemId)
                    )
                    if (item && item.quantity && !isExpired(item)) {
                        return parseFloat(item.quantity) >= parseFloat(ingredient.amount)
                    }
                }
            }
            return false
        })
    }

    function isExpired(item) {
        if (!item.expiryDate) return false
        return new Date(item.expiryDate) < new Date()
    }

    function onRecipeSelected(recipeId) {
        if (!recipeId || !recipes.value) return
        
        const recipe = recipes.value.find(r => r.id === recipeId)
        if (!recipe) return

        // Recipe ingredients are now handled automatically - no manual form population needed
        // The recipe selection is sufficient for batch creation
        console.log('Recipe selected:', recipe.name)
    }

    function getFermenterLabelById(id) {
        if (id === undefined || id === null) return '-';
        const list = fermenters.value || [];
        const found = list.find(f => f && (f.id === id || String(f.id) === String(id)));
        if (!found) return `Fermenter #${id}`;
        return found.name ? `${found.name}` : `Fermenter #${found.id}`;
    }

    function getRecipeName(recipeId) {
        if (!recipeId) return '-';
        const recipe = recipes.value?.find(r => r.id === recipeId);
        return recipe ? recipe.name : 'Unknown Recipe';
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

<style scoped>
/* show red asterisk for required fields */
.required-field .v-field-label::after,
.required-field .v-label::after,
.required-field label::after {
    content: ' *';
    color: #e53935;
    margin-left: 2px;
}
</style>