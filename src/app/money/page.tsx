'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Transaction, TransactionType } from '@/types';
import { api } from '@/lib/api-client';
import { 
  Plus, Trash2, ArrowUpRight, ArrowDownRight, TrendingUp, 
  PieChart, Filter, Calendar, X 
} from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Rent / Housing', 'Groceries & Food', 'EMI / Loan Payment', 
  'Utilities (Power, Net)', 'Transport & Fuel', 'Healthcare & Medicine', 
  'Insurance', 'Entertainment & Dining', 'Shopping', 'Miscellaneous'
];

const INCOME_CATEGORIES = [
  'Salary', 'Freelance & Consulting', 'Dividends', 
  'Interest Income', 'Rental Income', 'Capital Gains', 'Gift / Bonus'
];

export default function MoneyLedgerPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formType, setFormType] = useState<TransactionType>('EXPENSE');
  const [formCategory, setFormCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(''); // populated after mount to avoid prerender error
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    // Set today's date as the default for the transaction form (must be client-side)
    setFormDate(new Date().toISOString().split('T')[0]);

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
          toast.error('Failed to load transactions.');
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

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => filterType === 'ALL' || t.type === filterType);
  }, [transactions, filterType]);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const handleTypeChange = (type: TransactionType) => {
    setFormType(type);
    setFormCategory(type === 'EXPENSE' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount) {
      toast.error('Please enter a valid amount.');
      return;
    }

    try {
      const created = await api.post<Transaction>('/transactions', {
        type: formType,
        category: formCategory,
        amount: Number(formAmount),
        date: formDate,
        notes: formNotes,
        currency: 'INR',
      });
      setTransactions((prev) => [created, ...prev]);
      setShowAddModal(false);
      setFormAmount('');
      setFormNotes('');
      toast.success(`Logged ${formType === 'INCOME' ? 'income' : 'expense'} transaction!`);
    } catch {
      toast.error('Failed to add transaction.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/transactions?id=${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success('Transaction removed.');
    } catch {
      toast.error('Failed to delete transaction.');
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
              <h1 style={{ fontSize: '2rem' }}>Income & Expense Ledger</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
                Track manual transactions, monitor savings rate, and review category cashflow.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link href="/money/insights" className="btn-secondary" style={{ padding: '0.55rem 1rem', fontSize: '0.875rem' }}>
                <PieChart size={16} />
                <span>Cashflow Insights</span>
              </Link>
              <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}>
                <Plus size={16} />
                <span>Log Transaction</span>
              </button>
            </div>
          </div>

          {/* Monthly KPI Overview */}
          <div className="grid-cols-3" style={{ marginBottom: '2.5rem' }}>
            <div className="glass-card">
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Monthly Income</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '0.3rem' }}>
                {formatINR(totalIncome)}
              </div>
            </div>

            <div className="glass-card">
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Monthly Expenses</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-warning)', marginTop: '0.3rem' }}>
                {formatINR(totalExpenses)}
              </div>
            </div>

            <div className="glass-card">
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Net Monthly Cashflow</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: totalIncome >= totalExpenses ? 'var(--brand-primary)' : 'var(--color-danger)', marginTop: '0.3rem' }}>
                {formatINR(totalIncome - totalExpenses)}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Filter:</span>
            {(['ALL', 'INCOME', 'EXPENSE'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={filterType === type ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                {type === 'ALL' ? 'All Transactions' : type === 'INCOME' ? 'Income Only' : 'Expenses Only'}
              </button>
            ))}
          </div>

          {/* Ledger List */}
          {loading ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading transactions...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No transactions found for the selected view.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '8px', background: tx.type === 'INCOME' ? 'var(--brand-primary-light)' : 'rgba(239, 68, 68, 0.1)', color: tx.type === 'INCOME' ? 'var(--brand-primary)' : 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {tx.type === 'INCOME' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{tx.category}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        {tx.date} {tx.notes && <span>&bull; {tx.notes}</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.15rem', color: tx.type === 'INCOME' ? 'var(--brand-primary)' : 'var(--color-warning)' }}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatINR(tx.amount)}
                    </div>
                    <button onClick={() => handleDelete(tx.id)} aria-label="Delete transaction" style={{ color: 'var(--text-muted)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Transaction Modal */}
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-card" style={{ maxWidth: '440px', width: '100%', background: 'var(--bg-surface-elevated)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.35rem' }}>Log Transaction</h3>
                <button onClick={() => setShowAddModal(false)} aria-label="Close modal" style={{ color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {/* Type Toggle */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('EXPENSE')}
                    className={formType === 'EXPENSE' ? 'btn-primary' : 'btn-secondary'}
                    style={{ flex: 1, padding: '0.55rem' }}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('INCOME')}
                    className={formType === 'INCOME' ? 'btn-primary' : 'btn-secondary'}
                    style={{ flex: 1, padding: '0.55rem' }}
                  >
                    Income
                  </button>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="input-control"
                  >
                    {(formType === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="input-control"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="input-control"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Monthly internet bill"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="input-control"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    Save Transaction
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
