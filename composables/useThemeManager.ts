import { useTheme } from 'vuetify'

export const useThemeManager = () => {
    const settingsStore = useSettingsStore()
    const theme = useTheme()

    // Update Vuetify theme based on settings
    const updateVuetifyTheme = () => {
        const themeName = `${settingsStore.colorScheme}-${settingsStore.isDarkMode ? 'dark' : 'light'}`
        theme.global.name.value = themeName
    }

    // Initialize theme on app start
    const initializeTheme = () => {
        settingsStore.loadSettings()
        updateVuetifyTheme()
    }

    // Watch for settings changes and update theme
    const watchSettings = () => {
        watch(() => settingsStore.colorScheme, updateVuetifyTheme)
        watch(() => settingsStore.isDarkMode, updateVuetifyTheme)
    }

    return {
        updateVuetifyTheme,
        initializeTheme,
        watchSettings
    }
}