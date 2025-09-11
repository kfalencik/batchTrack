<template>
    <v-form class="bg-white max-w-4xl mx-auto rounded-lg" v-model="valid" lazy-validation>
        <v-container>
            <v-col cols="12">
                <p>Please provide your details to sign in:</p>
                <v-alert
                    v-if="error"
                    class="my-2 text-sm"
                    text="We could not sign you in — the details you entered are not correct. Please try again."
                    title="Incorrect Details"
                    type="error"
                />
            </v-col>
            <v-col cols="12">
                <v-text-field
                    v-model="email"
                    label="E-Mail"
                    placeholder=""
                    type="email"
                    name="email"
                    variant="outlined"
                    :rules="[rules.rules.email]"
                    required
                />
            </v-col>
            <v-col cols="12">
                <v-text-field
                    v-model="password"
                    label="Password"
                    type="password"
                    name="password"
                    variant="outlined"
                    :rules="[rules.rules.required]"
                    required
                />
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