// Domain Models & Type Specifications matching docs/REFERENCE_SPEC.md and docs/API_CONTRACTS.md

export type UserRole = 'ANON' | 'USER_FREE' | 'USER_PRO';

export interface UserAccount {
  id: string;
  email: string;
  password_hash: string;
  salt: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  base_currency: string;
  theme: 'dark' | 'light';
  font_scale: 'sm' | 'base' | 'lg' | 'xl';
  subscription_status: 'free' | 'pro';
  pro_purchased_at?: string | null;
  created_at: string;
  updated_at: string;
  limits?: {
    assets_count: number;
    assets_max: number;
    liabilities_count: number;
    liabilities_max: number;
    goals_count: number;
    goals_max: number;
    snapshots_this_month: number;
    snapshots_max_per_month: number;
  };
}

export type AssetClass =
  | 'EQUITY'
  | 'US_EQUITY'
  | 'MUTUAL_FUND'
  | 'EPF'
  | 'PPF'
  | 'NPS'
  | 'FD'
  | 'CASH'
  | 'GOLD'
  | 'REAL_ESTATE'
  | 'CRYPTO'
  | 'VEHICLE'
  | 'STARTUP'
  | 'P2P'
  | 'RSU'
  | 'SSY'
  | 'DIGITAL_GOLD'
  | 'COLLECTIBLES'
  | 'GRATUITY'
  | 'OTHER';

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  asset_class: AssetClass;
  institution?: string;
  quantity: number;
  buy_price: number;
  current_value: number;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type LiabilityType =
  | 'HOME_LOAN'
  | 'CAR_LOAN'
  | 'PERSONAL_LOAN'
  | 'EDUCATION_LOAN'
  | 'CREDIT_CARD'
  | 'FAMILY_LOAN'
  | 'OTHER';

export interface Liability {
  id: string;
  user_id: string;
  name: string;
  liability_type: LiabilityType;
  lender?: string;
  principal_outstanding: number;
  interest_rate?: number;
  monthly_emi?: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  category: string;
  amount: number;
  currency: string;
  date: string;
  notes?: string;
  created_at: string;
}

export type GoalCategory =
  | 'RETIREMENT'
  | 'EMERGENCY_FUND'
  | 'HOUSE'
  | 'EDUCATION'
  | 'TRAVEL'
  | 'CUSTOM';

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  target_date: string;
  category: GoalCategory;
  linked_asset_ids: string[];
  current_amount?: number;
  progress_percentage?: number;
  is_on_track?: boolean;
  created_at: string;
  updated_at: string;
}

export interface NetWorthSnapshot {
  id: string;
  user_id: string;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  currency: string;
  snapshot_date: string;
  created_at: string;
}

export interface CashflowInsight {
  total_income: number;
  total_expenses: number;
  net_cashflow: number;
  savings_rate: number;
  by_category: { category: string; amount: number; percentage: number }[];
}

export interface PortfolioSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  assetsCount: number;
  liabilitiesCount: number;
  goalsCount: number;
  baseCurrency: string;
}

export interface FinancialEssentials {
  has_term_insurance: boolean;
  term_cover_amount: number;
  has_health_insurance: boolean;
  health_cover_amount: number;
  has_nominees_updated: boolean;
  has_will_created: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
