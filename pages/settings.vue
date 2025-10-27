<template>
    <div class="settings-page">
        <PageHeader 
            title="Settings" 
            subtitle="Customize your BatchTrack experience"
            icon="mdi-cog"
        />

        <div class="settings-content">
            <!-- Settings Navigation Tabs -->
            <v-tabs v-model="activeTab" color="primary" class="mb-6">
                <v-tab value="appearance">
                    <v-icon start>mdi-palette</v-icon>
                    Appearance
                </v-tab>
                <v-tab value="branding">
                    <v-icon start>mdi-image-edit</v-icon>
                    Branding
                </v-tab>
                <v-tab value="currency">
                    <v-icon start>mdi-currency-usd</v-icon>
                    Currency
                </v-tab>
                <v-tab value="notifications">
                    <v-icon start>mdi-bell</v-icon>
                    Notifications
                </v-tab>
                <v-tab value="advanced">
                    <v-icon start>mdi-cogs</v-icon>
                    Advanced
                </v-tab>
            </v-tabs>

            <!-- Tab Content -->
            <v-tabs-window v-model="activeTab">
                <!-- Appearance Tab -->
                <v-tabs-window-item value="appearance">
                    <v-card class="mb-6">
                        <v-card-title class="d-flex align-center">
                            <v-icon start>mdi-theme-light-dark</v-icon>
                            Theme Mode
                        </v-card-title>
                        <v-card-text>
                            <v-switch
                                v-model="settingsStore.isDarkMode"
                                @change="settingsStore.saveSettings()"
                                color="primary"
                                label="Dark Mode"
                                hide-details
                            ></v-switch>
                            <p class="text-body-2 text-medium-emphasis mt-2">
                                Toggle between light and dark theme
                            </p>
                        </v-card-text>
                    </v-card>

                    <v-card>
                        <v-card-title class="d-flex align-center">
                            <v-icon start>mdi-palette</v-icon>
                            Color Scheme
                            <v-spacer></v-spacer>
                            <v-chip variant="outlined" size="small">
                                {{ settingsStore.availableThemes.length }} themes
                            </v-chip>
                        </v-card-title>
                        <v-card-text>
                            <p class="text-body-2 text-medium-emphasis mb-4">
                                Choose from our curated collection of beautiful color schemes
                            </p>
                            
                            <!-- Theme Categories -->
                            <div class="theme-categories mb-6">
                                <v-chip-group v-model="selectedCategory" mandatory class="mb-4">
                                    <v-chip value="all" variant="outlined">All Themes</v-chip>
                                    <v-chip value="professional" variant="outlined">Professional</v-chip>
                                    <v-chip value="vibrant" variant="outlined">Vibrant</v-chip>
                                    <v-chip value="nature" variant="outlined">Nature</v-chip>
                                    <v-chip value="cosmic" variant="outlined">Cosmic</v-chip>
                                </v-chip-group>
                            </div>

                            <div class="theme-grid">
                                <div 
                                    v-for="theme in filteredThemes"
                                    :key="theme.id"
                                    class="theme-option"
                                    :class="{ 'theme-option--active': settingsStore.colorScheme === theme.id }"
                                    @click="settingsStore.setTheme(theme.id)"
                                >
                                    <div class="theme-preview">
                                        <div class="theme-emoji">{{ theme.emoji }}</div>
                                        <div 
                                            class="theme-color theme-color--primary"
                                            :style="{ backgroundColor: theme.primary }"
                                        ></div>
                                        <div 
                                            class="theme-color theme-color--secondary"
                                            :style="{ backgroundColor: theme.secondary }"
                                        ></div>
                                        <div 
                                            class="theme-gradient"
                                            :style="{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }"
                                        ></div>
                                    </div>
                                    <div class="theme-info">
                                        <h4 class="text-subtitle-2">{{ theme.name }}</h4>
                                        <p class="text-caption text-medium-emphasis">
                                            {{ theme.description }}
                                        </p>
                                    </div>
                                    <v-icon 
                                        v-if="settingsStore.colorScheme === theme.id"
                                        color="primary"
                                        class="theme-check"
                                    >
                                        mdi-check-circle
                                    </v-icon>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-tabs-window-item>

                <!-- Branding Tab -->
                <v-tabs-window-item value="branding">
                    <v-card class="mb-6">
                        <v-card-title class="d-flex align-center">
                            <v-icon start>mdi-format-title</v-icon>
                            App Branding
                        </v-card-title>
                        <v-card-text>
                            <v-text-field
                                v-model="tempAppName"
                                label="Application Name"
                                variant="outlined"
                                class="mb-4"
                                @blur="updateBranding"
                            ></v-text-field>
                            
                            <v-text-field
                                v-model="tempAppSubtitle"
                                label="Application Subtitle"
                                variant="outlined"
                                @blur="updateBranding"
                            ></v-text-field>
                        </v-card-text>
                    </v-card>

                    <v-card>
                        <v-card-title class="d-flex align-center">
                            <v-icon start>mdi-image</v-icon>
                            Logo Management
                        </v-card-title>
                        <v-card-text>
                            <LogoUpload />
                        </v-card-text>
                    </v-card>
                </v-tabs-window-item>

                <!-- Currency Tab -->
                <v-tabs-window-item value="currency">
                    <v-card>
                        <v-card-title class="d-flex align-center">
                            <v-icon start>mdi-currency-usd</v-icon>
                            Currency Settings
                        </v-card-title>
                        <v-card-text>
                            <v-select
                                v-model="settingsStore.currency"
                                :items="currencyItems"
                                label="Primary Currency"
                                variant="outlined"
                                @update:model-value="settingsStore.setCurrency($event)"
                            >
                                <template v-slot:item="{ props, item }">
                                    <v-list-item v-bind="props">
                                        <template v-slot:prepend>
                                            <span class="text-h6 mr-3">{{ item.raw.symbol }}</span>
                                        </template>
                                        <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                                        <v-list-item-subtitle>{{ item.raw.code }}</v-list-item-subtitle>
                                    </v-list-item>
                                </template>
                                <template v-slot:selection="{ item }">
                                    <span class="mr-2">{{ item.raw.symbol }}</span>
                                    {{ item.raw.name }} ({{ item.raw.code }})
                                </template>
                            </v-select>
                            
                            <v-alert type="info" variant="tonal" class="mt-4">
                                <div class="d-flex align-center">
                                    <v-icon start>mdi-information</v-icon>
                                    <div>
                                        <div class="font-weight-medium">Current Currency</div>
                                        <div>{{ settingsStore.currentCurrency.symbol }} {{ settingsStore.currentCurrency.name }}</div>
                                    </div>
                                </div>
                            </v-alert>
                        </v-card-text>
                    </v-card>
                </v-tabs-window-item>

                <!-- Notifications Tab -->
                <v-tabs-window-item value="notifications">
                    <v-card>
                        <v-card-title class="d-flex align-center">
                            <v-icon start>mdi-bell</v-icon>
                            Notification Preferences
                        </v-card-title>
                        <v-card-text>
                            <div class="notification-settings">
                                <v-switch
                                    v-model="tempNotifications.sound"
                                    @change="updateNotifications"
                                    color="primary"
                                    label="Sound Notifications"
                                    hide-details
                                    class="mb-4"
                                ></v-switch>
                                
                                <v-switch
                                    v-model="tempNotifications.desktop"
                                    @change="updateNotifications"
                                    color="primary"
                                    label="Desktop Notifications"
                                    hide-details
                                    class="mb-4"
                                ></v-switch>
                                
                                <div class="notification-duration">
                                    <label class="text-subtitle-2 mb-2 d-block">
                                        Notification Duration: {{ tempNotifications.duration / 1000 }}s
                                    </label>
                                    <v-slider
                                        v-model="tempNotifications.duration"
                                        @end="updateNotifications"
                                        :min="1000"
                                        :max="10000"
                                        :step="1000"
                                        color="primary"
                                        track-color="grey-lighten-1"
                                        thumb-label
                                    >
                                        <template v-slot:thumb-label="{ modelValue }">
                                            {{ modelValue / 1000 }}s
                                        </template>
                                    </v-slider>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-tabs-window-item>

                <!-- Advanced Tab -->
                <v-tabs-window-item value="advanced">
                    <v-card class="mb-6">
                        <v-card-title class="d-flex align-center">
                            <v-icon start>mdi-backup-restore</v-icon>
                            Reset Settings
                        </v-card-title>
                        <v-card-text>
                            <p class="text-body-2 mb-4">
                                Reset all settings to their default values. This action cannot be undone.
                            </p>
                            <v-btn
                                @click="showResetDialog = true"
                                color="error"
                                variant="outlined"
                                prepend-icon="mdi-restore"
                            >
                                Reset to Defaults
                            </v-btn>
                        </v-card-text>
                    </v-card>

                    <v-card>
                        <v-card-title class="d-flex align-center">
                            <v-icon start>mdi-information</v-icon>
                            Application Information
                        </v-card-title>
                        <v-card-text>
                            <div class="app-info">
                                <div class="info-row">
                                    <span class="info-label">Application:</span>
                                    <span class="info-value">{{ settingsStore.appName }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Version:</span>
                                    <span class="info-value">1.0.0</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Theme:</span>
                                    <span class="info-value">{{ settingsStore.currentTheme.name }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Mode:</span>
                                    <span class="info-value">{{ settingsStore.isDarkMode ? 'Dark' : 'Light' }}</span>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-tabs-window-item>
            </v-tabs-window>
        </div>

        <!-- Reset Confirmation Dialog -->
        <v-dialog v-model="showResetDialog" max-width="400">
            <v-card>
                <v-card-title class="d-flex align-center">
                    <v-icon start color="error">mdi-alert-circle</v-icon>
                    Reset Settings
                </v-card-title>
                <v-card-text>
                    Are you sure you want to reset all settings to their default values? This action cannot be undone.
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="showResetDialog = false">Cancel</v-btn>
                    <v-btn @click="resetSettings" color="error">Reset</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Meta for page
definePageMeta({
    layout: 'default'
})

const settingsStore = useSettingsStore()
const userStore = useUserStore()

// Component state
const activeTab = ref('appearance')
const showResetDialog = ref(false)
const selectedCategory = ref('all')

// Temporary values for form inputs
const tempAppName = ref('')
const tempAppSubtitle = ref('')
const tempNotifications = ref({})

// Theme categorization
const themeCategories = {
    professional: ['hollenders', 'midnight', 'arctic', 'lavender'],
    vibrant: ['neon', 'volcano', 'cherry', 'coral', 'gold'],
    nature: ['forest', 'emerald', 'ocean', 'sunset'],
    cosmic: ['galaxy', 'aurora', 'retro', 'matrix']
}

// Computed properties
const currencyItems = computed(() => {
    return settingsStore.availableCurrencies.map(currency => ({
        title: `${currency.name} (${currency.code})`,
        value: currency.code,
        ...currency
    }))
})

const filteredThemes = computed(() => {
    if (selectedCategory.value === 'all') {
        return settingsStore.availableThemes
    }
    const categoryThemes = themeCategories[selectedCategory.value] || []
    return settingsStore.availableThemes.filter(theme => 
        categoryThemes.includes(theme.id)
    )
})

// Methods
const updateBranding = () => {
    if (tempAppName.value && tempAppSubtitle.value) {
        settingsStore.updateAppBranding(tempAppName.value, tempAppSubtitle.value)
    }
}

const updateNotifications = () => {
    settingsStore.updateNotifications(tempNotifications.value)
}

const resetSettings = () => {
    settingsStore.resetToDefaults()
    initializeTempValues()
    showResetDialog.value = false
    
    userStore.setNotification({
        text: 'Settings have been reset to defaults',
        color: 'success'
    })
}

const initializeTempValues = () => {
    tempAppName.value = settingsStore.appName
    tempAppSubtitle.value = settingsStore.appSubtitle
    tempNotifications.value = { ...settingsStore.notifications }
}

// Initialize on mount
onMounted(() => {
    settingsStore.loadSettings()
    initializeTempValues()
})
</script>

<style scoped>
.settings-page {
    max-width: 1000px;
    margin: 0 auto;
}

.settings-content {
    margin-top: 2rem;
}

/* Theme Grid */
.theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
}

.theme-option {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    border: 2px solid rgb(var(--v-theme-outline));
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    background: rgb(var(--v-theme-surface));
    overflow: hidden;
}

.theme-option::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(var(--v-theme-primary), 0.02) 50%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.theme-option:hover {
    border-color: rgb(var(--v-theme-primary));
    background: rgb(var(--v-theme-primary) / 0.04);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(var(--v-theme-primary) / 0.15);
}

.theme-option:hover::before {
    opacity: 1;
}

.theme-option--active {
    border-color: rgb(var(--v-theme-primary));
    background: rgb(var(--v-theme-primary) / 0.08);
    box-shadow: 0 4px 20px rgba(var(--v-theme-primary) / 0.2);
    animation: themeSelected 0.6s ease-out;
}

@keyframes themeSelected {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
}

.theme-preview {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
    flex-direction: column;
    align-items: center;
}

.theme-emoji {
    font-size: 1.5rem;
    margin-bottom: 4px;
    transition: transform 0.3s ease;
}

.theme-option:hover .theme-emoji {
    transform: scale(1.2);
}

.theme-color {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border: 2px solid rgba(255, 255, 255, 0.8);
}

.theme-gradient {
    width: 60px;
    height: 8px;
    border-radius: 4px;
    margin-top: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-info {
    flex-grow: 1;
}

.theme-check {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgb(var(--v-theme-surface));
    border-radius: 50%;
    padding: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Notification Settings */
.notification-duration {
    margin-top: 1rem;
}

/* App Info */
.app-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.info-row:last-child {
    border-bottom: none;
}

.info-label {
    font-weight: 500;
    color: rgb(var(--v-theme-on-surface));
}

.info-value {
    color: rgb(var(--v-theme-on-surface-variant));
}

/* Responsive */
@media (max-width: 768px) {
    .theme-grid {
        grid-template-columns: 1fr;
    }
    
    .theme-option {
        flex-direction: column;
        text-align: center;
    }
}
</style>