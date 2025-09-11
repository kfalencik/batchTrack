// plugins/firebase.ts
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from "firebase/auth"
import { getFirestore } from 'firebase/firestore'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: config.public.FIREBASE_API_KEY,
    authDomain: "hollenders-immobilien.firebaseapp.com",
    projectId: "hollenders-immobilien",
    storageBucket: "hollenders-immobilien.firebasestorage.app",
    messagingSenderId: "872887777730",
    appId: "1:872887777730:web:022bfb03df9c83db43be5b",
    measurementId: "G-0K894ET6HJ"
  }

  // Prevent re-initialization
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

  // Only get analytics on the client
  if (process.client) {
    import('firebase/analytics').then(({ getAnalytics }) => getAnalytics(app))
  }

  const auth = getAuth(app)
  const firestore = getFirestore(app)

  nuxtApp.provide('firebase', app)
  nuxtApp.provide('auth', auth)
  nuxtApp.provide('firestore', firestore)
})