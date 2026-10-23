'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { calculateFD } from '@/lib/calculators';
import { ArrowLeft, Calculator } from 'lucide-react';

export default function FDCalculatorPage() {
  const [depositAmount, setDepositAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(7.2);
  const [tenureYears, setTenureYears] = useState(3);

  const result = calculateFD(depositAmount, interestRate, tenureYears);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const principalPercent = result.maturityValue > 0 ? ((result.investedAmount / result.maturityValue) * 100).toFixed(0) : '0';
  const interestPercent = result.maturityValue > 0 ? ((result.estimatedInterest / result.maturityValue) * 100).toFixed(0) : '0';

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
            <h1 style={{ fontSize: '2rem' }}>Fixed Deposit (FD) Calculator</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
            Calculate maturity amount and interest earned on bank fixed deposits with quarterly compounding.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Input Controls */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Total Fixed Deposit</label>
                  <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{formatINR(depositAmount)}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="5000000"
                  step="5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Annual Interest Rate</label>
                  <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{interestRate}% p.a.</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Tenure (Years)</label>
                  <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{tenureYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                />
              </div>
            </div>

            {/* Results Display */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Maturity Amount (at exit)</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-primary)', marginBottom: '1.5rem' }}>
                  {formatINR(result.maturityValue)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Principal Deposit:</span>
                    <span style={{ fontWeight: 700 }}>{formatINR(result.investedAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Quarterly Compounded Interest:</span>
                    <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>+{formatINR(result.estimatedInterest)}</span>
                  </div>
                </div>

                {/* Proportion bar */}
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    <span>Deposit ({principalPercent}%)</span>
                    <span>Interest ({interestPercent}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${principalPercent}%`, background: '#64748b' }} />
                    <div style={{ width: `${interestPercent}%`, background: 'var(--brand-primary)' }} />
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
                Formula: A = P &times; (1 + r/400)&sup4;&supt; (RBI standard quarterly compounding).
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
