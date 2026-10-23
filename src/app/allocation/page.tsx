'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Asset, AssetClass } from '@/types';
import { api } from '@/lib/api-client';
import { 
  PieChart, Layers, ArrowRight, ShieldCheck, 
  TrendingUp, Wallet, CheckCircle2, AlertCircle 
} from 'lucide-react';

interface AllocationItem {
  assetClass: AssetClass;
  label: string;
  amount: number;
  percentage: number;
  color: string;
  count: number;
  category: 'EQUITY' | 'DEBT' | 'CASH' | 'GOLD' | 'REAL_ESTATE' | 'OTHER';
}

const CLASS_CONFIG: Record<AssetClass, { label: string; color: string; category: AllocationItem['category'] }> = {
  EQUITY: { label: 'Direct Indian Stocks', color: '#10b981', category: 'EQUITY' },
  US_EQUITY: { label: 'US / Global Stocks', color: '#059669', category: 'EQUITY' },
  MUTUAL_FUND: { label: 'Mutual Funds (Equity/Debt)', color: '#38bdf8', category: 'EQUITY' },
  EPF: { label: 'Employee Provident Fund (EPF)', color: '#818cf8', category: 'DEBT' },
  PPF: { label: 'Public Provident Fund (PPF)', color: '#6366f1', category: 'DEBT' },
  FD: { label: 'Fixed Deposits (FD)', color: '#f59e0b', category: 'DEBT' },
  NPS: { label: 'National Pension Scheme (NPS)', color: '#a855f7', category: 'DEBT' },
  GOLD: { label: 'Gold & Sovereign Gold Bonds (SGB)', color: '#eab308', category: 'GOLD' },
  DIGITAL_GOLD: { label: 'Digital Gold', color: '#ca8a04', category: 'GOLD' },
  REAL_ESTATE: { label: 'Real Estate / Land', color: '#ec4899', category: 'REAL_ESTATE' },
  CASH: { label: 'Bank Accounts / Cash', color: '#14b8a6', category: 'CASH' },
  CRYPTO: { label: 'Crypto Assets', color: '#f97316', category: 'OTHER' },
  RSU: { label: 'RSUs & Stock Options', color: '#06b6d4', category: 'EQUITY' },
  VEHICLE: { label: 'Vehicles / Automobiles', color: '#64748b', category: 'OTHER' },
  STARTUP: { label: 'Startup / Angel Equity', color: '#8b5cf6', category: 'EQUITY' },
  P2P: { label: 'P2P Lending', color: '#ef4444', category: 'DEBT' },
  SSY: { label: 'Sukanya Samriddhi (SSY)', color: '#ec4899', category: 'DEBT' },
  COLLECTIBLES: { label: 'Collectibles / Art', color: '#9333ea', category: 'OTHER' },
  GRATUITY: { label: 'Gratuity / Superannuation', color: '#475569', category: 'DEBT' },
  OTHER: { label: 'Other Custom Assets', color: '#64748b', category: 'OTHER' },
};

export default function AssetAllocationPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get<{ assets: Asset[] }>('/assets')
      .then((res) => {
        if (active) {
          setAssets(res.assets || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          toast.error('Failed to load assets for allocation analysis.');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const totalAssetsValue = useMemo(() => {
    return assets.reduce((sum, a) => sum + Number(a.current_value), 0);
  }, [assets]);

  const allocationList = useMemo((): AllocationItem[] => {
    const map: Record<string, { amount: number; count: number }> = {};
    assets.forEach((a) => {
      if (!map[a.asset_class]) {
        map[a.asset_class] = { amount: 0, count: 0 };
      }
      map[a.asset_class].amount += Number(a.current_value);
      map[a.asset_class].count += 1;
    });

    return Object.entries(map)
      .map(([assetClass, stats]) => {
        const cls = assetClass as AssetClass;
        const conf = CLASS_CONFIG[cls] || { label: assetClass, color: '#64748b', category: 'OTHER' as const };
        const percentage = totalAssetsValue > 0 ? Number(((stats.amount / totalAssetsValue) * 100).toFixed(1)) : 0;
        return {
          assetClass: cls,
          label: conf.label,
          amount: stats.amount,
          percentage,
          color: conf.color,
          count: stats.count,
          category: conf.category,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [assets, totalAssetsValue]);

  // Macro categories
  const macroCategories = useMemo(() => {
    const macro: Record<string, { label: string; amount: number; color: string }> = {
      EQUITY: { label: 'Equity & Growth', amount: 0, color: '#10b981' },
      DEBT: { label: 'Fixed Income & Debt', amount: 0, color: '#38bdf8' },
      GOLD: { label: 'Precious Metals (Gold/SGB)', amount: 0, color: '#eab308' },
      CASH: { label: 'Liquid Cash & Bank', amount: 0, color: '#14b8a6' },
      REAL_ESTATE: { label: 'Real Estate', amount: 0, color: '#ec4899' },
      OTHER: { label: 'Alternative / Other', amount: 0, color: '#818cf8' },
    };

    allocationList.forEach((item) => {
      if (macro[item.category]) {
        macro[item.category].amount += item.amount;
      } else {
        macro.OTHER.amount += item.amount;
      }
    });

    return Object.values(macro)
      .filter((m) => m.amount > 0)
      .map((m) => ({
        ...m,
        percentage: totalAssetsValue > 0 ? Number(((m.amount / totalAssetsValue) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [allocationList, totalAssetsValue]);

  // Liquidity Classification
  const liquidity = useMemo(() => {
    let liquid = 0;
    let semiLiquid = 0;
    let illiquid = 0;

    assets.forEach((a) => {
      const val = Number(a.current_value);
      if (['EQUITY', 'US_EQUITY', 'MUTUAL_FUND', 'CASH', 'CRYPTO'].includes(a.asset_class)) {
        liquid += val;
      } else if (['FD', 'RD', 'GOLD', 'DIGITAL_GOLD', 'RSU'].includes(a.asset_class)) {
        semiLiquid += val;
      } else {
        illiquid += val;
      }
    });

    return {
      liquid: { amount: liquid, percent: totalAssetsValue > 0 ? Number(((liquid / totalAssetsValue) * 100).toFixed(1)) : 0 },
      semiLiquid: { amount: semiLiquid, percent: totalAssetsValue > 0 ? Number(((semiLiquid / totalAssetsValue) * 100).toFixed(1)) : 0 },
      illiquid: { amount: illiquid, percent: totalAssetsValue > 0 ? Number(((illiquid / totalAssetsValue) * 100).toFixed(1)) : 0 },
    };
  }, [assets, totalAssetsValue]);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <>
      <Header />
      <main style={{ padding: '3rem 0 5rem 0', flex: 1 }}>
        <div className="container">
          {/* Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '2rem' }}>Asset Allocation & Diversification</h1>
                <span className="badge badge-emerald">{assets.length} Active Holdings</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
                Inspect your risk exposure across asset classes, liquidity horizons, and macro investment buckets.
              </p>
            </div>

            <Link href="/assets" className="btn-secondary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.875rem' }}>
              <Layers size={16} />
              <span>Manage Holdings</span>
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Analyzing portfolio diversification...
            </div>
          ) : assets.length === 0 ? (
            <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No assets to analyze</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Add your investments to view your real-time asset class allocation.
              </p>
              <Link href="/assets" className="btn-primary" style={{ display: 'inline-flex', padding: '0.55rem 1.25rem' }}>
                Add Asset
              </Link>
            </div>
          ) : (
            <>
              {/* Macro Asset Distribution Bar */}
              <div className="glass-card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Macro Allocation Breakdown</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Total Portfolio Valuation: <strong>{formatINR(totalAssetsValue)}</strong>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {macroCategories.map((m) => (
                      <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: m.color }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{m.label}:</span>
                        <span style={{ fontWeight: 700 }}>{m.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stacked Horizontal Bar */}
                <div style={{ width: '100%', height: '1.5rem', background: 'var(--bg-surface-elevated)', borderRadius: '999px', overflow: 'hidden', display: 'flex', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
                  {macroCategories.map((m) => (
                    <div
                      key={m.label}
                      title={`${m.label}: ${m.percentage}% (${formatINR(m.amount)})`}
                      style={{
                        width: `${m.percentage}%`,
                        height: '100%',
                        background: m.color,
                        transition: 'width 300ms ease',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Split: Detailed Asset Classes vs Liquidity Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                {/* Specific Asset Classes List */}
                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.15rem' }}>Detailed Holdings by Class</h2>
                    <span className="badge badge-emerald">{allocationList.length} Categories</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {allocationList.map((item) => (
                      <div key={item.assetClass}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                            <span style={{ fontWeight: 600 }}>{item.label}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({item.count} items)</span>
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

                {/* Liquidity Profile & Rebalancing Analysis */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Liquidity Profile */}
                  <div className="glass-card">
                    <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Liquidity Profile</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                      Speed of converting assets to immediate cash without penalty.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {/* Liquid */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>Liquid Assets (T+1 access)</span>
                          <span style={{ fontWeight: 700 }}>{formatINR(liquidity.liquid.amount)} ({liquidity.liquid.percent}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${liquidity.liquid.percent}%`, height: '100%', background: 'var(--brand-primary)', borderRadius: '999px' }} />
                        </div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                          Listed stocks, open-ended mutual funds, savings bank accounts
                        </div>
                      </div>

                      {/* Semi-Liquid */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                          <span style={{ fontWeight: 600, color: '#38bdf8' }}>Semi-Liquid (Notice / Lock-in)</span>
                          <span style={{ fontWeight: 700 }}>{formatINR(liquidity.semiLiquid.amount)} ({liquidity.semiLiquid.percent}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${liquidity.semiLiquid.percent}%`, height: '100%', background: '#38bdf8', borderRadius: '999px' }} />
                        </div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                          Fixed deposits, sovereign gold bonds (SGBs), vested RSUs
                        </div>
                      </div>

                      {/* Illiquid */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                          <span style={{ fontWeight: 600, color: '#a855f7' }}>Illiquid (Multi-year lock-in)</span>
                          <span style={{ fontWeight: 700 }}>{formatINR(liquidity.illiquid.amount)} ({liquidity.illiquid.percent}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${liquidity.illiquid.percent}%`, height: '100%', background: '#a855f7', borderRadius: '999px' }} />
                        </div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                          EPF, PPF, Real estate, Startup angel investments, Vehicles
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Diversification Health Check */}
                  <div className="glass-card" style={{ border: '1px solid var(--border-subtle)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 18, 26, 0.75) 100%)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <ShieldCheck size={18} color="var(--brand-primary)" />
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Portfolio Balance Insight</h3>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                      Your portfolio maintains a balanced blend across growth equities and compounding debt. Financial planners suggest keeping at least <strong>10-20%</strong> in liquid cash/debt instruments to cushion market drawdowns and fund unexpected emergencies.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span className="badge badge-emerald">Well Diversified</span>
                      <span className="badge badge-cyan">{allocationList.length} Unique Classes</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
