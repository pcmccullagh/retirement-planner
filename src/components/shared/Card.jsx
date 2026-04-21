import React from 'react'

export function Card({ children, className = '', onClick }) {
  return (
    <div
      className={`card ${onClick ? 'cursor-pointer hover:shadow-card-hover transition-shadow duration-200' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function SectionTitle({ children, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-serif text-slate-editorial">{children}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-1 font-sans">{subtitle}</p>}
    </div>
  )
}

export function Tooltip({ content, children }) {
  return (
    <span className="group relative inline-flex items-center">
      {children}
      <span className="ml-1 w-4 h-4 rounded-full bg-cream-dark text-slate-400 text-xs flex items-center justify-center cursor-help">?</span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-editorial text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-lg">
        {content}
      </span>
    </span>
  )
}

export function StatusBadge({ status }) {
  const labels = {
    'ahead': 'Ahead of Schedule',
    'on-track': 'On Track',
    'close': 'Getting Close',
    'behind': 'Needs Attention',
  }
  const cls = {
    'ahead': 'status-ahead',
    'on-track': 'status-on-track',
    'close': 'status-close',
    'behind': 'status-behind',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls[status] || 'status-close'}`}>
      {labels[status] || status}
    </span>
  )
}

export function ProgressBar({ value, className = '', color }) {
  const pct = Math.min(100, Math.max(0, value || 0))
  const barColor = color || (pct >= 100 ? 'bg-sage' : pct >= 80 ? 'bg-gold' : pct >= 60 ? 'bg-amber-400' : 'bg-terracotta')
  return (
    <div className={`w-full bg-cream-dark rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-2 rounded-full transition-all duration-700 ease-out ${barColor}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
