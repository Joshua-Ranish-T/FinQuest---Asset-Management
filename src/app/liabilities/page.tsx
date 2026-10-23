'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Liability, LiabilityType } from '@/types';
import { api } from '@/lib/api-client';
import { 
  Plus, Trash2, Edit3, Sparkles, CreditCard, AlertCircle, X 
} from 'lucide-react';
import { ApiError } from '@/lib/api-client';

const LIABILITY_TYPE_LABELS: Record<LiabilityType, string> = {
  HOME_LOAN: 'Home Loan / Mortgage',
  CAR_LOAN: 'Car / Vehicle Loan',
  PERSONAL_LOAN: 'Personal Loan',
  EDUCATION_LOAN: 'Education Loan',
  CREDIT_CARD: 'Credit Card Outstanding',
  FAMILY_LOAN: 'Family / Private Debt',
  OTHER: 'Other Debt',
};

export default function LiabilitiesPage() {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);
  const [deletingLiability, setDeletingLiability] = useState<Liability | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<LiabilityType>('HOME_LOAN');
  const [formLender, setFormLender] = useState('');
  const [formPrincipal, setFormPrincipal] = useState('');
  const [formRate, setFormRate] = useState('');
  const [formEMI, setFormEMI] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get<{ liabilities: Liability[]; summary: { total_outstanding: number; count: number; max_allowed: number } }>('/liabilities')
      .then((res) => {
        if (active) {
          setLiabilities(res.liabilities || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          toast.error('Failed to load liabilities. Please try again.');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const totalOutstanding = useMemo(() => {
    return liabilities.reduce((sum, l) => sum + Number(l.principal_outstanding), 0);
  }, [liabilities]);

  const totalMonthlyEMI = useMemo(() => {
    return liabilities.reduce((sum, l) => sum + Number(l.monthly_emi || 0), 0);
  }, [liabilities]);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const openAddModal = () => {
    if (liabilities.length >= 5) {
      setShowUpgradeModal(true);
      return;
    }
    setFormName('');
    setFormType('HOME_LOAN');
    setFormLender('');
    setFormPrincipal('');
    setFormRate('');
    setFormEMI('');
    setShowAddModal(true);
  };

  const openEditModal = (liab: Liability) => {
    setEditingLiability(liab);
    setFormName(liab.name);
    setFormType(liab.liability_type);
    setFormLender(liab.lender || '');
    setFormPrincipal(String(liab.principal_outstanding));
    setFormRate(liab.interest_rate !== undefined ? String(liab.interest_rate) : '');
    setFormEMI(liab.monthly_emi !== undefined ? String(liab.monthly_emi) : '');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrincipal) {
      toast.error('Liability name and principal amount are required.');
      return;
    }

    try {
      const created = await api.post<Liability>('/liabilities', {
        name: formName,
        liability_type: formType,
        lender: formLender,
        principal_outstanding: Number(formPrincipal),
        interest_rate: formRate ? Number(formRate) : undefined,
        monthly_emi: formEMI ? Number(formEMI) : undefined,
        currency: 'INR',
      });
      setLiabilities((prev) => [...prev, created]);
      setShowAddModal(false);
      toast.success(`Added ${formName} successfully!`);
    } catch (err: unknown) {
      if (err instanceof ApiError && (err.status === 403 || err.code === 'LIABILITY_LIMIT_REACHED')) {
        setShowAddModal(false);
        setShowUpgradeModal(true);
      } else {
        toast.error(err instanceof Error ? err.message : 'Failed to add liability.');
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLiability) return;

    try {
      const updated = await api.put<Liability>(`/liabilities/${editingLiability.id}`, {
        name: formName,
        liability_type: formType,
        lender: formLender,
        principal_outstanding: Number(formPrincipal),
        interest_rate: formRate ? Number(formRate) : undefined,
        monthly_emi: formEMI ? Number(formEMI) : undefined,
        currency: 'INR',
      });
      setLiabilities((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setEditingLiability(null);
      toast.success(`Updated ${formName} successfully!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update liability.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingLiability) return;

    try {
      await api.delete(`/liabilities/${deletingLiability.id}`);
      setLiabilities((prev) => prev.filter((l) => l.id !== deletingLiability.id));
      toast.success(`Deleted ${deletingLiability.name}.`);
      setDeletingLiability(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete liability.');
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
                <h1 style={{ fontSize: '2rem' }}>Liabilities & Loans</h1>
                <span className={`badge ${liabilities.length >= 5 ? 'badge-gold' : 'badge-emerald'}`}>
                  {liabilities.length} / 5 Quota Used
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
                Track home loans, vehicle debt, and credit balances.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link href="/dashboard" className="btn-secondary" style={{ padding: '0.55rem 1rem', fontSize: '0.875rem' }}>
                Dashboard
              </Link>
              <button onClick={openAddModal} className="btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}>
                <Plus size={16} />
                <span>Add Liability</span>
              </button>
            </div>
          </div>

          {/* Liabilities Summary Card */}
          <div className="grid-cols-2" style={{ marginBottom: '2.5rem' }}>
            <div className="glass-card" style={{ border: '1px solid var(--border-medium)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Principal Outstanding</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-danger)', marginTop: '0.25rem' }}>
                {formatINR(totalOutstanding)}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginTop: '0.5rem' }}>
                Across {liabilities.length} active liabilities
              </div>
            </div>

            <div className="glass-card" style={{ border: '1px solid var(--border-medium)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Monthly EMI Commitment</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-warning)', marginTop: '0.25rem' }}>
                {formatINR(totalMonthlyEMI)} / mo
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginTop: '0.5rem' }}>
                Monthly cashflow deduction
              </div>
            </div>
          </div>

          {/* Liabilities List */}
          {loading ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading liabilities...
            </div>
          ) : liabilities.length === 0 ? (
            <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
              <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <CreditCard size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>Zero Liabilities</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                You have no outstanding loans or debts registered in FinQuest.
              </p>
              <button onClick={openAddModal} className="btn-secondary" style={{ padding: '0.6rem 1.25rem' }}>
                <Plus size={16} />
                <span>Add Loan</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {liabilities.map((liab) => (
                <div
                  key={liab.id}
                  className="glass-card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-danger)' }}>
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                        {liab.name}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-muted">{LIABILITY_TYPE_LABELS[liab.liability_type] || liab.liability_type}</span>
                        {liab.lender && <span>Lender: {liab.lender}</span>}
                        {liab.interest_rate !== undefined && <span>Rate: {liab.interest_rate}% p.a.</span>}
                        {liab.monthly_emi !== undefined && <span>EMI: {formatINR(liab.monthly_emi)}/mo</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-danger)' }}>
                        {formatINR(liab.principal_outstanding)}
                      </div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        Outstanding Principal
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => openEditModal(liab)}
                        aria-label={`Edit ${liab.name}`}
                        className="btn-secondary"
                        style={{ padding: '0.45rem' }}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => setDeletingLiability(liab)}
                        aria-label={`Delete ${liab.name}`}
                        className="btn-secondary"
                        style={{ padding: '0.45rem', color: 'var(--color-danger)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Liability Modal */}
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-card" style={{ maxWidth: '480px', width: '100%', background: 'var(--bg-surface-elevated)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.35rem' }}>Add Liability</h3>
                <button onClick={() => setShowAddModal(false)} aria-label="Close modal" style={{ color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Liability Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as LiabilityType)}
                    className="input-control"
                  >
                    {Object.entries(LIABILITY_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Liability / Loan Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC Home Loan"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="input-control"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Outstanding Amount (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 2800000"
                      value={formPrincipal}
                      onChange={(e) => setFormPrincipal(e.target.value)}
                      className="input-control"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Lender / Bank
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SBI, HDFC, ICICI"
                      value={formLender}
                      onChange={(e) => setFormLender(e.target.value)}
                      className="input-control"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 8.4"
                      value={formRate}
                      onChange={(e) => setFormRate(e.target.value)}
                      className="input-control"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Monthly EMI (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 28500"
                      value={formEMI}
                      onChange={(e) => setFormEMI(e.target.value)}
                      className="input-control"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    Save Liability
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Liability Modal */}
        {editingLiability && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-card" style={{ maxWidth: '480px', width: '100%', background: 'var(--bg-surface-elevated)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.35rem' }}>Edit {editingLiability.name}</h3>
                <button onClick={() => setEditingLiability(null)} aria-label="Close modal" style={{ color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Liability Name
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
                      Outstanding Amount (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formPrincipal}
                      onChange={(e) => setFormPrincipal(e.target.value)}
                      className="input-control"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Lender
                    </label>
                    <input
                      type="text"
                      value={formLender}
                      onChange={(e) => setFormLender(e.target.value)}
                      className="input-control"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formRate}
                      onChange={(e) => setFormRate(e.target.value)}
                      className="input-control"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Monthly EMI (₹)
                    </label>
                    <input
                      type="number"
                      value={formEMI}
                      onChange={(e) => setFormEMI(e.target.value)}
                      className="input-control"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    Update Liability
                  </button>
                  <button type="button" onClick={() => setEditingLiability(null)} className="btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingLiability && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-card" style={{ maxWidth: '440px', width: '100%', background: 'var(--bg-surface-elevated)' }}>
              <div style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>
                <AlertCircle size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Delete {deletingLiability.name}?</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Are you sure you want to remove this liability? This will adjust your consolidated net worth. This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={handleDeleteConfirm} className="btn-primary" style={{ flex: 1, background: 'var(--color-danger)' }}>
                  Delete
                </button>
                <button onClick={() => setDeletingLiability(null)} className="btn-secondary" style={{ flex: 1 }}>
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
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Liability Quota Reached</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Your Free plan includes up to <strong>5 liabilities</strong>. Upgrade to <strong>FinQuest Pro</strong> for lifetime unlimited liability and debt tracking.
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
