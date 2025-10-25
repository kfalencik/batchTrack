<template>
    <div class="login-layout">
        <!-- Background Elements -->
        <div class="bg-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
        </div>

        <!-- Main Content -->
        <div class="login-container">
            <!-- Header Section -->
            <div class="login-header">
                <div class="logo-container">
                    <img src="/img/logo.png" alt="BatchTrack Logo" class="logo-image"/>
                    <div class="logo-glow"></div>
                </div>
                <h1 class="brand-title">BatchTrack</h1>
                <p class="brand-subtitle">Professional Brewing Management</p>
            </div>

            <!-- Login Form Container -->
            <div class="form-container">
                <slot />
            </div>

            <!-- Footer -->
            <div class="login-footer">
                <p class="footer-text">
                    Streamline your brewing operations with confidence
                </p>
                <div class="feature-list">
                    <div class="feature-item">
                        <v-icon size="16" color="#36a367">mdi-check-circle</v-icon>
                        <span>Real-time batch tracking</span>
                    </div>
                    <div class="feature-item">
                        <v-icon size="16" color="#36a367">mdi-check-circle</v-icon>
                        <span>Inventory management</span>
                    </div>
                    <div class="feature-item">
                        <v-icon size="16" color="#36a367">mdi-check-circle</v-icon>
                        <span>Production analytics</span>
                    </div>
                </div>
            </div>
        </div>
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

<style scoped>
.login-layout {
    min-height: 100vh;
    width: 100vw;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    overflow: hidden;
}

/* Animated Background Shapes */
.bg-shapes {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;
}

.shape {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 6s ease-in-out infinite;
}

.shape-1 {
    width: 200px;
    height: 200px;
    top: 10%;
    left: 10%;
    animation-delay: 0s;
}

.shape-2 {
    width: 150px;
    height: 150px;
    top: 70%;
    right: 10%;
    animation-delay: 2s;
}

.shape-3 {
    width: 100px;
    height: 100px;
    top: 40%;
    right: 30%;
    animation-delay: 4s;
}

@keyframes float {
    0%, 100% {
        transform: translateY(0px) rotate(0deg);
        opacity: 0.7;
    }
    50% {
        transform: translateY(-20px) rotate(180deg);
        opacity: 0.3;
    }
}

/* Main Container */
.login-container {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 2rem;
    padding: 3rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    max-width: 500px;
    width: 100%;
    position: relative;
    z-index: 1;
    animation: slideUp 0.8s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Header Section */
.login-header {
    text-align: center;
    margin-bottom: 2.5rem;
}

.logo-container {
    position: relative;
    display: inline-block;
    margin-bottom: 1.5rem;
}

.logo-image {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    box-shadow: 0 8px 32px rgba(54, 163, 103, 0.3);
    transition: transform 0.3s ease;
    position: relative;
    z-index: 2;
}

.logo-glow {
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    background: linear-gradient(135deg, #36a367, #6366f1);
    border-radius: 50%;
    opacity: 0.2;
    animation: pulse 2s ease-in-out infinite;
    z-index: 1;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        opacity: 0.2;
    }
    50% {
        transform: scale(1.1);
        opacity: 0.4;
    }
}

.brand-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #36a367, #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
}

.brand-subtitle {
    font-size: 1rem;
    color: #6b7280;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

/* Form Container */
.form-container {
    margin-bottom: 2rem;
}

/* Footer */
.login-footer {
    text-align: center;
    border-top: 1px solid #e5e7eb;
    padding-top: 1.5rem;
}

.footer-text {
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    font-weight: 500;
}

.feature-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #374151;
    font-size: 0.875rem;
    font-weight: 500;
}

/* Responsive Design */
@media (max-width: 640px) {
    .login-layout {
        padding: 1rem;
    }
    
    .login-container {
        padding: 2rem 1.5rem;
        max-width: 100%;
        margin: 0 1rem;
    }
    
    .brand-title {
        font-size: 2rem;
    }
    
    .feature-list {
        gap: 0.25rem;
    }
    
    .feature-item {
        font-size: 0.8rem;
    }
}

@media (max-width: 480px) {
    .login-container {
        padding: 1.5rem 1rem;
        border-radius: 1.5rem;
    }
    
    .logo-image {
        width: 60px;
        height: 60px;
    }
    
    .brand-title {
        font-size: 1.75rem;
    }
}
</style>