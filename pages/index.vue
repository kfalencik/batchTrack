<template>
    <v-form class="bg-white max-w-4xl mx-auto rounded-lg" v-model="valid" lazy-validation>
        <v-container>
            <v-col cols="12">
                <h2 class="text-h4 mb-2">Welcome to BatchTrack</h2>
                <p class="text-body-1 mb-4">Please provide your credentials to access your brewing dashboard:</p>
                <v-alert
                    v-if="error"
                    class="my-4"
                    text="We could not sign you in — the details you entered are not correct. Please try again."
                    title="Incorrect Details"
                    type="error"
                    variant="tonal"
                />
            </v-col>
            <v-col cols="12">
                <v-text-field
                    v-model="email"
                    label="Email Address"
                    placeholder="Enter your email address"
                    type="email"
                    name="email"
                    variant="outlined"
                    class="modern-field"
                    :rules="[rules.rules.email]"
                    hint="Use your registered email address"
                    persistent-hint
                    required
                >
                    <template #prepend-inner>
                        <v-icon color="primary">mdi-email</v-icon>
                    </template>
                </v-text-field>
            </v-col>
            <v-col cols="12">
                <v-text-field
                    v-model="password"
                    label="Password"
                    type="password"
                    name="password"
                    variant="outlined"
                    class="modern-field"
                    :rules="[rules.rules.required]"
                    hint="Enter your secure password"
                    persistent-hint
                    required
                >
                    <template #prepend-inner>
                        <v-icon color="primary">mdi-lock</v-icon>
                    </template>
                </v-text-field>
            </v-col>
            <v-col cols="12" class="text-right">
                <v-btn color="black" :disabled="!valid" flat class="text-white" @click="signIn()">Sign In</v-btn>
            </v-col>
        </v-container>
    </v-form>
</template>

<script setup>
    import nuxtStorage from 'nuxt-storage';

    import { ref } from 'vue';
    import { rules } from '../helpers/rules'
    import { useRouter } from "vue-router";

    const userStore = useUserStore()

    definePageMeta({
        layout: 'simple'
    })

    useHead({
        title: 'Sign In | BatchTrack',
    })
    const router = useRouter();

    const valid = ref(false)
    const email = ref(null)
    const password = ref(null)
    const error = ref(false)

    const authenticated = nuxtStorage.localStorage ? nuxtStorage.localStorage.getData('authenticated') : false;

    userStore.authenticated = authenticated
    if (authenticated && !userStore.user && nuxtStorage.localStorage) {
        const user = nuxtStorage.localStorage.getData('user');
        userStore.user = user
        router.push("/dashboard");
    }

    const signIn = async () => {
        error.value = false
        await userStore.login(email.value, password.value)
        if (userStore.authenticated) {
            router.push("/dashboard");
        } else {
            error.value = true
        }
    }
</script>

<style scoped>
/* Modern form styling */
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

.modern-field :deep(.v-field__input) {
    font-weight: 500;
    color: rgb(15 23 42);
}

.modern-field :deep(.v-label) {
    color: rgb(100 116 139);
    font-weight: 600;
}

.modern-field :deep(.v-input--focused .v-label) {
    color: rgb(99, 102, 241);
}
</style>