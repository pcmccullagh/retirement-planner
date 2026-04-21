import React from 'react'
import { NumberInput, TextInput, Toggle, SegmentedControl, SectionDivider } from '../shared/FormField.jsx'
import { annualIncome, annualContributions, totalPortfolio, formatCurrency } from '../../utils/calculations.js'

export default function PersonInputs({ person, update, color = 'gold' }) {
  const income = annualIncome(person)
  const contribs = annualContributions(person)
  const portfolio = totalPortfolio(person)

  return (
    <div>
      {/* Summary pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="text-xs px-3 py-1 bg-cream rounded-full border border-cream-dark text-slate-500 font-sans">
          Income: <strong>{formatCurrency(income, true)}</strong>
        </span>
        <span className="text-xs px-3 py-1 bg-cream rounded-full border border-cream-dark text-slate-500 font-sans">
          Portfolio: <strong>{formatCurrency(portfolio, true)}</strong>
        </span>
        <span className="text-xs px-3 py-1 bg-cream rounded-full border border-cream-dark text-slate-500 font-sans">
          Saving: <strong>{formatCurrency(contribs, true)}/yr</strong>
        </span>
      </div>

      <SectionDivider label="Personal" />
      <div className="grid grid-cols-2 gap-3">
        <NumberInput label="Current Age" value={person.age} onChange={v => update('age', v)} prefix="" min={18} max={80} />
        <NumberInput label="Target Retire Age" value={person.retirementAge} onChange={v => update('retirementAge', v)} prefix="" min={person.age + 1} max={80} />
      </div>

      <SectionDivider label="Income (Annual)" />
      <NumberInput
        label="Base Salary"
        value={person.salary}
        onChange={v => update('salary', v)}
        tooltip="Your annual base salary before taxes"
      />
      <div className="mb-3">
        <label className="label">Bonus</label>
        <div className="mb-2">
          <SegmentedControl
            value={person.bonusType}
            onChange={v => update('bonusType', v)}
            options={[{ value: 'percent', label: '% of Salary' }, { value: 'fixed', label: 'Fixed $' }]}
          />
        </div>
        {person.bonusType === 'percent' ? (
          <NumberInput label="Bonus %" value={person.bonusPercent} onChange={v => update('bonusPercent', v)} prefix="" suffix="%" tooltip="Annual bonus as % of base salary" />
        ) : (
          <NumberInput label="Bonus Amount" value={person.bonusFixed} onChange={v => update('bonusFixed', v)} tooltip="Fixed annual bonus amount" />
        )}
      </div>
      <NumberInput label="RSU Vesting (Annual)" value={person.rsuAnnual} onChange={v => update('rsuAnnual', v)} tooltip="Annual value of RSU vesting" />
      <NumberInput label="Other Income" value={person.otherIncome} onChange={v => update('otherIncome', v)} tooltip="Freelance, rental, side income, etc." />

      <SectionDivider label="Investment Accounts" />
      <NumberInput label="401(k) / 403(b) Balance" value={person.k401Balance} onChange={v => update('k401Balance', v)} />
      <NumberInput label="Annual 401(k) Contribution" value={person.k401Contribution} onChange={v => update('k401Contribution', v)} tooltip="IRS 2024 limit: $23,000 ($30,500 if 50+)" />
      <NumberInput label="Employer Match Rate" value={person.employerMatchRate} onChange={v => update('employerMatchRate', v)} prefix="" suffix="%" />
      <NumberInput label="Traditional IRA Balance" value={person.iraBalance} onChange={v => update('iraBalance', v)} />
      <NumberInput label="Annual IRA Contribution" value={person.iraContribution} onChange={v => update('iraContribution', v)} tooltip="IRS 2024 limit: $7,000 ($8,000 if 50+)" />
      <NumberInput label="Roth IRA Balance" value={person.rothBalance} onChange={v => update('rothBalance', v)} />
      <NumberInput label="Annual Roth Contribution" value={person.rothContribution} onChange={v => update('rothContribution', v)} tooltip="Income limits apply. 2024 phase-out: $146K–$161K single, $230K–$240K MFJ" />
      <NumberInput label="Taxable Brokerage Balance" value={person.brokerageBalance} onChange={v => update('brokerageBalance', v)} />
      <NumberInput label="Annual Brokerage Contribution" value={person.brokerageContribution} onChange={v => update('brokerageContribution', v)} />
      <NumberInput label="HSA Balance" value={person.hsaBalance} onChange={v => update('hsaBalance', v)} tooltip="Health Savings Account — triple tax advantage" />
      <NumberInput label="Annual HSA Contribution" value={person.hsaContribution} onChange={v => update('hsaContribution', v)} tooltip="2024 family limit: $8,300" />

      <SectionDivider label="Liabilities" />
      <NumberInput label="Student Loan Balance" value={person.studentLoanBalance} onChange={v => update('studentLoanBalance', v)} />
      <NumberInput label="Student Loan Rate" value={person.studentLoanRate} onChange={v => update('studentLoanRate', v)} prefix="" suffix="%" step={0.1} />
      <NumberInput label="Car Loan Balance" value={person.carLoanBalance} onChange={v => update('carLoanBalance', v)} />
      <NumberInput label="Car Loan Rate" value={person.carLoanRate} onChange={v => update('carLoanRate', v)} prefix="" suffix="%" step={0.1} />
      <NumberInput label="Other Debt Balance" value={person.otherDebtBalance} onChange={v => update('otherDebtBalance', v)} />
      <NumberInput label="Other Debt Rate" value={person.otherDebtRate} onChange={v => update('otherDebtRate', v)} prefix="" suffix="%" step={0.1} />

      <SectionDivider label="Healthcare" />
      <Toggle
        label="Employer-provided healthcare"
        value={person.healthcareEmployer}
        onChange={v => update('healthcareEmployer', v)}
        tooltip="Toggle off if self-insured"
      />
      {!person.healthcareEmployer && (
        <NumberInput
          label="Monthly self-insured cost"
          value={person.healthcareSelfPay}
          onChange={v => update('healthcareSelfPay', v)}
          tooltip="What you'd pay for coverage on the ACA marketplace or COBRA"
        />
      )}
    </div>
  )
}
