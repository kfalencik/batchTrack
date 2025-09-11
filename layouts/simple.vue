<template>
    <div class="bg-lightGrey w-screen h-screen p-10">
        <NuxtLink class="text-center" to="/">
            <img class="mx-auto" src="/img/logo.png" alt="Hollenders Immobilien" style="height: 90px"/>
            <h1 class="text-primary text-center">BatchTrack</h1>
        </NuxtLink>

        <v-container>
            <div class="bg-white max-w-4xl mx-auto rounded-lg p-5 mt-10">
                <slot />
            </div>
        </v-container>
    </div>
</template>

<script setup>
    import nuxtStorage from 'nuxt-storage';
    import { useRouter } from "vue-router";
    import { useUserStore } from '@/stores/user';

    const userStore = useUserStore()
    const router = useRouter();
    const authenticated = nuxtStorage.localStorage ? nuxtStorage.localStorage.getData('authenticated') : false;
    userStore.authenticated = authenticated
    if (authenticated && !userStore.user && nuxtStorage.localStorage) {
        const user = nuxtStorage.localStorage.getData('user');
        userStore.user = user
        router.push("/dashboard");
    }
</script>