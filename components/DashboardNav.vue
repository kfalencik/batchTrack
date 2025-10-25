<template>
    <div class="nav-container">
        <!-- Header Section -->
        <div class="nav-header">
            <div class="logo-container">
                <img src="/public/img/logo.png" width="42" class="logo-image" />
            </div>
            <h1 class="brand-title">BatchTrack</h1>
            <div class="brand-subtitle">Brewing Management</div>
        </div>

        <!-- Navigation Links -->
        <nav class="nav-links">
            <NuxtLink to="/dashboard" class="nav-item" active-class="nav-item--active">
                <div class="nav-item__icon">
                    <v-icon size="20">mdi-view-dashboard-variant</v-icon>
                </div>
                <span class="nav-item__text">Dashboard</span>
                <div class="nav-item__indicator"></div>
            </NuxtLink>

            <NuxtLink to="/fermenters" class="nav-item" active-class="nav-item--active">
                <div class="nav-item__icon">
                    <v-icon size="20">mdi-beer</v-icon>
                </div>
                <span class="nav-item__text">Fermenters</span>
                <div class="nav-item__indicator"></div>
            </NuxtLink>

            <NuxtLink to="/batches" class="nav-item" active-class="nav-item--active">
                <div class="nav-item__icon">
                    <v-icon size="20">mdi-barrel</v-icon>
                </div>
                <span class="nav-item__text">Batches</span>
                <div class="nav-item__indicator"></div>
            </NuxtLink>

            <NuxtLink to="/recipes" class="nav-item" active-class="nav-item--active">
                <div class="nav-item__icon">
                    <v-icon size="20">mdi-chef-hat</v-icon>
                </div>
                <span class="nav-item__text">Recipes</span>
                <div class="nav-item__indicator"></div>
            </NuxtLink>

            <NuxtLink to="/stock" class="nav-item" active-class="nav-item--active">
                <div class="nav-item__icon">
                    <v-icon size="20">mdi-clipboard-list-outline</v-icon>
                </div>
                <span class="nav-item__text">Ingredients</span>
                <div class="nav-item__indicator"></div>
            </NuxtLink>

            <NuxtLink to="/products" class="nav-item" active-class="nav-item--active">
                <div class="nav-item__icon">
                    <v-icon size="20">mdi-package-variant-closed</v-icon>
                </div>
                <span class="nav-item__text">Products</span>
                <div class="nav-item__indicator"></div>
            </NuxtLink>

            <NuxtLink to="/taxes" class="nav-item" active-class="nav-item--active">
                <div class="nav-item__icon">
                    <v-icon size="20">mdi-cash-multiple</v-icon>
                </div>
                <span class="nav-item__text">Taxes</span>
                <div class="nav-item__indicator"></div>
            </NuxtLink>
        </nav>

        <!-- Footer Section -->
        <div class="nav-footer">
            <div class="user-section">
                <div class="user-avatar">
                    <v-icon color="primary">mdi-account-circle</v-icon>
                </div>
                <div class="user-info">
                    <div class="user-name">{{ userStore.user?.name || 'User' }}</div>
                    <div class="user-role">Administrator</div>
                </div>
            </div>
            
            <v-btn 
                @click="logout()" 
                variant="text" 
                color="error" 
                icon="mdi-logout" 
                class="logout-btn"
                size="small"
                v-tooltip:right="'Sign Out'"
            ></v-btn>
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
.nav-container {
    width: auto;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
    border-radius: 1.5rem;
    padding: 1.5rem 1rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
    min-width: 280px;
}

.nav-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #36a367, #6366f1, #06b6d4);
    border-radius: 1.5rem 1.5rem 0 0;
}

/* Header Section */
.nav-header {
    text-align: center;
    margin-bottom: 2rem;
}

.logo-container {
    margin-bottom: 1rem;
    position: relative;
}

.logo-image {
    margin: 0 auto;
    border-radius: 50%;
    box-shadow: 0 4px 16px rgba(54, 163, 103, 0.3);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.logo-image:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(54, 163, 103, 0.4);
}

.brand-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.25rem;
    background: linear-gradient(135deg, #36a367, #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
}

.brand-subtitle {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

/* Navigation Links */
.nav-links {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.nav-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    color: #374151;
    text-decoration: none;
    position: relative;
    overflow: hidden;
    background: transparent;
    border: 1px solid transparent;
    transition: all 0.3s ease-out;
}

.nav-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(54, 163, 103, 0.1), transparent);
    transition: left 0.5s ease;
}

.nav-item:hover::before {
    left: 100%;
}

.nav-item:hover {
    background: rgba(54, 163, 103, 0.08);
    border-color: rgba(54, 163, 103, 0.2);
    transform: translateX(4px);
    color: #36a367;
}

.nav-item__icon {
    margin-right: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    transition: all 0.3s ease;
    background: rgba(54, 163, 103, 0.1);
    color: #36a367;
}

.nav-item:hover .nav-item__icon {
    background: rgba(54, 163, 103, 0.2);
    transform: scale(1.1);
}

.nav-item__text {
    font-weight: 500;
    font-size: 0.875rem;
    flex: 1;
    transition: color 0.3s ease;
    letter-spacing: 0.01em;
}

.nav-item__indicator {
    width: 0.25rem;
    height: 1.5rem;
    background: transparent;
    border-radius: 9999px;
    transition: all 0.3s ease;
}

/* Active State */
.nav-item--active {
    color: white;
    background: linear-gradient(135deg, #36a367, #2d8653);
    border-color: #36a367;
    box-shadow: 0 4px 16px rgba(54, 163, 103, 0.3);
}

.nav-item--active::before {
    display: none;
}

.nav-item--active:hover {
    transform: translateX(2px);
    box-shadow: 0 6px 20px rgba(54, 163, 103, 0.4);
}

.nav-item--active .nav-item__icon {
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.nav-item--active .nav-item__indicator {
    background: white;
}

/* Footer Section */
.nav-footer {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
}

.user-section {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.75rem;
    border-radius: 0.75rem;
    background: #f9fafb;
    transition: all 0.3s ease;
}

.user-section:hover {
    background: rgba(54, 163, 103, 0.05);
}

.user-avatar {
    margin-right: 0.75rem;
}

.user-info {
    flex: 1;
}

.user-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1f2937;
    line-height: 1.25;
}

.user-role {
    font-size: 0.75rem;
    color: #6b7280;
}

.logout-btn {
    width: 100%;
    transition: all 0.3s ease;
    border-radius: 0.75rem !important;
    background: rgba(239, 68, 68, 0.1) !important;
    border: 1px solid rgba(239, 68, 68, 0.2) !important;
}

.logout-btn:hover {
    background: rgba(239, 68, 68, 0.15) !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
    .nav-container {
        min-width: 240px;
        padding: 1rem 0.75rem;
    }
    
    .nav-item {
        padding: 0.75rem 1rem;
    }
    
    .nav-item__text {
        font-size: 0.875rem;
    }
}

/* Animation for page load */
.nav-container {
    animation: slideInLeft 0.6s ease-out;
}

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.nav-item {
    animation: fadeInUp 0.6s ease-out backwards;
}

.nav-item:nth-child(1) { animation-delay: 0.1s; }
.nav-item:nth-child(2) { animation-delay: 0.2s; }
.nav-item:nth-child(3) { animation-delay: 0.3s; }
.nav-item:nth-child(4) { animation-delay: 0.4s; }
.nav-item:nth-child(5) { animation-delay: 0.5s; }
.nav-item:nth-child(6) { animation-delay: 0.6s; }
.nav-item:nth-child(7) { animation-delay: 0.7s; }

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