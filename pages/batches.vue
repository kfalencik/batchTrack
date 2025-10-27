<template>
    <div class="batches-page">
        <PageHeader 
            title="Batches"
            description="Track your brewing batches from start to finish. Monitor fermentation progress, manage packaging, and maintain quality records."
            action-text="Add Batch"
            action-icon="mdi-plus-circle"
            @action="openAdd"
        />

        <!-- Modern Stat cards grid -->
        <div class="stats-grid">
            <StatCard :title="'All'" icon="mdi-view-grid" color="black" :count="batches?.length" :active="activeFilter === 'all'" @click="setFilter('all')" />
            <StatCard :title="'Fermenting'" icon="mdi-flask" color="blue-lighten-1" :count="stats.fermenting" :active="activeFilter === 'fermenting'" @click="setFilter('fermenting')" />
            <StatCard :title="'Flavouring'" icon="mdi-leaf" color="orange-lighten-2" :count="stats.flavouring" :active="activeFilter === 'flavouring'" @click="setFilter('flavouring')" />
            <StatCard :title="'Failed'" icon="mdi-alert-circle-outline" color="red" :count="stats.failed" :active="activeFilter === 'failed'" @click="setFilter('failed')" />
            <StatCard :title="'Ready to Pack'" icon="mdi-package-up" color="purple" :count="stats.readyToPack" :active="activeFilter === 'ready to pack'" @click="setFilter('ready to pack')" />
            <StatCard :title="'Packaged'" icon="mdi-package-variant-closed" color="green" :count="stats.packaged" :active="activeFilter === 'packaged'" @click="setFilter('packaged')" />
        </div>

         <EnhancedDataTable
            :headers="headers"
            :items="displayedBatches"
            :loading="loading"
            loading-text="Loading batches..."
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
                <ProgressDisplay 
                    :progress="getProgress(item)"
                    :tooltip="getProgress(item).label"
                />
            </template>
            <template #item.status="{ item }">
                <StatusChip 
                    :status="getStatus(item)"
                    type="batch"
                    uppercase
                />
            </template>
            <template #item.actions="{ item }">
                <DataTableActions 
                    :item="item"
                    :show-delete="false"
                    :edit-icon="getStatus(item) === 'packaged' ? 'mdi-eye' : 'mdi-pencil'"
                    :custom-actions="getCustomActions(item)"
                    @edit="openEdit"
                    @custom-action="handleCustomAction"
                />
            </template>
        </EnhancedDataTable>
        <BaseDialog
            v-model="editDialog"
            :title="isPreview ? 'Preview Batch' : (isAdding ? 'Add Batch' : 'Update Batch')"
            title-icon="mdi-barrel"
            max-width="1200px"
            @close="closeEdit"
        >
            <v-form v-if="edited" ref="formRef" lazy-validation>
                <v-container>
                    <!-- Help Section -->
                    <v-row v-if="!isPreview">
                        <v-col cols="12">
                            <HelpSection
                                title="Batch Creation Guidelines"
                                :help-items="batchHelpItems"
                            />
                        </v-col>
                    </v-row>

                    <!-- Form Fields -->
                    <v-row>
                        <v-col cols="12">
                            <v-select
                                label="Recipe"
                                v-model="edited.recipeId"
                                :items="recipeOptions"
                                item-title="label"
                                item-value="value"
                                :item-disabled="(opt) => !!opt.disabled"
                                hint="Choose the recipe that defines ingredients and brewing process"
                                persistent-hint
                                :rules="[requiredRule]"
                                required
                                class="required-field modern-select"
                                :readonly="isPreview"
                                :disabled="!isAdding"
                                @update:model-value="onRecipeSelected"
                            >
                                <template #prepend-inner>
                                    <v-icon color="primary">mdi-chef-hat</v-icon>
                                </template>
                            </v-select>
                        </v-col>
                        <v-col cols="12">
                            <v-select
                                label="Fermenter"
                                v-model="edited.fermenter"
                                :items="visibleFermenterOptions"
                                item-title="label"
                                item-value="value"
                                :item-disabled="(opt) => !!opt.disabled"
                                hint="Select the fermenter vessel for this batch"
                                persistent-hint
                                :rules="[requiredRule]"
                                required
                                class="required-field modern-select"
                                :readonly="isPreview"
                                :disabled="!isAdding"
                            >
                                <template #prepend-inner>
                                    <v-icon color="primary">mdi-flask</v-icon>
                                </template>
                            </v-select>
                        </v-col>
                        <v-col cols="12">
                            <FormField
                                v-model="edited.fermentationDays"
                                label="Fermentation Days"
                                type="number"
                                :required="true"
                                :readonly="isPreview"
                                placeholder="e.g. 14"
                                hint="Primary fermentation period in days"
                                prepend-icon="mdi-calendar-clock"
                            />
                        </v-col>
                        <v-col cols="12">
                            <FormField
                                v-model="edited.readingOG"
                                label="Original Gravity (OG)"
                                type="number"
                                :required="true"
                                :readonly="isPreview"
                                placeholder="e.g. 1.045"
                                hint="Initial sugar content measurement"
                                prepend-icon="mdi-scale"
                            />
                        </v-col>
                        <v-col cols="12">
                            <v-text-field
                                v-model="edited.startDateDate"
                                label="Start Date"
                                type="date"
                                variant="outlined"
                                class="mb-2 modern-field"
                                :required="true"
                                :readonly="isPreview"
                                :rules="[requiredRule]"
                                hint="When fermentation begins"
                                persistent-hint
                            >
                                <template #prepend-inner>
                                    <v-icon color="primary">mdi-calendar</v-icon>
                                </template>
                            </v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <FormField
                                v-model="edited.readingFG"
                                label="Final Gravity (FG)"
                                type="number"
                                :readonly="isPreview"
                                placeholder="e.g. 1.010"
                                hint="Final sugar content after fermentation (optional)"
                                prepend-icon="mdi-scale"
                            />
                        </v-col>
                        <v-col cols="12">
                            <FormField
                                v-model="edited.temp"
                                label="Fermentation Temperature (°C)"
                                type="number"
                                :required="true"
                                :readonly="isPreview"
                                placeholder="e.g. 20"
                                hint="Maintain consistent temperature for best results"
                                prepend-icon="mdi-thermometer"
                            />
                        </v-col>
                    </v-row>
                        </v-container>
                    </v-form>
            
            <template #actions>
                <v-spacer />
                <v-btn 
                    class="modern-btn-base modern-btn-secondary" 
                    @click="closeEdit"
                    prepend-icon="mdi-close"
                >
                    {{ isPreview ? 'Close' : 'Cancel' }}
                </v-btn>
                <v-btn 
                    v-if="!isPreview" 
                    class="modern-btn-base modern-btn-primary" 
                    @click="saveEdit" 
                    :disabled="!isFormValid"
                    prepend-icon="mdi-content-save"
                >
                    {{ isAdding ? 'Create Batch' : 'Update Batch' }}
                </v-btn>
            </template>
        </BaseDialog>

        <!-- Packaging Dialog -->
        <BaseDialog
            v-model="packDialog"
            :title="`Pack Batch: ${packingBatch ? getFermenterLabelById(packingBatch.fermenter) : ''}`"
            title-icon="mdi-package-variant"
            max-width="1000px"
            @close="closePackDialog"
        >
            <v-form v-if="packingBatch" ref="packFormRef" lazy-validation>
                <v-container>
                    <!-- Help Section for Packaging -->
                    <v-row>
                        <v-col cols="12">
                            <v-card variant="flat" class="help-card mb-6">
                                <v-card-title class="help-card-title">
                                    <v-icon class="help-icon">mdi-lightbulb-on</v-icon>
                                    <span>Packaging Guidelines</span>
                                    <v-spacer />
                                    <v-btn
                                        variant="text"
                                        size="small"
                                        @click="showPackagingHelp = !showPackagingHelp"
                                        :color="showPackagingHelp ? 'white' : 'rgba(255,255,255,0.7)'"
                                    >
                                        {{ showPackagingHelp ? 'Hide' : 'Show' }} Help
                                        <v-icon :class="{ 'rotate-180': showPackagingHelp }">mdi-chevron-down</v-icon>
                                    </v-btn>
                                </v-card-title>
                                <v-expand-transition>
                                    <v-card-text v-show="showPackagingHelp" class="help-card-content">
                                        <div class="help-grid">
                                            <div class="help-item">
                                                <div class="help-item-header">
                                                    <v-avatar size="40" class="help-avatar">
                                                        <v-icon color="white">mdi-package-variant</v-icon>
                                                    </v-avatar>
                                                    <h4>Container Types</h4>
                                                </div>
                                                <p>Choose appropriate containers for your brew. Common types: bottles (0.33L, 0.5L, 0.75L), growlers (1L, 2L), kegs (5L, 10L, 20L).</p>
                                            </div>
                                            
                                            <div class="help-item">
                                                <div class="help-item-header">
                                                    <v-avatar size="40" class="help-avatar">
                                                        <v-icon color="white">mdi-calculator</v-icon>
                                                    </v-avatar>
                                                    <h4>Volume Planning</h4>
                                                </div>
                                                <p>Total volume is calculated automatically. You can split your batch across multiple container types. Account for some loss during transfer (~5-10%).</p>
                                            </div>
                                            
                                            <div class="help-item">
                                                <div class="help-item-header">
                                                    <v-avatar size="40" class="help-avatar">
                                                        <v-icon color="white">mdi-note-text</v-icon>
                                                    </v-avatar>
                                                    <h4>Organization Tips</h4>
                                                </div>
                                                <p>Use notes to track different purposes: "Gift bottles", "Personal stock", "Competition entries", etc.</p>
                                            </div>
                                        </div>
                                    </v-card-text>
                                </v-expand-transition>
                            </v-card>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12">
                            <h3 class="mb-3 d-flex align-center">
                                <v-icon color="primary" class="mr-2">mdi-information</v-icon>
                                Batch Summary
                            </h3>
                            <v-card outlined class="mb-4 summary-card">
                                <v-card-text>
                                    <div class="d-flex justify-space-between align-center">
                                        <div>
                                            <div class="text-h6 font-weight-bold">{{ getFermenterLabelById(packingBatch.fermenter) }}</div>
                                            <div class="text-subtitle-2 text-medium-emphasis">Batch Identifier</div>
                                        </div>
                                        <div class="text-right">
                                            <div class="text-h6 font-weight-bold text-primary">{{ getTotalBrewAmount(packingBatch) }} L</div>
                                            <div class="text-subtitle-2 text-medium-emphasis">Available Brew</div>
                                        </div>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12">
                            <h3 class="mb-3 d-flex align-center">
                                <v-icon color="primary" class="mr-2">mdi-package-variant</v-icon>
                                Packaging Groups
                            </h3>
                        </v-col>
                    </v-row>

                    <v-row v-for="(group, idx) in packagingGroups" :key="idx" class="mb-4">
                        <v-col cols="12">
                            <PackagingGroup
                                v-model="packagingGroups[idx]"
                                :container-types="containerTypes"
                                :show-delete="packagingGroups.length > 1"
                                @delete="removePackagingGroup(idx)"
                            />
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12">
                            <v-btn 
                                class="modern-btn-base modern-btn-secondary modern-btn-small" 
                                @click="addPackagingGroup"
                                prepend-icon="mdi-plus"
                            >
                                Add Another Container Group
                            </v-btn>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12">
                            <v-alert 
                                :type="getTotalPackaged() > getTotalBrewAmount(packingBatch) ? 'error' : ((getTotalBrewAmount(packingBatch) - getTotalPackaged()) > 1 ? 'warning' : 'success')" 
                                class="mt-4"
                            >
                                <div><strong>Total packaged:</strong> {{ getTotalPackaged() }} L</div>
                                <div><strong>Remaining:</strong> {{ (getTotalBrewAmount(packingBatch) - getTotalPackaged()).toFixed(1) }} L</div>
                                <div v-if="getTotalPackaged() > getTotalBrewAmount(packingBatch)" class="mt-2">
                                    <strong>Error: You are trying to package {{ (getTotalPackaged() - getTotalBrewAmount(packingBatch)).toFixed(1) }}L more than available!</strong>
                                </div>
                                <div v-else-if="(getTotalBrewAmount(packingBatch) - getTotalPackaged()) > 1" class="mt-2">
                                    <small>You have {{ (getTotalBrewAmount(packingBatch) - getTotalPackaged()).toFixed(1) }}L remaining brew that won't be packaged. This could be intentional (testing, spillage, etc.)</small>
                                </div>
                                <div v-else-if="getTotalPackaged() < getTotalBrewAmount(packingBatch)" class="mt-2">
                                    <small>Good! Only {{ (getTotalBrewAmount(packingBatch) - getTotalPackaged()).toFixed(1) }}L remaining (within acceptable range).</small>
                                </div>
                                <div v-else class="mt-2">
                                    <small>Perfect! All available brew will be packaged.</small>
                                </div>
                            </v-alert>
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
            
            <template #actions>
                <v-spacer />
                <v-btn 
                    class="modern-btn-base modern-btn-secondary"
                    @click="closePackDialog"
                    prepend-icon="mdi-close"
                >
                    Cancel
                </v-btn>
                <v-btn 
                    class="modern-btn-base modern-btn-primary" 
                    @click="savePackaging" 
                    :disabled="!isPackFormValid"
                    prepend-icon="mdi-package-variant"
                >
                    Complete Packaging
                </v-btn>
            </template>
        </BaseDialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { isAmountSufficient } from '@/utils/units.js'
import StatCard from '@/components/StatCard.vue'
import HelpSection from '@/components/HelpSection.vue'
import EnhancedDataTable from '@/components/EnhancedDataTable.vue'
import ProgressDisplay from '@/components/ProgressDisplay.vue'
import PackagingGroup from '@/components/PackagingGroup.vue'

    // Help items for batch creation
    const batchHelpItems = ref([
        {
            icon: 'mdi-chef-hat',
            title: 'Recipe & Fermenter',
            description: 'Choose your recipe to define ingredients and the fermenter vessel for processing. These cannot be changed once the batch is created to maintain tracking integrity.'
        },
        {
            icon: 'mdi-calendar-clock',
            title: 'Fermentation Schedule',
            description: 'Set fermentation duration (typically 7-21 days) and start date. The system calculates completion dates automatically.'
        },
        {
            icon: 'mdi-scale',
            title: 'Gravity Readings',
            description: 'Original Gravity (OG): Initial sugar content (e.g., 1.045). Required for alcohol calculation. Final Gravity (FG): Final reading when fermentation completes (e.g., 1.010). Optional initially.'
        },
        {
            icon: 'mdi-thermometer',
            title: 'Temperature Control',
            description: 'Maintain consistent fermentation temperature. Ales: 18-22°C, Lagers: 8-12°C. Too high causes off-flavors, too low may stall fermentation.'
        }
    ])
    const headers = ref([
        { title: 'Recipe', value: 'recipe', sortable: true },
        { title: 'Fermenter', value: 'fermenter', sortable: true, width: '120px' },
        { title: 'Fermentation Days', value: 'fermentationDays', sortable: true, align: 'center', width: '140px' },
        { title: 'Start Date', value: 'startDate', sortable: true, width: '120px' },
        { title: 'End Date', value: 'endDate', sortable: true, width: '120px' },
        { title: 'OG', value: 'readingOG', sortable: true, align: 'center', width: '80px' },
        { title: 'FG', value: 'readingFG', sortable: true, align: 'center', width: '80px' },
        { title: 'ABV', value: 'abv', sortable: true, align: 'center', width: '80px' },
        { title: 'Progress', value: 'progress', sortable: false, align: 'center', width: '160px' },
        { title: 'Status', value: 'status', sortable: true, align: 'center', width: '120px' },
        { title: 'Actions', value: 'actions', sortable: false, align: 'center', width: '120px' }
    ]);

    // UI state for filtering & sorting
    const search = ref('')
    const activeFilter = ref('all')
    const sortDesc = ref(true)
    const loading = ref(false)

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
            // after fermentation - automatically becomes flavouring status
            return 'flavouring';
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
        return 'mdi-help-circle';
    }

    function getCustomActions(item) {
        const actions = []
        
        if (getStatus(item) === 'ready to pack') {
            actions.push({
                key: 'pack',
                icon: 'mdi-package-variant',
                color: 'primary'
            })
        }
        
        if (getStatus(item) !== 'packaged') {
            actions.push({
                key: 'menu',
                icon: 'mdi-dots-vertical',
                color: 'default'
            })
        }
        
        return actions
    }

    function handleCustomAction(actionKey, item, status = null) {
        if (actionKey === 'pack') {
            openPackDialog(item)
        } else if (actionKey === 'set-status') {
            // Handle status changes from the menu
            if (status) {
                setStatus(item, status)
                // Show notification for better UX
                dataStore.setNotification({
                    text: `Batch status updated to: ${status}`,
                    color: 'success',
                    delay: 3000
                })
            }
        } else if (actionKey === 'menu') {
            // Legacy fallback - shouldn't be used with new menu
            const action = confirm('Mark as failed? (Cancel for Ready to Pack)')
            if (action) {
                setStatus(item, 'failed')
            } else {
                setStatus(item, 'ready to pack')
            }
        }
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
    const showHelp = ref(false)

    // Packaging dialog state
    const packDialog = ref(false)
    const packingBatch = ref(null)
    const packagingGroups = ref([])
    const packFormRef = ref(null)
    const showPackagingHelp = ref(false)
    
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
    
    // Packaging validation rules
    const containerSizeRule = (v) => {
        if (v === undefined || v === null || v === '') return 'Required'
        const n = Number(v)
        if (!Number.isFinite(n) || n <= 0) return 'Must be a positive number'
        return true
    }
    
    const quantityRule = (group) => (v) => {
        if (v === undefined || v === null || v === '') return 'Required'
        const n = Number(v)
        if (!Number.isFinite(n) || n <= 0) return 'Must be a positive number'
        
        // Check if this group would exceed available brew
        const groupTotal = Number(group.containerSize) * n
        const otherGroupsTotal = packagingGroups.value
            .filter(g => g !== group)
            .reduce((total, g) => total + Number(getGroupTotal(g)), 0)
        const totalWithThisGroup = groupTotal + otherGroupsTotal
        const available = getTotalBrewAmount(packingBatch.value)
        
        if (totalWithThisGroup > available) {
            const maxAllowed = Math.floor((available - otherGroupsTotal) / Number(group.containerSize))
            return `Maximum ${maxAllowed} containers (would exceed available brew: ${available}L)`
        }
        
        return true
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
        
        const totalAvailable = getTotalBrewAmount(packingBatch.value)
        const totalPackaged = getTotalPackaged()
        
        // Check if total packaged exceeds available brew
        if (totalPackaged > totalAvailable) return false
        
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

        // Check if user hasn't used all brew and show warning (only if more than 1L remains)
        const totalBrew = getTotalBrewAmount(packingBatch.value)
        const totalPackaged = getTotalPackaged()
        const remaining = totalBrew - totalPackaged
        
        if (remaining > 1) {
            const confirmed = confirm(
                `You are packaging ${totalPackaged}L out of ${totalBrew}L available. ` +
                `${remaining.toFixed(1)}L will remain unpackaged. ` +
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
                        // Use unit conversion to properly compare amounts
                        return isAmountSufficient(item.quantity, item.unit, ingredient.amount, ingredient.unit)
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

.modern-field :deep(.v-field) {
    background: rgb(248 250 252);
    border: 1px solid rgb(226 232 240);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.modern-field :deep(.v-field:hover) {
    border-color: rgb(148 163 184);
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    transform: translateY(-1px);
}

.modern-field :deep(.v-input--focused .v-field) {
    border-color: rgb(99, 102, 241);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1), 0 4px 6px -1px rgb(0 0 0 / 0.1);
    background: white;
    transform: translateY(-1px);
}

.calculated-field :deep(.v-field) {
    background: rgb(240 253 244);
    border: 1px solid rgb(187 247 208);
}

.calculated-field :deep(.v-field__input) {
    color: rgb(22 101 52);
    font-weight: 600;
}

/* Packaging group styling */
.packaging-group-card {
    border: 2px solid rgb(226 232 240) !important;
    transition: all 0.3s ease;
    background: rgb(248 250 252);
}

.packaging-group-card:hover {
    border-color: rgb(99, 102, 241) !important;
    box-shadow: 0 8px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);
    transform: translateY(-2px);
}

/* Summary card styling */
.summary-card {
    background: linear-gradient(135deg, rgb(248 250 252) 0%, rgb(241 245 249) 100%);
    border: 2px solid rgb(99 102 241 / 0.2) !important;
    transition: all 0.3s ease;
}

.summary-card:hover {
    border-color: rgb(99, 102, 241) !important;
    box-shadow: 0 8px 25px -5px rgb(99 102 241 / 0.15), 0 4px 6px -2px rgb(0 0 0 / 0.05);
}

/* Modern page layout styles */
.batches-page {
    padding: 0 1rem;
    max-width: 1400px;
    margin: 0 auto;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 1rem;
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
    .batches-page {
        padding: 0 0.5rem;
    }
    
    .stats-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
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
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
    }
    
    .modern-data-table :deep(.v-data-table-header .v-data-table__th) {
        padding: 0.75rem 0.5rem;
        font-size: 0.65rem;
    }
    
    .modern-data-table :deep(.v-data-table__td) {
        padding: 0.75rem 0.5rem;
        font-size: 0.875rem;
    }
}
</style>