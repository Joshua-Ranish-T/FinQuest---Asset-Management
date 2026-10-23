'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { 
  initialDemoAssets, initialDemoLiabilities, initialDemoTransactions, initialDemoGoals 
} from '@/lib/db/demo-fixtures';
import { TrendingUp, Plus, Lock } from 'lucide-react';

export default function DemoDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'liabilities' | 'insights'>('overview');

  const totalAssets = initialDemoAssets.reduce((acc, a) => acc + a.current_value, 0);
  const totalLiabilities = initialDemoLiabilities.reduce((acc, l) => acc + l.principal_outstanding, 0);
  const netWorth = totalAssets - totalLiabilities;

  const handleReadOnlyClick = () => {
    toast.info('Demo Mode is read-only. Create a free account to track your wealth.', {
      action: {
        label: 'Start Free',
        onClick: () => {
          router.push('/login?mode=register');
        },
      },
    });
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <>
      <Header />
      <main style={{ padding: '2.5rem 0 5rem 0', flex: 1 }}>
        <div className="container">
          {/* Demo Banner */}
          <div style={{ background: 'var(--brand-gold-light)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Lock size={18} color="var(--brand-gold)" />
              <span style={{ fontSize: '0.9rem', color: 'var(--brand-gold)', fontWeight: 600 }}>
                You are viewing the Live Demo with sample portfolio data (Read-Only).
              </span>
            </div>
            <Link href="/login?mode=register" className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
              Create Free Account &rarr;
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', overflowX: 'auto' }}>
            <button
              onClick={() => setActiveTab('overview')}
              className={activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('assets')}
              className={activeTab === 'assets' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
            >
              Assets ({initialDemoAssets.length})
            </button>
            <button
              onClick={() => setActiveTab('liabilities')}
              className={activeTab === 'liabilities' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
            >
              Liabilities ({initialDemoLiabilities.length})
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={activeTab === 'insights' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
            >
              Cashflow & Goals
            </button>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid-cols-3" style={{ marginBottom: '2.5rem' }}>
            <div className="glass-card" style={{ border: '1px solid var(--brand-primary)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Consolidated Net Worth</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{formatINR(netWorth)}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--brand-primary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <TrendingUp size={15} />
                <span>+14.8% past 12 months</span>
              </div>
            </div>

            <div className="glass-card">
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Total Assets</div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{formatINR(totalAssets)}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Across {initialDemoAssets.length} asset classes
              </div>
            </div>

            <div className="glass-card">
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Total Liabilities</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-danger)' }}>{formatINR(totalLiabilities)}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Debt-to-Asset: {((totalLiabilities / totalAssets) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
              {/* Asset Allocation Breakdown */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem' }}>Asset Allocation</h3>
                  <span className="badge badge-emerald">5 Classes</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {initialDemoAssets.map((asset) => {
                    const pct = ((asset.current_value / totalAssets) * 100).toFixed(1);
                    return (
                      <div key={asset.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 600 }}>{asset.name}</span>
                          <span>{formatINR(asset.current_value)} ({pct}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--brand-primary)', borderRadius: '999px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Essentials Health Check */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem' }}>Financial Health Check</h3>
                  <span className="badge badge-gold">Essentials Audit</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '0.9rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>Emergency Reserve</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>6 Months Living Expenses</div>
                    </div>
                    <span className="badge badge-emerald">Healthy (85%)</span>
                  </div>

                  <div style={{ padding: '0.9rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>Term Life Insurance</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹1.50 Cr Pure Term Policy</div>
                    </div>
                    <span className="badge badge-emerald">Covered</span>
                  </div>

                  <div style={{ padding: '0.9rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>Health Insurance</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹25L Family Floater Cover</div>
                    </div>
                    <span className="badge badge-emerald">Covered</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Assets List */}
          {activeTab === 'assets' && (
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Your Assets ({initialDemoAssets.length})</h3>
                <button onClick={handleReadOnlyClick} className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                  <Plus size={15} />
                  <span>Add Asset</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {initialDemoAssets.map((asset) => (
                  <div key={asset.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem' }}>{asset.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '0.2rem' }}>
                        <span>Class: {asset.asset_class}</span>
                        {asset.institution && <span>Platform: {asset.institution}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>{formatINR(asset.current_value)}</div>
                      <button onClick={handleReadOnlyClick} style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', marginTop: '0.2rem' }}>
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Liabilities List */}
          {activeTab === 'liabilities' && (
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Your Liabilities ({initialDemoLiabilities.length})</h3>
                <button onClick={handleReadOnlyClick} className="btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                  <Plus size={15} />
                  <span>Add Liability</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {initialDemoLiabilities.map((liab) => (
                  <div key={liab.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem' }}>{liab.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '0.2rem' }}>
                        <span>Type: {liab.liability_type}</span>
                        <span>Rate: {liab.interest_rate}%</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-danger)' }}>{formatINR(liab.principal_outstanding)}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>EMI: {formatINR(liab.monthly_emi || 0)}/mo</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Cashflow & Goals */}
          {activeTab === 'insights' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              <div className="glass-card">
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Recent Transactions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {initialDemoTransactions.map((tx) => (
                    <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-input)', borderRadius: '6px' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{tx.category}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.date} &bull; {tx.notes}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: tx.type === 'INCOME' ? 'var(--brand-primary)' : 'var(--color-warning)' }}>
                        {tx.type === 'INCOME' ? '+' : '-'}{formatINR(tx.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card">
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Financial Goals</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {initialDemoGoals.map((goal) => (
                    <div key={goal.id} style={{ padding: '0.9rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.925rem' }}>{goal.name}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--brand-primary)', fontWeight: 600 }}>{goal.progress_percentage}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface)', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                        <div style={{ width: `${goal.progress_percentage}%`, height: '100%', background: 'var(--brand-primary)', borderRadius: '999px' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        <span>Target: {formatINR(goal.target_amount)}</span>
                        <span>Date: {goal.target_date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
