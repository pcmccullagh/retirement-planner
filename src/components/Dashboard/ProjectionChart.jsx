import React, { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceArea, ResponsiveContainer, Legend,
} from 'recharts'
import { useApp } from '../../context/AppContext.jsx'
import { buildProjectionData, formatCurrency, combinedInvestments } from '../../utils/calculations.js'
import { calcAllScenarios } from '../../utils/fireCalculations.js'
import { Card, SectionTitle } from '../shared/Card.jsx'
import { Toggle } from '../shared/FormField.jsx'

const RATE_COLORS = { rate5: '#C4704A', rate7: '#C9A84C', rate9: '#6B9E7A' }
const FIRE_LINE_COLORS = {
  traditional: '#5B8DB8',
  lean: '#6B9E7A',
  fat: '#C9A84C',
  coast: '#9B7CC4',
}

function formatYAxis(value) {
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`
  return `$${value}`
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-cream-dark rounded-xl shadow-card px-4 py-3 min-w-48">
        <p className="text-xs font-semibold text-slate-editorial mb-2 font-sans">Age {label}</p>
        {payload.map(p => (
          <div key={p.dataKey} className="flex justify-between gap-4 text-xs font-sans mb-0.5">
            <span style={{ color: p.color }}>{p.name}</span>
            <span className="tabular-nums font-medium">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function ProjectionChart() {
  const { state } = useApp()
  const { peter, jennifer, realEstate, shared } = state
  const [includeSS, setIncludeSS] = useState(true)
  const [showFireLines, setShowFireLines] = useState(true)
  const [selectedScenarios, setSelectedScenarios] = useState(['traditional', 'lean', 'fat'])
  const [retireAge, setRetireAge] = useState(Math.min(peter.retirementAge, jennifer.retirementAge))

  const data = buildProjectionData(peter, jennifer, realEstate, shared, 75, includeSS)
  const scenarios = calcAllScenarios(peter, jennifer, shared, includeSS)

  const startAge = Math.min(peter.age, jennifer.age)
  const peterSSChartAge = startAge + (shared.peterSSAge || 67) - peter.age
  const jenniferSSChartAge = startAge + (shared.jenniferSSAge || 67) - jennifer.age
  const hasSS = (shared.peterSocialSecurity || 0) + (shared.jenniferSocialSecurity || 0) > 0

  const fireLines = [
    { id: 'traditional', label: 'Traditional FIRE', target: scenarios.traditional.target },
    { id: 'lean', label: 'Lean FIRE', target: scenarios.lean.target },
    { id: 'fat', label: 'Fat FIRE', target: scenarios.fat.target },
    { id: 'coast', label: 'Coast FIRE', target: scenarios.coast.target },
  ]

  const toggleScenario = (id) => {
    setSelectedScenarios(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  return (
    <div>
      <SectionTitle subtitle="See how your portfolio grows over time under different return assumptions">
        Portfolio Projections
      </SectionTitle>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="font-serif text-lg text-slate-editorial">Growth Trajectory</h3>
            <div className="flex items-center gap-4">
              <Toggle label="Social Security" value={includeSS} onChange={setIncludeSS} />
              <Toggle label="FIRE targets" value={showFireLines} onChange={setShowFireLines} />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2EEE6" />
              <XAxis
                dataKey="age"
                tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#94a3b8' }}
                tickLine={false}
                label={{ value: 'Age', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#94a3b8' }}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                width={65}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span className="text-xs font-sans text-slate-600">{value}</span>}
                iconType="circle"
                iconSize={8}
              />

              <Line dataKey="rate5" name="Conservative (5%)" stroke={RATE_COLORS.rate5} strokeWidth={2} dot={false} strokeDasharray="4 2" />
              <Line dataKey="rate7" name="Moderate (7%)" stroke={RATE_COLORS.rate7} strokeWidth={2.5} dot={false} />
              <Line dataKey="rate9" name="Optimistic (9%)" stroke={RATE_COLORS.rate9} strokeWidth={2} dot={false} strokeDasharray="2 2" />

              {/* Retirement age vertical line */}
              <ReferenceLine
                x={retireAge}
                stroke="#C9A84C"
                strokeWidth={2}
                strokeDasharray="6 3"
                label={{ value: `Target Retire (${retireAge})`, position: 'top', fontSize: 10, fill: '#C9A84C', fontFamily: 'DM Sans' }}
              />

              {/* Social Security claiming ages */}
              {includeSS && hasSS && peterSSChartAge !== jenniferSSChartAge ? (
                <>
                  <ReferenceLine x={peterSSChartAge} stroke="#6B9E7A" strokeWidth={1.5} strokeDasharray="3 3"
                    label={{ value: `Peter SS (${shared.peterSSAge})`, position: 'insideTopRight', fontSize: 9, fill: '#6B9E7A', fontFamily: 'DM Sans' }} />
                  <ReferenceLine x={jenniferSSChartAge} stroke="#5B8DB8" strokeWidth={1.5} strokeDasharray="3 3"
                    label={{ value: `Jennifer SS (${shared.jenniferSSAge})`, position: 'insideTopRight', fontSize: 9, fill: '#5B8DB8', fontFamily: 'DM Sans' }} />
                </>
              ) : includeSS && hasSS ? (
                <ReferenceLine x={peterSSChartAge} stroke="#6B9E7A" strokeWidth={1.5} strokeDasharray="3 3"
                  label={{ value: `SS begins (${shared.peterSSAge})`, position: 'insideTopRight', fontSize: 9, fill: '#6B9E7A', fontFamily: 'DM Sans' }} />
              ) : null}

              {/* FIRE target lines */}
              {showFireLines && fireLines.map(fl => (
                <ReferenceLine
                  key={fl.id}
                  y={fl.target}
                  stroke={FIRE_LINE_COLORS[fl.id]}
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  label={{ value: fl.label, position: 'right', fontSize: 9, fill: FIRE_LINE_COLORS[fl.id], fontFamily: 'DM Sans' }}
                />
              ))}

              {/* Safe withdrawal shaded band around 4% WR */}
              {data[0] && (
                <ReferenceArea
                  y1={scenarios.traditional.target * 0.95}
                  y2={scenarios.traditional.target * 1.05}
                  fill="#5B8DB8"
                  fillOpacity={0.06}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Controls */}
        <Card>
          <h3 className="font-serif text-base text-slate-editorial mb-4">Chart Controls</h3>

          <div className="mb-5">
            <label className="label">Target Retirement Age</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="45"
                max="70"
                value={retireAge}
                onChange={e => setRetireAge(+e.target.value)}
                className="flex-1 accent-gold"
              />
              <span className="text-lg font-serif text-gold w-8 text-right">{retireAge}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-cream-dark">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">FIRE Milestones</p>
            {fireLines.map(fl => (
              <div key={fl.id} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 rounded" style={{ backgroundColor: FIRE_LINE_COLORS[fl.id] }} />
                  <span className="text-xs text-slate-500 font-sans">{fl.label}</span>
                </div>
                <span className="text-xs font-medium tabular-nums text-slate-editorial">{formatCurrency(fl.target, true)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-cream-dark">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Assumptions</p>
            <div className="space-y-1 text-xs font-sans text-slate-400">
              <p>Return: {shared.expectedReturn || 7}% (moderate)</p>
              <p>Inflation: {shared.inflationRate || 3}%</p>
              <p>Withdrawals begin at retirement</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-cream-dark">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Projected Values at {retireAge}</p>
            {['rate5', 'rate7', 'rate9'].map(rate => {
              const point = data.find(d => d.age === retireAge)
              const label = { rate5: 'Conservative', rate7: 'Moderate', rate9: 'Optimistic' }
              return point ? (
                <div key={rate} className="flex justify-between py-1 text-xs font-sans">
                  <span style={{ color: RATE_COLORS[rate] }}>{label[rate]}</span>
                  <span className="font-medium tabular-nums">{formatCurrency(point[rate], true)}</span>
                </div>
              ) : null
            })}
          </div>
        </Card>
      </div>

      <Card className="bg-cream">
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          <strong className="text-slate-500">How to read this chart:</strong> The three lines show your portfolio value from today to age 75 under conservative (5%), moderate (7%), and optimistic (9%) annual returns. Contributions stop at retirement and withdrawals begin. Green/blue vertical lines mark when Social Security kicks in — at those points the portfolio withdrawal drops by the SS amount, which is why the lines often flatten or curve upward. FIRE target lines reflect the two-phase model accounting for SS income.
        </p>
      </Card>
    </div>
  )
}
