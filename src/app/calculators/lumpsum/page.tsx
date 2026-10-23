'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { calculateLumpsum } from '@/lib/calculators';
import { ArrowLeft, Calculator, TrendingUp } from 'lucide-react';

export default function LumpsumCalculatorPage() {
  const [investment, setInvestment] = useState(100000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [tenureYears, setTenureYears] = useState(10);

  const result = calculateLumpsum(investment, expectedReturn, tenureYears);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const investedPercent = result.totalValue > 0 ? ((result.investedAmount / result.totalValue) * 100).toFixed(0) : '0';
  const returnsPercent = result.totalValue > 0 ? ((result.estimatedReturns / result.totalValue) * 100).toFixed(0) : '0';

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
            <h1 style={{ fontSize: '2rem' }}>Lumpsum Investment Calculator</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
            Simulate compound interest returns on one-time mutual fund and equity lumpsum investments.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Input Controls */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Total Investment</label>
                  <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{formatINR(investment)}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="10000000"
                  step="5000"
                  value={investment}
                  onChange={(e) => setInvestment(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Expected Annual Return</label>
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
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Time Horizon (Years)</label>
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
            </div>

            {/* Results Display */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Expected Maturity Value</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-primary)', marginBottom: '1.5rem' }}>
                  {formatINR(result.totalValue)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Invested Amount:</span>
                    <span style={{ fontWeight: 700 }}>{formatINR(result.investedAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Estimated Wealth Gain:</span>
                    <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>+{formatINR(result.estimatedReturns)}</span>
                  </div>
                </div>

                {/* Proportion bar */}
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    <span>Principal ({investedPercent}%)</span>
                    <span>Wealth Gain ({returnsPercent}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${investedPercent}%`, background: '#64748b' }} />
                    <div style={{ width: `${returnsPercent}%`, background: 'var(--brand-primary)' }} />
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
                Formula: A = P &times; (1 + r)&supt;. Computed 100% locally in your browser.
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
