'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { calculateSIP } from '@/lib/calculators';
import { ArrowLeft, Calculator } from 'lucide-react';

export default function SIPCalculatorPage() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(15000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [tenureYears, setTenureYears] = useState(15);
  const [stepUpPercent, setStepUpPercent] = useState(10);

  const result = calculateSIP({
    monthlyInvestment,
    expectedAnnualReturn: expectedReturn,
    tenureYears,
    annualStepUpPercent: stepUpPercent,
  });

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <>
      <Header />
      <main style={{ padding: '3.5rem 0', flex: 1 }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          <Link href="/calculators" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            <ArrowLeft size={16} />
            <span>Back to All Calculators</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '8px', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator size={20} />
            </div>
            <h1 style={{ fontSize: '2rem' }}>SIP Calculator with Step-Up</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
            Calculate the future value of your systematic investment plan with annual step-up percentage.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Input Controls */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Monthly Investment</label>
                  <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{formatINR(monthlyInvestment)}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="200000"
                  step="500"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Expected Return (p.a.)</label>
                  <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{expectedReturn}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Time Period</label>
                  <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{tenureYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Annual Step-Up (%)</label>
                  <span style={{ fontWeight: 700, color: 'var(--brand-gold)' }}>{stepUpPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={stepUpPercent}
                  onChange={(e) => setStepUpPercent(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-gold)' }}
                />
              </div>
            </div>

            {/* Results Output */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--brand-primary)' }}>
              <div>
                <span className="badge badge-emerald">Projected Corpus</span>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '0.5rem', marginBottom: '2rem' }}>
                  {formatINR(result.totalValue)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Invested Amount:</span>
                    <span style={{ fontWeight: 600 }}>{formatINR(result.investedAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Estimated Returns:</span>
                    <span style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>{formatINR(result.estimatedReturns)}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Based on compounding monthly cash flows with {stepUpPercent}% annual top-up.
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
