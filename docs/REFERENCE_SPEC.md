# FinBoom – Implementation Specification & Product Behavior

> **Status:** Implementation-Ready Specification  
> **Reference System:** FinBoom (https://www.finboom.app)  
> **Document Purpose:** Complete specification of product behavior, verified functionality, business logic, validation rules, state transitions, and verification criteria for end-to-end reproduction.

---

## 1. Executive Summary & Product Scope

FinBoom is a private, manual-first personal wealth and finance management platform tailored for Indian and global retail investors. It emphasizes:
- **Zero bank/broker credential integration** (privacy-first manual tracking & statement imports).
- **Consolidated Net Worth Tracking** across 20+ asset classes (Equity, Mutual Funds, EPF, PPF, Real Estate, Gold, Crypto, NPS, Fixed Deposits, Cash, etc.) and liabilities.
- **Client-Side Financial Calculators** (XIRR, SIP with Step-Up, CAGR, Lumpsum, EMI, FD).
- **Income & Expense Tracking** with monthly cashflow analytics and savings rate computation.
- **Goal Tracking & Essentials Health Checklist** (Term Insurance, Health Cover, Emergency Fund).
- **Free vs. Pro Tier Enforcement** (strict asset, liability, goal, and monthly snapshot quotas).

---

## 2. Requirement Classification: Confirmed vs. Inferred Assumptions

To guarantee architectural integrity and prevent reliance on private APIs, all requirements are partitioned into:
- **[CONFIRMED]**: Directly observed and extracted from production SSR HTML, meta payloads, DOM attributes (`data-auth`, `data-slot`), or published legal/pricing documentation.
- **[INFERRED-STANDARD]**: Industry-standard, mathematically mandated, or structural necessities derived directly from observed UI fields (e.g., standard XIRR Newton-Raphson formula, Supabase OAuth callback cycle).

| Area | Status | Source / Evidence |
|---|---|---|
| Route & Page Structure | [CONFIRMED] | Next.js SSR HTML paths & sitemap inspection |
| Auth Mechanism & Cookies | [CONFIRMED] | Cookies `fb-auth=1`, `finboom-theme`, `finboom-font-scale` and Supabase client bundle |
| Pricing Quotas (Free vs Pro) | [CONFIRMED] | Pricing table on `/` and `/pricing`: Free = 25 assets, 5 liabilities, 3 goals, 2 snapshots/mo |
| 6 Calculators List | [CONFIRMED] | Verified on `/calculators` SSR HTML |
| Import Sources | [CONFIRMED] | "Import from Zerodha & Groww" explicitly listed in homepage copy |
| 45+ Currencies & Multi-Currency | [CONFIRMED] | FAQ & Hero copy |
| Offline / PWA Support | [CONFIRMED] | Manifest, ServiceWorkerRegister, InstallPrompt in DOM |
| Database & Security Model | [CONFIRMED] | FAQ: Supabase PostgreSQL on AWS, Row Level Security, bcrypt |
| Internal API Route Names | [INFERRED-STANDARD] | Standard RESTful design specified in API Contracts |
| Live Stock / NAV auto-sync | [INFERRED-STANDARD] | Manual-first entry with optional CSV import; live broker API connections are explicitly absent |

---

## 3. User Roles, Authentication & Permissions

### 3.1 Roles
1. **Anonymous / Guest (`ANON`)**
   - Can access `/`, `/calculators`, `/calculators/*`, `/demo`, `/demo/*`, `/privacy`, `/terms`, `/refund-policy`, `/whats-new`.
   - Cannot access any route under `/dashboard`, `/assets`, `/goals`, `/money`, `/snapshots`, `/settings`.
   - Can toggle theme (`finboom-theme`) and font scale (`finboom-font-scale`).
2. **Authenticated Free User (`USER_FREE`)**
   - Holds active JWT session and `fb-auth=1` cookie.
   - Quotas enforced:
     - Assets: Maximum **25 active assets**.
     - Liabilities: Maximum **5 active liabilities**.
     - Goals: Maximum **3 active goals**.
     - Net Worth Snapshots: Maximum **2 manual snapshots per calendar month**.
     - Single personal profile (Family profiles locked).
3. **Authenticated Pro User (`USER_PRO`)**
   - Holds active JWT session, `fb-auth=1` cookie, and `subscription_status = 'pro'`.
   - Unlimited assets, unlimited liabilities, unlimited goals, unlimited snapshots.
   - Unlocked family profile switching.
   - Advanced portfolio analytics & export privileges.

### 3.2 Authentication & Session Flow
- **Supabase Auth Engine**: Supports Email/Password + Google OAuth 2.0.
- **Cookie Mechanics**:
  - `fb-auth=1`: Set upon successful authentication; signals client hydrate script to display `data-auth="in"` nodes and hide `data-auth="out"` nodes.
  - `finboom-theme`: `dark` | `light` (defaults to system preference or dark).
  - `finboom-font-scale`: `sm` | `base` | `lg` | `xl`.
- **Session Duration**: JWT with 1-hour expiry + rolling Refresh Token stored in HTTP-only secure cookie.

---

## 4. Master Route Inventory & Feature IDs

| Route | Feature ID | Access Level | Description |
|---|---|---|---|
| `/` | `F-00` | Public | Marketing landing page, carousel, reviews marquee, FAQ, pricing |
| `/login` | `F-01`, `F-02` | Public | Unified sign-in and sign-up form with Google OAuth & Email/Pass |
| `/forgot-password` | `F-03` | Public | Password recovery request triggering reset email |
| `/demo` | `F-04` | Public | Interactive read-only dashboard with mock financial portfolio |
| `/demo/allocation` | `F-04`, `F-17`| Public | Demo portfolio asset allocation donut chart |
| `/demo/snapshots` | `F-04`, `F-16`| Public | Demo historical net worth trajectory |
| `/demo/money/insights` | `F-04`, `F-14`| Public | Demo cashflow, income/expense breakdown, and savings rate |
| `/calculators` | `F-05` | Public | Financial calculators directory |
| `/calculators/xirr` | `F-06` | Public | Irregular cash flow annualized return calculator (client-side) |
| `/calculators/sip` | `F-07` | Public | Systematic Investment Plan calculator with step-up rate |
| `/calculators/lumpsum` | `F-08` | Public | Compound interest lumpsum growth calculator |
| `/calculators/cagr` | `F-09` | Public | Compound Annual Growth Rate calculator |
| `/calculators/emi` | `F-10` | Public | Equated Monthly Installment loan amortization calculator |
| `/calculators/fd` | `F-11` | Public | Fixed Deposit quarterly compound interest calculator |
| `/dashboard` | `F-16`, `F-25`| Auth Required | Consolidated net worth overview, KPI cards, recent cashflow |
| `/assets` | `F-12`, `F-13`| Auth Required | Asset portfolio management, 20+ types, Zerodha/Groww CSV import |
| `/liabilities` | `F-12` | Auth Required | Debt & liability tracker (Home loan, auto loan, personal loan, CC) |
| `/money` | `F-14` | Auth Required | Income & expense transaction ledger |
| `/money/insights` | `F-14` | Auth Required | Category distribution, monthly savings rate trends |
| `/goals` | `F-15` | Auth Required | Goal creation, target dates, asset linkage, progress tracking |
| `/snapshots` | `F-16` | Auth Required | Historical net worth ledger and manual snapshot capture |
| `/allocation` | `F-17` | Auth Required | Asset allocation breakdown by asset class, currency, risk |
| `/essentials` | `F-25` | Auth Required | Financial health scorecard (Insurance, Health, Emergency Fund) |
| `/settings` | `F-20`, `F-22`, `F-23` | Auth Required | Preferences, font scale, CSV/JSON data export, account wipe |
| `/pricing` | `F-21` | Public / Auth | Plan comparison and one-time Pro upgrade checkout |
| `/privacy`, `/terms`, `/refund-policy` | `F-00` | Public | Legal compliance and data privacy disclosures |
| `/whats-new` | `F-00` | Public | Release notes, changelog updates |

---

## 5. Feature Specifications & Business Logic

### F-01 & F-02: User Registration & Authentication
- **Inputs**:
  - Email (Standard RFC 5322 regex validation, normalized lowercase).
  - Password (Minimum 8 characters; must not be all spaces).
  - Mode toggle: query parameter `?mode=register` or in-page button toggles between "Sign In" and "Create Account".
- **Business Rules**:
  - Duplicate registration with existing email triggers safe error toast: `"Email is already registered. Please sign in."`
  - Successful registration assigns `USER_FREE` role, generates a default user profile, and initializes default expense categories.
  - Setting `fb-auth=1` cookie immediately unlocks client UI state without requiring page reload.
- **States**:
  - `Empty`: Clean inputs, submit button enabled once valid.
  - `Loading`: Button disabled with inline spinner; inputs read-only.
  - `Error`: Inline red border + Sonner toast alert in top-right.
  - `Success`: Redirects to `/dashboard` (or `redirect` query parameter destination).

### F-04: Interactive Demo Mode
- **Behavior**: Provides full unauthenticated exploratory capabilities without database mutations.
- **Data Fixtures**:
  - Total Net Worth: ₹84,50,000 (~$101,000 USD).
  - Asset Classes: Indian Equities (₹32L), Mutual Funds (₹24L), EPF (₹12L), Gold (₹6.5L), Cash/Bank (₹10L).
  - Liabilities: Home Loan (₹28L).
  - Goals: Emergency Fund (₹5L target - 85% reached), Home Down Payment (₹20L target - 45% reached).
- **Restrictions**: All "Add", "Edit", "Delete", and "Save" actions display a non-blocking toast: *"Demo Mode is read-only. Create a free account to track your wealth."* with a CTA to `/login?mode=register`.

### F-05 through F-11: Financial Calculators Engine
All calculator computations are performed **100% client-side** using pure mathematical algorithms with zero network calls for absolute speed and privacy.

1. **XIRR (`F-06`)**:
   - Accepts list of cash flow entries: `(Date, Amount)`. Negative = investment/outflow; Positive = current value/inflow.
   - Uses Newton-Raphson method to solve:
     $$\sum_{i=1}^{n} \frac{C_i}{(1 + r)^{\frac{d_i - d_1}{365}}} = 0$$
   - Convergence criteria: Tolerance $< 10^{-7}$, maximum 100 iterations.
   - Edge Cases: Returns error state if all cashflows share identical sign or count $< 2$.
2. **SIP with Step-Up (`F-07`)**:
   - Inputs: Monthly Investment ($P$), Expected Annual Return Rate ($r\%$), Tenure in Years ($t$), Annual Step-Up ($\%$ or fixed amount).
   - Monthly rate $i = (1 + r)^{1/12} - 1$ or nominal $r/12$.
   - Output: Total Amount Invested, Total Estimated Returns, Total Maturity Value.
3. **Lumpsum Growth (`F-08`)**:
   - Formula: $A = P \times (1 + r/n)^{n \times t}$ where $n=1$ (annual compounding).
4. **CAGR (`F-09`)**:
   - Formula: $\text{CAGR} = \left(\frac{V_{\text{final}}}{V_{\text{initial}}}\right)^{1/t} - 1$.
   - Validates $V_{\text{initial}} > 0, V_{\text{final}} \ge 0, t > 0$.
5. **EMI Amortization (`F-10`)**:
   - Formula: $E = \frac{P \times r \times (1+r)^n}{(1+r)^n - 1}$ where $r = \frac{\text{Annual Rate}}{12 \times 100}$ and $n = \text{Tenure in Months}$.
   - Generates full month-by-month principal vs. interest amortization breakdown table.
6. **Fixed Deposit (`F-11`)**:
   - Formula: Quarterly compounding $A = P \times \left(1 + \frac{r}{400}\right)^{4 \times t}$.

### F-12: Asset & Liability Tracking (20+ Classes)
- **Supported Classes**:
  1. Indian Stocks (Direct Equity)
  2. US / Global Stocks
  3. Mutual Funds (Equity / Debt / Hybrid)
  4. Employee Provident Fund (EPF)
  5. Public Provident Fund (PPF)
  6. National Pension Scheme (NPS)
  7. Fixed Deposits (FD) & Recurring Deposits (RD)
  8. Savings Bank Accounts / Cash
  9. Physical Gold & Sovereign Gold Bonds (SGB)
  10. Real Estate (Residential / Commercial / Land)
  11. Cryptocurrencies (BTC, ETH, etc.)
  12. Vehicle / Automobile
  13. Angel / Private Equity / Startup Investments
  14. P2P Lending & Debt Notes
  15. RSUs / ESOPs (Vested)
  16. Sukanya Samriddhi Yojana (SSY)
  17. Digital Gold
  18. Artwork / Collectibles
  19. Gratuity / Superannuation
  20. Other Custom Assets
- **Liabilities**: Home Loan, Personal Loan, Car Loan, Education Loan, Credit Card Outstanding, Family Loan.
- **Quotas**: Free plan strictly rejects adding a 26th asset or 6th liability with an HTTP 403 / Modal Upgrade trigger.

### F-13: Broker Statement Import (Zerodha & Groww)
- **Client-Side CSV Parsing**:
  - Zerodha Holdings CSV: Detects header fields (`Instrument`, `Qty.`, `Avg. cost`, `Cur. val`, `P&L`).
  - Groww Holdings CSV: Detects header fields (`Stock name`, `Symbol`, `Shares`, `Average price`, `Current value`).
  - Generic CSV: Field mapper allowing user to map `Name`, `Quantity`, `Buy Price`, `Current Value`.
- **Validation**:
  - File size limit: 5MB.
  - Rejects corrupted files with detailed row-level error reporting (e.g., *"Row 14: Invalid quantity format"*).
  - Deduplication: Provides toggle to "Update existing assets if symbol matches" or "Add as new".

### F-14: Income & Expense Ledger & Cashflow Analytics
- **Fields**: Date, Type (`INCOME` | `EXPENSE`), Amount, Currency, Category, Notes, Account.
- **Default Expense Categories**: Housing/Rent, EMI/Loans, Groceries & Food, Utilities, Transport/Fuel, Insurance, Healthcare, Entertainment, Shopping, Miscellaneous.
- **Default Income Categories**: Salary, Freelance/Consulting, Dividends, Interest, Rental Income, Capital Gains, Gift/Bonus.
- **Analytics Metrics**:
  - Monthly Cashflow: $\text{Total Income} - \text{Total Expenses}$.
  - Savings Rate: $\left(\frac{\text{Total Income} - \text{Total Expenses}}{\text{Total Income}}\right) \times 100\%$.

### F-15: Goals Management
- **Fields**: Goal Name, Target Amount, Target Date, Linked Asset IDs, Category (`RETIREMENT`, `EMERGENCY_FUND`, `HOUSE`, `EDUCATION`, `TRAVEL`, `CUSTOM`).
- **Progress Calculation**:
  - Current Value = Sum of current values of all linked assets (or manual progress amount if no assets linked).
  - Completion Percentage: $\min\left(100\%, \frac{\text{Current Value}}{\text{Target Amount}} \times 100\right)$.
  - On-Track Status: Evaluates required monthly run rate vs. scheduled target date.

### F-16: Net Worth Snapshots
- Captures point-in-time portfolio valuation: Total Assets, Total Liabilities, Net Worth ($A - L$), Timestamp, Currency Breakdown.
- Free Plan restriction: Maximum 2 snapshot creations per calendar month (e.g. 1st of month and mid-month).
- Snapshots power the historical net worth trajectory chart on `/dashboard` and `/snapshots`.

### F-18: Multi-Currency Support (45+ Currencies)
- User selects **Base Display Currency** (default: `INR`, supports `USD`, `EUR`, `GBP`, `AED`, `SGD`, `CAD`, etc.).
- Each asset/transaction stores its native currency (`asset.currency`).
- Periodic exchange rates (synced every 6 hours via cached FX table) convert individual assets into the base currency for consolidated net worth.

### F-21: Pro Subscription Model
- One-time payment (Lifetime Pro access) or annual model.
- Payment gateway integration: Razorpay checkout supporting UPI, Credit/Debit cards, NetBanking.
- Webhook idempotency: Verifies cryptographic payment signature before granting `USER_PRO` status.

### F-22 & F-23: Data Export & Total Account Erasure
- **Export (`F-22`)**: Instant single-click generation of either:
  - Structured `.json` containing all user collections (profile, assets, liabilities, transactions, goals, snapshots).
  - Multi-sheet `.zip` with individual CSV files (`assets.csv`, `transactions.csv`, `snapshots.csv`).
- **Account Erasure (`F-23`)**:
  - "Danger Zone" in `/settings`.
  - Requires user to type confirmation phrase (e.g. `"DELETE MY DATA"`).
  - Cascading database transaction deletes all records associated with `user_id` and revokes Supabase Auth identity. Complete erasure, no soft-delete retention.

---

## 6. Comprehensive Verification & Acceptance Criteria

### Feature Verification Matrix

| Feature ID | Test Scenario | Acceptance Criteria |
|---|---|---|
| **F-01** | Register with new email & valid password | User record created, `fb-auth=1` cookie set, 201 response, redirects to `/dashboard`. |
| **F-01** | Register with existing email | Prevents account creation, returns 409 conflict, displays non-technical toast error. |
| **F-02** | Sign in with correct password | Session issued, cookie set, redirected to dashboard without delay. |
| **F-02** | Sign in with invalid password | Returns 401 unauthorized, retains email input, displays invalid credentials message. |
| **F-04** | Access `/demo` routes | Loads without auth prompt; displays mock portfolio; mutating attempts trigger read-only toast. |
| **F-06** | XIRR computation with standard SIP | Computes within 10ms with error margin $< 0.01\%$ matching Microsoft Excel XIRR output. |
| **F-10** | Loan EMI calculation | Correctly partitions monthly payments into principal and interest matching standard banking tables. |
| **F-12** | Free user adds 25th asset | Asset persists successfully; counter displays `25 / 25`. |
| **F-12** | Free user attempts 26th asset | Server rejects request with 403 Forbidden; frontend presents Pro Upgrade modal. |
| **F-13** | Upload Zerodha CSV export | Parses valid rows, extracts asset names and quantities, allows user review before bulk insert. |
| **F-14** | Log expense transaction | Deducts from monthly cashflow balance; recalculates savings rate dynamically. |
| **F-16** | Free user takes 3rd snapshot in month | Mutation blocked with message: *"Free tier includes 2 snapshots per month. Upgrade to Pro."* |
| **F-19** | Switch Dark/Light theme | HTML tag toggles `dark` class instantly without page flash; persists in `finboom-theme` cookie. |
| **F-22** | Export account data | Downloads complete JSON payload containing all user entities with valid schema. |
| **F-23** | Execute Account Deletion | Deletes user from DB, clears auth cookies, redirects to `/` with fresh unauthenticated state. |
