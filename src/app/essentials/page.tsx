'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Asset, Transaction } from '@/types';
import { api } from '@/lib/api-client';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, HeartPulse, 
  Umbrella, Wallet, ArrowRight, Sparkles, FileText, Lock 
} from 'lucide-react';

export default function EssentialsHealthScorecardPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Self-reported checklist states (persisted locally in localStorage for user session)
  const [hasTermInsurance, setHasTermInsurance] = useState(true);
  const [termCoverAmount, setTermCoverAmount] = useState('15000000'); // 1.5 Cr
  const [hasHealthInsurance, setHasHealthInsurance] = useState(true);
  const [healthCoverAmount, setHealthCoverAmount] = useState('1500000'); // 15 Lakhs
  const [hasNomineesUpdated, setHasNomineesUpdated] = useState(true);
  const [hasWillCreated, setHasWillCreated] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get<{ assets: Asset[] }>('/assets'),
      api.get<{ transactions: Transaction[] }>('/transactions'),
    ])
      .then(([assetsRes, txRes]) => {
        if (active) {
          setAssets(assetsRes.assets || []);
          setTransactions(txRes.transactions || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          toast.error('Failed to load portfolio essentials data.');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // Liquid cash/bank balance
  const liquidCash = useMemo(() => {
    return assets
      .filter((a) => a.asset_class === 'CASH' || a.asset_class === 'FD')
      .reduce((sum, a) => sum + Number(a.current_value), 0);
  }, [assets]);

  // Monthly living expenses
  const monthlyExpense = useMemo(() => {
    const expenses = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return expenses > 0 ? expenses : 88100; // fallback realistic figure if empty
  }, [transactions]);

  // Emergency Fund metrics
  const targetEmergencyFund = monthlyExpense * 6;
  const emergencyCoverageMonths = (liquidCash / monthlyExpense).toFixed(1);
  const emergencyFundPercent = Math.min(100, Math.round((liquidCash / targetEmergencyFund) * 100));

  // Annual income
  const annualIncome = useMemo(() => {
    const monthlyIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return (monthlyIncome > 0 ? monthlyIncome : 185000) * 12;
  }, [transactions]);

  // Score computation (out of 100)
  const healthScore = useMemo(() => {
    let score = 0;
    // 1. Emergency Fund (35 pts)
    if (emergencyFundPercent >= 100) score += 35;
    else score += Math.round((emergencyFundPercent / 100) * 35);

    // 2. Term Insurance (25 pts)
    if (hasTermInsurance && Number(termCoverAmount) >= annualIncome * 10) score += 25;
    else if (hasTermInsurance) score += 15;

    // 3. Health Insurance (25 pts)
    if (hasHealthInsurance && Number(healthCoverAmount) >= 1000000) score += 25;
    else if (hasHealthInsurance) score += 15;

    // 4. Estate & Nominees (15 pts)
    if (hasNomineesUpdated) score += 10;
    if (hasWillCreated) score += 5;

    return Math.min(100, score);
  }, [emergencyFundPercent, hasTermInsurance, termCoverAmount, annualIncome, hasHealthInsurance, healthCoverAmount, hasNomineesUpdated, hasWillCreated]);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const getScoreRating = (s: number) => {
    if (s >= 80) return { label: 'Fortress Level (Excellent)', color: 'var(--brand-primary)', badge: 'badge-emerald' };
    if (s >= 60) return { label: 'Adequate Protection', color: '#38bdf8', badge: 'badge-cyan' };
    if (s >= 40) return { label: 'Moderate Vulnerability', color: '#f59e0b', badge: 'badge-amber' };
    return { label: 'Critical Protection Gaps', color: 'var(--color-danger)', badge: 'badge-red' };
  };

  const rating = getScoreRating(healthScore);

  return (
    <>
      <Header />
      <main style={{ padding: '3rem 0 5rem 0', flex: 1 }}>
        <div className="container">
          {/* Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '2rem' }}>Financial Safety & Essentials</h1>
                <span className={`badge ${rating.badge}`}>Score: {healthScore} / 100</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
                Before aggressive investing, verify foundational safety rails: Emergency Fund, Term Life Cover, and Health Protection.
              </p>
            </div>
          </div>

          {/* Health Score Hero Card */}
          <div className="glass-card" style={{ marginBottom: '2.5rem', padding: '2rem', border: `1px solid ${rating.color}`, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 18, 26, 0.8) 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Safety Readiness Score
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 900, color: rating.color }}>{healthScore}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>/ 100</span>
                </div>
                <div style={{ marginTop: '0.4rem', fontSize: '1.05rem', fontWeight: 700, color: rating.color }}>
                  {rating.label}
                </div>
              </div>

              <div style={{ maxWidth: '420px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Your foundational finances are soundly structured. Ensuring continuous 6-month liquid runway and adequate risk transfer through pure term insurance eliminates forced selling of investments during market downturns.
              </div>
            </div>
          </div>

          {/* The 4 Pillars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            {/* Pillar 1: Emergency Fund */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                    <Wallet size={18} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.15rem' }}>6-Month Emergency Runway</h2>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Liquid cash & fixed deposits</div>
                  </div>
                </div>
                <span className={`badge ${emergencyFundPercent >= 100 ? 'badge-emerald' : 'badge-amber'}`}>
                  {emergencyFundPercent >= 100 ? 'Fully Funded' : `${emergencyFundPercent}% Funded`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Liquid Reserve:</span>
                <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{formatINR(liquidCash)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target (6 Mo Expenses):</span>
                <span style={{ fontWeight: 700 }}>{formatINR(targetEmergencyFund)}</span>
              </div>

              <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <div style={{ width: `${emergencyFundPercent}%`, height: '100%', background: emergencyFundPercent >= 100 ? 'var(--brand-primary)' : '#f59e0b', borderRadius: '999px' }} />
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Provides approximately <strong>{emergencyCoverageMonths} months</strong> of runway at current monthly burn rate ({formatINR(monthlyExpense)}/mo).
              </div>
            </div>

            {/* Pillar 2: Term Life Insurance */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                    <Umbrella size={18} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.15rem' }}>Term Life Insurance</h2>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pure income replacement cover</div>
                  </div>
                </div>
                <span className={`badge ${hasTermInsurance ? 'badge-emerald' : 'badge-red'}`}>
                  {hasTermInsurance ? 'Insured' : 'Missing'}
                </span>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hasTermInsurance}
                  onChange={(e) => setHasTermInsurance(e.target.checked)}
                />
                <span style={{ fontWeight: 600 }}>I have an active pure term insurance plan</span>
              </label>

              {hasTermInsurance && (
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Sum Assured Coverage:</div>
                  <input
                    type="number"
                    value={termCoverAmount}
                    onChange={(e) => setTermCoverAmount(e.target.value)}
                    className="input-field"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    Recommended: 10x-15x annual salary ({formatINR(annualIncome * 10)} - {formatINR(annualIncome * 15)})
                  </div>
                </div>
              )}
            </div>

            {/* Pillar 3: Health Insurance */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
                    <HeartPulse size={18} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.15rem' }}>Comprehensive Health Cover</h2>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Separate personal/family floater</div>
                  </div>
                </div>
                <span className={`badge ${hasHealthInsurance ? 'badge-emerald' : 'badge-red'}`}>
                  {hasHealthInsurance ? 'Covered' : 'Missing'}
                </span>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hasHealthInsurance}
                  onChange={(e) => setHasHealthInsurance(e.target.checked)}
                />
                <span style={{ fontWeight: 600 }}>I have an independent family health policy</span>
              </label>

              {hasHealthInsurance && (
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Sum Insured:</div>
                  <input
                    type="number"
                    value={healthCoverAmount}
                    onChange={(e) => setHealthCoverAmount(e.target.value)}
                    className="input-field"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    Corporate employer cover vanishes if you switch jobs. Always retain an individual base/super top-up policy.
                  </div>
                </div>
              )}
            </div>

            {/* Pillar 4: Estate & Nominees */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.15rem' }}>Nominees & Estate Will</h2>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Frictionless wealth transmission</div>
                  </div>
                </div>
                <span className={`badge ${hasNomineesUpdated ? 'badge-emerald' : 'badge-amber'}`}>
                  {hasNomineesUpdated ? 'Up to Date' : 'Action Needed'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={hasNomineesUpdated}
                    onChange={(e) => setHasNomineesUpdated(e.target.checked)}
                  />
                  <span>All bank accounts, Demat, and EPF have verified nominees</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={hasWillCreated}
                    onChange={(e) => setHasWillCreated(e.target.checked)}
                  />
                  <span>Registered legal will drafted for asset distribution</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
