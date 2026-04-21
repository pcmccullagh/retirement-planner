import {
  combinedInvestments,
  annualContributions,
  coastFireNumber,
  ageToReachTarget,
  projectPortfolio,
} from './calculations.js'

function combinedAge(peter, jennifer) {
  return Math.min(peter.age, jennifer.age)
}

function combinedRetirementAge(peter, jennifer) {
  return Math.min(peter.retirementAge, jennifer.retirementAge)
}

function totalContrib(peter, jennifer) {
  return annualContributions(peter) + annualContributions(jennifer)
}

export function calcTraditionalFire(peter, jennifer, shared) {
  const spending = shared.retirementAnnualSpending || 100000
  const target = spending * 25
  const portfolio = combinedInvestments(peter, jennifer)
  const contrib = totalContrib(peter, jennifer)
  const r = shared.expectedReturn || 7
  const currentAge = combinedAge(peter, jennifer)
  const pAge = ageToReachTarget(portfolio, contrib, r, peter.age, target)
  const jAge = ageToReachTarget(portfolio, contrib, r, jennifer.age, target)
  const progress = Math.min(100, (portfolio / target) * 100)
  const status = progress >= 100 ? 'ahead' : progress >= 80 ? 'on-track' : progress >= 60 ? 'close' : 'behind'
  return { target, portfolio, progress, status, pAge, jAge, spending }
}

export function calcLeanFire(peter, jennifer, shared) {
  const spending = shared.leanFireAmount || 40000
  const target = spending * 25
  const portfolio = combinedInvestments(peter, jennifer)
  const contrib = totalContrib(peter, jennifer)
  const r = shared.expectedReturn || 7
  const pAge = ageToReachTarget(portfolio, contrib, r, peter.age, target)
  const jAge = ageToReachTarget(portfolio, contrib, r, jennifer.age, target)
  const progress = Math.min(100, (portfolio / target) * 100)
  const status = progress >= 100 ? 'ahead' : progress >= 80 ? 'on-track' : progress >= 60 ? 'close' : 'behind'
  return { target, portfolio, progress, status, pAge, jAge, spending }
}

export function calcFatFire(peter, jennifer, shared) {
  const spending = shared.fatFireAmount || 150000
  const target = spending * 25
  const portfolio = combinedInvestments(peter, jennifer)
  const contrib = totalContrib(peter, jennifer)
  const r = shared.expectedReturn || 7
  const pAge = ageToReachTarget(portfolio, contrib, r, peter.age, target)
  const jAge = ageToReachTarget(portfolio, contrib, r, jennifer.age, target)
  const progress = Math.min(100, (portfolio / target) * 100)
  const status = progress >= 100 ? 'ahead' : progress >= 80 ? 'on-track' : progress >= 60 ? 'close' : 'behind'
  return { target, portfolio, progress, status, pAge, jAge, spending }
}

export function calcBaristaFire(peter, jennifer, shared) {
  const totalSpending = shared.retirementAnnualSpending || 100000
  const partTimeIncome = shared.baristaPartTimeIncome || 24000
  const portfolioNeeds = Math.max(0, totalSpending - partTimeIncome)
  const target = portfolioNeeds * 25
  const portfolio = combinedInvestments(peter, jennifer)
  const contrib = totalContrib(peter, jennifer)
  const r = shared.expectedReturn || 7
  const pAge = ageToReachTarget(portfolio, contrib, r, peter.age, target)
  const jAge = ageToReachTarget(portfolio, contrib, r, jennifer.age, target)
  const progress = Math.min(100, (portfolio / target) * 100)
  const status = progress >= 100 ? 'ahead' : progress >= 80 ? 'on-track' : progress >= 60 ? 'close' : 'behind'
  return { target, portfolio, progress, status, pAge, jAge, partTimeIncome, totalSpending, portfolioNeeds }
}

export function calcCoastFire(peter, jennifer, shared) {
  const spending = shared.retirementAnnualSpending || 100000
  const fullFireTarget = spending * 25
  const r = shared.expectedReturn || 7
  const pCoastNumber = coastFireNumber(fullFireTarget, peter.age, 65, r)
  const jCoastNumber = coastFireNumber(fullFireTarget, jennifer.age, 65, r)
  const coastNumber = Math.min(pCoastNumber, jCoastNumber) // whichever is younger/smaller need

  const portfolio = combinedInvestments(peter, jennifer)
  const contrib = totalContrib(peter, jennifer)

  // Age when they hit coast number
  const pCoastAge = ageToReachTarget(portfolio, contrib, r, peter.age, pCoastNumber)
  const jCoastAge = ageToReachTarget(portfolio, contrib, r, jennifer.age, jCoastNumber)

  const hasHitCoast = portfolio >= pCoastNumber || portfolio >= jCoastNumber
  const progress = Math.min(100, (portfolio / pCoastNumber) * 100)
  const status = hasHitCoast ? 'ahead' : progress >= 80 ? 'on-track' : progress >= 60 ? 'close' : 'behind'

  return {
    target: pCoastNumber,
    portfolio,
    progress,
    status,
    pAge: pCoastAge,
    jAge: jCoastAge,
    fullFireTarget,
    hasHitCoast,
    spending,
  }
}

export function calcFlamingoFire(peter, jennifer, shared) {
  const spending = shared.retirementAnnualSpending || 100000
  const fullFireTarget = spending * 25
  const target = fullFireTarget / 2
  const portfolio = combinedInvestments(peter, jennifer)
  const contrib = totalContrib(peter, jennifer)
  const r = shared.expectedReturn || 7
  const pAge = ageToReachTarget(portfolio, contrib, r, peter.age, target)
  const jAge = ageToReachTarget(portfolio, contrib, r, jennifer.age, target)
  const progress = Math.min(100, (portfolio / target) * 100)
  const status = progress >= 100 ? 'ahead' : progress >= 80 ? 'on-track' : progress >= 60 ? 'close' : 'behind'
  return { target, portfolio, progress, status, pAge, jAge, fullFireTarget, spending }
}

export function calcSlowFire(peter, jennifer, shared) {
  const spending = shared.retirementAnnualSpending || 100000
  const fullFireTarget = spending * 25
  const portfolio = combinedInvestments(peter, jennifer)
  const r = shared.expectedReturn || 7
  const passiveIncome = portfolio * (r / 100) * 0.7 // conservative 70% of returns as income
  const incomeProgress = Math.min(100, (passiveIncome / spending) * 100)
  const contrib = totalContrib(peter, jennifer)
  const pAge = ageToReachTarget(portfolio, contrib, r, peter.age, fullFireTarget)
  const jAge = ageToReachTarget(portfolio, contrib, r, jennifer.age, fullFireTarget)
  const progress = Math.min(100, (portfolio / fullFireTarget) * 100)
  const status = progress >= 100 ? 'ahead' : progress >= 80 ? 'on-track' : progress >= 60 ? 'close' : 'behind'
  return { target: fullFireTarget, portfolio, progress, status, pAge, jAge, passiveIncome, spending, incomeProgress }
}

export function calcAllScenarios(peter, jennifer, shared) {
  return {
    traditional: calcTraditionalFire(peter, jennifer, shared),
    lean: calcLeanFire(peter, jennifer, shared),
    fat: calcFatFire(peter, jennifer, shared),
    barista: calcBaristaFire(peter, jennifer, shared),
    coast: calcCoastFire(peter, jennifer, shared),
    flamingo: calcFlamingoFire(peter, jennifer, shared),
    slow: calcSlowFire(peter, jennifer, shared),
  }
}
