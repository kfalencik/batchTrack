// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default defineNuxtPlugin((app) => {
    const hollenders = {
        dark: false,
        colors: {
          background: '#fafbfc',
          surface: '#ffffff',
          'surface-bright': '#ffffff',
          'surface-light': '#f8fafc',
          'surface-variant': '#f1f5f9',
          'on-surface-variant': '#64748b',
          primary: '#6366f1',
          'primary-darken-1': '#4f46e5',
          'primary-lighten-1': '#818cf8',
          secondary: '#06b6d4',
          'secondary-darken-1': '#0891b2',
          'secondary-lighten-1': '#22d3ee',
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
          // Modern neutral grays
          'grey-50': '#f8fafc',
          'grey-100': '#f1f5f9',
          'grey-200': '#e2e8f0',
          'grey-300': '#cbd5e1',
          'grey-400': '#94a3b8',
          'grey-500': '#64748b',
          'grey-600': '#475569',
          'grey-700': '#334155',
          'grey-800': '#1e293b',
          'grey-900': '#0f172a'
        },
        variables: {
          'border-color': '#e2e8f0',
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
          'theme-kbd': '#0f172a',
          'theme-on-kbd': '#ffffff',
          'theme-code': '#f8fafc',
          'theme-on-code': '#1e293b',
        }
      }

    const vuetify = createVuetify({
    theme: {
        defaultTheme: 'hollenders',
        themes: {
            hollenders,
        },
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