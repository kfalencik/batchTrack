export default defineNuxtPlugin(() => {
    const settingsStore = useSettingsStore()
    
    // Initialize settings when the plugin is loaded
    if (process.client) {
        settingsStore.loadSettings()
    }
})