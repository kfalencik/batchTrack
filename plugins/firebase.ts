// plugins/firebase.ts
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from "firebase/auth"
import { getFirestore } from 'firebase/firestore'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: config.public.FIREBASE_API_KEY,
    authDomain: "batchtrack-81557.firebaseapp.com",
    projectId: "batchtrack-81557",
    storageBucket: "batchtrack-81557.firebasestorage.app",
    messagingSenderId: "1043506392761",
    appId: "1:1043506392761:web:40c3a966dd026214b43568",
    measurementId: "G-9C0HZ8VN8T"
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