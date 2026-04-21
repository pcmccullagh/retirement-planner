import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { fetchUserProfile } from '../utils/driveStorage.js'

const CLIENT_ID     = import.meta.env.VITE_GOOGLE_CLIENT_ID
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'openid',
].join(' ')

const SESSION_TOKEN_KEY  = 'goog_token'
const SESSION_EXPIRY_KEY = 'goog_expiry'
const SESSION_PROFILE_KEY = 'goog_profile'
const PKCE_VERIFIER_KEY  = 'pkce_verifier'

const GoogleAuthContext = createContext(null)

// ── PKCE helpers ─────────────────────────────────────────────────────────────
async function generateCodeVerifier() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function getRedirectUri() {
  // Must exactly match an Authorized Redirect URI in Google Cloud Console
  return window.location.origin + window.location.pathname
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function GoogleAuthProvider({ children }) {
  const [status, setStatus]           = useState('initializing')
  const [token, setToken]             = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [error, setError]             = useState(null)

  const persistSession = useCallback(async (accessToken, expiresIn) => {
    const expiry = Date.now() + expiresIn * 1000
    sessionStorage.setItem(SESSION_TOKEN_KEY,  accessToken)
    sessionStorage.setItem(SESSION_EXPIRY_KEY, String(expiry))

    setToken(accessToken)

    try {
      const profile = await fetchUserProfile(accessToken)
      setUserProfile(profile)
      sessionStorage.setItem(SESSION_PROFILE_KEY, JSON.stringify(profile))
    } catch {}

    setStatus('authenticated')
  }, [])

  // On mount: handle OAuth redirect callback OR restore saved session
  useEffect(() => {
    const params    = new URLSearchParams(window.location.search)
    const code      = params.get('code')
    const authError = params.get('error')

    if (authError) {
      window.history.replaceState({}, '', window.location.pathname)
      setError('Google sign-in was cancelled. Please try again.')
      setStatus('unauthenticated')
      return
    }

    if (code) {
      // Clean URL immediately so a refresh doesn't re-use the code
      window.history.replaceState({}, '', window.location.pathname)

      const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY)
      sessionStorage.removeItem(PKCE_VERIFIER_KEY)

      if (!verifier) {
        setError('Session expired during sign-in. Please try again.')
        setStatus('unauthenticated')
        return
      }

      setStatus('initializing')

      fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id:     CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri:  getRedirectUri(),
          grant_type:    'authorization_code',
          code_verifier: verifier,
        }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.error) {
            setError(`Sign-in failed: ${data.error_description || data.error}`)
            setStatus('unauthenticated')
            return
          }
          persistSession(data.access_token, data.expires_in)
        })
        .catch(() => {
          setError('Failed to complete sign-in. Please try again.')
          setStatus('unauthenticated')
        })

      return
    }

    // No OAuth callback — check for a saved valid session
    const savedToken   = sessionStorage.getItem(SESSION_TOKEN_KEY)
    const savedExpiry  = sessionStorage.getItem(SESSION_EXPIRY_KEY)
    const savedProfile = sessionStorage.getItem(SESSION_PROFILE_KEY)

    if (savedToken && savedExpiry && Date.now() < parseInt(savedExpiry) - 60_000) {
      setToken(savedToken)
      if (savedProfile) setUserProfile(JSON.parse(savedProfile))
      setStatus('authenticated')
    } else {
      sessionStorage.removeItem(SESSION_TOKEN_KEY)
      sessionStorage.removeItem(SESSION_EXPIRY_KEY)
      sessionStorage.removeItem(SESSION_PROFILE_KEY)
      setStatus('unauthenticated')
    }
  }, [persistSession])

  const signIn = useCallback(async () => {
    if (!CLIENT_ID) {
      setError('App is not configured (missing Client ID). Check your .env.local file.')
      return
    }
    setError(null)
    try {
      const verifier  = await generateCodeVerifier()
      const challenge = await generateCodeChallenge(verifier)
      sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier)

      const authParams = new URLSearchParams({
        client_id:             CLIENT_ID,
        redirect_uri:          getRedirectUri(),
        response_type:         'code',
        scope:                 SCOPES,
        code_challenge:        challenge,
        code_challenge_method: 'S256',
        access_type:           'online',
        include_granted_scopes: 'true',
        prompt:                'consent',
      })

      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${authParams}`
    } catch {
      setError('Failed to start sign-in. Please try again.')
    }
  }, [])

  const signOut = useCallback(() => {
    sessionStorage.clear()
    setToken(null)
    setUserProfile(null)
    setStatus('unauthenticated')
  }, [])

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
