'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { initialDemoSnapshots } from '@/lib/db/demo-fixtures';
import { 
  Camera, TrendingUp, Sparkles, Calendar, ArrowRight, 
  Layers, CreditCard, ArrowLeft, ArrowUpRight 
} from 'lucide-react';

export default function DemoSnapshotsPage() {
  const snapshots = initialDemoSnapshots;
  const currentNetWorth = 5650000;
  const totalAssets = 8450000;
  const totalLiabilities = 2800000;

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const handleCaptureSnapshot = () => {
    toast.info('Demo Mode is read-only. Create a free account to track your net worth over time.');
  };

  return (
    <>
      <Header />
      <main style={{ padding: '3rem 0 5rem 0', flex: 1 }}>
        <div className="container">
          {/* Demo Mode Notice */}
          <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <span className="badge badge-cyan">Demo Mode</span>
              <span style={{ color: 'var(--text-secondary)' }}>You are viewing simulated historical trajectory snapshots.</span>
            </div>
            <Link href="/login?mode=register" className="btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>
              <Sparkles size={14} />
              <span>Create Free Account</span>
            </Link>
          </div>

          {/* Breadcrumb */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <ArrowLeft size={16} />
              <span>Back to Demo Dashboard</span>
            </Link>
          </div>

          {/* Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '2rem' }}>Demo Net Worth Snapshots</h1>
                <span className="badge badge-emerald">5 Recorded Checkpoints</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
                Periodic point-in-time valuation checkpoints measuring long-term wealth compounding.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={handleCaptureSnapshot}
                className="btn-primary"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}
              >
                <Camera size={16} />
                <span>Capture Snapshot</span>
              </button>
            </div>
          </div>

          {/* Current Portfolio Snapshot KPI */}
          <div className="grid-cols-3" style={{ marginBottom: '2.5rem' }}>
            <div className="glass-card" style={{ border: '1px solid var(--brand-primary)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 18, 26, 0.75) 100%)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Demo Net Worth</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{formatINR(currentNetWorth)}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--brand-primary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <TrendingUp size={15} />
                <span>+34.5% total recorded gain</span>
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Assets</div>
                <Layers size={16} color="var(--brand-primary)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{formatINR(totalAssets)}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                5 holdings (Equity, MF, EPF, Gold, Bank)
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Debt / Liabilities</div>
                <CreditCard size={16} color="var(--color-danger)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-danger)' }}>{formatINR(totalLiabilities)}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Home Loan installment
              </div>
            </div>
          </div>

          {/* Historical Trajectory Table */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem' }}>Historical Valuation Timeline</h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Consolidated balance history captured over time</div>
              </div>
              <span className="badge badge-emerald">{snapshots.length} Recorded Checkpoints</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Snapshot Date</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Total Assets</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Liabilities</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Net Worth</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Growth vs Previous</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshots.map((snap, idx) => {
                    const prevSnap = idx > 0 ? snapshots[idx - 1] : null;
                    const delta = prevSnap ? snap.net_worth - prevSnap.net_worth : 0;
                    const deltaPercent = prevSnap && prevSnap.net_worth > 0 ? ((delta / prevSnap.net_worth) * 100).toFixed(1) : null;

                    return (
                      <tr key={snap.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Calendar size={15} color="var(--brand-primary)" />
                            <span>{snap.snapshot_date}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>{formatINR(snap.total_assets)}</td>
                        <td style={{ padding: '1rem', color: 'var(--color-danger)' }}>{formatINR(snap.total_liabilities)}</td>
                        <td style={{ padding: '1rem', fontWeight: 800, color: 'var(--brand-primary)', fontSize: '1.05rem' }}>
                          {formatINR(snap.net_worth)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {prevSnap ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: delta >= 0 ? 'var(--brand-primary)' : 'var(--color-danger)', fontWeight: 600 }}>
                              <ArrowUpRight size={15} />
                              <span>+{formatINR(delta)} (+{deltaPercent}%)</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Baseline checkpoint</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
