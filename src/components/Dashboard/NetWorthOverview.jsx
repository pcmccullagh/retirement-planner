import React, { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useApp } from '../../context/AppContext.jsx'
import {
  combinedNetWorth, totalPortfolio, homeEquity, formatCurrency,
  combinedInvestments,
} from '../../utils/calculations.js'
import { Card, SectionTitle, ProgressBar } from '../shared/Card.jsx'

const COLORS = ['#C9A84C', '#6B9E7A', '#5B8DB8', '#C4704A', '#9B7CC4']

const MILESTONES = [250000, 500000, 750000, 1000000, 1500000, 2000000, 3000000]

function AnimatedNumber({ value }) {
  return (
    <span className="tabular-nums">{formatCurrency(value)}</span>
  )
}

function MilestoneTracker({ netWorth }) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {MILESTONES.map(m => {
        const reached = netWorth >= m
        const next = !reached && (MILESTONES.find(x => x > netWorth) === m)
        return (
          <div
            key={m}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              reached
                ? 'bg-sage-light border-sage/30 text-sage'
                : next
                ? 'bg-gold/10 border-gold/30 text-gold animate-pulse'
                : 'bg-cream-dark border-cream-dark text-slate-300'
            }`}
          >
            <span>{reached ? '✓' : next ? '◎' : '○'}</span>
            <span>{formatCurrency(m, true)}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function NetWorthOverview() {
  const { state, updateShared } = useApp()
  const { peter, jennifer, realEstate, shared } = state

  const pPortfolio = totalPortfolio(peter)
  const jPortfolio = totalPortfolio(jennifer)
  const cash = shared.cashSavings || 0
  const equity = homeEquity(realEstate)
  const combinedInv = combinedInvestments(peter, jennifer)
  const netWorth = combinedNetWorth(peter, jennifer, realEstate, shared)

  const donutData = [
    { name: 'Retirement Accounts', value: (peter.k401Balance||0)+(peter.iraBalance||0)+(peter.rothBalance||0)+(jennifer.k401Balance||0)+(jennifer.iraBalance||0)+(jennifer.rothBalance||0)+(peter.hsaBalance||0)+(jennifer.hsaBalance||0) },
    { name: 'Taxable Brokerage', value: (peter.brokerageBalance||0)+(jennifer.brokerageBalance||0) },
    { name: 'Home Equity', value: shared.includeHomeEquity ? equity : 0 },
    { name: 'Cash & Savings', value: cash },
  ].filter(d => d.value > 0)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-cream-dark rounded-xl shadow-card px-3 py-2 text-xs">
          <p className="font-medium text-slate-editorial">{payload[0].name}</p>
          <p className="text-gold">{formatCurrency(payload[0].value)}</p>
          <p className="text-slate-400">{((payload[0].value / netWorth) * 100).toFixed(1)}% of net worth</p>
        </div>
      )
    }
    return null
  }

  return (
    <div>
      <SectionTitle subtitle="Your complete financial picture at a glance">
        Net Worth Overview
      </SectionTitle>

      {/* Hero card */}
      <Card className="mb-6 bg-gradient-to-br from-slate-editorial to-slate-700">
        <div className="text-white">
          <p className="text-sm font-sans text-white/60 uppercase tracking-widest mb-1">Combined Net Worth</p>
          <p className="text-4xl md:text-5xl font-serif mb-1">
            <AnimatedNumber value={netWorth} />
          </p>
          <p className="text-sm text-white/50 font-sans">
            {formatCurrency(combinedInv)} invested · {shared.includeHomeEquity ? formatCurrency(equity) : '$0'} home equity
          </p>
          <MilestoneTracker netWorth={netWorth} />
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Donut chart */}
        <Card>
          <h3 className="font-serif text-lg text-slate-editorial mb-1">Asset Breakdown</h3>
          <p className="text-xs text-slate-400 font-sans mb-3">How your wealth is distributed across account types and assets.</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={donutData}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {donutData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Custom legend below chart */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-1">
            {donutData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-slate-500 font-sans">{entry.name}</span>
                <span className="text-xs font-medium text-slate-editorial font-sans">{((entry.value / netWorth) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Per-person breakdown */}
        <Card>
          <h3 className="font-serif text-lg text-slate-editorial mb-4">Investment Accounts</h3>
          <p className="text-xs text-slate-400 font-sans mb-4">Individual account balances for Peter and Jennifer.</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { person: peter, label: "Peter's" },
              { person: jennifer, label: "Jennifer's" },
            ].map(({ person, label }) => (
              <div key={label}>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">{label}</p>
                {[
                  { key: 'k401Balance', name: '401(k)' },
                  { key: 'iraBalance', name: 'Trad. IRA' },
                  { key: 'rothBalance', name: 'Roth IRA' },
                  { key: 'brokerageBalance', name: 'Brokerage' },
                  { key: 'hsaBalance', name: 'HSA' },
                ].map(({ key, name }) => (
                  <div key={key} className="flex justify-between items-center py-1.5 border-b border-cream-dark last:border-0">
                    <span className="text-xs text-slate-500 font-sans">{name}</span>
                    <span className="text-xs font-medium text-slate-editorial tabular-nums">
                      {formatCurrency(person[key] || 0, true)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 mt-1">
                  <span className="text-xs font-semibold text-slate-editorial">Total</span>
                  <span className="text-xs font-semibold text-gold tabular-nums">
                    {formatCurrency(totalPortfolio(person), true)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Real estate & cash */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card>
          <h3 className="font-serif text-base text-slate-editorial mb-1">Home</h3>
          <p className="text-2xl font-serif text-gold mb-1">{formatCurrency(realEstate.homeValue, true)}</p>
          <p className="text-xs text-slate-400 font-sans mb-3">Estimated market value</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-slate-400">Mortgage</span>
              <span className="text-terracotta">−{formatCurrency(realEstate.mortgageBalance, true)}</span>
            </div>
            <div className="flex justify-between text-xs font-sans">
              <span className="text-slate-400">Equity</span>
              <span className="text-sage font-semibold">{formatCurrency(equity, true)}</span>
            </div>
          </div>
          <ProgressBar value={(equity / (realEstate.homeValue || 1)) * 100} className="mt-3" color="bg-sage" />
          <p className="text-xs text-slate-300 mt-1 font-sans">{((equity / (realEstate.homeValue || 1)) * 100).toFixed(0)}% equity</p>
        </Card>

        <Card>
          <h3 className="font-serif text-base text-slate-editorial mb-1">Cash & Savings</h3>
          <p className="text-2xl font-serif text-gold mb-1">{formatCurrency(cash, true)}</p>
          <p className="text-xs text-slate-400 font-sans">Emergency fund / liquid savings</p>
          <div className="mt-4 pt-3 border-t border-cream-dark">
            <p className="text-xs text-slate-500 font-sans">
              Recommended: {formatCurrency((shared.currentAnnualSpending || 120000) / 2, true)} (6 months expenses)
            </p>
            <ProgressBar
              value={(cash / ((shared.currentAnnualSpending || 120000) / 2)) * 100}
              className="mt-2"
              color={cash >= (shared.currentAnnualSpending || 120000) / 2 ? 'bg-sage' : 'bg-terracotta'}
            />
          </div>
        </Card>

        <Card>
          <h3 className="font-serif text-base text-slate-editorial mb-1">Total Debt</h3>
          <p className="text-2xl font-serif text-terracotta mb-1">
            −{formatCurrency((peter.studentLoanBalance||0)+(peter.carLoanBalance||0)+(peter.otherDebtBalance||0)+(jennifer.studentLoanBalance||0)+(jennifer.carLoanBalance||0)+(jennifer.otherDebtBalance||0), true)}
          </p>
          <p className="text-xs text-slate-400 font-sans mb-3">Excluding mortgage</p>
          {[
            { label: 'Student Loans', value: (peter.studentLoanBalance||0)+(jennifer.studentLoanBalance||0) },
            { label: 'Car Loans', value: (peter.carLoanBalance||0)+(jennifer.carLoanBalance||0) },
            { label: 'Other', value: (peter.otherDebtBalance||0)+(jennifer.otherDebtBalance||0) },
          ].filter(d => d.value > 0).map(d => (
            <div key={d.label} className="flex justify-between text-xs font-sans py-1">
              <span className="text-slate-400">{d.label}</span>
              <span className="text-terracotta">−{formatCurrency(d.value, true)}</span>
            </div>
          ))}
          {((peter.studentLoanBalance||0)+(peter.carLoanBalance||0)+(peter.otherDebtBalance||0)+(jennifer.studentLoanBalance||0)+(jennifer.carLoanBalance||0)+(jennifer.otherDebtBalance||0)) === 0 && (
            <p className="text-xs text-sage font-sans">No non-mortgage debt. Excellent!</p>
          )}
        </Card>
      </div>

      {/* Last updated */}
      {state.lastUpdated && (
        <p className="text-xs text-slate-300 text-right font-sans">
          Last updated: {new Date(state.lastUpdated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  )
}
