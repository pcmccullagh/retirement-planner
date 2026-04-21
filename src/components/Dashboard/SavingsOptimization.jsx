import React, { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { calcAllScenarios } from '../../utils/fireCalculations.js'
import { formatCurrency, annualContributions } from '../../utils/calculations.js'
import { Card, SectionTitle, ProgressBar } from '../shared/Card.jsx'

function Slider({ label, value, onChange, min, max, step = 1, format = v => v, tooltip }) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-slate-600 font-sans">{label}</label>
        <span className="text-sm font-semibold text-gold font-sans">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(+e.target.value)}
        className="w-full accent-gold h-1.5"
      />
      {tooltip && <p className="text-xs text-slate-300 mt-1 font-sans">{tooltip}</p>}
    </div>
  )
}

function ScenarioImpact({ label, base, modified, unit = '' }) {
  const diff = modified - base
  const improved = diff < 0
  return (
    <div className="flex items-center justify-between py-2 border-b border-cream-dark last:border-0">
      <span className="text-xs text-slate-500 font-sans">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs tabular-nums text-slate-editorial font-medium">Age {modified ?? '—'}</span>
        {diff !== 0 && (
          <span className={`text-xs font-semibold ${improved ? 'text-sage' : 'text-terracotta'}`}>
            {improved ? `${diff}yr` : `+${diff}yr`}
          </span>
        )}
      </div>
    </div>
  )
}

export default function SavingsOptimization() {
  const { state, updateShared } = useApp()
  const { peter, jennifer, shared } = state

  const [extraSavings, setExtraSavings] = useState(0)
  const [returnBoost, setReturnBoost] = useState(0)
  const [spendingCut, setSpendingCut] = useState(0)
  const [retireDelay, setRetireDelay] = useState(0)

  const baseScenarios = useMemo(
    () => calcAllScenarios(peter, jennifer, shared),
    [peter, jennifer, shared]
  )

  const modifiedShared = useMemo(() => ({
    ...shared,
    expectedReturn: (shared.expectedReturn || 7) + returnBoost,
    retirementAnnualSpending: Math.max(0, (shared.retirementAnnualSpending || 100000) - spendingCut),
  }), [shared, returnBoost, spendingCut])

  const modifiedPeter = useMemo(() => ({
    ...peter,
    retirementAge: peter.retirementAge + retireDelay,
    k401Contribution: peter.k401Contribution + Math.round(extraSavings / 2),
    brokerageContribution: peter.brokerageContribution + Math.round(extraSavings / 2),
  }), [peter, extraSavings, retireDelay])

  const modifiedJennifer = useMemo(() => ({
    ...jennifer,
    retirementAge: jennifer.retirementAge + retireDelay,
    k401Contribution: jennifer.k401Contribution + Math.round(extraSavings / 2),
  }), [jennifer, extraSavings, retireDelay])

  const modifiedScenarios = useMemo(
    () => calcAllScenarios(modifiedPeter, modifiedJennifer, modifiedShared),
    [modifiedPeter, modifiedJennifer, modifiedShared]
  )

  const baseContrib = annualContributions(peter) + annualContributions(jennifer)
  const max401k = 23000
  const maxRoth = 7000
  const maxContrib = (max401k * 2) + (maxRoth * 2)
  const roomToMax = maxContrib - baseContrib

  const coastData = baseScenarios.coast
  const coastPct = coastData.progress

  return (
    <div>
      <SectionTitle subtitle="Adjust variables to see the impact on your retirement timeline in real time">
        Savings Optimization
      </SectionTitle>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Sliders */}
        <Card>
          <h3 className="font-serif text-lg text-slate-editorial mb-1">What-If Sliders</h3>
          <p className="text-xs text-slate-400 font-sans mb-5">Move the sliders to see how small changes accelerate (or delay) your FIRE milestones.</p>

          <Slider
            label="Extra annual savings"
            value={extraSavings}
            onChange={setExtraSavings}
            min={0}
            max={100000}
            step={1000}
            format={v => formatCurrency(v, true)}
            tooltip="Split equally between Peter's 401(k) and brokerage accounts"
          />

          <Slider
            label="Return rate boost"
            value={returnBoost}
            onChange={setReturnBoost}
            min={-2}
            max={3}
            step={0.5}
            format={v => `${v > 0 ? '+' : ''}${v}%`}
            tooltip={`Adjusts from base ${shared.expectedReturn || 7}% to ${(shared.expectedReturn || 7) + returnBoost}%`}
          />

          <Slider
            label="Reduce retirement spending"
            value={spendingCut}
            onChange={setSpendingCut}
            min={0}
            max={50000}
            step={1000}
            format={v => formatCurrency(v, true)}
            tooltip={`Reduces from ${formatCurrency(shared.retirementAnnualSpending || 100000)} to ${formatCurrency(Math.max(0, (shared.retirementAnnualSpending || 100000) - spendingCut))}`}
          />

          <Slider
            label="Delay retirement by"
            value={retireDelay}
            onChange={setRetireDelay}
            min={-3}
            max={10}
            step={1}
            format={v => `${v > 0 ? '+' : ''}${v} yr${Math.abs(v) !== 1 ? 's' : ''}`}
          />
        </Card>

        {/* Impact */}
        <Card>
          <h3 className="font-serif text-lg text-slate-editorial mb-1">Timeline Impact</h3>
          <p className="text-xs text-slate-400 font-sans mb-4">How your changes shift each FIRE milestone (Peter's projected age).</p>

          <div className="space-y-0">
            {[
              { key: 'traditional', label: 'Traditional FIRE' },
              { key: 'lean', label: 'Lean FIRE' },
              { key: 'fat', label: 'Fat FIRE' },
              { key: 'barista', label: 'Barista FIRE' },
              { key: 'coast', label: 'Coast FIRE' },
              { key: 'flamingo', label: 'Flamingo FIRE' },
            ].map(({ key, label }) => (
              <ScenarioImpact
                key={key}
                label={label}
                base={baseScenarios[key]?.pAge}
                modified={modifiedScenarios[key]?.pAge}
              />
            ))}
          </div>

          {(extraSavings > 0 || returnBoost !== 0 || spendingCut > 0 || retireDelay !== 0) && (
            <div className="mt-4 pt-4 border-t border-cream-dark bg-sage-light rounded-xl p-3">
              <p className="text-xs font-semibold text-sage mb-1 font-sans">Combined Effect</p>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                With these changes, your Traditional FIRE number drops to{' '}
                <strong>{formatCurrency(modifiedScenarios.traditional.target)}</strong> and
                you need {formatCurrency(Math.max(0, modifiedScenarios.traditional.target - modifiedScenarios.traditional.portfolio))} more.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Coast FIRE countdown */}
      <Card className="mb-6 border-2 border-gold/20">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-serif text-lg text-slate-editorial">Coast FIRE Countdown</h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Once you hit this number, you can stop saving for retirement entirely.</p>
          </div>
          <span className="text-2xl font-serif text-gold">{coastPct.toFixed(0)}%</span>
        </div>
        <ProgressBar value={coastPct} color="bg-gold" />
        <div className="flex justify-between mt-2 text-xs font-sans text-slate-400">
          <span>Current: {formatCurrency(coastData.portfolio)}</span>
          <span>Coast target: {formatCurrency(coastData.target)}</span>
        </div>
        {coastData.hasHitCoast ? (
          <p className="mt-3 text-sm text-sage font-semibold font-sans">
            🎉 You've hit Coast FIRE! Your money is working hard enough that you only need to cover current living expenses.
          </p>
        ) : (
          <p className="mt-3 text-xs text-slate-500 font-sans">
            You need <strong>{formatCurrency(Math.max(0, coastData.target - coastData.portfolio))}</strong> more to coast. At current savings rates, you'll hit this around age {coastData.pAge ?? '—'}.
          </p>
        )}
      </Card>

      {/* 401k maxing insight */}
      <Card className="bg-cream">
        <h3 className="font-serif text-base text-slate-editorial mb-2">Account Maximization Insight</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm font-sans">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Current Annual Contributions</p>
            <p className="text-xl font-serif text-slate-editorial">{formatCurrency(baseContrib)}</p>
            <p className="text-xs text-slate-400 mt-1">Combined across all accounts</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Available Contribution Room</p>
            <p className={`text-xl font-serif ${roomToMax > 0 ? 'text-gold' : 'text-sage'}`}>
              {roomToMax > 0 ? formatCurrency(roomToMax) : 'Maxed out!'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {roomToMax > 0 ? `vs. IRS max of ${formatCurrency(maxContrib)} combined` : 'Great work — you\'re contributing the maximum allowed.'}
            </p>
          </div>
        </div>
        {roomToMax > 0 && (
          <div className="mt-3 pt-3 border-t border-cream-dark">
            <p className="text-xs text-slate-500 font-sans leading-relaxed">
              <strong>Tip:</strong> Maxing out both 401(k)s (${(max401k * 2).toLocaleString()}/yr combined) plus both Roth IRAs (${(maxRoth * 2).toLocaleString()}/yr) would add{' '}
              <strong>{formatCurrency(roomToMax)}/yr</strong> to your tax-advantaged investing, potentially shaving years off your FIRE timeline.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
