import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY

let auth = null
let db   = null

if (apiKey) {
  const app = initializeApp({
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:  import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId:      import.meta.env.VITE_FIREBASE_APP_ID,
  })
  auth = getAuth(app)
  db   = getFirestore(app)
}

export { auth, db }
export const isConfigured = !!apiKey
