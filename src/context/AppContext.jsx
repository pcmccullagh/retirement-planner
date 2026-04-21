import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { DEFAULT_STATE } from '../utils/defaults.js'
import { saveToDrive } from '../utils/driveStorage.js'

const AppContext = createContext(null)

const LOCAL_CACHE_KEY = 'retirement_planner_cache_v1'

export function AppProvider({ children, initialData, token, driveRef, onDriveRefUpdate }) {
  const [state, setState] = useState(() => {
    // Use Drive data if available, otherwise fall back to local cache
    if (initialData) return { ...DEFAULT_STATE, ...initialData }
    try {
      const cached = localStorage.getItem(LOCAL_CACHE_KEY)
      if (cached) return { ...DEFAULT_STATE, ...JSON.parse(cached) }
    } catch {}
    return DEFAULT_STATE
  })

  const [syncStatus, setSyncStatus] = useState('idle') // idle | saving | saved | error
  const saveTimerRef = useRef(null)
  const driveRefRef = useRef(driveRef)

  // Keep driveRef current without re-triggering save effect
  useEffect(() => { driveRefRef.current = driveRef }, [driveRef])

  // Debounced save to Drive + local cache on state change
  useEffect(() => {
    // Always update local cache immediately
    try { localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(state)) } catch {}

    if (!token) return

    clearTimeout(saveTimerRef.current)
    setSyncStatus('saving')
    saveTimerRef.current = setTimeout(async () => {
      try {
        const { fileId } = driveRefRef.current
        if (!fileId) return
        await saveToDrive(token, state, fileId)
        setSyncStatus('saved')
        setTimeout(() => setSyncStatus('idle'), 2500)
      } catch (e) {
        console.error('Drive save error:', e)
        setSyncStatus('error')
      }
    }, 2000)

    return () => clearTimeout(saveTimerRef.current)
  }, [state, token])

  const updatePeter = useCallback((field, value) => {
    setState(s => ({ ...s, peter: { ...s.peter, [field]: value }, lastUpdated: new Date().toISOString() }))
  }, [])

  const updateJennifer = useCallback((field, value) => {
    setState(s => ({ ...s, jennifer: { ...s.jennifer, [field]: value }, lastUpdated: new Date().toISOString() }))
  }, [])

  const updateRealEstate = useCallback((field, value) => {
    setState(s => ({ ...s, realEstate: { ...s.realEstate, [field]: value }, lastUpdated: new Date().toISOString() }))
  }, [])

  const updateShared = useCallback((field, value) => {
    setState(s => ({ ...s, shared: { ...s.shared, [field]: value }, lastUpdated: new Date().toISOString() }))
  }, [])

  const updateChecklist = useCallback((item, field, value) => {
    setState(s => ({
      ...s,
      checklist: { ...s.checklist, [item]: { ...s.checklist[item], [field]: value } },
      lastUpdated: new Date().toISOString(),
    }))
  }, [])

  const resetToDefaults = useCallback(() => setState(DEFAULT_STATE), [])

  return (
    <AppContext.Provider value={{
      state,
      syncStatus,
      updatePeter,
      updateJennifer,
      updateRealEstate,
      updateShared,
      updateChecklist,
      resetToDefaults,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
