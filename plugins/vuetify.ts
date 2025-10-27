// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default defineNuxtPlugin((app) => {
    // Function to create theme configuration
    const createThemeConfig = (primaryColor: string, secondaryColor: string, isDark = false) => ({
        dark: isDark,
        colors: {
          background: isDark ? '#121212' : '#fafbfc',
          surface: isDark ? '#1e1e1e' : '#ffffff',
          'surface-bright': isDark ? '#2a2a2a' : '#ffffff',
          'surface-light': isDark ? '#1a1a1a' : '#f8fafc',
          'surface-variant': isDark ? '#2c2c2c' : '#f1f5f9',
          'on-surface-variant': isDark ? '#a0a0a0' : '#64748b',
          primary: primaryColor,
          'primary-darken-1': adjustColor(primaryColor, -20),
          'primary-lighten-1': adjustColor(primaryColor, 20),
          secondary: secondaryColor,
          'secondary-darken-1': adjustColor(secondaryColor, -20),
          'secondary-lighten-1': adjustColor(secondaryColor, 20),
          accent: '#f59e0b',
          'accent-darken-1': '#d97706',
          error: '#ef4444',
          'error-lighten-1': '#f87171',
          info: '#3b82f6',
          'info-lighten-1': '#60a5fa',
          success: '#10b981',
          'success-lighten-1': '#34d399',
          warning: '#f59e0b',
          'warning-lighten-1': '#fbbf24',
          // Modern neutral grays (adjusted for dark mode)
          'grey-50': isDark ? '#0f172a' : '#f8fafc',
          'grey-100': isDark ? '#1e293b' : '#f1f5f9',
          'grey-200': isDark ? '#334155' : '#e2e8f0',
          'grey-300': isDark ? '#475569' : '#cbd5e1',
          'grey-400': isDark ? '#64748b' : '#94a3b8',
          'grey-500': isDark ? '#94a3b8' : '#64748b',
          'grey-600': isDark ? '#cbd5e1' : '#475569',
          'grey-700': isDark ? '#e2e8f0' : '#334155',
          'grey-800': isDark ? '#f1f5f9' : '#1e293b',
          'grey-900': isDark ? '#f8fafc' : '#0f172a'
        },
        variables: {
          'border-color': isDark ? '#334155' : '#e2e8f0',
          'border-opacity': 0.12,
          'high-emphasis-opacity': 0.87,
          'medium-emphasis-opacity': 0.60,
          'disabled-opacity': 0.38,
          'idle-opacity': 0.04,
          'hover-opacity': 0.04,
          'focus-opacity': 0.12,
          'selected-opacity': 0.08,
          'activated-opacity': 0.12,
          'pressed-opacity': 0.12,
          'dragged-opacity': 0.08,
          'theme-kbd': isDark ? '#f8fafc' : '#0f172a',
          'theme-on-kbd': isDark ? '#0f172a' : '#ffffff',
          'theme-code': isDark ? '#1e293b' : '#f8fafc',
          'theme-on-code': isDark ? '#f8fafc' : '#1e293b',
        }
    })

    // Helper function to adjust color brightness
    function adjustColor(color: string, percent: number): string {
        const hex = color.replace('#', '')
        const r = parseInt(hex.substr(0, 2), 16)
        const g = parseInt(hex.substr(2, 2), 16)
        const b = parseInt(hex.substr(4, 2), 16)
        
        const adjustedR = Math.max(0, Math.min(255, r + (r * percent / 100)))
        const adjustedG = Math.max(0, Math.min(255, g + (g * percent / 100)))
        const adjustedB = Math.max(0, Math.min(255, b + (b * percent / 100)))
        
        return `#${Math.round(adjustedR).toString(16).padStart(2, '0')}${Math.round(adjustedG).toString(16).padStart(2, '0')}${Math.round(adjustedB).toString(16).padStart(2, '0')}`
    }

    // Create theme configurations for all available themes
    const themeConfigs = {
        hollenders: {
            light: createThemeConfig('#6366f1', '#06b6d4', false),
            dark: createThemeConfig('#6366f1', '#06b6d4', true)
        },
        forest: {
            light: createThemeConfig('#16a34a', '#059669', false),
            dark: createThemeConfig('#16a34a', '#059669', true)
        },
        sunset: {
            light: createThemeConfig('#ea580c', '#dc2626', false),
            dark: createThemeConfig('#ea580c', '#dc2626', true)
        },
        royal: {
            light: createThemeConfig('#9333ea', '#7c3aed', false),
            dark: createThemeConfig('#9333ea', '#7c3aed', true)
        },
        ocean: {
            light: createThemeConfig('#0ea5e9', '#0284c7', false),
            dark: createThemeConfig('#0ea5e9', '#0284c7', true)
        },
        neon: {
            light: createThemeConfig('#00f5ff', '#ff00aa', false),
            dark: createThemeConfig('#00f5ff', '#ff00aa', true)
        },
        galaxy: {
            light: createThemeConfig('#8b5cf6', '#ec4899', false),
            dark: createThemeConfig('#8b5cf6', '#ec4899', true)
        },
        volcano: {
            light: createThemeConfig('#ef4444', '#f97316', false),
            dark: createThemeConfig('#ef4444', '#f97316', true)
        },
        emerald: {
            light: createThemeConfig('#10b981', '#06d6a0', false),
            dark: createThemeConfig('#10b981', '#06d6a0', true)
        },
        midnight: {
            light: createThemeConfig('#1e40af', '#3730a3', false),
            dark: createThemeConfig('#1e40af', '#3730a3', true)
        },
        aurora: {
            light: createThemeConfig('#06b6d4', '#8b5cf6', false),
            dark: createThemeConfig('#06b6d4', '#8b5cf6', true)
        },
        cherry: {
            light: createThemeConfig('#ec4899', '#f43f5e', false),
            dark: createThemeConfig('#ec4899', '#f43f5e', true)
        },
        gold: {
            light: createThemeConfig('#f59e0b', '#eab308', false),
            dark: createThemeConfig('#f59e0b', '#eab308', true)
        },
        matrix: {
            light: createThemeConfig('#22c55e', '#16a34a', false),
            dark: createThemeConfig('#22c55e', '#16a34a', true)
        },
        retro: {
            light: createThemeConfig('#a855f7', '#06b6d4', false),
            dark: createThemeConfig('#a855f7', '#06b6d4', true)
        },
        coral: {
            light: createThemeConfig('#f97316', '#fb7185', false),
            dark: createThemeConfig('#f97316', '#fb7185', true)
        },
        arctic: {
            light: createThemeConfig('#0891b2', '#0e7490', false),
            dark: createThemeConfig('#0891b2', '#0e7490', true)
        },
        lavender: {
            light: createThemeConfig('#a78bfa', '#c084fc', false),
            dark: createThemeConfig('#a78bfa', '#c084fc', true)
        }
    }

    // Flatten theme configurations for Vuetify
    const themes: Record<string, any> = {}
    Object.keys(themeConfigs).forEach(themeName => {
        themes[`${themeName}-light`] = themeConfigs[themeName as keyof typeof themeConfigs].light
        themes[`${themeName}-dark`] = themeConfigs[themeName as keyof typeof themeConfigs].dark
    })

    const vuetify = createVuetify({
    theme: {
        defaultTheme: 'hollenders-light',
        themes,
    },
    display: {
      mobileBreakpoint: 'sm',
      thresholds: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    defaults: {
        VBtn: {
          style: 'font-weight: 500; text-transform: none; letter-spacing: 0;',
          rounded: 'lg',
          elevation: 0,
          variant: 'flat'
        },
        VCard: {
          elevation: 0,
          rounded: 'xl',
          style: 'border: 1px solid rgb(226 232 240 / 0.8); backdrop-filter: blur(8px);'
        },
        VDialog: {
          rounded: 'xl'
        },
        VTextField: {
          variant: 'outlined',
          rounded: 'lg',
          density: 'comfortable'
        },
        VSelect: {
          variant: 'outlined',
          rounded: 'lg',
          density: 'comfortable'
        },
        VTextarea: {
          variant: 'outlined',
          rounded: 'lg',
          density: 'comfortable'
        },
        VDataTable: {
          density: 'comfortable'
        },
        VChip: {
          rounded: 'pill',
          variant: 'flat'
        }
    }
    })
    app.vueApp.use(vuetify)
})