import React, { useState, useCallback } from 'react'
import { GoogleAuthProvider, useGoogleAuth } from './context/GoogleAuthContext.jsx'
import { AppProvider, useApp } from './context/AppContext.jsx'
import Login from './components/Login.jsx'
import Nav from './components/shared/Nav.jsx'
import NetWorthOverview from './components/Dashboard/NetWorthOverview.jsx'
import FireScenarios from './components/Dashboard/FireScenarios.jsx'
import ProjectionChart from './components/Dashboard/ProjectionChart.jsx'
import SavingsOptimization from './components/Dashboard/SavingsOptimization.jsx'
import RetirementChecklist from './components/Dashboard/RetirementChecklist.jsx'
import InputsPage from './components/Dashboard/InputsPage.jsx'
import { loadFromDrive } from './utils/driveStorage.js'

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
    saving: { text: 'Saving to Drive…', color: 'text-slate-400', dot: 'bg-gold animate-pulse' },
    saved:  { text: 'Saved to Drive',   color: 'text-sage',       dot: 'bg-sage' },
    error:  { text: 'Save failed',      color: 'text-terracotta', dot: 'bg-terracotta' },
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
  const { signOut } = useGoogleAuth()

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

// ── Drive-aware wrapper ─────────────────────────────────────────────────────
function DriveApp({ token, userProfile }) {
  const [driveStatus, setDriveStatus] = useState('loading') // loading | ready | error
  const [driveData, setDriveData] = useState(null)
  const [driveRef, setDriveRef] = useState({ folderId: null, fileId: null })
  const [driveError, setDriveError] = useState(null)

  // Load from Drive once we have a token
  React.useEffect(() => {
    if (!token) return
    setDriveStatus('loading')
    loadFromDrive(token)
      .then(({ data, folderId, fileId }) => {
        setDriveData(data)
        setDriveRef({ folderId, fileId })
        setDriveStatus('ready')
      })
      .catch(err => {
        console.error('Drive load error:', err)
        setDriveError(err.message)
        setDriveStatus('error')
      })
  }, [token])

  if (driveStatus === 'loading') {
    return <LoadingScreen message="Loading your plan from Google Drive…" />
  }

  if (driveStatus === 'error') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-card border border-cream-dark p-8 max-w-md text-center">
          <p className="text-2xl mb-3">⚠️</p>
          <h2 className="font-serif text-lg text-slate-editorial mb-2">Couldn't reach Google Drive</h2>
          <p className="text-xs text-slate-400 font-sans mb-4">{driveError}</p>
          <button onClick={() => window.location.reload()} className="btn-primary text-sm">
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <AppProvider
      initialData={driveData}
      token={token}
      driveRef={driveRef}
      onDriveRefUpdate={setDriveRef}
    >
      <MainApp userProfile={userProfile} />
    </AppProvider>
  )
}

// ── Root ─────────────────────────────────────────────────────────────────────
function AuthGate() {
  const { status, token, userProfile } = useGoogleAuth()

  if (status === 'initializing') return <LoadingScreen message="Initializing…" />
  if (status === 'unauthenticated') return <Login />
  return <DriveApp token={token} userProfile={userProfile} />
}

export default function App() {
  return (
    <GoogleAuthProvider>
      <AuthGate />
    </GoogleAuthProvider>
  )
}
