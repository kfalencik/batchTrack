<template>
    <div class="w-auto rounded-2xl pt-5 px-4   h-full flex flex-col text-center justify-between">
        <img src="/public/img/logo.png" width="50" class="mx-auto" />
        <h1 class="text-primary">BatchTrack</h1>
        <div class="flex flex-col mt-10 items-start justify-start h-[80vh]">
            <v-btn to="dashboard" variant="outline" class="my-1 w-full justify-start text-left" color="black">
                <v-icon size="small" class="mr-2">mdi-home</v-icon>
                <span>Dashboard</span>
            </v-btn>
            <v-btn to="fermenters" variant="outline" class="my-1 w-full justify-start text-left" color="black">
                <v-icon size="small" class="mr-2">mdi-beer</v-icon>
                <span>Fermenters</span>
            </v-btn>
            <v-btn to="batches" variant="outline" class="my-1 w-full justify-start text-left" color="black">
                <v-icon size="small" class="mr-2">mdi-barrel</v-icon>
                <span>Batches</span>
            </v-btn>
            <v-btn to="recipes" variant="outline" class="my-1 w-full justify-start text-left" color="black">
                <v-icon size="small" class="mr-2">mdi-chef-hat</v-icon>
                <span>Recipes</span>
            </v-btn>
            <v-btn to="stock" variant="outline" class="my-1 w-full justify-start text-left" color="black">
                <v-icon size="small" class="mr-2">mdi-clipboard-list-outline</v-icon>
                <span>Stock</span>
            </v-btn>
            <v-btn to="taxes" variant="outline" class="my-1 w-full justify-start text-left" color="black">
                <v-icon size="small" class="mr-2">mdi-cash-multiple</v-icon>
                <span>Taxes</span>
            </v-btn>
        </div>
        <div class="text-center">
            <v-btn @click="logout()" variant="plain" color="error" icon="mdi-logout" v-tooltip:top="'Sign Out'"></v-btn>
        </div>
    </div>
    
</template>

<script setup>
    import { useRouter } from "vue-router";
    const userStore = useUserStore()
    const router = useRouter();

    function logout() {
        userStore.logout()
        router.push('/')
    }
</script>

<style scoped>
    .v-btn {
        border-radius: 5px;
        text-align: left !important;
    }
    .v-btn--active {
        background-color: #36a367 !important;
        color: white !important;
    }
</style>