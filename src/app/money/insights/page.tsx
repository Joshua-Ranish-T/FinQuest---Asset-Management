'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Transaction } from '@/types';
import { api } from '@/lib/api-client';
import { 
  ArrowLeft, ArrowUpRight, ArrowDownRight, TrendingUp, 
  PieChart, DollarSign, Wallet, AlertCircle, CheckCircle2, 
  Sparkles, ShieldCheck
} from 'lucide-react';

interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export default function MoneyInsightsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get<{ transactions: Transaction[] }>('/transactions')
      .then((res) => {
        if (active) {
          setTransactions(res.transactions || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          toast.error('Failed to load transaction data for insights.');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const netCashflow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Number((((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1)) : 0;

  const expenseCategories = useMemo((): CategoryBreakdown[] => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + Number(t.amount);
      });
    return Object.entries(map)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? Number(((amount / totalExpenses) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, totalExpenses]);

  const incomeCategories = useMemo((): CategoryBreakdown[] => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'INCOME')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + Number(t.amount);
      });
    return Object.entries(map)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalIncome > 0 ? Number(((amount / totalIncome) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, totalIncome]);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const getSavingsRateRating = (rate: number) => {
    if (rate >= 50) return { label: 'Exceptional (FIRE Track)', color: 'var(--brand-primary)', badge: 'badge-emerald' };
    if (rate >= 30) return { label: 'Healthy & Sustainable', color: '#38bdf8', badge: 'badge-cyan' };
    if (rate >= 15) return { label: 'Moderate', color: '#f59e0b', badge: 'badge-amber' };
    return { label: 'High Burn Rate', color: 'var(--color-danger)', badge: 'badge-red' };
  };

  const rating = getSavingsRateRating(savingsRate);

  const CATEGORY_COLORS = [
    '#10b981', '#38bdf8', '#818cf8', '#f59e0b', '#ec4899', 
    '#a855f7', '#14b8a6', '#f97316', '#64748b', '#ef4444'
  ];

  return (
    <>
      <Header />
      <main style={{ padding: '3rem 0 5rem 0', flex: 1 }}>
        <div className="container">
          {/* Breadcrumb & Navigation */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <Link href="/money" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <ArrowLeft size={16} />
              <span>Back to Money Ledger</span>
            </Link>
            <Link href="/money" className="btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
              <span>View Transactions</span>
            </Link>
          </div>

          {/* Page Heading */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <PieChart size={20} />
              </div>
              <h1 style={{ fontSize: '2rem' }}>Cashflow & Spending Insights</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Understand your savings capacity, recurring burn rate, and discretionary expenditure distribution.
            </p>
          </div>

          {loading ? (
            <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Calculating cashflow metrics...
            </div>
          ) : (
            <>
              {/* Summary Metrics Bar */}
              <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Inflow</span>
                    <ArrowUpRight size={16} color="var(--brand-primary)" />
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    {formatINR(totalIncome)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    {incomeCategories.length} income sources
                  </div>
                </div>

                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Outflow</span>
                    <ArrowDownRight size={16} color="var(--color-danger)" />
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-danger)' }}>
                    {formatINR(totalExpenses)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    {expenseCategories.length} expense categories
                  </div>
                </div>

                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Net Monthly Surplus</span>
                    <Wallet size={16} color={netCashflow >= 0 ? 'var(--brand-primary)' : 'var(--color-danger)'} />
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: netCashflow >= 0 ? 'var(--brand-primary)' : 'var(--color-danger)' }}>
                    {formatINR(netCashflow)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Available for investing
                  </div>
                </div>

                <div className="glass-card" style={{ border: `1px solid ${rating.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Savings Rate</span>
                    <span className={`badge ${rating.badge}`}>{rating.label}</span>
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: rating.color }}>
                    {savingsRate}%
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Recommended: &gt; 30%
                  </div>
                </div>
              </div>

              {/* Savings Rate Gauge Card */}
              <div className="glass-card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Monthly Savings Efficiency</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Proportion of net earnings retained after meeting fixed and discretionary obligations.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: rating.color }}>{savingsRate}%</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>saved</span>
                  </div>
                </div>

                {/* Meter Bar */}
                <div style={{ width: '100%', height: '1.25rem', background: 'var(--bg-surface-elevated)', borderRadius: '999px', overflow: 'hidden', display: 'flex', border: '1px solid var(--border-subtle)', marginBottom: '0.75rem' }}>
                  <div 
                    style={{ 
                      width: `${Math.min(100, Math.max(0, savingsRate))}%`, 
                      background: rating.color, 
                      transition: 'width 400ms ease-out',
                      borderRadius: '999px'
                    }} 
                  />
                </div>

                {/* Milestones markers */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>0% (Breakeven)</span>
                  <span>20% (Recommended Minimum)</span>
                  <span>50% (High Velocity FIRE)</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Split: Expense Category Distribution & Income Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                {/* Expense Breakdown */}
                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.15rem' }}>Expense Breakdown by Category</h2>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Where your monthly money flows</div>
                    </div>
                    <span className="badge badge-red">{expenseCategories.length} Categories</span>
                  </div>

                  {expenseCategories.length === 0 ? (
                    <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No expenses logged yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {expenseCategories.map((item, idx) => {
                        const barColor = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                        return (
                          <div key={item.category}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                              <span style={{ fontWeight: 600 }}>{item.category}</span>
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
                                  background: barColor, 
                                  borderRadius: '999px' 
                                }} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Income Breakdown & 50/30/20 Budget Analysis */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Income Breakdown */}
                  <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <div>
                        <h2 style={{ fontSize: '1.15rem' }}>Income Sources</h2>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Revenue stream diversity</div>
                      </div>
                      <span className="badge badge-emerald">{incomeCategories.length} Streams</span>
                    </div>

                    {incomeCategories.length === 0 ? (
                      <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No income logged yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {incomeCategories.map((item, idx) => (
                          <div key={item.category}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                              <span style={{ fontWeight: 600 }}>{item.category}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>{item.percentage}%</span>
                                <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{formatINR(item.amount)}</span>
                              </div>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
                              <div 
                                style={{ 
                                  width: `${item.percentage}%`, 
                                  height: '100%', 
                                  background: 'var(--brand-primary)', 
                                  borderRadius: '999px' 
                                }} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 50/30/20 Rule Health Card */}
                  <div className="glass-card" style={{ border: '1px solid var(--border-subtle)', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.05) 0%, rgba(16, 18, 26, 0.7) 100%)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <ShieldCheck size={18} color="#38bdf8" />
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>50 / 30 / 20 Budget Guide</h3>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                      Financial advisors recommend allocating <strong>50%</strong> of net income toward essential needs (Rent, Groceries, Utilities, EMIs), <strong>30%</strong> toward discretionary lifestyle wants, and at least <strong>20%</strong> directly toward savings & investments.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <div className="badge badge-emerald">Needs: &le; 50%</div>
                      <div className="badge badge-cyan">Wants: &le; 30%</div>
                      <div className="badge badge-amber">Investments: &ge; 20%</div>
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
