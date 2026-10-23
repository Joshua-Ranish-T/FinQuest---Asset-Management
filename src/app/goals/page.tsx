'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Goal, GoalCategory, Asset } from '@/types';
import { api, ApiError } from '@/lib/api-client';
import { 
  Target, Plus, Trash2, Calendar, Sparkles, CheckCircle2, 
  AlertCircle, ArrowRight, X, Layers, Clock, TrendingUp
} from 'lucide-react';

const GOAL_CATEGORIES: { id: GoalCategory; label: string; badge: string }[] = [
  { id: 'EMERGENCY_FUND', label: 'Emergency Fund', badge: 'badge-emerald' },
  { id: 'HOUSE', label: 'Home Purchase', badge: 'badge-cyan' },
  { id: 'RETIREMENT', label: 'Retirement (FIRE)', badge: 'badge-amber' },
  { id: 'EDUCATION', label: 'Education / Higher Studies', badge: 'badge-purple' },
  { id: 'TRAVEL', label: 'Travel / Vacation', badge: 'badge-blue' },
  { id: 'CUSTOM', label: 'Custom Milestone', badge: 'badge-gray' },
];

export default function GoalsManagementPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Goal Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<GoalCategory>('HOUSE');
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  // Upgrade Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get<{ goals: Goal[] }>('/goals'),
      api.get<{ assets: Asset[] }>('/assets'),
    ])
      .then(([goalsRes, assetsRes]) => {
        if (active) {
          setGoals(goalsRes.goals || []);
          setAssets(assetsRes.assets || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          toast.error('Failed to load goals data.');
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

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !targetAmount || !targetDate) {
      toast.error('Please fill in goal name, target amount, and target date.');
      return;
    }

    try {
      const created = await api.post<Goal>('/goals', {
        name: goalName,
        target_amount: Number(targetAmount),
        target_date: targetDate,
        category,
        linked_asset_ids: selectedAssetIds,
      });

      setGoals((prev) => [...prev, created]);
      setShowAddModal(false);
      setGoalName('');
      setTargetAmount('');
      setTargetDate('');
      setSelectedAssetIds([]);
      toast.success(`Created goal: ${goalName}!`);
    } catch (err: unknown) {
      if (err instanceof ApiError && (err.status === 403 || err.code === 'GOAL_LIMIT_REACHED')) {
        setShowAddModal(false);
        setShowUpgradeModal(true);
      } else {
        toast.error(err instanceof Error ? err.message : 'Failed to create goal.');
      }
    }
  };

  const handleDeleteGoal = async (id: string, name: string) => {
    try {
      await api.delete(`/goals/${id}`);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast.success(`Removed goal: ${name}`);
    } catch {
      toast.error('Failed to delete goal.');
    }
  };

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    );
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
                <h1 style={{ fontSize: '2rem' }}>Financial Goals & Milestones</h1>
                <span className="badge badge-emerald">Free Plan ({goals.length}/3 Goals)</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
                Map real-world wealth goals directly to your investment portfolio and track target deadlines.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={() => {
                  if (goals.length >= 3) {
                    setShowUpgradeModal(true);
                  } else {
                    setShowAddModal(true);
                  }
                }}
                className="btn-primary"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}
              >
                <Plus size={16} />
                <span>Create New Goal</span>
              </button>
            </div>
          </div>

          {/* Quota Notice Card */}
          <div style={{ background: 'var(--bg-surface-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Target size={20} color="var(--brand-primary)" />
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Goal Allocation Status: </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {goals.length} of 3 Free goals allocated. Link your existing assets to track real-time progress.
                </span>
              </div>
            </div>
            {goals.length >= 3 && (
              <button onClick={() => setShowUpgradeModal(true)} className="btn-secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
                <Sparkles size={14} />
                <span>Unlock Unlimited Goals</span>
              </button>
            )}
          </div>

          {/* Goals List */}
          {loading ? (
            <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading your financial goals...
            </div>
          ) : goals.length === 0 ? (
            <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: 'var(--bg-surface-elevated)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--text-muted)' }}>
                <Target size={28} />
              </div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No financial goals created yet</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
                Define your life targets—such as an emergency fund, home down payment, or retirement—and connect your investments.
              </p>
              <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ display: 'inline-flex', padding: '0.55rem 1.25rem' }}>
                <Plus size={16} />
                <span>Create Your First Goal</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
              {goals.map((g) => {
                const categoryConfig = GOAL_CATEGORIES.find((c) => c.id === g.category) || GOAL_CATEGORIES[5];
                const progress = Math.min(100, Math.max(0, g.progress_percentage || 0));
                const linkedAssets = assets.filter((a) => g.linked_asset_ids?.includes(a.id));
                const isOverdue = g.target_date < '2026-10-23';

                return (
                  <div key={g.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      {/* Top Info */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <span className={`badge ${categoryConfig.badge}`} style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                            {categoryConfig.label}
                          </span>
                          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{g.name}</h2>
                        </div>
                        <button
                          onClick={() => handleDeleteGoal(g.id, g.name)}
                          aria-label={`Delete goal ${g.name}`}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.25rem',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Amounts */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Accumulated</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                            {formatINR(g.current_amount || 0)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Goal</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                            {formatINR(g.target_amount)}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ width: '100%', height: '10px', background: 'var(--bg-surface-elevated)', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                        <div
                          style={{
                            width: `${progress}%`,
                            height: '100%',
                            background: progress >= 100 ? 'var(--brand-primary)' : 'linear-gradient(90deg, #38bdf8 0%, #10b981 100%)',
                            borderRadius: '999px',
                            transition: 'width 300ms ease-in-out',
                          }}
                        />
                      </div>

                      {/* Status row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
                        <span style={{ fontWeight: 700, color: progress >= 100 ? 'var(--brand-primary)' : 'var(--text-secondary)' }}>
                          {progress}% Completed
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: isOverdue ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                          <Calendar size={14} />
                          <span>Target: {g.target_date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Linked Assets Badges */}
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Layers size={13} />
                        <span>Contributing Portfolio Assets ({linkedAssets.length}):</span>
                      </div>
                      {linkedAssets.length === 0 ? (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No assets linked. Value is updated manually.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {linkedAssets.map((la) => (
                            <span key={la.id} className="badge badge-cyan" style={{ fontSize: '0.725rem' }}>
                              {la.name} ({formatINR(la.current_value)})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={20} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.25rem' }}>Create Financial Goal</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Home Down Payment, Early Retirement"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GoalCategory)}
                    className="input-field"
                  >
                    {GOAL_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Target Amount (INR)</label>
                <input
                  type="number"
                  placeholder="2500000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="input-field"
                  min="1"
                  required
                />
              </div>

              {/* Link Assets Checklist */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Link Assets (Automatically feeds current progress)
                </label>
                <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', background: 'var(--bg-surface-elevated)' }}>
                  {assets.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem' }}>
                      No assets found. You can link assets later.
                    </div>
                  ) : (
                    assets.map((asset) => (
                      <label key={asset.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="checkbox"
                            checked={selectedAssetIds.includes(asset.id)}
                            onChange={() => toggleAssetSelection(asset.id)}
                          />
                          <span>{asset.name}</span>
                        </div>
                        <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{formatINR(asset.current_value)}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pro Upgrade Modal */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', textAlign: 'center', border: '1px solid var(--brand-primary)' }}>
            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: 'var(--brand-primary-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--brand-primary)' }}>
              <Sparkles size={28} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Free Plan Goal Limit Reached</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              The Free plan includes up to <strong>3 financial goals</strong>. Upgrade to FinQuest Pro for unlimited goals, custom milestones, and family wealth planning.
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
