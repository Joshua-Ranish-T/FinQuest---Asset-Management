'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useTheme } from '@/components/theme/ThemeSync';
import { UserProfile } from '@/types';
import { api } from '@/lib/api-client';
import { 
  Settings, User, Globe, Type, Download, Trash2, 
  Sparkles, ShieldAlert, ArrowRight, X, Check, Moon, Sun
} from 'lucide-react';

const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham (AED)' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (SGD)' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar (CAD)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (AUD)' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { theme, toggleTheme, fontScale, updateFontScale, setAuthSession } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [fullName, setFullName] = useState('');
  const [baseCurrency, setBaseCurrency] = useState('INR');
  const [savingProfile, setSavingProfile] = useState(false);

  // Danger Zone Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get<{ profile: UserProfile }>('/profile')
      .then((res) => {
        if (active) {
          setProfile(res.profile);
          setFullName(res.profile.full_name || '');
          setBaseCurrency(res.profile.base_currency || 'INR');
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          toast.error('Failed to load profile settings.');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await api.put<UserProfile>('/profile', {
        full_name: fullName,
        base_currency: baseCurrency,
      });
      setProfile(updated);
      toast.success('Preferences saved successfully!');
    } catch {
      toast.error('Failed to update preferences.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      const data = await api.get<Record<string, unknown>>('/account/export');
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `finquest-export-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('JSON export downloaded successfully!');
    } catch {
      toast.error('Failed to export data.');
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await api.get<{ assets: Array<{ name: string; asset_class: string; current_value: number; currency: string }> }>('/assets');
      const assets = res.assets || [];
      const headers = ['Name', 'Asset Class', 'Current Value', 'Currency'];
      const rows = assets.map((a) => [a.name, a.asset_class, a.current_value, a.currency]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `finquest-assets-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV export downloaded successfully!');
    } catch {
      toast.error('Failed to export CSV.');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationInput !== 'DELETE MY DATA') {
      toast.error('Please type "DELETE MY DATA" exactly to confirm.');
      return;
    }

    setDeleting(true);
    try {
      await api.post('/account/wipe', { confirmation: deleteConfirmationInput });
      setAuthSession(false);
      toast.success('Your account and financial data have been permanently erased.');
      router.push('/');
    } catch {
      toast.error('Failed to erase account data.');
      setDeleting(false);
    }
  };

  return (
    <>
      <Header />
      <main style={{ padding: '3rem 0 5rem 0', flex: 1 }}>
        <div className="container" style={{ maxWidth: '880px' }}>
          {/* Header Bar */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Settings size={20} />
              </div>
              <h1 style={{ fontSize: '2rem' }}>Account & Preferences</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
              Manage your personal display currency, typography scale, backups, and data controls.
            </p>
          </div>

          {loading ? (
            <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading preferences...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Subscription Plan Status Card */}
              <div className="glass-card" style={{ border: profile?.subscription_status === 'pro' ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span className={`badge ${profile?.subscription_status === 'pro' ? 'badge-emerald' : 'badge-cyan'}`}>
                        {profile?.subscription_status === 'pro' ? 'FinQuest Pro (Lifetime)' : 'Free Tier Member'}
                      </span>
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                      {profile?.subscription_status === 'pro' ? 'Unlimited Wealth Management Access' : '25 Assets, 5 Liabilities, 3 Goals, 2 Snapshots/mo'}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                      {profile?.subscription_status === 'pro' ? 'All quotas are fully unlocked.' : 'Upgrade anytime for lifetime access and unlimited tracking.'}
                    </div>
                  </div>

                  {profile?.subscription_status !== 'pro' && (
                    <Link href="/pricing" className="btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}>
                      <Sparkles size={16} />
                      <span>Upgrade to Pro</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* General Profile & Currency Form */}
              <div className="glass-card">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Profile & Currency</h2>
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Email Address</label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="input-field"
                        style={{ opacity: 0.7, cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Base Display Currency (Consolidated Net Worth)
                    </label>
                    <select
                      value={baseCurrency}
                      onChange={(e) => setBaseCurrency(e.target.value)}
                      className="input-field"
                    >
                      {SUPPORTED_CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name} ({c.symbol})
                        </option>
                      ))}
                    </select>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      All assets, liabilities, and transactions will be converted to this currency for aggregated totals.
                    </div>
                  </div>

                  <div>
                    <button type="submit" disabled={savingProfile} className="btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}>
                      {savingProfile ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Display & Typography Preferences */}
              <div className="glass-card">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Appearance & Typography</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Theme Switcher */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Color Theme</div>
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Choose between dark mode and light mode</div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      {theme === 'dark' ? (
                        <>
                          <Sun size={16} />
                          <span>Switch to Light Theme</span>
                        </>
                      ) : (
                        <>
                          <Moon size={16} />
                          <span>Switch to Dark Theme</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Font Scale Selector */}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.3rem' }}>Font Scale</div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Adjust the interface font size for comfortable readability
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {(['sm', 'base', 'lg', 'xl'] as const).map((scale) => (
                        <button
                          key={scale}
                          onClick={() => updateFontScale(scale)}
                          style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: 'var(--radius-sm)',
                            border: fontScale === scale ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                            background: fontScale === scale ? 'var(--brand-primary-light)' : 'var(--bg-surface-elevated)',
                            color: fontScale === scale ? 'var(--brand-primary)' : 'var(--text-primary)',
                            fontWeight: fontScale === scale ? 700 : 500,
                            cursor: 'pointer',
                          }}
                        >
                          {scale === 'sm' && 'Compact (Small)'}
                          {scale === 'base' && 'Default (Base)'}
                          {scale === 'lg' && 'Large'}
                          {scale === 'xl' && 'Extra Large'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Export (F-22) */}
              <div className="glass-card">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>Data Ownership & Backups (F-22)</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  FinQuest guarantees zero platform lock-in. Export your complete financial portfolio, ledger transactions, and snapshot history anytime in open standard formats.
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button onClick={handleExportJSON} className="btn-secondary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}>
                    <Download size={16} />
                    <span>Export Complete JSON</span>
                  </button>
                  <button onClick={handleExportCSV} className="btn-secondary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}>
                    <Download size={16} />
                    <span>Export Holdings CSV</span>
                  </button>
                </div>
              </div>

              {/* Danger Zone (F-23: Total Account Erasure) */}
              <div className="glass-card" style={{ border: '1px solid var(--color-danger)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-danger)' }}>
                  <ShieldAlert size={20} />
                  <h2 style={{ fontSize: '1.25rem', color: 'var(--color-danger)' }}>Danger Zone: Total Account Erasure (F-23)</h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Permanently delete all your assets, liabilities, transactions, goals, and valuation snapshots. This action cannot be reversed.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid var(--color-danger)',
                    color: 'var(--color-danger)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Trash2 size={16} />
                  <span>Permanently Delete All Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal for Permanent Erasure */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', border: '1px solid var(--color-danger)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)' }}>
                <ShieldAlert size={20} />
                <h3 style={{ fontSize: '1.25rem' }}>Confirm Data Erasure</h3>
              </div>
              <button onClick={() => setShowDeleteModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              This will permanently delete your portfolio, holdings, transactions, and snapshots. To confirm, please type <strong style={{ color: 'var(--text-primary)' }}>DELETE MY DATA</strong> below:
            </p>

            <input
              type="text"
              placeholder="DELETE MY DATA"
              value={deleteConfirmationInput}
              onChange={(e) => setDeleteConfirmationInput(e.target.value)}
              className="input-field"
              style={{ marginBottom: '1.5rem', borderColor: deleteConfirmationInput === 'DELETE MY DATA' ? 'var(--color-danger)' : undefined }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmationInput !== 'DELETE MY DATA' || deleting}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-danger)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  cursor: deleteConfirmationInput === 'DELETE MY DATA' ? 'pointer' : 'not-allowed',
                  opacity: deleteConfirmationInput === 'DELETE MY DATA' ? 1 : 0.5,
                }}
              >
                {deleting ? 'Erasing...' : 'Confirm Permanent Erasure'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
