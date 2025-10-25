<template>
    <div class="login-form">
        <!-- Welcome Section -->
        <div class="welcome-section">
            <h2 class="welcome-title">Welcome Back</h2>
            <p class="welcome-subtitle">Access your brewing dashboard with your credentials</p>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="error-container">
            <v-alert
                class="error-alert"
                text="We could not sign you in — the details you entered are not correct. Please try again."
                title="Authentication Failed"
                type="error"
                variant="tonal"
                closable
                @click:close="error = false"
            >
                <template #prepend>
                    <v-icon>mdi-alert-circle</v-icon>
                </template>
            </v-alert>
        </div>

        <!-- Login Form -->
        <v-form v-model="valid" lazy-validation class="login-form-container">
            <!-- Email Field -->
            <div class="form-field">
                <v-text-field
                    v-model="email"
                    label="Email Address"
                    placeholder="Enter your email address"
                    type="email"
                    name="email"
                    variant="outlined"
                    class="modern-input"
                    :rules="[rules.rules.email]"
                    required
                    clearable
                >
                    <template #prepend-inner>
                        <v-icon color="#36a367" size="20">mdi-email-outline</v-icon>
                    </template>
                </v-text-field>
            </div>

            <!-- Password Field -->
            <div class="form-field">
                <v-text-field
                    v-model="password"
                    label="Password"
                    :type="showPassword ? 'text' : 'password'"
                    name="password"
                    variant="outlined"
                    class="modern-input"
                    :rules="[rules.rules.required]"
                    required
                    clearable
                >
                    <template #prepend-inner>
                        <v-icon color="#36a367" size="20">mdi-lock-outline</v-icon>
                    </template>
                    <template #append-inner>
                        <v-btn
                            icon
                            variant="plain"
                            size="small"
                            @click="showPassword = !showPassword"
                        >
                            <v-icon size="20">
                                {{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}
                            </v-icon>
                        </v-btn>
                    </template>
                </v-text-field>
            </div>

            <!-- Additional Options -->
            <div class="form-options">
                <v-checkbox
                    v-model="rememberMe"
                    label="Remember me"
                    class="remember-checkbox"
                    hide-details
                ></v-checkbox>
                <NuxtLink to="/forgot-password" class="forgot-password">Forgot password?</NuxtLink>
            </div>

            <!-- Submit Button -->
            <div class="submit-section">
                <v-btn
                    @click="signIn()"
                    :disabled="!valid || loading"
                    :loading="loading"
                    class="signin-btn"
                    size="large"
                    block
                >
                    <template #prepend>
                        <v-icon>mdi-login</v-icon>
                    </template>
                    Sign In to Dashboard
                </v-btn>
            </div>

            <!-- Demo Notice -->
            <div class="demo-notice">
                <v-icon size="16" color="#6b7280">mdi-information-outline</v-icon>
                <span>This is a demo application for brewing management</span>
            </div>
        </v-form>
    </div>
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
    const loading = ref(false)
    const showPassword = ref(false)
    const rememberMe = ref(false)

    const authenticated = nuxtStorage.localStorage ? nuxtStorage.localStorage.getData('authenticated') : false;

    userStore.authenticated = authenticated
    if (authenticated && !userStore.user && nuxtStorage.localStorage) {
        const user = nuxtStorage.localStorage.getData('user');
        userStore.user = user
        router.push("/dashboard");
    }

    const signIn = async () => {
        error.value = false
        loading.value = true
        
        try {
            await userStore.login(email.value, password.value)
            if (userStore.authenticated) {
                router.push("/dashboard");
            } else {
                error.value = true
            }
        } catch (err) {
            error.value = true
        } finally {
            loading.value = false
        }
    }
</script>

<style scoped>
.login-form {
    width: 100%;
}

/* Welcome Section */
.welcome-section {
    text-align: center;
    margin-bottom: 2rem;
}

.welcome-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #36a367, #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.welcome-subtitle {
    color: #6b7280;
    font-size: 0.95rem;
    font-weight: 500;
    line-height: 1.5;
}

/* Error Container */
.error-container {
    margin-bottom: 1.5rem;
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.error-alert {
    border-radius: 0.75rem !important;
    border: 1px solid rgba(239, 68, 68, 0.2) !important;
}

/* Form Container */
.login-form-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

/* Form Fields */
.form-field {
    position: relative;
}

.modern-input :deep(.v-field) {
    border-radius: 0.75rem !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
    border: 2px solid #e5e7eb !important;
    transition: all 0.3s ease !important;
}

.modern-input :deep(.v-field:hover) {
    border-color: #36a367 !important;
    box-shadow: 0 4px 12px rgba(54, 163, 103, 0.1) !important;
}

.modern-input :deep(.v-field--focused) {
    border-color: #36a367 !important;
    box-shadow: 0 0 0 3px rgba(54, 163, 103, 0.1) !important;
}

.modern-input :deep(.v-field__input) {
    padding: 1rem 0.75rem !important;
    font-size: 0.95rem !important;
    font-weight: 500 !important;
}

.modern-input :deep(.v-label) {
    font-weight: 600 !important;
    color: #374151 !important;
}

.modern-input :deep(.v-field__prepend-inner) {
    padding-left: 0.75rem !important;
}

.modern-input :deep(.v-field__append-inner) {
    padding-right: 0.5rem !important;
}

/* Form Options */
.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: -0.5rem 0 0.5rem 0;
}

.remember-checkbox :deep(.v-selection-control) {
    min-height: auto !important;
}

.remember-checkbox :deep(.v-label) {
    font-size: 0.875rem !important;
    font-weight: 500 !important;
    color: #6b7280 !important;
}

.forgot-password {
    color: #36a367;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 600;
    transition: color 0.3s ease;
}

.forgot-password:hover {
    color: #2d8653;
    text-decoration: underline;
}

/* Submit Section */
.submit-section {
    margin-top: 1rem;
}

.signin-btn {
    background: linear-gradient(135deg, #36a367, #2d8653) !important;
    color: white !important;
    border-radius: 0.75rem !important;
    padding: 1rem 2rem !important;
    font-weight: 600 !important;
    font-size: 0.95rem !important;
    letter-spacing: 0.025em !important;
    box-shadow: 0 4px 16px rgba(54, 163, 103, 0.3) !important;
    transition: all 0.3s ease !important;
    text-transform: none !important;
}

.signin-btn:hover {
    box-shadow: 0 6px 20px rgba(54, 163, 103, 0.4) !important;
    transform: translateY(-1px) !important;
}

.signin-btn:disabled {
    opacity: 0.6 !important;
    transform: none !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

/* Demo Notice */
.demo-notice {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1.5rem;
    padding: 0.75rem;
    background: rgba(107, 114, 128, 0.05);
    border-radius: 0.5rem;
    border: 1px solid rgba(107, 114, 128, 0.1);
}

.demo-notice span {
    font-size: 0.8rem;
    color: #6b7280;
    font-weight: 500;
}

/* Loading State */
.signin-btn.v-btn--loading {
    pointer-events: none;
}

.signin-btn :deep(.v-btn__loader) {
    color: white;
}

/* Responsive Design */
@media (max-width: 480px) {
    .welcome-title {
        font-size: 1.5rem;
    }
    
    .welcome-subtitle {
        font-size: 0.875rem;
    }
    
    .form-options {
        flex-direction: column;
        gap: 0.75rem;
        align-items: flex-start;
    }
    
    .signin-btn {
        padding: 0.875rem 1.5rem !important;
        font-size: 0.9rem !important;
    }
}

/* Animation for form elements */
.form-field {
    animation: fadeInUp 0.6s ease-out backwards;
}

.form-field:nth-child(1) { animation-delay: 0.1s; }
.form-field:nth-child(2) { animation-delay: 0.2s; }
.form-options { animation: fadeInUp 0.6s ease-out 0.3s backwards; }
.submit-section { animation: fadeInUp 0.6s ease-out 0.4s backwards; }
.demo-notice { animation: fadeInUp 0.6s ease-out 0.5s backwards; }

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>

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