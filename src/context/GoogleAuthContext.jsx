import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { fetchUserProfile } from '../utils/driveStorage.js'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = 'https://www.googleapis.com/auth/drive'

const SESSION_TOKEN_KEY = 'goog_token'
const SESSION_EXPIRY_KEY = 'goog_expiry'
const SESSION_PROFILE_KEY = 'goog_profile'

const GoogleAuthContext = createContext(null)

export function GoogleAuthProvider({ children, onAuthenticated, onSignOut }) {
  const [status, setStatus] = useState('initializing') // initializing | unauthenticated | authenticated
  const [token, setToken] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [error, setError] = useState(null)
  const tokenClientRef = useRef(null)

  const storeSession = (tok, expiresIn, profile) => {
    const expiry = Date.now() + expiresIn * 1000
    sessionStorage.setItem(SESSION_TOKEN_KEY, tok)
    sessionStorage.setItem(SESSION_EXPIRY_KEY, String(expiry))
    if (profile) sessionStorage.setItem(SESSION_PROFILE_KEY, JSON.stringify(profile))
  }

  const handleTokenResponse = useCallback(async (response) => {
    if (response.error) {
      setError('Google sign-in was cancelled or failed. Please try again.')
      setStatus('unauthenticated')
      return
    }

    const tok = response.access_token
    setToken(tok)

    let profile = null
    try {
      profile = await fetchUserProfile(tok)
      setUserProfile(profile)
    } catch {}

    storeSession(tok, response.expires_in, profile)
    setStatus('authenticated')
    onAuthenticated?.(tok, profile)
  }, [onAuthenticated])

  // Init GIS and restore session
  useEffect(() => {
    let attempts = 0
    const MAX_ATTEMPTS = 40 // 6 seconds max wait

    const tryInit = () => {
      if (!window.google?.accounts?.oauth2) {
        attempts++
        if (attempts >= MAX_ATTEMPTS) {
          setError('Google Sign-In failed to load. Check your internet connection and refresh.')
          setStatus('unauthenticated')
          return
        }
        setTimeout(tryInit, 150)
        return
      }

      if (!CLIENT_ID) {
        setError('VITE_GOOGLE_CLIENT_ID is not set. See setup instructions in .env.example.')
        setStatus('unauthenticated')
        return
      }

      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: handleTokenResponse,
      })

      // Restore existing session if token not expired
      const savedToken = sessionStorage.getItem(SESSION_TOKEN_KEY)
      const savedExpiry = sessionStorage.getItem(SESSION_EXPIRY_KEY)
      const savedProfile = sessionStorage.getItem(SESSION_PROFILE_KEY)

      if (savedToken && savedExpiry && Date.now() < parseInt(savedExpiry) - 60_000) {
        const profile = savedProfile ? JSON.parse(savedProfile) : null
        setToken(savedToken)
        setUserProfile(profile)
        setStatus('authenticated')
        onAuthenticated?.(savedToken, profile)
      } else {
        sessionStorage.removeItem(SESSION_TOKEN_KEY)
        sessionStorage.removeItem(SESSION_EXPIRY_KEY)
        sessionStorage.removeItem(SESSION_PROFILE_KEY)
        setStatus('unauthenticated')
      }
    }

    tryInit()
  }, [handleTokenResponse])

  const signIn = useCallback(() => {
    setError(null)
    tokenClientRef.current?.requestToken()
  }, [])

  const signOut = useCallback(() => {
    if (token) {
      window.google?.accounts?.oauth2?.revoke(token, () => {})
    }
    sessionStorage.clear()
    setToken(null)
    setUserProfile(null)
    setStatus('unauthenticated')
    onSignOut?.()
  }, [token, onSignOut])

  // Proactively refresh token 5 minutes before expiry
  useEffect(() => {
    const expiry = sessionStorage.getItem(SESSION_EXPIRY_KEY)
    if (!expiry || !token) return
    const msUntilRefresh = parseInt(expiry) - Date.now() - 5 * 60_000
    if (msUntilRefresh <= 0) return
    const t = setTimeout(() => tokenClientRef.current?.requestToken({ prompt: '' }), msUntilRefresh)
    return () => clearTimeout(t)
  }, [token])

  return (
    <GoogleAuthContext.Provider value={{ status, token, userProfile, signIn, signOut, error }}>
      {children}
    </GoogleAuthContext.Provider>
  )
}

export function useGoogleAuth() {
  const ctx = useContext(GoogleAuthContext)
  if (!ctx) throw new Error('useGoogleAuth must be used within GoogleAuthProvider')
  return ctx
}
