<template>
    <v-card class="pa-4">
        <v-card-title>Currency Demo</v-card-title>
        <v-card-text>
            <p><strong>Raw amount:</strong> 1234.56</p>
            <p><strong>Formatted currency:</strong> {{ formatCurrency(1234.56) }}</p>
            <p><strong>Currency symbol:</strong> {{ getCurrencySymbol() }}</p>
            <p><strong>Currency code:</strong> {{ getCurrencyCode() }}</p>
        </v-card-text>
    </v-card>
</template>

<script setup>
const { formatCurrency, getCurrencySymbol, getCurrencyCode } = useCurrency()
</script>