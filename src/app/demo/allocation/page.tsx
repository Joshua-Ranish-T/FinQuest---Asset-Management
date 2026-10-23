'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { initialDemoAssets } from '@/lib/db/demo-fixtures';
import { 
  PieChart, Layers, ArrowRight, ShieldCheck, 
  Sparkles, ArrowLeft, TrendingUp 
} from 'lucide-react';

export default function DemoAssetAllocationPage() {
  const assets = initialDemoAssets;

  const totalAssetsValue = useMemo(() => {
    return assets.reduce((sum, a) => sum + Number(a.current_value), 0);
  }, [assets]);

  const allocationList = useMemo(() => {
    const list = [
      { label: 'Indian Equities (Direct Stocks)', amount: 3200000, percentage: 37.9, color: '#10b981' },
      { label: 'Mutual Funds (Index / Growth)', amount: 2400000, percentage: 28.4, color: '#38bdf8' },
      { label: 'Employee Provident Fund (EPF)', amount: 1200000, percentage: 14.2, color: '#818cf8' },
      { label: 'Savings Bank Accounts / Cash', amount: 1000000, percentage: 11.8, color: '#14b8a6' },
      { label: 'Sovereign Gold Bonds (SGB)', amount: 650000, percentage: 7.7, color: '#eab308' },
    ];
    return list;
  }, []);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
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
              <span style={{ color: 'var(--text-secondary)' }}>You are viewing simulated portfolio asset allocation.</span>
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
                <h1 style={{ fontSize: '2rem' }}>Demo Asset Allocation</h1>
                <span className="badge badge-emerald">5 Holdings Analyzed</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
                Inspect your risk exposure across asset classes, liquidity horizons, and macro investment buckets.
              </p>
            </div>
          </div>

          {/* Macro Allocation Bar */}
          <div className="glass-card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Macro Allocation Breakdown</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Total Valuation: <strong>{formatINR(totalAssetsValue)}</strong>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {allocationList.map((m) => (
                  <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: m.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{m.label.split(' ')[0]}:</span>
                    <span style={{ fontWeight: 700 }}>{m.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ width: '100%', height: '1.5rem', background: 'var(--bg-surface-elevated)', borderRadius: '999px', overflow: 'hidden', display: 'flex', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
              {allocationList.map((m) => (
                <div
                  key={m.label}
                  style={{
                    width: `${m.percentage}%`,
                    height: '100%',
                    background: m.color,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Detailed List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
            <div className="glass-card">
              <h2 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Asset Classes</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {allocationList.map((item) => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                        <span style={{ fontWeight: 600 }}>{item.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>{item.percentage}%</span>
                        <span style={{ fontWeight: 700 }}>{formatINR(item.amount)}</span>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${item.percentage}%`,
                          height: '100%',
                          background: item.color,
                          borderRadius: '999px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ border: '1px solid var(--border-subtle)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 18, 26, 0.75) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <ShieldCheck size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Portfolio Balance Insight</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                This portfolio allocates <strong>66.3%</strong> to equities (Direct stocks + Mutual funds), providing robust capital appreciation, while balancing with <strong>33.7%</strong> in EPF, cash, and gold to protect against volatility.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="badge badge-emerald">66% Growth / 34% Stability</span>
                <span className="badge badge-cyan">Optimal FIRE Ratio</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
