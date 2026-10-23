'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { calculateCAGR } from '@/lib/calculators';
import { ArrowLeft, Calculator, TrendingUp, AlertCircle } from 'lucide-react';

export default function CAGRCalculatorPage() {
  const [initialValue, setInitialValue] = useState(100000);
  const [finalValue, setFinalValue] = useState(250000);
  const [years, setYears] = useState(5);

  let cagr = 0;
  let errorMsg = '';
  try {
    cagr = calculateCAGR(initialValue, finalValue, years);
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'Invalid inputs';
  }

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const totalGain = finalValue - initialValue;
  const totalGainPercent = initialValue > 0 ? ((totalGain / initialValue) * 100).toFixed(1) : '0';

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
            <h1 style={{ fontSize: '2rem' }}>CAGR Calculator</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
            Compute the Compound Annual Growth Rate over any multi-year investment horizon.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Input Controls */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>Initial Investment Value</label>
                <input
                  type="number"
                  min="1"
                  value={initialValue}
                  onChange={(e) => setInitialValue(Number(e.target.value))}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>Final Portfolio Value</label>
                <input
                  type="number"
                  min="0"
                  value={finalValue}
                  onChange={(e) => setFinalValue(Number(e.target.value))}
                  className="input-field"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Duration in Years</label>
                  <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{years} Years</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="30"
                  step="0.5"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                />
              </div>
            </div>

            {/* Results Display */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Annualized Compound Rate (CAGR)</div>
                {errorMsg ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)', fontSize: '1rem' }}>
                    <AlertCircle size={20} />
                    <span>{errorMsg}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: cagr >= 0 ? 'var(--brand-primary)' : 'var(--color-danger)', marginBottom: '1.5rem' }}>
                    {cagr.toFixed(2)}%
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Absolute Return:</span>
                    <span style={{ fontWeight: 700, color: totalGain >= 0 ? 'var(--brand-primary)' : 'var(--color-danger)' }}>
                      {totalGain >= 0 ? '+' : ''}{formatINR(totalGain)} ({totalGainPercent}%)
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Tenure:</span>
                    <span style={{ fontWeight: 700 }}>{years} Years ({(years * 12).toFixed(0)} Months)</span>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
                Formula: CAGR = (Final / Initial)&sup1;/&supt; - 1. Computed instantly client-side.
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
