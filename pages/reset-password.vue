<template>
    <div class="reset-password-form">
        <!-- Header Section -->
        <div class="header-section">
            <div class="welcome-section">
                <div class="icon-container">
                    <v-icon size="48" color="#36a367">mdi-lock-reset</v-icon>
                </div>
                <h2 class="welcome-title">Create New Password</h2>
                <p class="welcome-subtitle">
                    Enter your new password below. Make sure it's strong and secure.
                </p>
            </div>
        </div>

        <!-- Token Invalid/Expired -->
        <div v-if="tokenInvalid" class="token-error-container">
            <v-alert
                class="token-error-alert"
                type="error"
                variant="tonal"
                prominent
            >
                <template #prepend>
                    <v-icon>mdi-clock-alert</v-icon>
                </template>
                <div class="token-error-content">
                    <h3 class="error-title">Reset Link Invalid or Expired</h3>
                    <p class="error-text">
                        This password reset link has expired or is no longer valid. 
                        Please request a new password reset link to continue.
                    </p>
                    <div class="error-actions">
                        <NuxtLink to="/forgot-password" class="request-new-btn">
                            Request New Reset Link
                        </NuxtLink>
                    </div>
                </div>
            </v-alert>
        </div>

        <!-- Success Message -->
        <div v-if="passwordReset" class="success-container">
            <v-alert
                class="success-alert"
                type="success"
                variant="tonal"
                prominent
            >
                <template #prepend>
                    <v-icon>mdi-check-circle</v-icon>
                </template>
                <div class="success-content">
                    <h3 class="success-title">Password Reset Successfully!</h3>
                    <p class="success-text">
                        Your password has been updated successfully. You can now sign in with your new password.
                    </p>
                    <div class="success-actions">
                        <NuxtLink to="/" class="signin-btn-success">
                            Sign In Now
                        </NuxtLink>
                    </div>
                </div>
            </v-alert>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="error-container">
            <v-alert
                class="error-alert"
                :text="errorMessage"
                title="Password Reset Failed"
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

        <!-- Reset Form -->
        <div v-if="!tokenInvalid && !passwordReset">
            <v-form v-model="valid" lazy-validation class="reset-form-container">
                <!-- New Password Field -->
                <div class="form-field">
                    <v-text-field
                        v-model="password"
                        label="New Password"
                        :type="showPassword ? 'text' : 'password'"
                        name="password"
                        variant="outlined"
                        class="modern-input"
                        :rules="passwordRules"
                        required
                        clearable
                        autofocus
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
                    
                    <!-- Password Strength Indicator -->
                    <div class="password-strength">
                        <div class="strength-bar">
                            <div 
                                class="strength-fill" 
                                :class="passwordStrength.class"
                                :style="{ width: passwordStrength.percentage + '%' }"
                            ></div>
                        </div>
                        <span class="strength-text" :class="passwordStrength.class">
                            {{ passwordStrength.text }}
                        </span>
                    </div>
                    
                    <!-- Password Requirements -->
                    <div class="password-requirements">
                        <div class="requirement" :class="{ active: requirements.length }">
                            <v-icon size="12">{{ requirements.length ? 'mdi-check' : 'mdi-circle-outline' }}</v-icon>
                            <span>At least 8 characters</span>
                        </div>
                        <div class="requirement" :class="{ active: requirements.uppercase }">
                            <v-icon size="12">{{ requirements.uppercase ? 'mdi-check' : 'mdi-circle-outline' }}</v-icon>
                            <span>One uppercase letter</span>
                        </div>
                        <div class="requirement" :class="{ active: requirements.lowercase }">
                            <v-icon size="12">{{ requirements.lowercase ? 'mdi-check' : 'mdi-circle-outline' }}</v-icon>
                            <span>One lowercase letter</span>
                        </div>
                        <div class="requirement" :class="{ active: requirements.number }">
                            <v-icon size="12">{{ requirements.number ? 'mdi-check' : 'mdi-circle-outline' }}</v-icon>
                            <span>One number</span>
                        </div>
                    </div>
                </div>

                <!-- Confirm Password Field -->
                <div class="form-field">
                    <v-text-field
                        v-model="confirmPassword"
                        label="Confirm New Password"
                        :type="showConfirmPassword ? 'text' : 'password'"
                        name="confirmPassword"
                        variant="outlined"
                        class="modern-input"
                        :rules="confirmPasswordRules"
                        required
                        clearable
                    >
                        <template #prepend-inner>
                            <v-icon color="#36a367" size="20">mdi-lock-check-outline</v-icon>
                        </template>
                        <template #append-inner>
                            <v-btn
                                icon
                                variant="plain"
                                size="small"
                                @click="showConfirmPassword = !showConfirmPassword"
                            >
                                <v-icon size="20">
                                    {{ showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye' }}
                                </v-icon>
                            </v-btn>
                        </template>
                    </v-text-field>
                </div>

                <!-- Submit Button -->
                <div class="submit-section">
                    <v-btn
                        @click="resetPassword()"
                        :disabled="!valid || loading"
                        :loading="loading"
                        class="reset-btn"
                        size="large"
                        block
                    >
                        <template #prepend>
                            <v-icon>mdi-content-save</v-icon>
                        </template>
                        Update Password
                    </v-btn>
                </div>
            </v-form>
        </div>

        <!-- Back to Login -->
        <div v-if="!passwordReset" class="back-section">
            <NuxtLink to="/" class="back-link">
                <v-icon size="16">mdi-arrow-left</v-icon>
                <span>Back to Sign In</span>
            </NuxtLink>
        </div>

        <!-- Security Notice -->
        <div class="security-notice">
            <v-icon size="16" color="#6b7280">mdi-shield-check</v-icon>
            <span>For your security, you'll be signed out of all devices after password reset.</span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

definePageMeta({
    layout: 'simple'
});

useHead({
    title: 'Reset Password | BatchTrack',
    meta: [
        { name: 'description', content: 'Set a new password for your BatchTrack account' }
    ]
});

const route = useRoute();

const valid = ref(false);
const password = ref('');
const confirmPassword = ref('');
const error = ref(false);
const errorMessage = ref('');
const loading = ref(false);
const passwordReset = ref(false);
const tokenInvalid = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Check if reset token is valid on page load
const resetToken = route.query.token;
if (!resetToken) {
    tokenInvalid.value = true;
}

// Password validation requirements
const requirements = computed(() => ({
    length: password.value.length >= 8,
    uppercase: /[A-Z]/.test(password.value),
    lowercase: /[a-z]/.test(password.value),
    number: /\d/.test(password.value)
}));

const passwordStrength = computed(() => {
    const score = Object.values(requirements.value).filter(Boolean).length;
    
    if (score === 0) return { class: '', text: '', percentage: 0 };
    if (score === 1) return { class: 'weak', text: 'Weak', percentage: 25 };
    if (score === 2) return { class: 'fair', text: 'Fair', percentage: 50 };
    if (score === 3) return { class: 'good', text: 'Good', percentage: 75 };
    return { class: 'strong', text: 'Strong', percentage: 100 };
});

const passwordRules = [
    v => !!v || 'Password is required',
    v => v.length >= 8 || 'Password must be at least 8 characters',
    v => /[A-Z]/.test(v) || 'Password must contain at least one uppercase letter',
    v => /[a-z]/.test(v) || 'Password must contain at least one lowercase letter',
    v => /\d/.test(v) || 'Password must contain at least one number'
];

const confirmPasswordRules = [
    v => !!v || 'Please confirm your password',
    v => v === password.value || 'Passwords do not match'
];

const resetPassword = async () => {
    error.value = false;
    loading.value = true;
    
    try {
        // Simulate API call to reset password
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demo purposes, always succeed
        // In real implementation, this would call your password reset API
        
        passwordReset.value = true;
        
        // Optional: You could implement actual password reset logic here
        // await $fetch('/api/auth/reset-password', {
        //     method: 'POST',
        //     body: { 
        //         token: resetToken,
        //         password: password.value 
        //     }
        // });
        
    } catch (err) {
        error.value = true;
        errorMessage.value = 'Failed to reset password. Please try again or request a new reset link.';
    } finally {
        loading.value = false;
    }
};

// Simulate token validation on mount
onMounted(async () => {
    if (resetToken) {
        try {
            // Simulate token validation
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // For demo, randomly determine if token is valid
            // In real implementation, validate token with your API
            const isValid = Math.random() > 0.2; // 80% chance of valid token
            
            if (!isValid) {
                tokenInvalid.value = true;
            }
        } catch (err) {
            tokenInvalid.value = true;
        }
    }
});
</script>

<style scoped>
.reset-password-form {
    width: 100%;
}

/* Header Section */
.header-section {
    margin-bottom: 2rem;
}

.welcome-section {
    text-align: center;
}

.icon-container {
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
}

.welcome-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.75rem;
    background: linear-gradient(135deg, #36a367, #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.welcome-subtitle {
    color: #6b7280;
    font-size: 0.95rem;
    font-weight: 500;
    line-height: 1.6;
    max-width: 400px;
    margin: 0 auto;
}

/* Token Error */
.token-error-container {
    margin-bottom: 2rem;
    animation: slideIn 0.4s ease-out;
}

.token-error-alert {
    border-radius: 0.75rem !important;
    border: 1px solid rgba(239, 68, 68, 0.2) !important;
}

.token-error-content {
    text-align: left;
}

.error-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
}

.error-text {
    color: #374151;
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 1rem;
}

.error-actions {
    margin-top: 1rem;
}

.request-new-btn {
    display: inline-block;
    background: #36a367;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.875rem;
    transition: background 0.3s ease;
}

.request-new-btn:hover {
    background: #2d8653;
}

/* Success Container */
.success-container {
    margin-bottom: 2rem;
    animation: slideIn 0.4s ease-out;
}

.success-alert {
    border-radius: 0.75rem !important;
    border: 1px solid rgba(34, 197, 94, 0.2) !important;
}

.success-content {
    text-align: left;
}

.success-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
}

.success-text {
    color: #374151;
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 1rem;
}

.success-actions {
    margin-top: 1rem;
}

.signin-btn-success {
    display: inline-block;
    background: linear-gradient(135deg, #36a367, #2d8653);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.875rem;
    transition: all 0.3s ease;
}

.signin-btn-success:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(54, 163, 103, 0.3);
}

/* Error Container */
.error-container {
    margin-bottom: 1.5rem;
    animation: slideIn 0.3s ease-out;
}

.error-alert {
    border-radius: 0.75rem !important;
    border: 1px solid rgba(239, 68, 68, 0.2) !important;
}

/* Form Container */
.reset-form-container {
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

/* Password Strength */
.password-strength {
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.strength-bar {
    flex: 1;
    height: 4px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
}

.strength-fill {
    height: 100%;
    transition: all 0.3s ease;
    border-radius: 2px;
}

.strength-fill.weak { background: #ef4444; }
.strength-fill.fair { background: #f59e0b; }
.strength-fill.good { background: #3b82f6; }
.strength-fill.strong { background: #10b981; }

.strength-text {
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 60px;
}

.strength-text.weak { color: #ef4444; }
.strength-text.fair { color: #f59e0b; }
.strength-text.good { color: #3b82f6; }
.strength-text.strong { color: #10b981; }

/* Password Requirements */
.password-requirements {
    margin-top: 0.75rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
}

.requirement {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #9ca3af;
    transition: color 0.3s ease;
}

.requirement.active {
    color: #10b981;
}

.requirement .v-icon {
    color: inherit;
}

/* Submit Section */
.submit-section {
    margin-top: 0.5rem;
}

.reset-btn {
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

.reset-btn:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(54, 163, 103, 0.4) !important;
    transform: translateY(-1px) !important;
}

.reset-btn:disabled {
    opacity: 0.6 !important;
    transform: none !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

/* Back Section */
.back-section {
    margin-top: 2rem;
    text-align: center;
}

.back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #6b7280;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: color 0.3s ease;
}

.back-link:hover {
    color: #36a367;
}

/* Security Notice */
.security-notice {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 2rem;
    padding: 0.75rem;
    background: rgba(107, 114, 128, 0.05);
    border-radius: 0.5rem;
    border: 1px solid rgba(107, 114, 128, 0.1);
}

.security-notice span {
    font-size: 0.8rem;
    color: #6b7280;
    font-weight: 500;
    text-align: center;
}

/* Animations */
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

/* Form elements animation */
.form-field {
    animation: fadeInUp 0.6s ease-out backwards;
}

.form-field:nth-child(1) { animation-delay: 0.1s; }
.form-field:nth-child(2) { animation-delay: 0.2s; }

.submit-section { 
    animation: fadeInUp 0.6s ease-out 0.3s backwards; 
}

.back-section { 
    animation: fadeInUp 0.6s ease-out 0.4s backwards; 
}

.security-notice { 
    animation: fadeInUp 0.6s ease-out 0.5s backwards; 
}

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

/* Responsive Design */
@media (max-width: 480px) {
    .welcome-title {
        font-size: 1.5rem;
    }
    
    .welcome-subtitle {
        font-size: 0.875rem;
    }
    
    .password-requirements {
        grid-template-columns: 1fr;
        gap: 0.25rem;
    }
    
    .reset-btn {
        padding: 0.875rem 1.5rem !important;
        font-size: 0.9rem !important;
    }
    
    .security-notice {
        padding: 0.5rem;
    }
    
    .security-notice span {
        font-size: 0.75rem;
        line-height: 1.4;
    }
}
</style>