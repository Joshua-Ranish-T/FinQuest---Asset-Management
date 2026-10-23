import { describe, it, expect } from 'vitest';
import { 
  calculateXIRR, calculateSIP, calculateLumpsum, calculateCAGR, calculateEMI, calculateFD 
} from '@/lib/calculators';

describe('Financial Calculators Engine', () => {
  it('computes XIRR accurately for a simple 1-year investment doubling', () => {
    const cashFlows = [
      { date: '2025-01-01', amount: -100000 },
      { date: '2026-01-01', amount: 200000 },
    ];
    const rate = calculateXIRR(cashFlows);
    expect(rate).toBeCloseTo(100.0, 1);
  });

  it('throws error when XIRR has only positive or only negative cash flows', () => {
    expect(() => {
      calculateXIRR([
        { date: '2024-01-01', amount: 10000 },
        { date: '2025-01-01', amount: 20000 },
      ]);
    }).toThrow();
  });

  it('computes SIP future value with step-up', () => {
    const result = calculateSIP({
      monthlyInvestment: 10000,
      expectedAnnualReturn: 12,
      tenureYears: 10,
      annualStepUpPercent: 10,
    });

    expect(result.investedAmount).toBeGreaterThan(1200000);
    expect(result.totalValue).toBeGreaterThan(result.investedAmount);
    expect(result.estimatedReturns).toBe(result.totalValue - result.investedAmount);
  });

  it('computes Lumpsum growth correctly', () => {
    const res = calculateLumpsum(100000, 10, 5); // 1L at 10% for 5 years
    // 100000 * (1.1)^5 = 161,051
    expect(res.totalValue).toBe(161051);
    expect(res.investedAmount).toBe(100000);
  });

  it('computes CAGR accurately', () => {
    const cagr = calculateCAGR(100000, 200000, 5); // Doubled in 5 years
    expect(cagr).toBeCloseTo(14.87, 1);
  });

  it('computes EMI and interest breakup correctly', () => {
    const emi = calculateEMI(1000000, 10, 120); // 10L loan at 10% for 10 years (120 mo)
    expect(emi.monthlyEMI).toBeGreaterThan(13000);
    expect(emi.totalAmount).toBe(emi.monthlyEMI * 120);
    expect(emi.totalInterest).toBe(emi.totalAmount - 1000000);
  });

  it('computes FD quarterly compounding accurately', () => {
    const fd = calculateFD(100000, 7.5, 3); // 1L at 7.5% for 3 years
    expect(fd.maturityValue).toBeGreaterThan(124000);
    expect(fd.investedAmount).toBe(100000);
  });
});
