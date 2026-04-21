export function totalPortfolio(person) {
  return (
    (person.k401Balance || 0) +
    (person.iraBalance || 0) +
    (person.rothBalance || 0) +
    (person.brokerageBalance || 0) +
    (person.hsaBalance || 0)
  )
}

export function annualIncome(person) {
  const base = person.salary || 0
  const bonus =
    person.bonusType === 'percent'
      ? base * ((person.bonusPercent || 0) / 100)
      : person.bonusFixed || 0
  return base + bonus + (person.rsuAnnual || 0) + (person.otherIncome || 0)
}

export function annualContributions(person) {
  return (
    (person.k401Contribution || 0) +
    (person.iraContribution || 0) +
    (person.rothContribution || 0) +
    (person.brokerageContribution || 0) +
    (person.hsaContribution || 0)
  )
}

export function totalLiabilities(peter, jennifer, realEstate) {
  const pDebt =
    (peter.studentLoanBalance || 0) +
    (peter.carLoanBalance || 0) +
    (peter.otherDebtBalance || 0)
  const jDebt =
    (jennifer.studentLoanBalance || 0) +
    (jennifer.carLoanBalance || 0) +
    (jennifer.otherDebtBalance || 0)
  const mortgage = realEstate.mortgageBalance || 0
  return pDebt + jDebt + mortgage
}

export function homeEquity(realEstate) {
  return Math.max(0, (realEstate.homeValue || 0) - (realEstate.mortgageBalance || 0))
}

export function combinedNetWorth(peter, jennifer, realEstate, shared) {
  const investments = totalPortfolio(peter) + totalPortfolio(jennifer)
  const cash = shared.cashSavings || 0
  const equity = shared.includeHomeEquity ? homeEquity(realEstate) : 0
  const otherRE = shared.includeHomeEquity ? (realEstate.otherRealEstateValue || 0) : 0
  const liabilities =
    (peter.studentLoanBalance || 0) +
    (peter.carLoanBalance || 0) +
    (peter.otherDebtBalance || 0) +
    (jennifer.studentLoanBalance || 0) +
    (jennifer.carLoanBalance || 0) +
    (jennifer.otherDebtBalance || 0)
  return investments + cash + equity + otherRE - liabilities
}

export function combinedInvestments(peter, jennifer) {
  return totalPortfolio(peter) + totalPortfolio(jennifer)
}

// Project portfolio value at a future age
export function projectPortfolio(currentPortfolio, annualContrib, returnRate, years) {
  const r = returnRate / 100
  if (years <= 0) return currentPortfolio
  const fv = currentPortfolio * Math.pow(1 + r, years) +
    annualContrib * ((Math.pow(1 + r, years) - 1) / r)
  return fv
}

// Build year-by-year projection data, accounting for SS income reducing withdrawals
export function buildProjectionData(peter, jennifer, realEstate, shared, toAge = 75, includeSS = true) {
  const startAge = Math.min(peter.age, jennifer.age)
  const totalContrib = annualContributions(peter) + annualContributions(jennifer)
  const initialPortfolio = combinedInvestments(peter, jennifer)
  const rates = [5, 7, 9]
  const retireAge = Math.min(peter.retirementAge, jennifer.retirementAge)
  const spending = shared.retirementAnnualSpending || 0

  const safeMultiplier = shared.ssSafeEstimate ? 0.75 : 1
  const peterSSAnnual = includeSS ? (shared.peterSocialSecurity || 0) * 12 * safeMultiplier : 0
  const jenniferSSAnnual = includeSS ? (shared.jenniferSocialSecurity || 0) * 12 * safeMultiplier : 0
  // Years from now when each person starts claiming
  const peterSSYear = (shared.peterSSAge || 67) - peter.age
  const jenniferSSYear = (shared.jenniferSSAge || 67) - jennifer.age

  const data = []
  for (let age = startAge; age <= toAge; age++) {
    const years = age - startAge
    const row = { age, year: new Date().getFullYear() + years }

    rates.forEach((rate) => {
      let portfolio = initialPortfolio
      for (let y = 0; y < years; y++) {
        const currentAge = startAge + y
        const contrib = currentAge < retireAge ? totalContrib : 0
        let withdrawal = 0
        if (currentAge >= retireAge) {
          withdrawal = spending
          if (y >= peterSSYear)    withdrawal -= peterSSAnnual
          if (y >= jenniferSSYear) withdrawal -= jenniferSSAnnual
          withdrawal = Math.max(0, withdrawal)
        }
        portfolio = portfolio * (1 + rate / 100) + contrib - withdrawal
        if (portfolio < 0) portfolio = 0
      }
      row[`rate${rate}`] = Math.round(portfolio)
    })

    data.push(row)
  }
  return data
}

// Years until retirement for a person
export function yearsToRetirement(person) {
  return Math.max(0, person.retirementAge - person.age)
}

// Coast FIRE: amount needed today so it grows to FIRE target by age 65 with no contributions
export function coastFireNumber(fireTarget, currentAge, coastAge = 65, returnRate = 7) {
  const years = Math.max(0, coastAge - currentAge)
  return fireTarget / Math.pow(1 + returnRate / 100, years)
}

// Age at which current portfolio (with contributions) reaches a target
export function ageToReachTarget(currentPortfolio, annualContrib, returnRate, currentAge, target) {
  if (currentPortfolio >= target) return currentAge
  const r = returnRate / 100
  let portfolio = currentPortfolio
  let age = currentAge
  while (portfolio < target && age < 100) {
    portfolio = portfolio * (1 + r) + annualContrib
    age++
  }
  return age >= 100 ? null : age
}

export function formatCurrency(n, compact = false) {
  if (n === null || n === undefined || isNaN(n)) return '$—'
  if (compact) {
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
    if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}K`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export function formatPercent(n) {
  if (n === null || n === undefined || isNaN(n)) return '—%'
  return `${n.toFixed(1)}%`
}
