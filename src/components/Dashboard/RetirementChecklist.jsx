import React, { useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { Card, SectionTitle } from '../shared/Card.jsx'

const CHECKLIST_ITEMS = [
  {
    id: 'healthcareBridge',
    title: 'Healthcare Bridge Plan',
    subtitle: 'Pre-Medicare coverage strategy (ages 60–65)',
    detail: 'This is often the biggest wildcard for early retirees. Before Medicare at 65, you\'ll need coverage — through a spouse\'s employer, ACA marketplace, COBRA, or health sharing. Budget at minimum $1,500–$2,500/month for a family plan. Factor this into your FIRE number.',
    icon: '🏥',
    priority: 'critical',
  },
  {
    id: 'accountAccess',
    title: 'Retirement Account Access Strategy',
    subtitle: '59½ rule, 72(t) distributions, and Roth conversion ladder',
    detail: 'Traditional retirement accounts penalize withdrawals before 59½. FIRE retirees use three main workarounds: (1) Rule 72(t): Take Substantially Equal Periodic Payments (SEPP) penalty-free. (2) Roth Conversion Ladder: Convert traditional IRA to Roth over 5 years, then withdraw contributions tax-free. (3) Taxable brokerage as a bridge until 59½.',
    icon: '🔓',
    priority: 'critical',
  },
  {
    id: 'rothLadder',
    title: 'Roth Conversion Ladder',
    subtitle: 'Begin converting to Roth 5 years before planned retirement',
    detail: 'Each Roth conversion requires a 5-year seasoning period before penalty-free withdrawal. If you plan to retire at 55, start converting in your late 40s. Conversions are taxable income — do them in years with lower income, or strategically fill lower tax brackets.',
    icon: '🪜',
    priority: 'high',
  },
  {
    id: 'socialSecurity',
    title: 'Social Security Optimization',
    subtitle: 'When to claim for maximum lifetime benefit',
    detail: 'Every year you delay claiming SS past 62 increases your benefit by ~8%/year up to age 70. For a married couple, a common strategy is for the higher earner to delay to 70 (for maximum survivor benefit) while the lower earner claims earlier. Run breakeven analysis: at what age does delaying pay off?',
    icon: '🏛️',
    priority: 'medium',
  },
  {
    id: 'taxStrategy',
    title: 'Tax Strategy in Retirement',
    subtitle: 'Bracket management, Roth conversions, and capital gains harvesting',
    detail: 'In retirement, you control your taxable income. Key strategies: (1) Fill lower tax brackets each year with Roth conversions before SS and RMDs begin. (2) Harvest capital gains at 0% rate while in lower brackets. (3) Coordinate SS timing to minimize "torpedo" taxation of benefits. (4) Use HSA for tax-free medical expenses.',
    icon: '📊',
    priority: 'high',
  },
  {
    id: 'collegeFunding',
    title: 'College Funding (529)',
    subtitle: 'Status of education savings plans',
    detail: '529 plans grow tax-free for education expenses. Contributions are not federally deductible but may be state-deductible. New 2024 rule: unused 529 funds can be rolled into a Roth IRA (lifetime limit of $35,000 per beneficiary, 15-year rule). Consider your target retirement age vs. when children need funds.',
    icon: '🎓',
    priority: 'medium',
  },
  {
    id: 'estatePlanning',
    title: 'Estate Planning Basics',
    subtitle: 'Wills, beneficiary designations, and power of attorney',
    detail: 'At minimum: (1) Update beneficiary designations on all accounts — these override wills. (2) Create or update wills. (3) Healthcare proxy / durable power of attorney. (4) Term life insurance adequate to cover income replacement and mortgage. Consider a revocable living trust to avoid probate for your estate level.',
    icon: '📜',
    priority: 'high',
  },
  {
    id: 'emergencyFund',
    title: 'Emergency Fund',
    subtitle: '6–12 months of expenses in liquid savings',
    detail: 'In early retirement, your emergency fund becomes even more important — you want to avoid selling investments during a downturn to cover unexpected costs. Target 12 months of expenses in cash/high-yield savings, separate from your portfolio. This is your sequence-of-returns buffer.',
    icon: '🛡️',
    priority: 'high',
  },
]

const STATUS_OPTIONS = [
  { value: 'not-started', label: 'Not Started', cls: 'bg-cream-dark text-slate-400 border-cream-dark' },
  { value: 'in-progress', label: 'In Progress', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'done', label: 'Done', cls: 'bg-sage-light text-sage border-sage/20' },
]

const PRIORITY_LABELS = {
  critical: { label: 'Critical', cls: 'text-terracotta bg-terracotta-light border-terracotta/20' },
  high: { label: 'High Priority', cls: 'text-amber-700 bg-amber-50 border-amber-200' },
  medium: { label: 'Medium', cls: 'text-slate-400 bg-cream-dark border-cream-dark' },
}

function ChecklistItem({ item, status, notes, onStatusChange, onNotesChange }) {
  const [expanded, setExpanded] = useState(false)
  const currentStatus = STATUS_OPTIONS.find(s => s.value === (status || 'not-started'))
  const priority = PRIORITY_LABELS[item.priority]

  return (
    <Card className={`mb-4 transition-all duration-200 ${status === 'done' ? 'opacity-80' : ''}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{item.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <div>
              <h3 className={`font-serif text-base ${status === 'done' ? 'line-through text-slate-400' : 'text-slate-editorial'}`}>
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">{item.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium font-sans ${priority.cls}`}>{priority.label}</span>
            </div>
          </div>

          {/* Status selector */}
          <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => onStatusChange(opt.value)}
                className={`text-xs px-3 py-1 rounded-full border font-medium font-sans transition-all ${
                  (status || 'not-started') === opt.value
                    ? opt.cls
                    : 'bg-cream text-slate-300 border-cream-dark hover:text-slate-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Notes */}
          <textarea
            value={notes || ''}
            onChange={e => onNotesChange(e.target.value)}
            placeholder="Add notes, action items, or reminders…"
            rows={2}
            className="input-field text-xs resize-none"
          />

          {/* Expand detail */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-gold hover:text-gold-dark font-medium font-sans mt-2 flex items-center gap-1 transition-colors"
          >
            {expanded ? '▲ Less info' : '▼ What you need to know'}
          </button>

          {expanded && (
            <div className="mt-3 pt-3 border-t border-cream-dark">
              <p className="text-xs text-slate-500 font-sans leading-relaxed">{item.detail}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default function RetirementChecklist() {
  const { state, updateChecklist } = useApp()
  const { checklist } = state

  const done = CHECKLIST_ITEMS.filter(i => checklist[i.id]?.status === 'done').length
  const inProgress = CHECKLIST_ITEMS.filter(i => checklist[i.id]?.status === 'in-progress').length
  const total = CHECKLIST_ITEMS.length

  return (
    <div>
      <SectionTitle subtitle="The non-portfolio side of early retirement — just as important as the numbers">
        Early Retirement Checklist
      </SectionTitle>

      {/* Progress summary */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-serif text-lg text-slate-editorial">Planning Progress</p>
            <p className="text-xs text-slate-400 font-sans">{done} of {total} items complete · {inProgress} in progress</p>
          </div>
          <span className="text-3xl font-serif text-gold">{Math.round((done / total) * 100)}%</span>
        </div>
        <div className="w-full bg-cream-dark rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gold transition-all duration-700"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-xs font-sans">
          <span className="flex items-center gap-1.5 text-sage"><span className="w-2 h-2 rounded-full bg-sage inline-block" />{done} done</span>
          <span className="flex items-center gap-1.5 text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />{inProgress} in progress</span>
          <span className="flex items-center gap-1.5 text-slate-400"><span className="w-2 h-2 rounded-full bg-cream-dark inline-block" />{total - done - inProgress} not started</span>
        </div>
      </Card>

      {/* Critical items first */}
      <div>
        {['critical', 'high', 'medium'].map(priority => {
          const items = CHECKLIST_ITEMS.filter(i => i.priority === priority)
          return (
            <div key={priority} className="mb-6">
              <h3 className="font-serif text-base text-slate-editorial mb-3 capitalize">
                {priority === 'critical' ? '🚨 Critical Items' : priority === 'high' ? '⚡ High Priority' : '📌 When Ready'}
              </h3>
              {items.map(item => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  status={checklist[item.id]?.status}
                  notes={checklist[item.id]?.notes}
                  onStatusChange={value => updateChecklist(item.id, 'status', value)}
                  onNotesChange={value => updateChecklist(item.id, 'notes', value)}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
