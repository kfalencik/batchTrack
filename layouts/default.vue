<template>
    <div v-if="userStore.authenticated" class="bg-surface-0 border border-black/10  w-full h-screen rounded-3xl p-6 flex items-start gap-6 overflow-hidden" style="overflow: hidden;">
        <DashboardNav />
        <main class="bg-white w-full h-full rounded-xl p-10">
            <v-snackbar v-if="notification" v-model="notification" :color="notification.color || info" location="top">
                {{ notification.text }}
            </v-snackbar>
            <slot />
        </main>
    </div>
    <div v-if="userStore.authenticated === null" class="bg-lightGrey text-primary text-center p-5 w-screen h-screen">
    <img class="mx-auto" src="/img/logo.png" alt="Hollenders Immobilien" style="height: 90px"/>
        <v-progress-circular class="mt-5 fixed top-1/3" indeterminate></v-progress-circular>
    </div>
</template>

<script setup>
    import nuxtStorage from 'nuxt-storage';
    import { useRouter } from "vue-router";
    import { ref, computed } from 'vue';

    const userStore = useUserStore()
    const dataStore = useDataStore()
    const viewport = useViewport()
    const router = useRouter();

    const mobileMenu = ref(true)
    const notification = computed(() => {
        return dataStore.notification || userStore.notification
    })

    if (!nuxtStorage.localStorage || !nuxtStorage.localStorage.getData('authenticated')) {
        router.push('/')
    } else {
        userStore.authenticated = nuxtStorage.localStorage.getData('authenticated')
        userStore.user = nuxtStorage.localStorage.getData('user')
    }
    onMounted(() => {
        window.addEventListener('click', () => mobileMenu.value = true)
    })
</script>

<style>
    .v-data-table {
        &__tr {
            &:nth-child(odd) {
                background: #ddd;
                padding: 2px;
            }

            td {
                padding: 10px 16px !important;
            }
        }
    }
    .v-data-table-footer {
        margin-top: 40px;
        font-size: 12px;

        .v-select__selection-text {
            font-size: 12px;
        }
    }
    .menu-button {
        z-index: 10;
        left: 250px;
        bottom: 50px;
        position: absolute;
    }
    main {
        overflow: auto;
    }
    .menu, main, .menu-button{
        transition: all 0.1s linear;
        transform: translateX(0);
    }
    .mobile-menu {
        transform: translateX(-100%);
        width: 0px !important;
    }
    .mobile-main {
        width: 100% !important;
    }
    .mobile-button {
        transform: translateX(-250px);
    }
</style>