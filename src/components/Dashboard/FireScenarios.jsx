import React, { useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { calcAllScenarios } from '../../utils/fireCalculations.js'
import { formatCurrency } from '../../utils/calculations.js'
import { Card, SectionTitle, StatusBadge, ProgressBar } from '../shared/Card.jsx'

const SCENARIO_META = {
  traditional: {
    name: 'Traditional FIRE',
    emoji: '🏛️',
    description: 'The classic rule: save 25× your annual expenses and withdraw 4% per year. Designed for a 30-year retirement, though researchers note 4% may be slightly aggressive for 40-50 year horizons. For an early retiree like you, a 3.5% withdrawal (≈28.5× rule) offers extra safety.',
    formula: '25 × annual retirement spending',
    color: 'border-slate-200',
    accent: '#5B8DB8',
  },
  lean: {
    name: 'Lean FIRE',
    emoji: '🌱',
    description: 'Retire early by covering only essential expenses — housing, food, healthcare, utilities. This means a simpler lifestyle but maximum freedom, fastest timeline. Great as a floor: once you hit Lean FIRE, you\'re never truly stuck.',
    formula: '25 × essential/lean annual expenses',
    color: 'border-sage/30',
    accent: '#6B9E7A',
  },
  fat: {
    name: 'Fat FIRE',
    emoji: '✨',
    description: 'Retire with zero lifestyle compromise — travel, dining, hobbies, gifting. Your Fat FIRE number is built directly from your inputs. This is the gold standard for those who want full financial freedom without trimming the good life.',
    formula: '25 × full lifestyle expenses',
    color: 'border-gold/30',
    accent: '#C9A84C',
  },
  barista: {
    name: 'Barista FIRE',
    emoji: '☕',
    description: 'Semi-retire early: build a smaller portfolio and supplement with part-time work. Part-time work also solves the pre-Medicare healthcare gap — many employers cover benefits even for part-time staff. The portfolio handles the bulk; you earn the rest.',
    formula: '25 × (annual spending − part-time income)',
    color: 'border-amber-200',
    accent: '#D4884A',
  },
  coast: {
    name: 'Coast FIRE',
    emoji: '🌊',
    description: 'Invest enough today so that — with zero new contributions — compound growth alone carries you to your full FIRE number by age 65. Once you hit Coast FIRE, you only need to cover today\'s living expenses. No more retirement saving required.',
    formula: 'Full FIRE target ÷ (1 + return)^years to 65',
    color: 'border-blue-200',
    accent: '#5BA3C9',
    highlight: true,
  },
  flamingo: {
    name: 'Flamingo FIRE',
    emoji: '🦩',
    description: 'Reach half your FIRE number, then semi-retire. Your half-portfolio continues to double while you work part-time or at a lower-stress job. A beautiful middle path: you\'re already half-done, and the second half takes care of itself.',
    formula: '½ × full FIRE target (25× spending)',
    color: 'border-pink-200',
    accent: '#C47AAA',
  },
  slow: {
    name: 'Work Optional',
    emoji: '🧘',
    description: 'Your portfolio generates meaningful passive income, covering a large portion of expenses. You continue working by choice — for purpose, community, structure — not necessity. When work becomes optional, everything changes.',
    formula: 'Portfolio × expected return (conservative)',
    color: 'border-purple-200',
    accent: '#9B7CC4',
  },
}

function ScenarioCard({ id, data }) {
  const [expanded, setExpanded] = useState(false)
  const meta = SCENARIO_META[id]
  if (!meta) return null

  const isCoast = id === 'coast'
  const isSlow = id === 'slow'

  return (
    <Card
      className={`border-2 ${meta.color} ${meta.highlight ? 'ring-2 ring-gold/20' : ''} transition-all duration-200`}
    >
      {meta.highlight && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xs font-semibold text-gold uppercase tracking-widest bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20">
            ⭐ Especially Relevant
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-2xl mr-2">{meta.emoji}</span>
          <h3 className="font-serif text-lg text-slate-editorial inline">{meta.name}</h3>
        </div>
        <StatusBadge status={data.status} />
      </div>

      {/* Target */}
      <div className="mb-3">
        <p className="text-xs text-slate-400 font-sans uppercase tracking-wide">Target Portfolio</p>
        <p className="text-2xl font-serif" style={{ color: meta.accent }}>
          {formatCurrency(data.target)}
        </p>
        <p className="text-xs text-slate-400 font-sans mt-0.5">{meta.formula}</p>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs font-sans text-slate-400 mb-1">
          <span>Current: {formatCurrency(data.portfolio)}</span>
          <span>{data.progress.toFixed(0)}%</span>
        </div>
        <ProgressBar value={data.progress} />
      </div>

      {/* Projected ages */}
      {!isCoast && !isSlow && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-cream rounded-lg px-3 py-2">
            <p className="text-xs text-slate-400 font-sans">Peter reaches it</p>
            <p className="font-semibold text-slate-editorial text-sm">
              {data.pAge ? `Age ${data.pAge}` : 'Before 65'}
            </p>
          </div>
          <div className="bg-cream rounded-lg px-3 py-2">
            <p className="text-xs text-slate-400 font-sans">Jennifer reaches it</p>
            <p className="font-semibold text-slate-editorial text-sm">
              {data.jAge ? `Age ${data.jAge}` : 'Before 65'}
            </p>
          </div>
        </div>
      )}

      {/* Coast specific */}
      {isCoast && (
        <div className="mb-3 bg-cream rounded-xl p-3">
          {data.hasHitCoast ? (
            <p className="text-sm text-sage font-semibold font-sans">
              🎉 You've already hit Coast FIRE! Your investments will grow to {formatCurrency(data.fullFireTarget)} by age 65 without any new contributions.
            </p>
          ) : (
            <>
              <p className="text-xs text-slate-500 font-sans mb-2">
                You need <strong>{formatCurrency(data.target)}</strong> invested today to coast to {formatCurrency(data.fullFireTarget)} by 65.
              </p>
              <p className="text-xs text-slate-400 font-sans">
                Peter at coast age: {data.pAge ? `${data.pAge}` : '—'} · Jennifer: {data.jAge ? `${data.jAge}` : '—'}
              </p>
            </>
          )}
        </div>
      )}

      {/* Barista specific */}
      {id === 'barista' && (
        <div className="mb-3 bg-cream rounded-xl p-3 text-xs text-slate-500 font-sans">
          Part-time income needed: <strong>{formatCurrency(data.partTimeIncome)}/yr</strong> — covers {formatCurrency(data.totalSpending - data.portfolioNeeds * 0.04)}/yr of expenses and healthcare.
        </div>
      )}

      {/* Slow FIRE passive income */}
      {isSlow && (
        <div className="mb-3 bg-cream rounded-xl p-3">
          <div className="flex justify-between text-xs font-sans mb-1">
            <span className="text-slate-400">Current Passive Income</span>
            <span className="font-semibold text-slate-editorial">{formatCurrency(data.passiveIncome)}/yr</span>
          </div>
          <div className="flex justify-between text-xs font-sans">
            <span className="text-slate-400">Annual Expenses</span>
            <span>{formatCurrency(data.spending)}/yr</span>
          </div>
          <ProgressBar value={data.incomeProgress} className="mt-2" />
          <p className="text-xs text-slate-400 mt-1 font-sans">Portfolio covers {data.incomeProgress.toFixed(0)}% of expenses</p>
        </div>
      )}

      {/* Expandable description */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-gold hover:text-gold-dark font-medium font-sans flex items-center gap-1 mt-1 transition-colors"
      >
        {expanded ? '▲ Less detail' : '▼ What does this mean?'}
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-cream-dark">
          <p className="text-xs text-slate-500 font-sans leading-relaxed">{meta.description}</p>
        </div>
      )}
    </Card>
  )
}

export default function FireScenarios() {
  const { state } = useApp()
  const { peter, jennifer, shared } = state
  const [includeSS, setIncludeSS] = useState(true)

  const scenarios    = calcAllScenarios(peter, jennifer, shared, includeSS)
  const scenariosNoSS = calcAllScenarios(peter, jennifer, shared, false)

  const hasSS = (shared.peterSocialSecurity || 0) + (shared.jenniferSocialSecurity || 0) > 0
  const ssSavings = scenariosNoSS.traditional.target - scenarios.traditional.target

  // Find best scenario for them
  const aheadScenarios = Object.entries(scenarios).filter(([, d]) => d.status === 'ahead' || d.status === 'on-track')
  const recommended = aheadScenarios.length > 0 ? aheadScenarios[aheadScenarios.length - 1][0] : 'lean'

  return (
    <div>
      <SectionTitle subtitle="Seven ways to think about financial independence — all calculated from your numbers">
        FIRE Scenarios
      </SectionTitle>

      {/* SS toggle */}
      {hasSS && (
        <Card className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-editorial font-sans">Include Social Security</p>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                {includeSS
                  ? `SS reduces your required portfolio by ${formatCurrency(ssSavings, true)} — a two-phase model replacing the simple 25× rule.`
                  : 'Showing traditional 25× rule with no SS income assumed.'}
              </p>
            </div>
            <button
              onClick={() => setIncludeSS(v => !v)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                includeSS ? 'bg-sage' : 'bg-slate-200'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${includeSS ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </Card>
      )}

      <Card className="mb-6 bg-amber-50 border-amber-200">
        <div className="flex gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1 font-sans">Your Strongest Position</p>
            <p className="text-xs text-amber-700 font-sans leading-relaxed">
              Based on your current portfolio of <strong>{formatCurrency(Object.values(scenarios)[0].portfolio)}</strong>, your most achievable near-term milestone is <strong>{SCENARIO_META[recommended]?.name}</strong>. Coast FIRE is especially worth watching — it redefines what "enough" means.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Object.entries(scenarios).map(([id, data]) => (
          <ScenarioCard key={id} id={id} data={data} />
        ))}
      </div>

      <div className="mt-6 p-4 bg-cream rounded-xl border border-cream-dark">
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          <strong className="text-slate-500">How these are calculated:</strong>{' '}
          {includeSS && hasSS
            ? `With SS enabled, targets use a two-phase present-value model: full spending withdrawals until SS begins at ${shared.peterSSAge || 67}, then reduced withdrawals (spending minus SS income) for 30 years after. This is more accurate than the simple 25× rule for early retirees.`
            : 'FIRE numbers use the 4% Safe Withdrawal Rate (SWR) — a target portfolio of 25× your annual expenses.'
          }{' '}
          Coast FIRE divides the full target by compound growth factor to age 65. Projections assume {shared.expectedReturn || 7}% annual returns and {shared.inflationRate || 3}% inflation.
        </p>
      </div>
    </div>
  )
}
