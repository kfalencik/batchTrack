import { defineConfig } from 'windicss/helpers'

export default defineConfig({
    darkMode: 'class', // or 'media'
    theme: {
        extend: {
        screens: {
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
        },
        colors: {
            primary: '#c6bb8f',
            secondary: '#a4a189',
            darkGrey: '#363535ff',
            blueGrey: '#647589',
            lightGrey: '#e2e8f0'
        },
        fontFamily: {
            sans: ['Dosis', 'sans-serif'],
            serif: ['Noto Serif', 'serif'],
        },
        fontWeight: {
            'light': '400',
            'black': '600'
            }
        }
    },
    shortcuts: {
        headline: 'text-3xl text-primary font-serif underline mb-5',
        subheading: 'text-2xl font-serif mb-4'
    }
})