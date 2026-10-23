import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db';

const DEMO_MONTH = '2026-10'; // Month all demo fixture transactions are dated in

describe('Cashflow Insights & Transactions Ledger (F-14)', () => {
  beforeEach(() => {
    db.resetDatabase();
    db.seedDemoData();
  });

  it('correctly calculates monthly income, expenses, net surplus, and savings rate', () => {
    const insights = db.getCashflowInsights(DEMO_MONTH);

    // Default demo transactions (all 2026-10):
    // Income: Salary 185,000
    // Expenses: Rent 35,000, EMI 28,500, Groceries 18,200, Utilities 6,400 = 88,100
    expect(insights.total_income).toBe(185000);
    expect(insights.total_expenses).toBe(88100);
    expect(insights.net_cashflow).toBe(185000 - 88100);

    // Savings rate = (96,900 / 185,000) * 100 = 52.4%
    expect(insights.savings_rate).toBe(52.4);
    expect(insights.by_category.length).toBe(4);
    expect(insights.by_category[0].category).toBe('Rent');
  });

  it('updates monthly cashflow insights dynamically when logging a new expense in the same month', () => {
    db.addTransaction({
      type: 'EXPENSE',
      category: 'Dining Out',
      amount: 5000,
      currency: 'INR',
      date: '2026-10-22',
      notes: 'Weekend dinner',
    });

    const updated = db.getCashflowInsights(DEMO_MONTH);
    expect(updated.total_expenses).toBe(88100 + 5000);
    expect(updated.net_cashflow).toBe(185000 - 93100);
    // Savings rate = ((185,000 - 93,100) / 185,000) * 100 = 49.7%
    expect(updated.savings_rate).toBe(49.7);
  });

  it('returns zero income and expenses for an empty month with no transactions', () => {
    const insights = db.getCashflowInsights('2025-01');
    expect(insights.total_income).toBe(0);
    expect(insights.total_expenses).toBe(0);
    expect(insights.net_cashflow).toBe(0);
    expect(insights.savings_rate).toBe(0);
    expect(insights.by_category).toHaveLength(0);
  });

  it('correctly deletes a transaction and updates the ledger count', () => {
    const before = db.getTransactions();
    const toDelete = before[0];

    const deleted = db.deleteTransaction(toDelete.id);
    expect(deleted).toBe(true);

    const after = db.getTransactions();
    expect(after.length).toBe(before.length - 1);
    expect(after.find((t) => t.id === toDelete.id)).toBeUndefined();
  });

  it('getMonthlyTrend returns the correct number of months', () => {
    const trend = db.getMonthlyTrend(6);
    expect(trend).toHaveLength(6);
    trend.forEach((entry) => {
      expect(entry).toHaveProperty('month');
      expect(entry).toHaveProperty('income');
      expect(entry).toHaveProperty('expenses');
      expect(entry).toHaveProperty('savings_rate');
      expect(typeof entry.savings_rate).toBe('number');
    });
  });
});
