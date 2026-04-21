import React, { useState } from 'react'
import { createNewFile, loadFromDrive, openFilePicker } from '../utils/driveStorage.js'

export default function DriveSetup({ token, onSetup }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function handleCreate() {
    setBusy(true)
    setError(null)
    try {
      const fileId = await createNewFile(token)
      onSetup(fileId, null)
    } catch (e) {
      console.error(e)
      setError('Could not create a plan file. Please try again.')
      setBusy(false)
    }
  }

  function handlePick() {
    setBusy(true)
    setError(null)
    openFilePicker(token, async (fileId) => {
      try {
        const data = await loadFromDrive(token, fileId)
        onSetup(fileId, data)
      } catch (e) {
        console.error(e)
        setError('Could not load the selected file. Make sure it was shared with you.')
        setBusy(false)
      }
    })
    // Picker closing without selection should re-enable buttons
    setTimeout(() => setBusy(false), 15000)
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        <h1 className="font-serif text-3xl text-slate-editorial mb-2 text-center">Get Started</h1>
        <p className="text-sm text-slate-400 font-sans text-center mb-10">
          Your retirement plan is stored in a single file in your Google Drive.<br />
          Only that file is ever accessed — nothing else in your Drive.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleCreate}
            disabled={busy}
            className="w-full bg-slate-editorial text-white font-sans font-medium py-4 px-6 rounded-2xl hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="block text-base">Create a new plan</span>
            <span className="block text-xs text-white/60 mt-0.5">I'm setting this up for the first time</span>
          </button>

          <button
            onClick={handlePick}
            disabled={busy}
            className="w-full bg-white border border-cream-dark text-slate-editorial font-sans font-medium py-4 px-6 rounded-2xl hover:border-gold/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="block text-base">Open my partner's plan</span>
            <span className="block text-xs text-slate-400 mt-0.5">They already created one and shared it with me</span>
          </button>
        </div>

        {error && (
          <p className="mt-6 text-xs text-terracotta font-sans text-center">{error}</p>
        )}

        {busy && (
          <div className="mt-6 flex justify-center">
            <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}
