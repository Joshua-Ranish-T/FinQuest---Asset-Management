'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { calculateXIRR, CashFlow } from '@/lib/calculators';
import { ArrowLeft, Plus, Trash2, TrendingUp, AlertCircle } from 'lucide-react';

export default function XIRRCalculatorPage() {
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([
    { date: '2024-01-01', amount: -50000 },
    { date: '2024-06-01', amount: -50000 },
    { date: '2025-01-01', amount: -50000 },
    { date: '2026-01-01', amount: 195000 },
  ]);

  const [xirrResult, setXirrResult] = useState<number | null>(() => {
    try {
      return calculateXIRR([
        { date: '2024-01-01', amount: -50000 },
        { date: '2024-06-01', amount: -50000 },
        { date: '2025-01-01', amount: -50000 },
        { date: '2026-01-01', amount: 195000 },
      ]);
    } catch {
      return null;
    }
  });

  const [error, setError] = useState<string | null>(null);

  const recalculate = (flows: CashFlow[]) => {
    try {
      const res = calculateXIRR(flows);
      setXirrResult(res);
      setError(null);
    } catch (err: unknown) {
      setXirrResult(null);
      setError(err instanceof Error ? err.message : 'Invalid cash flows');
    }
  };

  const handleUpdate = (index: number, field: keyof CashFlow, val: string | number) => {
    const updated = [...cashFlows];
    if (field === 'amount') {
      updated[index].amount = Number(val) || 0;
    } else {
      updated[index].date = String(val);
    }
    setCashFlows(updated);
    recalculate(updated);
  };

  const addRow = () => {
    const today = new Date().toISOString().split('T')[0];
    const updated = [...cashFlows, { date: today, amount: 10000 }];
    setCashFlows(updated);
    recalculate(updated);
  };

  const removeRow = (index: number) => {
    if (cashFlows.length <= 2) return;
    const updated = cashFlows.filter((_, i) => i !== index);
    setCashFlows(updated);
    recalculate(updated);
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
              <TrendingUp size={20} />
            </div>
            <h1 style={{ fontSize: '2rem' }}>XIRR Calculator</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
            Compute the Extended Internal Rate of Return for irregular investments and SIP redemptions. (Enter investments as negative numbers, redemption as positive).
          </p>

          {/* Result Card */}
          <div className="glass-card" style={{ marginBottom: '2rem', border: '1px solid var(--brand-primary)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 18, 26, 0.75) 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge badge-emerald">Annualized Return</span>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '0.25rem' }}>
                  {xirrResult !== null ? `${xirrResult.toFixed(2)}% p.a.` : '—'}
                </div>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '320px' }}>
                {error ? (
                  <div style={{ color: 'var(--color-danger)', display: 'flex', gap: '0.4rem' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                ) : (
                  <span>Calculated in your browser using Newton-Raphson approximation.</span>
                )}
              </div>
            </div>
          </div>

          {/* Cash Flows Table */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem' }}>Cash Flow Schedule</h2>
              <button onClick={addRow} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <Plus size={15} />
                <span>Add Row</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {cashFlows.map((cf, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={cf.date}
                      onChange={(e) => handleUpdate(idx, 'date', e.target.value)}
                      className="input-control"
                      style={{ fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={cf.amount}
                      onChange={(e) => handleUpdate(idx, 'amount', e.target.value)}
                      className="input-control"
                      style={{ fontSize: '0.875rem', color: cf.amount >= 0 ? 'var(--brand-primary)' : 'var(--color-warning)' }}
                    />
                  </div>
                  <div style={{ paddingTop: '1.25rem' }}>
                    <button
                      onClick={() => removeRow(idx)}
                      disabled={cashFlows.length <= 2}
                      aria-label="Delete row"
                      style={{
                        padding: '0.5rem',
                        borderRadius: '6px',
                        color: cashFlows.length <= 2 ? 'var(--text-muted)' : 'var(--color-danger)',
                        opacity: cashFlows.length <= 2 ? 0.3 : 1,
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
