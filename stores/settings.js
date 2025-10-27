import nuxtStorage from 'nuxt-storage';

export const useSettingsStore = defineStore('settingsStore', {
    state: () => ({
        // Theme settings
        isDarkMode: false,
        colorScheme: 'hollenders', // default theme
        
        // App customization
        appName: 'BatchTrack',
        appSubtitle: 'Brewing Management',
        customLogo: null,
        
        // Currency settings
        currency: 'USD',
        currencySymbol: '$',
        
        // Other preferences
        notifications: {
            sound: true,
            desktop: true,
            duration: 3000
        },
        
        // Language (for future use)
        language: 'en',
        
        // Available themes
        availableThemes: [
            {
                id: 'hollenders',
                name: 'Hollenders Blue',
                primary: '#6366f1',
                secondary: '#06b6d4',
                description: 'Modern blue theme with clean aesthetics',
                emoji: '💼'
            },
            {
                id: 'forest',
                name: 'Forest Green',
                primary: '#16a34a',
                secondary: '#059669',
                description: 'Nature-inspired green theme',
                emoji: '🌲'
            },
            {
                id: 'sunset',
                name: 'Sunset Orange',
                primary: '#ea580c',
                secondary: '#dc2626',
                description: 'Warm orange and red theme',
                emoji: '🌅'
            },
            {
                id: 'royal',
                name: 'Royal Purple',
                primary: '#9333ea',
                secondary: '#7c3aed',
                description: 'Elegant purple theme',
                emoji: '👑'
            },
            {
                id: 'ocean',
                name: 'Ocean Blue',
                primary: '#0ea5e9',
                secondary: '#0284c7',
                description: 'Deep blue oceanic theme',
                emoji: '🌊'
            },
            {
                id: 'neon',
                name: 'Neon Cyber',
                primary: '#00f5ff',
                secondary: '#ff00aa',
                description: 'Electric cyberpunk vibes',
                emoji: '⚡'
            },
            {
                id: 'galaxy',
                name: 'Galaxy Purple',
                primary: '#8b5cf6',
                secondary: '#ec4899',
                description: 'Cosmic purple and pink gradient',
                emoji: '🌌'
            },
            {
                id: 'volcano',
                name: 'Volcano Red',
                primary: '#ef4444',
                secondary: '#f97316',
                description: 'Fiery red and orange theme',
                emoji: '🌋'
            },
            {
                id: 'emerald',
                name: 'Emerald Mint',
                primary: '#10b981',
                secondary: '#06d6a0',
                description: 'Fresh emerald and mint combination',
                emoji: '💎'
            },
            {
                id: 'midnight',
                name: 'Midnight Blue',
                primary: '#1e40af',
                secondary: '#3730a3',
                description: 'Deep midnight blue elegance',
                emoji: '🌙'
            },
            {
                id: 'aurora',
                name: 'Aurora Borealis',
                primary: '#06b6d4',
                secondary: '#8b5cf6',
                description: 'Northern lights inspired theme',
                emoji: '🌈'
            },
            {
                id: 'cherry',
                name: 'Cherry Blossom',
                primary: '#ec4899',
                secondary: '#f43f5e',
                description: 'Soft pink cherry blossom theme',
                emoji: '🌸'
            },
            {
                id: 'gold',
                name: 'Golden Hour',
                primary: '#f59e0b',
                secondary: '#eab308',
                description: 'Warm golden sunset colors',
                emoji: '✨'
            },
            {
                id: 'matrix',
                name: 'Matrix Green',
                primary: '#22c55e',
                secondary: '#16a34a',
                description: 'Digital matrix green theme',
                emoji: '💻'
            },
            {
                id: 'retro',
                name: 'Retro Wave',
                primary: '#a855f7',
                secondary: '#06b6d4',
                description: '80s retro synthwave aesthetic',
                emoji: '🕹️'
            },
            {
                id: 'coral',
                name: 'Coral Reef',
                primary: '#f97316',
                secondary: '#fb7185',
                description: 'Vibrant coral and salmon colors',
                emoji: '🐠'
            },
            {
                id: 'arctic',
                name: 'Arctic Ice',
                primary: '#0891b2',
                secondary: '#0e7490',
                description: 'Cool arctic ice blue theme',
                emoji: '❄️'
            },
            {
                id: 'lavender',
                name: 'Lavender Fields',
                primary: '#a78bfa',
                secondary: '#c084fc',
                description: 'Calm lavender purple theme',
                emoji: '💜'
            }
        ],
        
        // Available currencies
        availableCurrencies: [
            { code: 'USD', symbol: '$', name: 'US Dollar' },
            { code: 'EUR', symbol: '€', name: 'Euro' },
            { code: 'GBP', symbol: '£', name: 'British Pound' },
            { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
            { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
            { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
            { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
            { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
            { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
            { code: 'DKK', symbol: 'kr', name: 'Danish Krone' }
        ]
    }),
    
    getters: {
        currentTheme: (state) => {
            return state.availableThemes.find(theme => theme.id === state.colorScheme) || state.availableThemes[0];
        },
        
        currentCurrency: (state) => {
            return state.availableCurrencies.find(curr => curr.code === state.currency) || state.availableCurrencies[0];
        },
        
        logoUrl: (state) => {
            return state.customLogo || '/img/logo.png';
        }
    },
    
    actions: {
        // Load settings from localStorage
        loadSettings() {
            if (process.client && nuxtStorage.localStorage) {
                const savedSettings = nuxtStorage.localStorage.getData('appSettings');
                if (savedSettings) {
                    // Merge saved settings with defaults
                    Object.keys(savedSettings).forEach(key => {
                        if (this.$state.hasOwnProperty(key)) {
                            this.$state[key] = savedSettings[key];
                        }
                    });
                }
            }
        },
        
        // Save settings to localStorage
        saveSettings() {
            if (process.client && nuxtStorage.localStorage) {
                const settingsToSave = {
                    isDarkMode: this.isDarkMode,
                    colorScheme: this.colorScheme,
                    appName: this.appName,
                    appSubtitle: this.appSubtitle,
                    customLogo: this.customLogo,
                    currency: this.currency,
                    currencySymbol: this.currencySymbol,
                    notifications: this.notifications,
                    language: this.language
                };
                nuxtStorage.localStorage.setData('appSettings', settingsToSave);
            }
        },
        
        // Update theme
        setTheme(themeId) {
            const theme = this.availableThemes.find(t => t.id === themeId);
            if (theme) {
                this.colorScheme = themeId;
                this.saveSettings();
            }
        },
        
        // Toggle dark mode
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode;
            this.saveSettings();
        },
        
        // Update currency
        setCurrency(currencyCode) {
            const currency = this.availableCurrencies.find(c => c.code === currencyCode);
            if (currency) {
                this.currency = currencyCode;
                this.currencySymbol = currency.symbol;
                this.saveSettings();
            }
        },
        
        // Update app branding
        updateAppBranding(name, subtitle) {
            this.appName = name;
            this.appSubtitle = subtitle;
            this.saveSettings();
        },
        
        // Set custom logo
        setCustomLogo(logoDataUrl) {
            this.customLogo = logoDataUrl;
            this.saveSettings();
        },
        
        // Remove custom logo
        removeCustomLogo() {
            this.customLogo = null;
            this.saveSettings();
        },
        
        // Update notification settings
        updateNotifications(settings) {
            this.notifications = { ...this.notifications, ...settings };
            this.saveSettings();
        },
        
        // Reset to defaults
        resetToDefaults() {
            this.isDarkMode = false;
            this.colorScheme = 'hollenders';
            this.appName = 'BatchTrack';
            this.appSubtitle = 'Brewing Management';
            this.customLogo = null;
            this.currency = 'USD';
            this.currencySymbol = '$';
            this.notifications = {
                sound: true,
                desktop: true,
                duration: 3000
            };
            this.language = 'en';
            this.saveSettings();
        }
    }
});