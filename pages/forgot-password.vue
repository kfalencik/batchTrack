<template>
    <div class="forgot-password-form">
        <!-- Header Section -->
        <div class="header-section">
            <div class="back-button-container">
                <NuxtLink to="/" class="back-button">
                    <v-icon size="20">mdi-arrow-left</v-icon>
                    <span>Back to Sign In</span>
                </NuxtLink>
            </div>
            
            <div class="welcome-section">
                <div class="icon-container">
                    <v-icon size="48" color="#36a367">mdi-lock-reset</v-icon>
                </div>
                <h2 class="welcome-title">Reset Your Password</h2>
                <p class="welcome-subtitle">
                    Enter your email address and we'll send you a link to reset your password
                </p>
            </div>
        </div>

        <!-- Success Message -->
        <div v-if="emailSent" class="success-container">
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
                    <h3 class="success-title">Email Sent Successfully!</h3>
                    <p class="success-text">
                        We've sent a password reset link to <strong>{{ email }}</strong>. 
                        Please check your email inbox and follow the instructions to reset your password.
                    </p>
                    <p class="success-note">
                        Didn't receive the email? Check your spam folder or 
                        <button @click="resendEmail" class="resend-link" :disabled="loading">
                            click here to resend
                        </button>
                    </p>
                </div>
            </v-alert>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="error-container">
            <v-alert
                class="error-alert"
                :text="errorMessage"
                title="Reset Failed"
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
        <div v-if="!emailSent">
            <v-form v-model="valid" lazy-validation class="reset-form-container">
                <!-- Email Field -->
                <div class="form-field">
                    <v-text-field
                        v-model="email"
                        label="Email Address"
                        placeholder="Enter your registered email address"
                        type="email"
                        name="email"
                        variant="outlined"
                        class="modern-input"
                        :rules="[rules.rules.email]"
                        required
                        clearable
                        autofocus
                    >
                        <template #prepend-inner>
                            <v-icon color="#36a367" size="20">mdi-email-outline</v-icon>
                        </template>
                    </v-text-field>
                    <div class="field-hint">
                        <v-icon size="14" color="#6b7280">mdi-information-outline</v-icon>
                        <span>We'll send reset instructions to this email address</span>
                    </div>
                </div>

                <!-- Submit Button -->
                <div class="submit-section">
                    <v-btn
                        @click="sendResetEmail()"
                        :disabled="!valid || loading"
                        :loading="loading"
                        class="reset-btn"
                        size="large"
                        block
                    >
                        <template #prepend>
                            <v-icon>mdi-email-send</v-icon>
                        </template>
                        Send Reset Instructions
                    </v-btn>
                </div>
            </v-form>
        </div>

        <!-- Alternative Actions -->
        <div v-if="!emailSent" class="alternative-actions">
            <div class="divider">
                <span>or</span>
            </div>
            
            <div class="action-buttons">
                <NuxtLink to="/" class="action-link">
                    <v-icon size="16">mdi-login</v-icon>
                    <span>Try signing in again</span>
                </NuxtLink>
                
                <a href="mailto:support@batchtrack.com" class="action-link">
                    <v-icon size="16">mdi-help-circle</v-icon>
                    <span>Contact support</span>
                </a>
            </div>
        </div>

        <!-- Return to Login (after email sent) -->
        <div v-if="emailSent" class="return-section">
            <NuxtLink to="/" class="return-button">
                <v-icon>mdi-arrow-left</v-icon>
                <span>Return to Sign In</span>
            </NuxtLink>
        </div>

        <!-- Security Notice -->
        <div class="security-notice">
            <v-icon size="16" color="#6b7280">mdi-shield-check</v-icon>
            <span>Your account security is important to us. Reset links expire in 24 hours.</span>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { rules } from '../helpers/rules';

definePageMeta({
    layout: 'simple'
});

useHead({
    title: 'Reset Password | BatchTrack',
    meta: [
        { name: 'description', content: 'Reset your BatchTrack password securely' }
    ]
});

const valid = ref(false);
const email = ref('');
const error = ref(false);
const errorMessage = ref('');
const loading = ref(false);
const emailSent = ref(false);

const sendResetEmail = async () => {
    error.value = false;
    loading.value = true;
    
    try {
        // Simulate API call to send reset email
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // For demo purposes, always succeed
        // In real implementation, this would call your password reset API
        
        emailSent.value = true;
        
        // Optional: You could implement actual password reset logic here
        // await $fetch('/api/auth/forgot-password', {
        //     method: 'POST',
        //     body: { email: email.value }
        // });
        
    } catch (err) {
        error.value = true;
        errorMessage.value = 'Failed to send reset email. Please try again or contact support.';
    } finally {
        loading.value = false;
    }
};

const resendEmail = async () => {
    if (loading.value) return;
    
    loading.value = true;
    
    try {
        // Simulate resend API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success feedback (you could add a toast notification here)
        console.log('Reset email resent successfully');
        
    } catch (err) {
        error.value = true;
        errorMessage.value = 'Failed to resend email. Please try again.';
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.forgot-password-form {
    width: 100%;
}

/* Header Section */
.header-section {
    margin-bottom: 2rem;
}

.back-button-container {
    margin-bottom: 1.5rem;
}

.back-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #6b7280;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.5rem 0;
    transition: color 0.3s ease;
}

.back-button:hover {
    color: #36a367;
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
    margin-bottom: 0.75rem;
}

.success-note {
    color: #6b7280;
    font-size: 0.85rem;
    line-height: 1.4;
}

.resend-link {
    background: none;
    border: none;
    color: #36a367;
    text-decoration: underline;
    cursor: pointer;
    font-size: inherit;
    font-weight: 600;
    transition: color 0.3s ease;
}

.resend-link:hover:not(:disabled) {
    color: #2d8653;
}

.resend-link:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

.field-hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #6b7280;
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

/* Alternative Actions */
.alternative-actions {
    margin-top: 2rem;
}

.divider {
    text-align: center;
    margin: 1.5rem 0;
    position: relative;
}

.divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e5e7eb;
}

.divider span {
    background: rgba(255, 255, 255, 0.95);
    color: #6b7280;
    padding: 0 1rem;
    font-size: 0.875rem;
    font-weight: 500;
}

.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.action-link {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    color: #6b7280;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    transition: all 0.3s ease;
}

.action-link:hover {
    color: #36a367;
    border-color: #36a367;
    background: rgba(54, 163, 103, 0.02);
}

/* Return Section */
.return-section {
    margin-top: 2rem;
    text-align: center;
}

.return-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #36a367;
    text-decoration: none;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    border: 2px solid #36a367;
    border-radius: 0.75rem;
    transition: all 0.3s ease;
}

.return-button:hover {
    background: #36a367;
    color: white;
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

.submit-section { 
    animation: fadeInUp 0.6s ease-out 0.1s backwards; 
}

.alternative-actions { 
    animation: fadeInUp 0.6s ease-out 0.2s backwards; 
}

.security-notice { 
    animation: fadeInUp 0.6s ease-out 0.3s backwards; 
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
    
    .action-buttons {
        gap: 0.5rem;
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