import React, { useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { Card, SectionTitle } from '../shared/Card.jsx'
import PersonInputs from '../Inputs/PersonInputs.jsx'
import SharedInputs from '../Inputs/SharedInputs.jsx'

const tabs = ['Peter', 'Jennifer', 'Shared']

export default function InputsPage() {
  const { state, updatePeter, updateJennifer, resetToDefaults } = useApp()
  const [activeTab, setActiveTab] = useState('Peter')
  const [showReset, setShowReset] = useState(false)

  function handleExportPDF() {
    window.print()
  }

  return (
    <div>
      <SectionTitle subtitle="Your financial details — all calculations update in real time as you type">
        Your Information
      </SectionTitle>

      {/* Tab bar */}
      <div className="flex gap-1 bg-cream-dark rounded-xl p-1 mb-6 w-fit">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium font-sans transition-all duration-150 ${
              activeTab === tab
                ? 'bg-white text-slate-editorial shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Peter' && (
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-sm font-serif text-gold">P</div>
            <h3 className="font-serif text-lg text-slate-editorial">Peter's Details</h3>
          </div>
          <PersonInputs person={state.peter} update={updatePeter} />
        </Card>
      )}

      {activeTab === 'Jennifer' && (
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-full bg-sage/20 flex items-center justify-center text-sm font-serif text-sage">J</div>
            <h3 className="font-serif text-lg text-slate-editorial">Jennifer's Details</h3>
          </div>
          <PersonInputs person={state.jennifer} update={updateJennifer} color="sage" />
        </Card>
      )}

      {activeTab === 'Shared' && <SharedInputs />}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-6 border-t border-cream-dark">
        <div className="flex gap-3">
          <button onClick={handleExportPDF} className="btn-secondary text-sm flex items-center gap-2 no-print">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            Export / Print
          </button>
        </div>
        <div>
          {!showReset ? (
            <button onClick={() => setShowReset(true)} className="text-xs text-slate-300 hover:text-terracotta font-sans transition-colors">
              Reset to defaults
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-sans">Are you sure?</span>
              <button onClick={() => { resetToDefaults(); setShowReset(false) }} className="text-xs text-terracotta font-medium font-sans">Yes, reset</button>
              <button onClick={() => setShowReset(false)} className="text-xs text-slate-400 font-sans">Cancel</button>
            </div>
          )}
        </div>
      </div>

      {state.lastUpdated && (
        <p className="text-xs text-slate-300 mt-3 font-sans">
          Last saved: {new Date(state.lastUpdated).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  )
}
