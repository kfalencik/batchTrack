<template>
    <div class="logo-upload-section">
        <h3 class="text-h6 mb-4">Custom Logo</h3>
        
        <!-- Current Logo Display -->
        <div class="current-logo mb-4">
            <div class="logo-preview">
                <img 
                    :src="settingsStore.logoUrl" 
                    alt="Current Logo" 
                    class="logo-image"
                />
            </div>
            <div class="logo-info">
                <p class="text-body-2 text-medium-emphasis">
                    {{ settingsStore.customLogo ? 'Custom logo' : 'Default logo' }}
                </p>
                <v-btn 
                    v-if="settingsStore.customLogo"
                    @click="removeCustomLogo"
                    variant="text"
                    color="error"
                    size="small"
                    prepend-icon="mdi-delete"
                    class="mt-2"
                >
                    Remove Custom Logo
                </v-btn>
            </div>
        </div>

        <!-- Upload Section -->
        <v-card variant="outlined" class="upload-card">
            <v-card-text class="text-center pa-6">
                <!-- Drop Zone -->
                <div 
                    class="drop-zone"
                    :class="{ 'drop-zone--active': isDragging }"
                    @drop="handleDrop"
                    @dragover.prevent="isDragging = true"
                    @dragleave="isDragging = false"
                    @click="triggerFileInput"
                >
                    <v-icon size="48" color="primary" class="mb-4">
                        mdi-cloud-upload-outline
                    </v-icon>
                    <h4 class="text-h6 mb-2">Upload New Logo</h4>
                    <p class="text-body-2 text-medium-emphasis mb-4">
                        Drag and drop an image file here, or click to browse
                    </p>
                    <p class="text-caption text-medium-emphasis">
                        Recommended: PNG or SVG, max 2MB, square aspect ratio
                    </p>
                </div>

                <!-- Hidden File Input -->
                <input
                    ref="fileInput"
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    @change="handleFileSelect"
                    style="display: none"
                />
            </v-card-text>
        </v-card>

        <!-- Upload Progress -->
        <v-progress-linear 
            v-if="isUploading"
            :model-value="uploadProgress"
            color="primary"
            class="mt-4"
        ></v-progress-linear>

        <!-- Error Display -->
        <v-alert
            v-if="uploadError"
            type="error"
            variant="tonal"
            class="mt-4"
            closable
            @click:close="uploadError = null"
        >
            {{ uploadError }}
        </v-alert>

        <!-- Success Display -->
        <v-alert
            v-if="uploadSuccess"
            type="success"
            variant="tonal"
            class="mt-4"
            closable
            @click:close="uploadSuccess = false"
        >
            Logo uploaded successfully!
        </v-alert>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const settingsStore = useSettingsStore()

// Component state
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadError = ref(null)
const uploadSuccess = ref(false)
const fileInput = ref(null)

// Maximum file size (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024

// Allowed file types
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']

// Trigger file input click
const triggerFileInput = () => {
    fileInput.value?.click()
}

// Handle file selection
const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
        processFile(file)
    }
}

// Handle drag and drop
const handleDrop = (event) => {
    event.preventDefault()
    isDragging.value = false
    
    const files = event.dataTransfer.files
    if (files.length > 0) {
        processFile(files[0])
    }
}

// Process the selected file
const processFile = async (file) => {
    // Reset states
    uploadError.value = null
    uploadSuccess.value = false
    
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
        uploadError.value = 'Please select a valid image file (PNG, JPEG, SVG, or WebP)'
        return
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        uploadError.value = 'File size must be less than 2MB'
        return
    }
    
    try {
        isUploading.value = true
        uploadProgress.value = 0
        
        // Convert file to data URL
        const dataUrl = await fileToDataUrl(file)
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
            uploadProgress.value += 10
            if (uploadProgress.value >= 100) {
                clearInterval(progressInterval)
            }
        }, 100)
        
        // Wait for progress to complete
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Save to settings store
        settingsStore.setCustomLogo(dataUrl)
        
        uploadSuccess.value = true
        
        // Clear file input
        if (fileInput.value) {
            fileInput.value.value = ''
        }
        
    } catch (error) {
        uploadError.value = 'Failed to upload logo. Please try again.'
        console.error('Logo upload error:', error)
    } finally {
        isUploading.value = false
        uploadProgress.value = 0
    }
}

// Convert file to data URL
const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

// Remove custom logo
const removeCustomLogo = () => {
    settingsStore.removeCustomLogo()
    uploadSuccess.value = false
    uploadError.value = null
}
</script>

<style scoped>
.logo-upload-section {
    max-width: 500px;
}

.current-logo {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgb(var(--v-theme-surface));
    border-radius: 8px;
    border: 1px solid rgb(var(--v-theme-outline));
}

.logo-preview {
    flex-shrink: 0;
}

.logo-image {
    width: 48px;
    height: 48px;
    object-fit: contain;
    border-radius: 4px;
    background: white;
    padding: 4px;
    border: 1px solid rgb(var(--v-theme-outline));
}

.logo-info {
    flex-grow: 1;
}

.upload-card {
    border: 2px dashed rgb(var(--v-theme-outline)) !important;
    transition: all 0.3s ease;
}

.drop-zone {
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 8px;
    padding: 2rem;
}

.drop-zone:hover,
.drop-zone--active {
    background: rgb(var(--v-theme-primary) / 0.04);
    border-color: rgb(var(--v-theme-primary));
}

.drop-zone--active {
    transform: scale(1.02);
    box-shadow: 0 4px 20px rgb(var(--v-theme-primary) / 0.2);
}
</style>