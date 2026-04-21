import {
  combinedInvestments,
  annualContributions,
  coastFireNumber,
  ageToReachTarget,
} from './calculations.js'

function combinedAge(peter, jennifer) {
  return Math.min(peter.age, jennifer.age)
}

function totalContrib(peter, jennifer) {
  return annualContributions(peter) + annualContributions(jennifer)
}

function earliestRetirementAge(peter, jennifer) {
  return Math.min(peter.retirementAge, jennifer.retirementAge)
}

// Combined annual SS income, optionally haircut to 75% for conservatism
function combinedSSAnnual(shared) {
  const multiplier = shared.ssSafeEstimate ? 0.75 : 1
  return ((shared.peterSocialSecurity || 0) + (shared.jenniferSocialSecurity || 0)) * 12 * multiplier
}

// Earlier of the two SS claiming ages (when first SS check arrives)
function firstSSAge(shared) {
  return Math.min(shared.peterSSAge || 67, shared.jenniferSSAge || 67)
}

// Two-phase present value FIRE target.
// Phase 1 (retirement → first SS): withdraws full spending.
// Phase 2 (first SS onward): withdraws spending minus combined SS income.
// Uses real (inflation-adjusted) return rate throughout.
function twoPhaseTarget(spending, ssIncome, retirementAge, ssAge, returnRate, inflationRate, includeSS = true) {
  // Without SS: use classic 25x rule (4% safe withdrawal rate, infinite horizon)
  if (!includeSS || ssIncome <= 0) return Math.round(spending * 25)

  const realR = Math.max(0.001, (returnRate - inflationRate) / 100)
  const gap = Math.max(0, ssAge - retirementAge) // years before SS
  const postYears = 30                            // planning horizon after SS starts
  const netSpending = Math.max(0, spending - ssIncome)

  const pv1 = gap > 0
    ? spending * (1 - Math.pow(1 + realR, -gap)) / realR
    : 0

  const pv2 = netSpending
    * (1 - Math.pow(1 + realR, -postYears)) / realR
    * Math.pow(1 + realR, -gap)

  return Math.round(pv1 + pv2)
}

export function calcTraditionalFire(peter, jennifer, shared, includeSS = true) {
  const spending   = shared.retirementAnnualSpending || 100000
  const ssIncome   = combinedSSAnnual(shared)
  const retireAge  = earliestRetirementAge(peter, jennifer)
  const ssAge      = firstSSAge(shared)
  const r          = shared.expectedReturn || 7
  const inf        = shared.inflationRate  || 3
  const target     = twoPhaseTarget(spending, ssIncome, retireAge, ssAge, r, inf, includeSS)
  const portfolio  = combinedInvestments(peter, jennifer)
  const contrib    = totalContrib(peter, jennifer)
  const progress   = Math.min(100, (portfolio / target) * 100)
  const status     = progress >= 100 ? 'ahead' : progress >= 80 ? 'on-track' : progress >= 60 ? 'close' : 'behind'
  const pAge       = ageToReachTarget(portfolio, contrib, r, peter.age, target)
  const jAge       = ageToReachTarget(portfolio, contrib, r, jennifer.age, target)
  return { target, portfolio, progress, status, pAge, jAge, spending, ssIncome, ssAge }
}

export function calcLeanFire(peter, jennifer, shared, includeSS = true) {
  const spending   = shared.leanFireAmount || 40000
  const ssIncome   = combinedSSAnnual(shared)
  const retireAge  = earliestRetirementAge(peter, jennifer)
  const ssAge      = firstSSAge(shared)
  const r          = shared.expectedReturn || 7
  const inf        = shared.inflationRate  || 3
  const target     = twoPhaseTarget(spending, ssIncome, retireAge, ssAge, r, inf, includeSS)
  const portfolio  = combinedInvestments(peter, jennifer)
  const contrib    = totalContrib(peter, jennifer)
  const progress   = Math.min(100, (portfolio / target) * 100)
  const status     = progress >= 100 ? 'ahead' : progress >= 80 ? 'on-track' : progress >= 60 ? 'close' : 'behind'
  const pAge       = ageToReachTarget(portfolio, contrib, r, peter.age, target)
  const jAge       = ageToReachTarget(portfolio, contrib, r, jennifer.age, target)
  return { target, portfolio, progress, status, pAge, jAge, spending, ssIncome }
}

export function calcFatFire(peter, jennifer, shared, includeSS = true) {
  const spending   = shared.fatFireAmount || 150000
  const ssIncome   = combinedSSAnnual(shared)
  const retireAge  = earliestRetirementAge(peter, jennifer)
  const ssAge      = firstSSAge(shared)
  const r          = shared.expectedReturn || 7
  const inf        = shared.inflationRate  || 3
  const target     = twoPhaseTarget(spending, ssIncome, retireAge, ssAge, r, inf, includeSS)
  const portfolio  = combinedInvestments(peter, jennifer)
  const contrib    = totalContrib(peter, jennifer)
  const progress   = Math.min(100, (portfolio / target) * 100)
  const status     = progress >= 100 ? 'ahead' : progress >= 80 ? 'on-track' : progress >= 60 ? 'close' : 'behind'
  const pAge       = ageToReachTarget(portfolio, contrib, r, peter.age, target)
  const jAge       = ageToReachTarget(portfolio, contrib, r, jennifer.age, target)
  return { target, portfolio, progress, status, pAge, jAge, spending, ssIncome }
}

export function calcBaristaFire(peter, jennifer, shared, includeSS = true) {
  const totalSpending   = shared.retirementAnnualSpending || 100000
  const partTimeIncome  = shared.baristaPartTimeIncome || 24000
  const ssIncome        = combinedSSAnnual(shared)
  const retireAge       = earliestRetirementAge(peter, jennifer)
  const ssAge           = firstSSAge(shared)
  const r               = shared.expectedReturn || 7
  const inf             = shared.inflationRate  || 3
  const phase1Spending  = Math.max(0, totalSpending - partTimeIncome)
  const target          = twoPhaseTarget(phase1Spending, ssIncome, retireAge, ssAge, r, inf, includeSS)
  const portfolio       = combinedInvestments(peter, jennifer)
  const contrib         = totalContrib(peter, jennifer)
  const progress        = Math.min(100, (portfolio / target) * 100)
  const status          = progress >= 100 ? 'ahead' : progress >= 80 ? 'on-track' : progress >= 60 ? 'close' : 'behind'
  const pAge            = ageToReachTarget(portfolio, contrib, r, peter.age, target)
  const jAge            = ageToReachTarget(portfolio, contrib, r, jennifer.age, target)
  return { target, portfolio, progress, status, pAge, jAge, partTimeIncome, totalSpending, portfolioNeeds: phase1Spending, ssIncome }
}

export function calcCoastFire(peter, jennifer, shared, includeSS = true) {
  const spending       = shared.retirementAnnualSpending || 100000
  const ssIncome       = combinedSSAnnual(shared)
  const retireAge      = earliestRetirementAge(peter, jennifer)
  const ssAge          = firstSSAge(shared)
  const r              = shared.expectedReturn || 7
  const inf            = shared.inflationRate  || 3
  const fullFireTarget = twoPhaseTarget(spending, ssIncome, retireAge, ssAge, r, inf, includeSS)
  const pCoastNumber   = coastFireNumber(fullFireTarget, peter.age, 65, r)
  const jCoastNumber   = coastFireNumber(fullFireTarget, jennifer.age, 65, r)
  const portfolio      = combinedInvestments(peter, jennifer)
  const contrib        = totalContrib(peter, jennifer)
  const pCoastAge      = ageToReachTarget(portfolio, contrib, r, peter.age, pCoastNumber)
  const jCoastAge      = ageToReachTarget(portfolio, contrib, r, jennifer.age, jCoastNumber)
  const hasHitCoast    = portfolio >= pCoastNumber || portfolio >= jCoastNumber
  const progress       = Math.min(100, (portfolio / pCoastNumber) * 100)
  const status         = hasHitCoast ? 'ahead' : progress >= 80 ? 'on-track' : progress >= 60 ? 'close' : 'behind'
  return { target: pCoastNumber, portfolio, progress, status, pAge: pCoastAge, jAge: jCoastAge, fullFireTarget, hasHitCoast, spending }
}

export function calcFlamingoFire(peter, jennifer, shared, includeSS = true) {
  const spending       = shared.retirementAnnualSpending || 100000
  const ssIncome       = combinedSSAnnual(shared)
  const retireAge      = earliestRetirementAge(peter, jennifer)
  const ssAge          = firstSSAge(shared)
  const r              = shared.expectedReturn || 7
  const inf            = shared.inflationRate  || 3
  const fullFireTarget = twoPhaseTarget(spending, ssIncome, retireAge, ssAge, r, inf, includeSS)
  const target         = fullFireTarget / 2
  const portfolio      = combinedInvestments(peter, jennifer)
  const contrib        = totalContrib(peter, jennifer)
  const progress       = Math.min(100, (portfolio / target) * 100)
  const status         = progress >= 100 ? 'ahead' : progress >= 80 ? 'on-track' : progress >= 60 ? 'close' : 'behind'
  const pAge           = ageToReachTarget(portfolio, contrib, r, peter.age, target)
  const jAge           = ageToReachTarget(portfolio, contrib, r, jennifer.age, target)
  return { target, portfolio, progress, status, pAge, jAge, fullFireTarget, spending }
}

export function calcSlowFire(peter, jennifer, shared, includeSS = true) {
  const spending       = shared.retirementAnnualSpending || 100000
  const ssIncome       = combinedSSAnnual(shared)
  const retireAge      = earliestRetirementAge(peter, jennifer)
  const ssAge          = firstSSAge(shared)
  const r              = shared.expectedReturn || 7
  const inf            = shared.inflationRate  || 3
  const fullFireTarget = twoPhaseTarget(spending, ssIncome, retireAge, ssAge, r, inf, includeSS)
  const portfolio      = combinedInvestments(peter, jennifer)
  const contrib        = totalContrib(peter, jennifer)
  const passiveIncome  = portfolio * (r / 100) * 0.7
  const incomeProgress = Math.min(100, (passiveIncome / spending) * 100)
  const progress       = Math.min(100, (portfolio / fullFireTarget) * 100)
  const status         = progress >= 100 ? 'ahead' : progress >= 80 ? 'on-track' : progress >= 60 ? 'close' : 'behind'
  const pAge           = ageToReachTarget(portfolio, contrib, r, peter.age, fullFireTarget)
  const jAge           = ageToReachTarget(portfolio, contrib, r, jennifer.age, fullFireTarget)
  return { target: fullFireTarget, portfolio, progress, status, pAge, jAge, passiveIncome, spending, incomeProgress }
}

export function calcAllScenarios(peter, jennifer, shared, includeSS = true) {
  return {
    traditional: calcTraditionalFire(peter, jennifer, shared, includeSS),
    lean:        calcLeanFire(peter, jennifer, shared, includeSS),
    fat:         calcFatFire(peter, jennifer, shared, includeSS),
    barista:     calcBaristaFire(peter, jennifer, shared, includeSS),
    coast:       calcCoastFire(peter, jennifer, shared, includeSS),
    flamingo:    calcFlamingoFire(peter, jennifer, shared, includeSS),
    slow:        calcSlowFire(peter, jennifer, shared, includeSS),
  }
}
