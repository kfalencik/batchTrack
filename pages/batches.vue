<template>
    <div>
        <h2 class="mb-5">Batches</h2>
        <v-data-table
            class="text-sm"
            :headers="headers"
            :items="batches"
        >
            <template #item.startDate="{ item }">
                <span v-if="item.startDate && item.startDate.seconds">
                    {{ new Date(item.startDate.seconds * 1000).toLocaleDateString() }}
                </span>
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
                <v-icon :color="item.pasteurised ? 'green' : 'grey'">{{ item.pasteurised ? 'mdi-check' : 'mdi-close' }}</v-icon>
            </template>
            <template #item.taxPaid="{ item }">
                <v-icon :color="item.taxPaid ? 'green' : 'grey'">{{ item.taxPaid ? 'mdi-check' : 'mdi-close' }}</v-icon>
            </template>
        </v-data-table>
    </div>
</template>

<script setup>
    const headers = [
        { title: 'Fermenter', value: 'fermenter', prefix: 'Fermenter #' },
        { title: 'Status', value: 'status' },
        { title: 'Fermentation Days', value: 'fermentationDays', suffix: ' days' },
        { title: 'Batch Start Date', value: 'startDate' },
        { title: 'Batch End Date', value: 'endDate' },
        { title: 'OG (°)', value: 'readingOG', suffix: '°' },
        { title: 'FG (°)', value: 'readingFG', suffix: '°' },
        { title: 'Pasteurised', value: 'pasteurised', align: 'center' },
        { title: 'Tax Paid',  value: 'taxPaid', align: 'center' }
    ];

    function getEndDate(item) {
        if (item && item.startDate && item.startDate.seconds && Number.isFinite(item.fermentationDays)) {
            const secs = item.startDate.seconds + (Number(item.fermentationDays) * 86400);
            return new Date(secs * 1000).toLocaleDateString();
        }
        return '';
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

            if (raw === null || raw === undefined || raw === '') return '';

            // Special numeric formatting for OG/FG (always x.xxx)
            if (key === 'readingOG' || key === 'readingFG') {
                const n = Number(raw);
                if (!Number.isFinite(n)) return '';
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