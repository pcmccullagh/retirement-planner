import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { DEFAULT_STATE } from '../utils/defaults.js'
import { auth, db } from '../utils/firebase.js'
import { doc, setDoc } from 'firebase/firestore'

const AppContext = createContext(null)

const LOCAL_CACHE_KEY = 'retirement_planner_cache_v1'

export function AppProvider({ children, initialData }) {
  const [state, setState] = useState(() => {
    if (initialData) return { ...DEFAULT_STATE, ...initialData }
    try {
      const cached = localStorage.getItem(LOCAL_CACHE_KEY)
      if (cached) return { ...DEFAULT_STATE, ...JSON.parse(cached) }
    } catch {}
    return DEFAULT_STATE
  })

  const [syncStatus, setSyncStatus] = useState('idle')
  const saveTimerRef = useRef(null)

  useEffect(() => {
    try { localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(state)) } catch {}

    if (!auth?.currentUser || !db) return

    clearTimeout(saveTimerRef.current)
    setSyncStatus('saving')
    saveTimerRef.current = setTimeout(async () => {
      try {
        await setDoc(doc(db, 'plans', 'shared'), { ...state, lastUpdated: new Date().toISOString() }, { merge: true })
        setSyncStatus('saved')
        setTimeout(() => setSyncStatus('idle'), 2500)
      } catch (e) {
        console.error('Firestore save error:', e)
        setSyncStatus('error')
      }
    }, 2000)

    return () => clearTimeout(saveTimerRef.current)
  }, [state])

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
