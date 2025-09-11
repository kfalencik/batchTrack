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
            primary: '#36a367',
            secondary: '#a4a189',
            darkGrey: '#dcd5d5',
            blueGrey: '#647589',
            lightGrey: '#ededed'
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