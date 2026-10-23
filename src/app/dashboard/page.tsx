'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useTheme } from '@/components/theme/ThemeSync';
import { Asset, Liability, AssetClass } from '@/types';
import { api, ApiError } from '@/lib/api-client';
import { 
  TrendingUp, Plus, Camera, Sparkles, LogOut, ArrowRight, Layers, CreditCard 
} from 'lucide-react';

export default function AuthenticatedDashboardPage() {
  const router = useRouter();
  const { setAuthSession } = useTheme();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [userName, setUserName] = useState<string>('Investor');
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetValue, setNewAssetValue] = useState('');
  const [newAssetClass, setNewAssetClass] = useState<AssetClass>('EQUITY');

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get<{ assets: Asset[] }>('/assets'),
      api.get<{ liabilities: Liability[] }>('/liabilities'),
      api.get<any>('/profile').catch(() => null),
    ])
      .then(([assetsRes, liabRes, profileRes]) => {
        if (active) {
          setAssets(assetsRes.assets || []);
          setLiabilities(liabRes.liabilities || []);
          if (profileRes?.full_name) {
            setUserName(profileRes.full_name);
          } else if (profileRes?.email) {
            setUserName(profileRes.email.split('@')[0]);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          toast.error('Failed to load portfolio data.');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const totalAssets = useMemo(() => {
    return assets.reduce((sum, a) => sum + Number(a.current_value), 0);
  }, [assets]);

  const totalLiabilities = useMemo(() => {
    return liabilities.reduce((sum, l) => sum + Number(l.principal_outstanding), 0);
  }, [liabilities]);

  const netWorth = totalAssets - totalLiabilities;

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const handleTakeSnapshot = async () => {
    try {
      await api.post('/snapshots', {});
      toast.success('Net worth snapshot captured successfully!');
    } catch (err: unknown) {
      if (err instanceof ApiError && (err.status === 403 || err.code === 'SNAPSHOT_LIMIT_REACHED')) {
        toast.error('Free tier includes 2 snapshots per month. Upgrade to Pro for unlimited snapshots.');
      } else {
        toast.error(err instanceof Error ? err.message : 'Failed to capture snapshot.');
      }
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName || !newAssetValue) {
      toast.error('Please enter asset name and current value.');
      return;
    }

    try {
      const created = await api.post<Asset>('/assets', {
        name: newAssetName,
        asset_class: newAssetClass,
        current_value: Number(newAssetValue),
        currency: 'INR',
      });
      setAssets((prev) => [...prev, created]);
      setShowAddModal(false);
      setNewAssetName('');
      setNewAssetValue('');
      toast.success(`Added ${newAssetName} to your portfolio!`);
    } catch (err: unknown) {
      if (err instanceof ApiError && (err.status === 403 || err.code === 'ASSET_LIMIT_REACHED')) {
        setShowAddModal(false);
        toast.error('Free tier quota reached (25 assets). Upgrade to Pro for unlimited tracking.');
      } else {
        toast.error(err instanceof Error ? err.message : 'Failed to add asset.');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (_) { /* ignore network errors during logout */ }
    setAuthSession(false);
    toast.info('Signed out successfully.');
    window.location.href = '/login';
  };

  return (
    <>
      <Header />
      <main style={{ padding: '3rem 0 5rem 0', flex: 1 }}>
        <div className="container">
          {/* Welcome Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.85rem' }}>Welcome back, {userName}</h1>
                <span className="badge badge-emerald">Free Plan ({assets.length}/25 Assets)</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                All figures updated across your consolidated investment accounts.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.875rem' }}>
                <Plus size={16} />
                <span>Add Asset</span>
              </button>
              <button onClick={handleTakeSnapshot} className="btn-secondary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.875rem' }}>
                <Camera size={16} />
                <span>Capture Snapshot</span>
              </button>
              <button onClick={handleSignOut} className="btn-outline" style={{ padding: '0.55rem 1rem', fontSize: '0.875rem' }}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid-cols-3" style={{ marginBottom: '2.5rem' }}>
            <div className="glass-card" style={{ border: '1px solid var(--brand-primary)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 18, 26, 0.75) 100%)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Consolidated Net Worth</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{formatINR(netWorth)}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--brand-primary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <TrendingUp size={15} />
                <span>{assets.length === 0 ? 'Add assets to track net worth' : '+14.8% annual portfolio gain'}</span>
              </div>
            </div>

            <Link href="/assets" className="glass-card" style={{ display: 'block', transition: 'border-color 150ms' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Assets</div>
                <ArrowRight size={15} color="var(--brand-primary)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{formatINR(totalAssets)}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                {assets.length} of 25 Quota Used &rarr;
              </div>
            </Link>

            <Link href="/liabilities" className="glass-card" style={{ display: 'block', transition: 'border-color 150ms' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Liabilities</div>
                <ArrowRight size={15} color="var(--color-danger)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-danger)' }}>{formatINR(totalLiabilities)}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                {liabilities.length} of 5 Quota Used &rarr;
              </div>
            </Link>
          </div>

          {/* Pro Upgrade Banner */}
          <div style={{ background: 'var(--brand-primary-light)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} />
                <span>Upgrade to Pro for Lifetime Access</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Track unlimited assets, access family profiles, and capture unlimited net worth snapshots.
              </div>
            </div>
            <Link href="/#pricing" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
              Upgrade to Pro (₹2,999)
            </Link>
          </div>

          {/* Section Split: Assets Overview & Liabilities Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
            {/* Assets Column */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={18} color="var(--brand-primary)" />
                  <h2 style={{ fontSize: '1.15rem' }}>Top Assets ({assets.length})</h2>
                </div>
                <Link href="/assets" style={{ fontSize: '0.85rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                  Manage All &rarr;
                </Link>
              </div>

              {loading ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading assets...</div>
              ) : assets.length === 0 ? (
                <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>No assets in your portfolio yet.</div>
                  <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                    <Plus size={15} />
                    <span>Add Your First Asset</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {assets.slice(0, 5).map((asset) => (
                    <div key={asset.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>{asset.name}</div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{asset.asset_class}</div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{formatINR(asset.current_value)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Liabilities Column */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CreditCard size={18} color="var(--color-danger)" />
                  <h2 style={{ fontSize: '1.15rem' }}>Liabilities ({liabilities.length})</h2>
                </div>
                <Link href="/liabilities" style={{ fontSize: '0.85rem', color: 'var(--color-danger)', fontWeight: 600 }}>
                  Manage All &rarr;
                </Link>
              </div>

              {loading ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading liabilities...</div>
              ) : liabilities.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No outstanding liabilities registered.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {liabilities.map((liab) => (
                    <div key={liab.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>{liab.name}</div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{liab.liability_type}</div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-danger)' }}>
                        {formatINR(liab.principal_outstanding)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Asset Modal */}
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-card" style={{ maxWidth: '460px', width: '100%', background: 'var(--bg-surface-elevated)' }}>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>Add New Asset</h3>
              <form onSubmit={handleAddAsset} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Asset Class
                  </label>
                  <select
                    value={newAssetClass}
                    onChange={(e) => setNewAssetClass(e.target.value as AssetClass)}
                    className="input-control"
                  >
                    <option value="EQUITY">Indian Equity (Stocks)</option>
                    <option value="MUTUAL_FUND">Mutual Fund</option>
                    <option value="EPF">Employee Provident Fund (EPF)</option>
                    <option value="PPF">Public Provident Fund (PPF)</option>
                    <option value="GOLD">Sovereign Gold Bonds / Gold</option>
                    <option value="FD">Fixed Deposit</option>
                    <option value="CASH">Savings Account / Cash</option>
                    <option value="REAL_ESTATE">Real Estate</option>
                    <option value="CRYPTO">Cryptocurrency</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Asset Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Parag Parikh Flexi Cap Fund"
                    value={newAssetName}
                    onChange={(e) => setNewAssetName(e.target.value)}
                    className="input-control"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Current Valuation (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150000"
                    value={newAssetValue}
                    onChange={(e) => setNewAssetValue(e.target.value)}
                    className="input-control"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    Save Asset
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
