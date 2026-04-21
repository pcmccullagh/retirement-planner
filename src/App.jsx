import React, { useState, useEffect } from 'react'
import { FirebaseAuthProvider, useFirebaseAuth } from './context/FirebaseAuthContext.jsx'
import { AppProvider, useApp } from './context/AppContext.jsx'
import Login from './components/Login.jsx'
import Nav from './components/shared/Nav.jsx'
import NetWorthOverview from './components/Dashboard/NetWorthOverview.jsx'
import FireScenarios from './components/Dashboard/FireScenarios.jsx'
import ProjectionChart from './components/Dashboard/ProjectionChart.jsx'
import SavingsOptimization from './components/Dashboard/SavingsOptimization.jsx'
import RetirementChecklist from './components/Dashboard/RetirementChecklist.jsx'
import InputsPage from './components/Dashboard/InputsPage.jsx'
import { db } from './utils/firebase.js'
import { doc, getDoc } from 'firebase/firestore'

const LOCAL_CACHE_KEY = 'retirement_planner_cache_v1'

// ── Loading screen ──────────────────────────────────────────────────────────
function LoadingScreen({ message }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      <p className="text-sm text-slate-400 font-sans">{message}</p>
    </div>
  )
}

// ── Sync status indicator ───────────────────────────────────────────────────
function SyncIndicator() {
  const { syncStatus } = useApp()
  if (syncStatus === 'idle') return null

  const config = {
    saving: { text: 'Saving…',     color: 'text-slate-400', dot: 'bg-gold animate-pulse' },
    saved:  { text: 'Saved',       color: 'text-sage',       dot: 'bg-sage' },
    error:  { text: 'Save failed', color: 'text-terracotta', dot: 'bg-terracotta' },
  }[syncStatus]

  if (!config) return null

  return (
    <div className={`flex items-center gap-1.5 text-xs font-sans ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.text}
    </div>
  )
}

// ── Main app shell ──────────────────────────────────────────────────────────
function MainApp({ userProfile }) {
  const [page, setPage] = useState('overview')
  const { signOut } = useFirebaseAuth()

  const pages = {
    overview:    <NetWorthOverview />,
    fire:        <FireScenarios />,
    projections: <ProjectionChart />,
    optimize:    <SavingsOptimization />,
    inputs:      <InputsPage />,
    checklist:   <RetirementChecklist />,
  }

  const displayName = userProfile?.given_name
    ? `Welcome back, ${userProfile.given_name}`
    : 'Welcome back'

  return (
    <div className="min-h-screen bg-cream">
      <Nav active={page} setActive={setPage} />

      <main className="md:ml-52 pb-20 md:pb-8">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-8 no-print">
            <div>
              <p className="text-xs text-slate-300 font-sans uppercase tracking-widest mb-0.5">
                {displayName}
              </p>
              <h1 className="text-xl font-serif text-slate-editorial">
                Peter & Jennifer's Plan
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <SyncIndicator />
              {userProfile?.picture ? (
                <img
                  src={userProfile.picture}
                  alt={userProfile.name}
                  className="w-8 h-8 rounded-full border-2 border-cream-dark"
                  title={`Signed in as ${userProfile.email}`}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-xs font-serif text-gold">
                  {userProfile?.given_name?.[0] ?? 'P'}
                </div>
              )}
              <button
                onClick={signOut}
                className="text-xs text-slate-300 hover:text-slate-500 font-sans transition-colors"
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          </div>

          {pages[page] ?? pages.overview}

          <footer className="mt-12 pt-6 border-t border-cream-dark text-center">
            <p className="text-xs text-slate-300 font-sans">
              This tool is for personal planning purposes only and does not constitute financial advice.
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}

// ── Firebase-aware wrapper ──────────────────────────────────────────────────
function FirebaseApp({ user }) {
  const [appStatus, setAppStatus]   = useState('loading')
  const [initialData, setInitialData] = useState(null)
  const [loadWarning, setLoadWarning] = useState(null)

  useEffect(() => {
    getDoc(doc(db, 'plans', 'shared'))
      .then(snap => {
        setInitialData(snap.exists() ? snap.data() : null)
        setAppStatus('ready')
      })
      .catch(err => {
        console.error('Firestore load error:', err)
        try {
          const cached = localStorage.getItem(LOCAL_CACHE_KEY)
          if (cached) setInitialData(JSON.parse(cached))
        } catch {}
        setLoadWarning("Firestore unavailable — showing cached data. Changes won't be saved until reconnected.")
        setAppStatus('ready')
      })
  }, [user.uid])

  if (appStatus === 'loading') {
    return <LoadingScreen message="Loading your plan…" />
  }

  const userProfile = {
    given_name: user.displayName?.split(' ')[0] ?? '',
    name:       user.displayName ?? '',
    email:      user.email ?? '',
    picture:    user.photoURL ?? null,
  }

  return (
    <AppProvider initialData={initialData}>
      {loadWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
          <p className="text-xs text-amber-700 font-sans">{loadWarning}</p>
        </div>
      )}
      <MainApp userProfile={userProfile} />
    </AppProvider>
  )
}

// ── Root ─────────────────────────────────────────────────────────────────────
function AuthGate() {
  const { status, user } = useFirebaseAuth()
  if (status === 'initializing') return <LoadingScreen message="Initializing…" />
  if (status === 'unauthenticated') return <Login />
  return <FirebaseApp user={user} />
}

export default function App() {
  return (
    <FirebaseAuthProvider>
      <AuthGate />
    </FirebaseAuthProvider>
  )
}
