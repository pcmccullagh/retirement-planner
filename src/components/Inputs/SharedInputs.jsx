import React from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { NumberInput, Toggle, SegmentedControl, SectionDivider } from '../shared/FormField.jsx'
import { Card } from '../shared/Card.jsx'
import { homeEquity, formatCurrency } from '../../utils/calculations.js'

export default function SharedInputs() {
  const { state, updateRealEstate, updateShared } = useApp()
  const { realEstate, shared } = state

  const equity = homeEquity(realEstate)

  return (
    <div className="space-y-6">
      {/* Real Estate */}
      <Card>
        <h3 className="font-serif text-lg text-slate-editorial mb-4">🏡 Real Estate</h3>
        <div className="text-xs text-slate-400 font-sans mb-4 bg-cream rounded-lg p-3">
          Current equity: <strong className="text-sage">{formatCurrency(equity)}</strong> ({((equity / (realEstate.homeValue || 1)) * 100).toFixed(0)}% of home value)
        </div>
        <NumberInput label="Home Estimated Value" value={realEstate.homeValue} onChange={v => updateRealEstate('homeValue', v)} />
        <NumberInput label="Mortgage Balance Remaining" value={realEstate.mortgageBalance} onChange={v => updateRealEstate('mortgageBalance', v)} />
        <NumberInput label="Monthly Mortgage Payment" value={realEstate.monthlyMortgage} onChange={v => updateRealEstate('monthlyMortgage', v)} />
        <NumberInput label="Mortgage Interest Rate" value={realEstate.mortgageRate} onChange={v => updateRealEstate('mortgageRate', v)} prefix="" suffix="%" step={0.05} />
        <NumberInput label="Years Remaining on Mortgage" value={realEstate.mortgageYearsRemaining} onChange={v => updateRealEstate('mortgageYearsRemaining', v)} prefix="" suffix="yrs" />
        <NumberInput label="Other Real Estate Value" value={realEstate.otherRealEstateValue} onChange={v => updateRealEstate('otherRealEstateValue', v)} tooltip="Rental properties, vacation homes, etc." />
      </Card>

      {/* Cash & Expenses */}
      <Card>
        <h3 className="font-serif text-lg text-slate-editorial mb-4">💰 Cash & Expenses</h3>
        <NumberInput label="Emergency Fund / Cash Savings" value={shared.cashSavings} onChange={v => updateShared('cashSavings', v)} />

        <SectionDivider label="Annual Expenses" />
        <NumberInput label="Current Annual Spending" value={shared.currentAnnualSpending} onChange={v => updateShared('currentAnnualSpending', v)} tooltip="What you actually spend today, all-in" />
        <NumberInput label="Expected Retirement Spending" value={shared.retirementAnnualSpending} onChange={v => updateShared('retirementAnnualSpending', v)} tooltip="In today's dollars — your retirement lifestyle budget" />
        <NumberInput label="Essential Expenses" value={shared.essentialExpenses} onChange={v => updateShared('essentialExpenses', v)} tooltip="Housing, food, healthcare, utilities — non-negotiable" />
        <NumberInput label="Discretionary Expenses" value={shared.discretionaryExpenses} onChange={v => updateShared('discretionaryExpenses', v)} tooltip="Travel, dining, hobbies, entertainment" />

        <SectionDivider label="FIRE Targets (Adjustable)" />
        <NumberInput label="Lean FIRE Annual Spending" value={shared.leanFireAmount} onChange={v => updateShared('leanFireAmount', v)} tooltip="Bare minimum to cover essentials" />
        <NumberInput label="Fat FIRE Annual Spending" value={shared.fatFireAmount} onChange={v => updateShared('fatFireAmount', v)} tooltip="Full lifestyle, no compromises" />
        <NumberInput label="Barista Part-Time Income" value={shared.baristaPartTimeIncome} onChange={v => updateShared('baristaPartTimeIncome', v)} tooltip="Annual income from part-time or semi-retirement work" />
      </Card>

      {/* Assumptions */}
      <Card>
        <h3 className="font-serif text-lg text-slate-editorial mb-4">⚙️ Planning Assumptions</h3>
        <p className="text-xs text-slate-400 font-sans mb-4">These drive all calculations. Adjust to reflect your outlook.</p>

        <NumberInput label="Expected Annual Investment Return" value={shared.expectedReturn} onChange={v => updateShared('expectedReturn', v)} prefix="" suffix="%" step={0.5} tooltip="Historical S&P 500: ~10% nominal, ~7% real (inflation-adjusted). Using 7% is conservative and common in FIRE planning." />
        <NumberInput label="Expected Inflation Rate" value={shared.inflationRate} onChange={v => updateShared('inflationRate', v)} prefix="" suffix="%" step={0.5} tooltip="Fed target is 2%. Using 3% builds in a safety margin." />
        <NumberInput label="Home Appreciation Rate" value={shared.homeAppreciationRate} onChange={v => updateShared('homeAppreciationRate', v)} prefix="" suffix="%" step={0.5} tooltip="National average ~3–4%/year. May vary significantly by market." />

        <SectionDivider label="Social Security" />
        <div className="grid grid-cols-2 gap-3">
          <NumberInput label="Peter's SS Estimate ($/mo)" value={shared.peterSocialSecurity} onChange={v => updateShared('peterSocialSecurity', v)} tooltip="From ssa.gov — check your Social Security Statement" />
          <NumberInput label="Peter's Claiming Age" value={shared.peterSSAge} onChange={v => updateShared('peterSSAge', v)} prefix="" min={62} max={70} />
          <NumberInput label="Jennifer's SS Estimate ($/mo)" value={shared.jenniferSocialSecurity} onChange={v => updateShared('jenniferSocialSecurity', v)} />
          <NumberInput label="Jennifer's Claiming Age" value={shared.jenniferSSAge} onChange={v => updateShared('jenniferSSAge', v)} prefix="" min={62} max={70} />
        </div>

        <SectionDivider label="Display Options" />
        <Toggle
          label="Include home equity in net worth"
          value={shared.includeHomeEquity}
          onChange={v => updateShared('includeHomeEquity', v)}
          tooltip="Some FIRE planners exclude home equity since it's illiquid. Toggle to see both views."
        />
      </Card>
    </div>
  )
}
