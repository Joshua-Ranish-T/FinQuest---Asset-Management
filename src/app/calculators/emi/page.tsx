'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { calculateEMI } from '@/lib/calculators';
import { ArrowLeft, Calendar } from 'lucide-react';

export default function EMICalculatorPage() {
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const result = calculateEMI(loanAmount, interestRate, tenureYears * 12);

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
              <Calendar size={20} />
            </div>
            <h1 style={{ fontSize: '2rem' }}>EMI Loan Calculator</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
            Calculate your monthly equated installment and total interest payable for home, car, or personal loans.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Input Controls */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Loan Amount</label>
                  <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{formatINR(loanAmount)}</span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="20000000"
                  step="50000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Interest Rate (p.a.)</label>
                  <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="20"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Loan Tenure</label>
                  <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{tenureYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                />
              </div>
            </div>

            {/* Results Output */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border-medium)' }}>
              <div>
                <span className="badge badge-emerald">Monthly Payment</span>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '0.5rem', marginBottom: '2rem' }}>
                  {formatINR(result.monthlyEMI)} / mo
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Principal Amount:</span>
                    <span style={{ fontWeight: 600 }}>{formatINR(loanAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Interest:</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-warning)' }}>{formatINR(result.totalInterest)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Amount Payable:</span>
                    <span style={{ fontWeight: 700 }}>{formatINR(result.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
