import React from 'react'

const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    shortLabel: 'Overview',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    id: 'fire',
    label: 'FIRE Scenarios',
    shortLabel: 'FIRE',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2c0 6-6 8-6 13a6 6 0 0 0 12 0c0-5-6-7-6-13z"/>
        <path d="M12 22v-4"/>
      </svg>
    ),
  },
  {
    id: 'projections',
    label: 'Projections',
    shortLabel: 'Chart',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    id: 'optimize',
    label: 'Optimize',
    shortLabel: 'Optimize',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 19.07l-1.41 1.41M3 12H1m22 0h-2M4.93 4.93L3.5 3.5M19.07 19.07l1.41 1.41M12 1v2m0 18v2"/>
      </svg>
    ),
  },
  {
    id: 'inputs',
    label: 'Inputs',
    shortLabel: 'Inputs',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
  {
    id: 'checklist',
    label: 'Checklist',
    shortLabel: 'Check',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
]

export default function Nav({ active, setActive }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-52 min-h-screen bg-white border-r border-cream-dark py-6 px-3 fixed left-0 top-0 z-40">
        <div className="px-3 mb-8">
          <h1 className="text-lg font-serif text-slate-editorial leading-tight">Our<br/>Retirement</h1>
          <p className="text-xs text-slate-300 mt-0.5 font-sans">Peter & Jennifer</p>
        </div>
        <nav className="flex-1 space-y-0.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${
                active === tab.id
                  ? 'bg-gold/10 text-gold border border-gold/20'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-cream'
              }`}
            >
              <span className={active === tab.id ? 'text-gold' : ''}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="px-3 pt-4 border-t border-cream-dark">
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Personal planning tool.<br/>Not financial advice.
          </p>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-cream-dark shadow-[0_-4px_16px_rgba(0,0,0,0.08)] z-40 flex">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
              active === tab.id ? 'text-gold' : 'text-slate-500'
            }`}
          >
            <span className={`flex items-center justify-center w-9 h-7 rounded-lg transition-colors ${
              active === tab.id ? 'bg-gold/10' : ''
            }`}>
              {tab.icon}
            </span>
            <span className={`text-[11px] font-sans font-medium leading-none ${
              active === tab.id ? 'text-gold' : 'text-slate-500'
            }`}>
              {tab.shortLabel}
            </span>
          </button>
        ))}
      </nav>
    </>
  )
}
