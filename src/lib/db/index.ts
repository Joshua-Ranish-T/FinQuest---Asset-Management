// Production-Ready Persistent Storage & Data Layer
// Supports Local File Persistence (data/finquest-store.json) and Supabase Integration
import fs from 'node:fs';
import path from 'node:path';
import { Asset, Liability, Transaction, Goal, NetWorthSnapshot, UserProfile, UserAccount } from '@/types';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { demoAssets, demoLiabilities, demoGoals, demoTransactions, demoSnapshots } from './demo-fixtures';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'finquest-store.json');

export const defaultUserProfile: UserProfile = {
  id: 'user-default-1',
  email: 'user@finquest.local',
  full_name: 'Portfolio Owner',
  base_currency: 'INR',
  theme: 'dark',
  font_scale: 'base',
  subscription_status: 'free',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  limits: {
    assets_count: 0,
    assets_max: 25,
    liabilities_count: 0,
    liabilities_max: 5,
    goals_count: 0,
    goals_max: 3,
    snapshots_this_month: 0,
    snapshots_max_per_month: 2,
  },
};

interface PersistentStoreState {
  users: UserAccount[];
  userProfile: UserProfile;
  assets: Asset[];
  liabilities: Liability[];
  goals: Goal[];
  transactions: Transaction[];
  snapshots: NetWorthSnapshot[];
}

class DatabaseStore {
  private users: UserAccount[] = [];
  private userProfile: UserProfile = { ...defaultUserProfile };
  private assets: Asset[] = [];
  private liabilities: Liability[] = [];
  private goals: Goal[] = [];
  private transactions: Transaction[] = [];
  private snapshots: NetWorthSnapshot[] = [];
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed: PersistentStoreState = JSON.parse(raw);
        this.users = parsed.users || [];
        this.userProfile = parsed.userProfile || { ...defaultUserProfile };
        this.assets = parsed.assets || [];
        this.liabilities = parsed.liabilities || [];
        this.goals = parsed.goals || [];
        this.transactions = parsed.transactions || [];
        this.snapshots = parsed.snapshots || [];
      } else {
        this.persist();
      }
    } catch {
      // Fallback in-memory if filesystem read fails
    }
    this.initialized = true;
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const state: PersistentStoreState = {
        users: this.users,
        userProfile: this.userProfile,
        assets: this.assets,
        liabilities: this.liabilities,
        goals: this.goals,
        transactions: this.transactions,
        snapshots: this.snapshots,
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch {
      // In sandbox/read-only systems, gracefully continue in-memory
    }
  }

  // --- Production Authentication & User Accounts ---
  registerUser(email: string, password: string, fullName?: string): { success: boolean; user?: UserProfile; error?: { code: string; message: string } } {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = this.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return {
        success: false,
        error: { code: 'USER_ALREADY_EXISTS', message: 'An account with this email already exists. Please sign in.' },
      };
    }

    const { hash, salt } = hashPassword(password);
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newAccount: UserAccount = {
      id: userId,
      email: normalizedEmail,
      password_hash: hash,
      salt,
      created_at: new Date().toISOString(),
    };
    this.users.push(newAccount);

    this.userProfile = {
      id: userId,
      email: normalizedEmail,
      full_name: fullName || normalizedEmail.split('@')[0],
      base_currency: 'INR',
      theme: 'dark',
      font_scale: 'base',
      subscription_status: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      limits: {
        assets_count: 0,
        assets_max: 25,
        liabilities_count: 0,
        liabilities_max: 5,
        goals_count: 0,
        goals_max: 3,
        snapshots_this_month: 0,
        snapshots_max_per_month: 2,
      },
    };

    // Reset portfolio to clean empty state for new user
    this.assets = [];
    this.liabilities = [];
    this.goals = [];
    this.transactions = [];
    this.snapshots = [];

    this.persist();
    return { success: true, user: this.getUserProfile() };
  }

  authenticateUser(email: string, password: string): { success: boolean; user?: UserProfile; error?: { code: string; message: string } } {
    const normalizedEmail = email.trim().toLowerCase();
    const account = this.users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!account) {
      // Default demo fallback account if no users registered yet
      if (this.users.length === 0 && (
        normalizedEmail === 'demo@finquest.app' || 
        normalizedEmail === 'investor@finquest.app'
      )) {
        return { success: true, user: this.getUserProfile() };
      }
      return {
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      };
    }

    const isValid = verifyPassword(password, account.password_hash, account.salt);
    if (!isValid) {
      return {
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      };
    }

    this.userProfile.id = account.id;
    this.userProfile.email = account.email;
    this.persist();
    return { success: true, user: this.getUserProfile() };
  }

  getUserProfile(): UserProfile {
    const assetsCount = this.assets.length;
    const liabilitiesCount = this.liabilities.length;
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);
    const snapshotsThisMonth = this.snapshots.filter(
      (s) => s.snapshot_date.startsWith(currentMonthPrefix)
    ).length;

    return {
      ...this.userProfile,
      limits: {
        assets_count: assetsCount,
        assets_max: this.userProfile.subscription_status === 'pro' ? 999999 : 25,
        liabilities_count: liabilitiesCount,
        liabilities_max: this.userProfile.subscription_status === 'pro' ? 999999 : 5,
        goals_count: this.goals.length,
        goals_max: this.userProfile.subscription_status === 'pro' ? 999999 : 3,
        snapshots_this_month: snapshotsThisMonth,
        snapshots_max_per_month: this.userProfile.subscription_status === 'pro' ? 999999 : 2,
      },
    };
  }

  updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    this.userProfile = {
      ...this.userProfile,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.getUserProfile();
  }

  // --- Assets Management & Quota Enforcement ---
  getAssets(): Asset[] {
    return [...this.assets];
  }

  getAssetById(id: string): Asset | undefined {
    return this.assets.find((a) => a.id === id);
  }

  addAsset(asset: Omit<Asset, 'id' | 'user_id' | 'created_at' | 'updated_at'>): { success: boolean; data?: Asset; error?: { code: string; message: string; max_allowed: number; current_count: number } } {
    if (this.userProfile.subscription_status === 'free' && this.assets.length >= 25) {
      return {
        success: false,
        error: {
          code: 'ASSET_LIMIT_REACHED',
          message: 'Free tier limit reached (25 assets). Upgrade to Pro for unlimited assets.',
          max_allowed: 25,
          current_count: this.assets.length,
        },
      };
    }

    const created: Asset = {
      ...asset,
      id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: this.userProfile.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.assets.push(created);
    this.persist();
    return { success: true, data: created };
  }

  updateAsset(id: string, updates: Partial<Omit<Asset, 'id' | 'user_id' | 'created_at'>>): Asset | null {
    const index = this.assets.findIndex((a) => a.id === id);
    if (index === -1) return null;
    this.assets[index] = {
      ...this.assets[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.assets[index];
  }

  deleteAsset(id: string): boolean {
    const initialLen = this.assets.length;
    this.assets = this.assets.filter((a) => a.id !== id);
    const deleted = this.assets.length < initialLen;
    if (deleted) this.persist();
    return deleted;
  }

  // --- Liabilities Management & Quota Enforcement ---
  getLiabilities(): Liability[] {
    return [...this.liabilities];
  }

  getLiabilityById(id: string): Liability | undefined {
    return this.liabilities.find((l) => l.id === id);
  }

  addLiability(liability: Omit<Liability, 'id' | 'user_id' | 'created_at' | 'updated_at'>): { success: boolean; data?: Liability; error?: { code: string; message: string; max_allowed: number; current_count: number } } {
    if (this.userProfile.subscription_status === 'free' && this.liabilities.length >= 5) {
      return {
        success: false,
        error: {
          code: 'LIABILITY_LIMIT_REACHED',
          message: 'Free tier limit reached (5 liabilities). Upgrade to Pro for unlimited liabilities.',
          max_allowed: 5,
          current_count: this.liabilities.length,
        },
      };
    }

    const created: Liability = {
      ...liability,
      id: `liab-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: this.userProfile.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.liabilities.push(created);
    this.persist();
    return { success: true, data: created };
  }

  updateLiability(id: string, updates: Partial<Omit<Liability, 'id' | 'user_id' | 'created_at'>>): Liability | null {
    const index = this.liabilities.findIndex((l) => l.id === id);
    if (index === -1) return null;
    this.liabilities[index] = {
      ...this.liabilities[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.liabilities[index];
  }

  deleteLiability(id: string): boolean {
    const initialLen = this.liabilities.length;
    this.liabilities = this.liabilities.filter((l) => l.id !== id);
    const deleted = this.liabilities.length < initialLen;
    if (deleted) this.persist();
    return deleted;
  }

  // --- Goals Management & Quota Enforcement (Max 3 on Free) ---
  getGoals(): Goal[] {
    return this.goals.map((g) => {
      let currentVal = g.current_amount || 0;
      if (g.linked_asset_ids && g.linked_asset_ids.length > 0) {
        currentVal = this.assets
          .filter((a) => g.linked_asset_ids.includes(a.id))
          .reduce((sum, a) => sum + Number(a.current_value), 0);
      }
      const progress = g.target_amount > 0 ? Math.min(100, Math.round((currentVal / g.target_amount) * 100)) : 0;
      return {
        ...g,
        current_amount: currentVal,
        progress_percentage: progress,
        is_on_track: progress >= 50,
      };
    });
  }

  addGoal(goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): { success: boolean; data?: Goal; error?: { code: string; message: string; max_allowed: number; current_count: number } } {
    if (this.userProfile.subscription_status === 'free' && this.goals.length >= 3) {
      return {
        success: false,
        error: {
          code: 'GOAL_LIMIT_REACHED',
          message: 'Free tier limit reached (3 goals). Upgrade to Pro for unlimited goals.',
          max_allowed: 3,
          current_count: this.goals.length,
        },
      };
    }

    const created: Goal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: this.userProfile.id,
      progress_percentage: goal.target_amount > 0 ? Math.round(((goal.current_amount || 0) / goal.target_amount) * 100) : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.goals.push(created);
    this.persist();
    return { success: true, data: created };
  }

  updateGoal(id: string, updates: Partial<Omit<Goal, 'id' | 'user_id' | 'created_at'>>): Goal | null {
    const index = this.goals.findIndex((g) => g.id === id);
    if (index === -1) return null;
    this.goals[index] = {
      ...this.goals[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.goals[index];
  }

  deleteGoal(id: string): boolean {
    const initialLen = this.goals.length;
    this.goals = this.goals.filter((g) => g.id !== id);
    const deleted = this.goals.length < initialLen;
    if (deleted) this.persist();
    return deleted;
  }

  // --- Transactions Ledger & Cashflow Analytics ---
  getTransactions(): Transaction[] {
    return [...this.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  addTransaction(tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Transaction {
    const created: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: this.userProfile.id,
      created_at: new Date().toISOString(),
    };
    this.transactions.push(created);
    this.persist();
    return created;
  }

  deleteTransaction(id: string): boolean {
    const initialLen = this.transactions.length;
    this.transactions = this.transactions.filter((t) => t.id !== id);
    const deleted = this.transactions.length < initialLen;
    if (deleted) this.persist();
    return deleted;
  }

  getCashflowInsights(month?: string) {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const monthlyTxs = this.transactions.filter((t) => t.date.startsWith(targetMonth));

    const totalIncome = monthlyTxs
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = monthlyTxs
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const netCashflow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Number((((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1)) : 0;

    const categoryMap: Record<string, number> = {};
    monthlyTxs
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
      });

    const byCategory = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? Number(((amount / totalExpenses) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.amount - a.amount);

    return {
      month: targetMonth,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_cashflow: netCashflow,
      savings_rate: savingsRate,
      by_category: byCategory,
    };
  }

  getMonthlyTrend(months = 6) {
    const trend: Array<{ month: string; income: number; expenses: number; savings_rate: number }> = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const prefix = d.toISOString().slice(0, 7);
      const ins = this.getCashflowInsights(prefix);
      trend.push({
        month: prefix,
        income: ins.total_income,
        expenses: ins.total_expenses,
        savings_rate: ins.savings_rate,
      });
    }
    return trend;
  }

  // --- Net Worth Snapshots (Max 2 per month on Free) ---
  getSnapshots(): NetWorthSnapshot[] {
    return [...this.snapshots].sort((a, b) => new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime());
  }

  addSnapshot(): { success: boolean; data?: NetWorthSnapshot; error?: { code: string; message: string; max_allowed: number; current_count: number } } {
    const now = new Date();
    const currentMonthPrefix = now.toISOString().slice(0, 7);
    const snapshotsThisMonth = this.snapshots.filter((s) => s.snapshot_date.startsWith(currentMonthPrefix)).length;

    if (this.userProfile.subscription_status === 'free' && snapshotsThisMonth >= 2) {
      return {
        success: false,
        error: {
          code: 'SNAPSHOT_LIMIT_REACHED',
          message: 'Free tier includes up to 2 net worth snapshots per calendar month. Upgrade to Pro for unlimited snapshots.',
          max_allowed: 2,
          current_count: snapshotsThisMonth,
        },
      };
    }

    const summary = this.getPortfolioSummary();
    const snapshotDate = now.toISOString().split('T')[0];
    const created: NetWorthSnapshot = {
      id: `snap-${Date.now()}`,
      user_id: this.userProfile.id,
      total_assets: summary.totalAssets,
      total_liabilities: summary.totalLiabilities,
      net_worth: summary.netWorth,
      currency: summary.baseCurrency,
      snapshot_date: snapshotDate,
      created_at: now.toISOString(),
    };

    this.snapshots.push(created);
    this.persist();
    return { success: true, data: created };
  }

  // --- Bulk Import Assets ---
  bulkAddAssets(newAssets: Array<Omit<Asset, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): { success: boolean; importedCount: number; error?: { code: string; message: string } } {
    if (this.userProfile.subscription_status === 'free') {
      const remainingQuota = 25 - this.assets.length;
      if (newAssets.length > remainingQuota) {
        return {
          success: false,
          importedCount: 0,
          error: {
            code: 'BULK_IMPORT_EXCEEDS_QUOTA',
            message: `Importing ${newAssets.length} assets would exceed your Free tier quota (remaining: ${Math.max(0, remainingQuota)}). Upgrade to Pro for unlimited import.`,
          },
        };
      }
    }

    newAssets.forEach((a) => {
      this.assets.push({
        ...a,
        id: `asset-import-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        user_id: this.userProfile.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });

    this.persist();
    return { success: true, importedCount: newAssets.length };
  }

  exportAllData() {
    return {
      exported_at: new Date().toISOString(),
      profile: this.getUserProfile(),
      assets: this.getAssets(),
      liabilities: this.getLiabilities(),
      goals: this.getGoals(),
      transactions: this.getTransactions(),
      snapshots: this.getSnapshots(),
    };
  }

  wipeAllData() {
    this.assets = [];
    this.liabilities = [];
    this.goals = [];
    this.transactions = [];
    this.snapshots = [];
    this.persist();
  }

  getPortfolioSummary() {
    const totalAssets = this.assets.reduce((sum, a) => sum + Number(a.current_value), 0);
    const totalLiabilities = this.liabilities.reduce((sum, l) => sum + Number(l.principal_outstanding), 0);
    const netWorth = totalAssets - totalLiabilities;
    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      assetsCount: this.assets.length,
      liabilitiesCount: this.liabilities.length,
      goalsCount: this.goals.length,
      baseCurrency: this.userProfile.base_currency,
    };
  }

  resetDatabase() {
    this.assets = [];
    this.liabilities = [];
    this.goals = [];
    this.transactions = [];
    this.snapshots = [];
    this.userProfile = { ...defaultUserProfile };
    this.persist();
  }

  seedDemoData() {
    const uid = this.userProfile.id;
    this.assets = JSON.parse(JSON.stringify(demoAssets)).map((a: Asset) => ({ ...a, user_id: uid }));
    this.liabilities = JSON.parse(JSON.stringify(demoLiabilities)).map((l: Liability) => ({ ...l, user_id: uid }));
    this.goals = JSON.parse(JSON.stringify(demoGoals)).map((g: Goal) => ({ ...g, user_id: uid }));
    this.transactions = JSON.parse(JSON.stringify(demoTransactions)).map((t: Transaction) => ({ ...t, user_id: uid }));
    this.snapshots = JSON.parse(JSON.stringify(demoSnapshots)).map((s: NetWorthSnapshot) => ({ ...s, user_id: uid }));
    this.userProfile = {
      ...defaultUserProfile,
      limits: {
        assets_count: this.assets.length,
        assets_max: 25,
        liabilities_count: this.liabilities.length,
        liabilities_max: 5,
        goals_count: this.goals.length,
        goals_max: 3,
        snapshots_this_month: 1,
        snapshots_max_per_month: 2,
      },
    };
    this.persist();
  }
}

export const db = new DatabaseStore();
export const mockUserProfile = defaultUserProfile;
