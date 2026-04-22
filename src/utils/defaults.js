export const DEFAULT_STATE = {
  peter: {
    name: 'Peter',
    age: 38,
    retirementAge: 55,
    salary: 225000,
    bonusType: 'percent',
    bonusPercent: 20,          // $45k bonus on $225k base
    bonusFixed: 0,
    rsuAnnual: 61250,          // Salesforce RSUs
    otherIncome: 0,
    k401Balance: 305461,       // Salesforce 401k (4/21/26)
    iraBalance: 117741,        // Traditional IRA (4/21/26)
    rothBalance: 0,
    brokerageBalance: 402668,  // Schwab $348,570 + Betterment $54,098 (4/21/26)
    hsaBalance: 0,
    employerMatchRate: 8,      // Salesforce ~8% match
    k401Contribution: 23500,   // 2026 IRS employee limit
    iraContribution: 0,
    rothContribution: 0,
    brokerageContribution: 75000, // ~half of annual surplus
    hsaContribution: 7550,     // 2026 family HSA limit
    studentLoanBalance: 0,
    studentLoanRate: 0,
    carLoanBalance: 0,
    carLoanRate: 0,
    otherDebtBalance: 0,
    otherDebtRate: 0,
    healthcareSelfPay: 800,
    healthcareEmployer: true,
  },
  jennifer: {
    name: 'Jennifer',
    age: 36,
    retirementAge: 53,
    salary: 225000,
    bonusType: 'percent',
    bonusPercent: 0,
    bonusFixed: 0,
    rsuAnnual: 0,
    otherIncome: 0,
    k401Balance: 289273,       // Altius 401k (4/21/26)
    iraBalance: 0,
    rothBalance: 0,
    brokerageBalance: 133064,  // ETrade/Vanguard $113,064 + Robinhood $20,000 (4/21/26)
    hsaBalance: 0,
    employerMatchRate: 8,      // Altius ~8% match ($18k on $225k)
    k401Contribution: 23500,   // 2026 IRS employee limit
    iraContribution: 0,
    rothContribution: 0,
    brokerageContribution: 75000, // ~half of annual surplus
    hsaContribution: 0,
    studentLoanBalance: 0,
    studentLoanRate: 0,
    carLoanBalance: 0,
    carLoanRate: 0,
    otherDebtBalance: 0,
    otherDebtRate: 0,
    healthcareSelfPay: 800,
    healthcareEmployer: true,
  },
  realEstate: {
    homeValue: 1413600,
    mortgageBalance: 953575,
    monthlyMortgage: 5971,     // Actual P&I from budget ($5,970.53)
    mortgageRate: 3.25,
    mortgageYearsRemaining: 25,
    otherRealEstateValue: 0,
  },
  shared: {
    cashSavings: 22000,        // MITFCU savings account (4/21/26)
    savingsRateType: 'dollar',
    savingsRatePercent: 20,
    savingsRateDollar: 5000,
    currentAnnualSpending: 250000, // Mortgage+daycare+car+utilities+CC flux+travel (~actual)
    retirementAnnualSpending: 150000, // Ex-daycare, ex-car lease, lower work costs
    essentialExpenses: 85000,  // Housing, utilities, food, insurance
    discretionaryExpenses: 65000, // Travel, dining, activities, home projects
    expectedReturn: 7,
    inflationRate: 3,
    peterSocialSecurity: 2800,
    jenniferSocialSecurity: 2200,
    peterSSAge: 67,
    jenniferSSAge: 67,
    homeAppreciationRate: 3.5,
    includeHomeEquity: true,
    ssSafeEstimate: false,
    leanFireAmount: 60000,     // Essentials-only retirement
    fatFireAmount: 200000,     // Full lifestyle (current minus daycare/work costs)
    baristaPartTimeIncome: 24000,
  },
  checklist: {
    healthcareBridge: { status: 'not-started', notes: '' },
    accountAccess: { status: 'not-started', notes: '' },
    socialSecurity: { status: 'not-started', notes: '' },
    taxStrategy: { status: 'not-started', notes: '' },
    collegeFunding: { status: 'in-progress', notes: "Tuesday's my529: $14,504 balance, contributing $6,000/yr" },
    estatePlanning: { status: 'not-started', notes: '' },
    rothLadder: { status: 'not-started', notes: '' },
    emergencyFund: { status: 'in-progress', notes: 'MITFCU $22,000 — targeting 3-6 months of essential expenses' },
  },
  snapshots: [],
  lastUpdated: null,
}
