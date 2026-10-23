// Pure Client-Side Financial Calculation Engines (100% Client-Side, No Network Calls)
import Decimal from 'decimal.js';

export interface CashFlow {
  date: string; // ISO date string (YYYY-MM-DD)
  amount: number; // Negative = outflow/investment, Positive = inflow/redemption
}

/**
 * XIRR (Extended Internal Rate of Return) using Newton-Raphson
 */
export function calculateXIRR(cashFlows: CashFlow[], guess = 0.1): number {
  if (cashFlows.length < 2) {
    throw new Error('At least two cash flows are required to compute XIRR.');
  }

  const hasPositive = cashFlows.some((cf) => cf.amount > 0);
  const hasNegative = cashFlows.some((cf) => cf.amount < 0);
  if (!hasPositive || !hasNegative) {
    throw new Error('Cash flows must contain at least one positive and one negative cash flow.');
  }

  const sorted = [...cashFlows].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const d0 = new Date(sorted[0].date).getTime();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  let rate = guess;
  const maxIterations = 100;
  const tolerance = 1e-7;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (const cf of sorted) {
      const dt = (new Date(cf.date).getTime() - d0) / MS_PER_DAY / 365.0;
      const factor = Math.pow(1 + rate, dt);
      if (factor === 0) continue;
      npv += cf.amount / factor;
      dnpv += (-dt * cf.amount) / (factor * (1 + rate));
    }

    if (Math.abs(npv) < tolerance) {
      return rate * 100; // Return as percentage (e.g. 14.5%)
    }

    if (Math.abs(dnpv) < 1e-12) {
      rate += 0.05;
      continue;
    }

    const nextRate = rate - npv / dnpv;
    if (Math.abs(nextRate - rate) < tolerance) {
      return nextRate * 100;
    }
    rate = nextRate;
  }

  return rate * 100;
}

/**
 * SIP Calculator with Step-Up
 */
export interface SIPInput {
  monthlyInvestment: number;
  expectedAnnualReturn: number; // percentage, e.g. 12
  tenureYears: number;
  annualStepUpPercent?: number; // annual percentage increase, e.g. 10
}

export interface SIPResult {
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
}

export function calculateSIP({
  monthlyInvestment,
  expectedAnnualReturn,
  tenureYears,
  annualStepUpPercent = 0,
}: SIPInput): SIPResult {
  const months = tenureYears * 12;
  const monthlyRate = expectedAnnualReturn / 12 / 100;

  let totalInvested = new Decimal(0);
  let totalValue = new Decimal(0);
  let currentMonthly = new Decimal(monthlyInvestment);

  for (let m = 1; m <= months; m++) {
    if (m > 1 && (m - 1) % 12 === 0 && annualStepUpPercent > 0) {
      currentMonthly = currentMonthly.mul(1 + annualStepUpPercent / 100);
    }
    totalInvested = totalInvested.plus(currentMonthly);
    const monthsRemaining = months - m + 1;
    const futureFactor = new Decimal(1 + monthlyRate).pow(monthsRemaining);
    totalValue = totalValue.plus(currentMonthly.mul(futureFactor));
  }

  const investedNum = Math.round(totalInvested.toNumber());
  const totalNum = Math.round(totalValue.toNumber());
  return {
    investedAmount: investedNum,
    estimatedReturns: Math.max(0, totalNum - investedNum),
    totalValue: totalNum,
  };
}

/**
 * Lumpsum Investment Calculator
 */
export function calculateLumpsum(principal: number, annualReturnRate: number, years: number) {
  const p = new Decimal(principal);
  const r = new Decimal(annualReturnRate).div(100);
  const factor = new Decimal(1).plus(r).pow(years);
  const total = p.mul(factor);

  const invested = Math.round(principal);
  const totalValue = Math.round(total.toNumber());
  return {
    investedAmount: invested,
    estimatedReturns: Math.max(0, totalValue - invested),
    totalValue,
  };
}

/**
 * CAGR (Compound Annual Growth Rate)
 */
export function calculateCAGR(initialValue: number, finalValue: number, years: number): number {
  if (initialValue <= 0 || years <= 0) {
    throw new Error('Initial value and years must be positive.');
  }
  const ratio = finalValue / initialValue;
  const cagr = Math.pow(ratio, 1 / years) - 1;
  return cagr * 100; // Returns percentage
}

/**
 * EMI (Equated Monthly Installment) Loan Calculator
 */
export interface EMIResult {
  monthlyEMI: number;
  totalInterest: number;
  totalAmount: number;
}

export function calculateEMI(principal: number, annualInterestRate: number, tenureMonths: number): EMIResult {
  if (tenureMonths <= 0 || principal <= 0) {
    return { monthlyEMI: 0, totalInterest: 0, totalAmount: 0 };
  }
  if (annualInterestRate === 0) {
    const emi = Math.round(principal / tenureMonths);
    return { monthlyEMI: emi, totalInterest: 0, totalAmount: principal };
  }

  const r = annualInterestRate / 12 / 100;
  const factor = Math.pow(1 + r, tenureMonths);
  const emi = Math.round((principal * r * factor) / (factor - 1));
  const totalAmount = emi * tenureMonths;
  const totalInterest = Math.max(0, totalAmount - principal);

  return {
    monthlyEMI: emi,
    totalInterest,
    totalAmount,
  };
}

/**
 * Fixed Deposit (Quarterly Compounding)
 */
export function calculateFD(principal: number, annualRate: number, tenureYears: number) {
  const p = new Decimal(principal);
  const r = new Decimal(annualRate).div(400); // 4 quarters, rate/100
  const n = tenureYears * 4;
  const factor = new Decimal(1).plus(r).pow(n);
  const total = p.mul(factor);

  const invested = Math.round(principal);
  const totalValue = Math.round(total.toNumber());
  return {
    investedAmount: invested,
    estimatedInterest: Math.max(0, totalValue - invested),
    maturityValue: totalValue,
  };
}
