import React from 'react'

export function NumberInput({ label, value, onChange, prefix = '$', suffix, tooltip, min, max, step = 1 }) {
  return (
    <div className="mb-3">
      <label className="label">
        {label}
        {tooltip && (
          <span className="group relative inline-block ml-1">
            <span className="w-3.5 h-3.5 rounded-full bg-cream-dark text-slate-400 text-xs inline-flex items-center justify-center cursor-help">?</span>
            <span className="absolute bottom-full left-0 mb-1 w-56 bg-slate-editorial text-white text-xs rounded-lg px-2.5 py-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-lg">
              {tooltip}
            </span>
          </span>
        )}
      </label>
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-slate-400 text-sm">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className={`input-field ${prefix ? 'pl-6' : ''} ${suffix ? 'pr-10' : ''}`}
        />
        {suffix && <span className="absolute right-3 text-slate-400 text-sm">{suffix}</span>}
      </div>
    </div>
  )
}

export function TextInput({ label, value, onChange }) {
  return (
    <div className="mb-3">
      <label className="label">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field"
      />
    </div>
  )
}

export function Toggle({ label, value, onChange, tooltip }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <label className="text-sm text-slate-600 font-sans">
        {label}
        {tooltip && (
          <span className="group relative inline-block ml-1">
            <span className="w-3.5 h-3.5 rounded-full bg-cream-dark text-slate-400 text-xs inline-flex items-center justify-center cursor-help">?</span>
            <span className="absolute bottom-full left-0 mb-1 w-52 bg-slate-editorial text-white text-xs rounded-lg px-2.5 py-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-lg">
              {tooltip}
            </span>
          </span>
        )}
      </label>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gold/30 ${value ? 'bg-gold' : 'bg-cream-dark'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

export function Select({ label, value, onChange, options }) {
  return (
    <div className="mb-3">
      <label className="label">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

export function SegmentedControl({ value, onChange, options }) {
  return (
    <div className="flex rounded-lg bg-cream p-0.5 border border-cream-dark">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 text-xs py-1.5 px-2 rounded-md transition-all duration-150 font-medium ${
            value === opt.value
              ? 'bg-white shadow-sm text-slate-editorial'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-2 my-4">
      <div className="h-px flex-1 bg-cream-dark" />
      <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">{label}</span>
      <div className="h-px flex-1 bg-cream-dark" />
    </div>
  )
}
