'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Asset, AssetClass } from '@/types';
import { api } from '@/lib/api-client';
import { 
  Plus, Search, Trash2, Edit3, ArrowUpDown, 
  Sparkles, Layers, DollarSign, AlertCircle, X 
} from 'lucide-react';
import { ApiError } from '@/lib/api-client';

const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  EQUITY: 'Indian Stocks (Direct Equity)',
  US_EQUITY: 'US & Global Stocks',
  MUTUAL_FUND: 'Mutual Funds',
  EPF: 'Employee Provident Fund (EPF)',
  PPF: 'Public Provident Fund (PPF)',
  NPS: 'National Pension Scheme (NPS)',
  FD: 'Fixed & Recurring Deposits',
  CASH: 'Savings Account & Cash',
  GOLD: 'Sovereign Gold Bonds & Bullion',
  REAL_ESTATE: 'Real Estate & Land',
  CRYPTO: 'Cryptocurrencies',
  VEHICLE: 'Automobile / Vehicle',
  STARTUP: 'Startup / Angel Investments',
  P2P: 'P2P Lending & Debt Notes',
  RSU: 'RSUs & Vested ESOPs',
  SSY: 'Sukanya Samriddhi Yojana (SSY)',
  DIGITAL_GOLD: 'Digital Gold',
  COLLECTIBLES: 'Artwork & Collectibles',
  GRATUITY: 'Gratuity & Superannuation',
  OTHER: 'Other Custom Assets',
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'value_desc' | 'value_asc' | 'name_asc'>('value_desc');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formClass, setFormClass] = useState<AssetClass>('EQUITY');
  const [formInstitution, setFormInstitution] = useState('');
  const [formQuantity, setFormQuantity] = useState('1');
  const [formBuyPrice, setFormBuyPrice] = useState('');
  const [formCurrentValue, setFormCurrentValue] = useState('');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get<{ assets: Asset[]; summary: { total_value: number; count: number; max_allowed: number } }>('/assets')
      .then((res) => {
        if (active) {
          setAssets(res.assets || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          toast.error('Failed to load assets. Please try again.');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const totalValue = useMemo(() => {
    return assets.reduce((sum, a) => sum + Number(a.current_value), 0);
  }, [assets]);

  const filteredAssets = useMemo(() => {
    return assets
      .filter((a) => {
        const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (a.institution && a.institution.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesClass = filterClass === 'ALL' || a.asset_class === filterClass;
        return matchesSearch && matchesClass;
      })
      .sort((a, b) => {
        if (sortBy === 'value_desc') return b.current_value - a.current_value;
        if (sortBy === 'value_asc') return a.current_value - b.current_value;
        return a.name.localeCompare(b.name);
      });
  }, [assets, searchQuery, filterClass, sortBy]);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  // Open Add Modal
  const openAddModal = () => {
    if (assets.length >= 25) {
      setShowUpgradeModal(true);
      return;
    }
    setFormName('');
    setFormClass('EQUITY');
    setFormInstitution('');
    setFormQuantity('1');
    setFormBuyPrice('');
    setFormCurrentValue('');
    setFormNotes('');
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setFormName(asset.name);
    setFormClass(asset.asset_class);
    setFormInstitution(asset.institution || '');
    setFormQuantity(String(asset.quantity || 1));
    setFormBuyPrice(String(asset.buy_price || asset.current_value));
    setFormCurrentValue(String(asset.current_value));
    setFormNotes(asset.notes || '');
  };

  // Submit Add
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCurrentValue) {
      toast.error('Asset name and current valuation are required.');
      return;
    }

    try {
      const created = await api.post<Asset>('/assets', {
        name: formName,
        asset_class: formClass,
        institution: formInstitution,
        quantity: Number(formQuantity) || 1,
        buy_price: Number(formBuyPrice) || Number(formCurrentValue),
        current_value: Number(formCurrentValue),
        currency: 'INR',
        notes: formNotes,
      });
      setAssets((prev) => [...prev, created]);
      setShowAddModal(false);
      toast.success(`Added ${formName} successfully!`);
    } catch (err: unknown) {
      if (err instanceof ApiError && (err.status === 403 || err.code === 'ASSET_LIMIT_REACHED')) {
        setShowAddModal(false);
        setShowUpgradeModal(true);
      } else {
        toast.error(err instanceof Error ? err.message : 'Failed to add asset.');
      }
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;

    try {
      const updated = await api.put<Asset>(`/assets/${editingAsset.id}`, {
        name: formName,
        asset_class: formClass,
        institution: formInstitution,
        quantity: Number(formQuantity) || 1,
        buy_price: Number(formBuyPrice) || Number(formCurrentValue),
        current_value: Number(formCurrentValue),
        currency: 'INR',
        notes: formNotes,
      });
      setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setEditingAsset(null);
      toast.success(`Updated ${formName} successfully!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update asset.');
    }
  };

  // Delete Asset
  const handleDeleteConfirm = async () => {
    if (!deletingAsset) return;

    try {
      await api.delete(`/assets/${deletingAsset.id}`);
      setAssets((prev) => prev.filter((a) => a.id !== deletingAsset.id));
      toast.success(`Deleted ${deletingAsset.name}.`);
      setDeletingAsset(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete asset.');
    }
  };

  return (
    <>
      <Header />
      <main style={{ padding: '3rem 0 5rem 0', flex: 1 }}>
        <div className="container">
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h1 style={{ fontSize: '2rem' }}>Assets Portfolio</h1>
                <span className={`badge ${assets.length >= 25 ? 'badge-gold' : 'badge-emerald'}`}>
                  {assets.length} / 25 Quota Used
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
                Track and manage your investments across 20+ asset classes.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link href="/dashboard" className="btn-secondary" style={{ padding: '0.55rem 1rem', fontSize: '0.875rem' }}>
                Dashboard
              </Link>
              <button onClick={openAddModal} className="btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}>
                <Plus size={16} />
                <span>Add Asset</span>
              </button>
            </div>
          </div>

          {/* Portfolio Summary Card */}
          <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', border: '1px solid var(--border-medium)' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Asset Valuation</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '0.25rem' }}>
                {formatINR(totalValue)}
              </div>
            </div>

            <div style={{ minWidth: '220px', flex: 1, maxWidth: '400px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Free Tier Quota</span>
                <span style={{ fontWeight: 600 }}>{assets.length} of 25 Max</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, (assets.length / 25) * 100)}%`,
                    height: '100%',
                    background: assets.length >= 25 ? 'var(--color-warning)' : 'var(--brand-primary)',
                    borderRadius: '999px',
                    transition: 'width 300ms ease',
                  }}
                />
              </div>
              {assets.length >= 25 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--brand-gold)', marginTop: '0.4rem' }}>
                  Limit reached. Upgrade to Pro for unlimited assets.
                </div>
              )}
            </div>
          </div>

          {/* Search, Filter & Sort Controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
              {/* Search */}
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <input
                  type="text"
                  placeholder="Search assets or platforms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-control"
                  style={{ paddingLeft: '2.25rem' }}
                />
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>

              {/* Class Filter */}
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="input-control"
                style={{ width: 'auto', minWidth: '180px' }}
              >
                <option value="ALL">All Asset Classes ({assets.length})</option>
                {Object.entries(ASSET_CLASS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowUpDown size={15} color="var(--text-muted)" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'value_desc' | 'value_asc' | 'name_asc')}
                className="input-control"
                style={{ width: 'auto' }}
              >
                <option value="value_desc">Valuation: High to Low</option>
                <option value="value_asc">Valuation: Low to High</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Assets Table / List */}
          {loading ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading assets portfolio...
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
              <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Layers size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>No assets found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                {searchQuery || filterClass !== 'ALL'
                  ? 'No holdings match your current filter or search criteria.'
                  : 'Start tracking your wealth by adding your first investment holding.'}
              </p>
              <button onClick={openAddModal} className="btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
                <Plus size={16} />
                <span>Add First Asset</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredAssets.map((asset) => {
                const pct = totalValue > 0 ? ((asset.current_value / totalValue) * 100).toFixed(1) : '0';
                return (
                  <div
                    key={asset.id}
                    className="glass-card"
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      transition: 'border-color 150ms ease',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                        <DollarSign size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                          {asset.name}
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                          <span className="badge badge-muted">{ASSET_CLASS_LABELS[asset.asset_class] || asset.asset_class}</span>
                          {asset.institution && <span>Platform: {asset.institution}</span>}
                          {asset.quantity > 1 && <span>Units: {asset.quantity}</span>}
                          {asset.notes && <span>&bull; {asset.notes}</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                          {formatINR(asset.current_value)}
                        </div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                          {pct}% of portfolio
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => openEditModal(asset)}
                          aria-label={`Edit ${asset.name}`}
                          className="btn-secondary"
                          style={{ padding: '0.45rem' }}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingAsset(asset)}
                          aria-label={`Delete ${asset.name}`}
                          className="btn-secondary"
                          style={{ padding: '0.45rem', color: 'var(--color-danger)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Asset Modal */}
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-card" style={{ maxWidth: '520px', width: '100%', background: 'var(--bg-surface-elevated)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.35rem' }}>Add New Asset</h3>
                <button onClick={() => setShowAddModal(false)} aria-label="Close modal" style={{ color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Asset Class (20+ Classes Supported)
                  </label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value as AssetClass)}
                    className="input-control"
                  >
                    {Object.entries(ASSET_CLASS_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Asset / Security Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mirae Asset Large Cap Fund"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="input-control"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Current Valuation (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 250000"
                      value={formCurrentValue}
                      onChange={(e) => setFormCurrentValue(e.target.value)}
                      className="input-control"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Purchase Cost (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 200000"
                      value={formBuyPrice}
                      onChange={(e) => setFormBuyPrice(e.target.value)}
                      className="input-control"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Institution / Platform
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Zerodha, Groww, SBI"
                      value={formInstitution}
                      onChange={(e) => setFormInstitution(e.target.value)}
                      className="input-control"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Units / Quantity
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="1"
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(e.target.value)}
                      className="input-control"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Notes / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Direct SIP, Long term retirement bucket"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="input-control"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
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

        {/* Edit Asset Modal */}
        {editingAsset && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-card" style={{ maxWidth: '520px', width: '100%', background: 'var(--bg-surface-elevated)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.35rem' }}>Edit Asset: {editingAsset.name}</h3>
                <button onClick={() => setEditingAsset(null)} aria-label="Close modal" style={{ color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Asset Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="input-control"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Current Valuation (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formCurrentValue}
                      onChange={(e) => setFormCurrentValue(e.target.value)}
                      className="input-control"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Purchase Cost (₹)
                    </label>
                    <input
                      type="number"
                      value={formBuyPrice}
                      onChange={(e) => setFormBuyPrice(e.target.value)}
                      className="input-control"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Institution / Platform
                    </label>
                    <input
                      type="text"
                      value={formInstitution}
                      onChange={(e) => setFormInstitution(e.target.value)}
                      className="input-control"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Units / Quantity
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(e.target.value)}
                      className="input-control"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Notes
                  </label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="input-control"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    Update Asset
                  </button>
                  <button type="button" onClick={() => setEditingAsset(null)} className="btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingAsset && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-card" style={{ maxWidth: '440px', width: '100%', background: 'var(--bg-surface-elevated)' }}>
              <div style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>
                <AlertCircle size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Delete {deletingAsset.name}?</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Are you sure you want to remove this asset? This will adjust your consolidated net worth. This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={handleDeleteConfirm} className="btn-primary" style={{ flex: 1, background: 'var(--color-danger)' }}>
                  Delete
                </button>
                <button onClick={() => setDeletingAsset(null)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pro Upgrade Quota Modal */}
        {showUpgradeModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-card" style={{ maxWidth: '480px', width: '100%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--brand-primary)', textAlign: 'center', padding: '2.5rem' }}>
              <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Sparkles size={28} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Asset Quota Reached</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Your Free plan includes up to <strong>25 assets</strong>. Upgrade to <strong>FinQuest Pro</strong> for lifetime unlimited tracking across all 20+ classes.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link href="/#pricing" className="btn-primary" style={{ padding: '0.8rem' }}>
                  Upgrade to Pro (₹2,999 Lifetime)
                </Link>
                <button onClick={() => setShowUpgradeModal(false)} className="btn-secondary" style={{ padding: '0.8rem' }}>
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
