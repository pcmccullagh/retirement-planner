import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth, isConfigured } from '../utils/firebase.js'
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'

const ALLOWED_EMAILS = (import.meta.env.VITE_ALLOWED_EMAILS || '')
  .split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

const FirebaseAuthContext = createContext(null)

export function FirebaseAuthProvider({ children }) {
  const [status, setStatus]   = useState('initializing')
  const [user, setUser]       = useState(null)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!isConfigured) {
      setError('Firebase is not configured. Add VITE_FIREBASE_* to your .env.local file.')
      setStatus('unauthenticated')
      return
    }
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setStatus('unauthenticated')
        return
      }
      if (ALLOWED_EMAILS.length && !ALLOWED_EMAILS.includes(firebaseUser.email?.toLowerCase())) {
        await signOut(auth)
        setError(`${firebaseUser.email} is not authorized to access this app.`)
        setStatus('unauthenticated')
        return
      }
      setUser(firebaseUser)
      setError(null)
      setStatus('authenticated')
    })
  }, [])

  const signIn = useCallback(async () => {
    setError(null)
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') {
        setError('Sign-in failed. Please try again.')
      }
    }
  }, [])

  const handleSignOut = useCallback(() => signOut(auth), [])

  return (
    <FirebaseAuthContext.Provider value={{ status, user, signIn, signOut: handleSignOut, error }}>
      {children}
    </FirebaseAuthContext.Provider>
  )
}

export function useFirebaseAuth() {
  const ctx = useContext(FirebaseAuthContext)
  if (!ctx) throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider')
  return ctx
}
