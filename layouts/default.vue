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
    /* Modern Data Table Global Overrides */
    .v-data-table {
        border-radius: 1rem !important;
        overflow: hidden !important;
        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) !important;
        
        .v-data-table__wrapper {
            border-radius: 1rem !important;
        }
        
        .v-data-table-header {
            background: rgb(248 250 252) !important;
            border-bottom: 1px solid rgb(226 232 240 / 0.5) !important;
            
            .v-data-table__th {
                font-weight: 600 !important;
                color: rgb(71 85 105) !important;
                text-transform: uppercase !important;
                letter-spacing: 0.05em !important;
                font-size: 0.75rem !important;
                padding: 1.25rem 1rem !important;
                border-bottom: none !important;
            }
        }
        
        .v-data-table__tr {
            border-bottom: 1px solid rgb(226 232 240 / 0.3) !important;
            transition: all 0.2s ease !important;
            
            &:nth-child(even) {
                background: rgb(248 250 252 / 0.3) !important;
            }
            
            &:hover {
                background: rgb(99 102 241 / 0.05) !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05) !important;
            }
            
            td {
                padding: 1.25rem 1rem !important;
                vertical-align: middle !important;
                border-bottom: none !important;
            }
        }
    }
    
    .v-data-table-footer {
        margin-top: 2rem !important;
        padding: 1rem !important;
        background: rgb(248 250 252) !important;
        border-top: 1px solid rgb(226 232 240 / 0.5) !important;
        font-size: 0.875rem !important;

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