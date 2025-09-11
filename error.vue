<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})
</script>

<template>
    <div class="bg-secondary w-screen h-screen p-5">
        <NuxtLink class="text-center" to="/">
            <img class="mx-auto" src="/img/logo.png" alt="Hollenders Immobilien" style="height: 90px"/>
        </NuxtLink>

        <v-container>
            <div class="bg-white max-w-4xl mx-auto rounded-lg p-10 mt-10">
                {{ error }}
                <v-alert
                    text="You have accessed a page that does not exist or is no longer available."
                    title="The page you are looking for does not exist"
                    type="warning"
                />
            </div>
        </v-container>
    </div>
</template>