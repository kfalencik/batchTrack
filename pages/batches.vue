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
    const headers = [
        { title: 'Fermenter', value: 'fermenter', prefix: 'Fermentor #' },
        { title: 'Status', value: 'status' },
        { title: 'Fermentation Days', value: 'fermentationDays', suffix: ' days' },
        { title: 'Batch Start Date', value: 'startDate' },
        { title: 'Batch End Date', value: 'endDate' },
        { title: 'OG (°)', value: 'readingOG', suffix: '°', align: 'center' },
        { title: 'FG (°)', value: 'readingFG', suffix: '°', align: 'center' },
        { title: 'Pasteurised', value: 'pasteurised', align: 'center' },
        { title: 'Tax Paid',  value: 'taxPaid', align: 'center' },
        { title: 'Actions', value: 'actions' }
    ];

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
            const header = headers.find(h => h.value === key);
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

    onMounted(() => {
        dataStore.getBatches()
    })

    const batches = computed(() => dataStore.batches)

    definePageMeta({
        layout: 'default'
    })
    useHead({
        title: 'Batches | BatchTrack',
    })
</script>