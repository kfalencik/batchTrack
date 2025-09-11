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
        { title: 'Fermenter', value: 'fermenter' },
        { title: 'Status', value: 'status' },
        { title: 'Fermentation Days', value: 'fermentationDays' },
        { title: 'Batch Start Date', value: 'startDate' },
        { title: 'Batch End Date', value: 'endDate' },
        { title: 'OG (%)', value: 'readingOG' },
        { title: 'FG (%)', value: 'readingFG' },
        { title: 'Pasteurised', value: 'pasteurised' },
        { title: 'Tax Paid',  value: 'taxPaid' }
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