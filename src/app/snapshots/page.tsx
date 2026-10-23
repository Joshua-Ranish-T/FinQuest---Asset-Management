'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { NetWorthSnapshot, PortfolioSummary } from '@/types';
import { api, ApiError } from '@/lib/api-client';
import { 
  Camera, TrendingUp, Sparkles, Calendar, ArrowRight, 
  Layers, CreditCard, ShieldCheck, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';

export default function SnapshotsPage() {
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get<{ snapshots: NetWorthSnapshot[]; summary: PortfolioSummary }>('/snapshots')
      .then((res) => {
        if (active) {
          setSnapshots(res.snapshots || []);
          setSummary(res.summary || null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          toast.error('Failed to load net worth snapshots.');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const handleCaptureSnapshot = async () => {
    setCapturing(true);
    try {
      const created = await api.post<NetWorthSnapshot>('/snapshots', {});
      setSnapshots((prev) => [...prev, created]);
      toast.success('Net worth snapshot recorded successfully!');
    } catch (err: unknown) {
      if (err instanceof ApiError && (err.status === 403 || err.code === 'SNAPSHOT_LIMIT_REACHED')) {
        setShowUpgradeModal(true);
      } else {
        toast.error(err instanceof Error ? err.message : 'Failed to capture snapshot.');
      }
    } finally {
      setCapturing(false);
    }
  };

  // Calculate month's snapshot count
  const currentMonthPrefix = '2026-10';
  const snapshotsThisMonth = snapshots.filter((s) => s.snapshot_date.startsWith(currentMonthPrefix)).length;

  return (
    <>
      <Header />
      <main style={{ padding: '3rem 0 5rem 0', flex: 1 }}>
        <div className="container">
          {/* Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '2rem' }}>Net Worth Snapshots</h1>
                <span className="badge badge-emerald">Free Plan ({snapshotsThisMonth}/2 Used This Month)</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
                Periodic point-in-time valuation checkpoints measuring long-term wealth compounding.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={handleCaptureSnapshot}
                disabled={capturing}
                className="btn-primary"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}
              >
                <Camera size={16} />
                <span>{capturing ? 'Recording...' : 'Capture Snapshot'}</span>
              </button>
            </div>
          </div>

          {/* Current Portfolio Snapshot KPI */}
          {summary && (
            <div className="grid-cols-3" style={{ marginBottom: '2.5rem' }}>
              <div className="glass-card" style={{ border: '1px solid var(--brand-primary)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 18, 26, 0.75) 100%)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Live Net Worth</div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{formatINR(summary.netWorth)}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--brand-primary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <TrendingUp size={15} />
                  <span>Ready for monthly checkpoint capture</span>
                </div>
              </div>

              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Assets</div>
                  <Layers size={16} color="var(--brand-primary)" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{formatINR(summary.totalAssets)}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {summary.assetsCount} portfolio holdings
                </div>
              </div>

              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Debt / Liabilities</div>
                  <CreditCard size={16} color="var(--color-danger)" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-danger)' }}>{formatINR(summary.totalLiabilities)}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {summary.liabilitiesCount} liabilities outstanding
                </div>
              </div>
            </div>
          )}

          {/* Historical Trajectory Table */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem' }}>Historical Valuation Timeline</h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Consolidated balance history captured over time</div>
              </div>
              <span className="badge badge-emerald">{snapshots.length} Recorded Snapshots</span>
            </div>

            {loading ? (
              <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading trajectory snapshots...
              </div>
            ) : snapshots.length === 0 ? (
              <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                No snapshots captured yet. Click &quot;Capture Snapshot&quot; above to log your first valuation checkpoint.
              </div>
            ) : (
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
                                {delta >= 0 ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                                <span>{delta >= 0 ? '+' : ''}{formatINR(delta)} ({deltaPercent}%)</span>
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
            )}
          </div>
        </div>
      </main>

      {/* Pro Upgrade Modal */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', textAlign: 'center', border: '1px solid var(--brand-primary)' }}>
            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: 'var(--brand-primary-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--brand-primary)' }}>
              <Sparkles size={28} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Monthly Snapshot Limit Reached</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Free tier includes up to <strong>2 net worth snapshots per calendar month</strong>. Upgrade to FinQuest Pro for unlimited snapshot checkpoints and exportable wealth history.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setShowUpgradeModal(false)} className="btn-secondary">
                Maybe Later
              </button>
              <Link href="/pricing" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>Upgrade to Pro</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
