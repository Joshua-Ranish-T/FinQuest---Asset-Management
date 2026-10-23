# FinBoom – Implementation Plan & Execution Roadmap

> **Status:** Implementation-Ready Plan  
> **Target:** Full Reproduction of FinBoom (https://www.finboom.app)  
> **Environment:** Windows, Node.js v22.4.1, npm v10.8.2, Git v2.45.1

---

## 1. Repository Status & Stack Recommendation

### 1.1 Existing Repository Inspection
- Current workspace contains only the `docs/` folder (`docs/reference/` and technical specifications).
- No conflicting legacy code or outdated frameworks exist.
- System prerequisites verified: **Node.js v22.4.1**, **npm v10.8.2**, **git v2.45.1**.

### 1.2 Recommended Technology Stack
1. **Next.js 15 (App Router)**: Fast SSR for marketing and calculator SEO; seamless SPA transitions for authenticated dashboard and demo mode.
2. **TypeScript**: Strict type definitions for 20+ asset classes, currency codes, and financial models.
3. **Vanilla CSS Design System**: Custom properties for dynamic themes (`.dark`), font scaling (`--font-scale`), responsive grid layouts, and glassmorphism styling matching production FinBoom.
4. **Supabase (PostgreSQL + Auth + RLS)**: Matches reference site's exact data tier architecture, providing robust Row-Level Security and Google OAuth integration.
5. **Sonner + Lucide Icons + Recharts + decimal.js**: Verified in production bundles for accessible toasts, modern iconography, lightweight SVG charts, and accurate financial calculations.

---

## 2. Blockers & Dependencies Identified Before Coding

| Dependency / Risk | Impact | Pre-Implementation Resolution |
|---|---|---|
| **Google OAuth Client Credentials** | Auth flow testing | Implement mock auth bypass mode for local development while supporting real Supabase OAuth when environment variables are supplied. |
| **Razorpay Gateway API Keys** | Pro upgrade checkout | Implement sandbox / test mode provider and mock webhook handler for local Pro tier testing. |
| **Broker CSV Format Drift** | Statement import reliability | Implement test fixtures based on standard Zerodha and Groww holdings export templates, with error tolerance for unmapped columns. |
| **Exchange Rate Service** | Multi-currency consolidated net worth | Implement fallback static exchange rate table for top 45 currencies, with background refreshing when external API is configured. |

---

## 3. Phased Implementation Roadmap

### Phase 1: Project Setup & Design System Foundation
- Initialize Next.js 15 TypeScript project in workspace root.
- Install essential runtime dependencies: `lucide-react`, `sonner`, `recharts`, `decimal.js`, `@supabase/supabase-js`.
- Establish global design system in `src/app/globals.css`:
  - CSS custom properties for palette, typography, borders, and shadows.
  - `--font-scale` dynamically controlled by `finboom-font-scale` cookie.
  - `.dark` theme support controlled by `finboom-theme` cookie.
  - Inline SSR script in `layout.tsx` to prevent theme/font FOUC.
- Configure PWA manifest (`manifest.json`) and service worker shell.

### Phase 2: Public Navigation, Marketing Pages & Legal Routes
- Build marketing layout (`Header`, `MarketingMobileNav` Sheet drawer, `Footer`).
- Build landing page (`src/app/(marketing)/page.tsx`):
  - Hero section with live stats and primary CTAs.
  - Auto-rotating desktop Dashboard Carousel (Net Worth, Income/Expenses, Goals, Asset Allocation).
  - Infinite CSS review cards marquee (`animate-marquee`).
  - How it Works 3-step cards.
  - Features grid (20+ asset classes, statement import, zero bank logins).
  - Pricing table with Free vs. Pro comparison cards.
  - Native HTML `<details>`/`<summary>` accordion FAQ section.
- Build static legal & info routes: `/privacy`, `/terms`, `/refund-policy`, `/whats-new`.

### Phase 3: Pure Client Financial Calculators
- Build `/calculators` hub page with catalog cards.
- Implement pure client-side mathematical engines:
  1. `/calculators/xirr`: Newton-Raphson cash flow algorithm with dynamic row addition/deletion.
  2. `/calculators/sip`: Future value formula with annual step-up percentage/fixed increments.
  3. `/calculators/lumpsum`: Compound growth calculator with duration sliders.
  4. `/calculators/cagr`: Initial vs final value annualized rate.
  5. `/calculators/emi`: Loan amortization schedule with principal vs interest breakdown chart.
  6. `/calculators/fd`: Quarterly compounding fixed deposit maturity calculator.
- All calculations update in real-time with zero server latency.

### Phase 4: Interactive Demo Mode (Read-Only)
- Build `/demo` layout with navigation tabs (Dashboard, Allocation, Snapshots, Insights) and "Start free →" CTA.
- Hydrate pre-populated mock portfolio data:
  - Total Net Worth: ₹84,50,000.
  - Asset distribution across Indian Equities, Mutual Funds, EPF, Gold, and Cash.
  - Interactive Recharts donut chart on `/demo/allocation`.
  - Historical net worth trajectory on `/demo/snapshots`.
  - Income, expenses, and savings rate analytics on `/demo/money/insights`.
- Mutating actions (add/edit/delete) trigger Sonner info toast: *"Demo Mode is read-only. Create a free account to track your wealth."*

### Phase 5: Authentication & Session Management
- [x] **F-01, F-02, F-03: Unified Auth, Session Cookies & Password Recovery (COMPLETED)**
  - Unified `/login` with Sign In / Register toggle, minLength=8 validation, password toggle.
  - `/forgot-password` email recovery flow.
  - Cookie synchronization (`fb-auth=1`, `finboom-theme`, `finboom-font-scale`).

### Phase 6: Asset & Liability Tracking + Broker CSV Import
- [x] **F-12: Asset & Liability Tracking (COMPLETED)**
  - Dedicated `/assets` and `/liabilities` dashboards with full CRUD operations.
  - 20+ asset classes supported with tailored input schemas and badges.
  - Strict Free Tier quota enforcement: 25 assets and 5 liabilities cap backed by API rejection and Pro Upgrade modal.
  - Automated unit and integration test coverage (`tests/assets-quota.test.ts`).
- [x] **F-13: Broker Statement Import (COMPLETED)**
  - Client-side CSV parser (`/assets/import`).
  - Zerodha Holdings & Groww format parser with preview and validation before bulk insert.

### Phase 7: Income, Expense Ledger & Cashflow Insights
- [x] **F-14: Money Ledger & Cashflow Insights (COMPLETED)**
  - `/money` transaction ledger with type toggle, category dropdown, search and delete.
  - `/money/insights` and `/demo/money/insights`: Savings Rate efficiency gauge, 50/30/20 budget guide, and category breakdown.

### Phase 8: Goals, Essentials Health Check & Snapshots
- [x] **F-15: Financial Goals Management (COMPLETED)**
  - `/goals` dashboard with progress bars, deadline countdown, and asset linkage.
  - Strict Free tier quota: Maximum 3 goals, with Pro upgrade modal.
- [x] **F-16: Net Worth Snapshots (COMPLETED)**
  - `/snapshots` and `/demo/snapshots`: Point-in-time net worth capture, trajectory milestones table.
  - Strict Free tier quota: 2 snapshots/calendar month.
- [x] **F-17: Asset Allocation & Diversification (COMPLETED)**
  - `/allocation` and `/demo/allocation`: Macro asset breakdown, liquidity profile (Liquid vs Semi-Liquid vs Illiquid), and rebalancing analysis.
- [x] **F-25: Financial Essentials Scorecard (COMPLETED)**
  - `/essentials`: 6-month emergency runway calculator, term life insurance audit (10-15x income), health insurance coverage check, and nominee verification.

### Phase 9: Settings, Data Export, Billing & Account Deletion
- [x] **F-20: User Preferences (COMPLETED)**
  - Base currency selector (INR, USD, EUR, GBP, AED, SGD, CAD, AUD).
  - Font scaling switcher (`sm`, `base`, `lg`, `xl`) and instant dark/light theme switch.
- [x] **F-21: Pricing & Pro Subscription (COMPLETED)**
  - `/pricing` with side-by-side Free vs Pro lifetime comparison matrix.
  - One-click Pro checkout simulation unlocking unlimited assets, liabilities, goals, snapshots, and family profiles.
- [x] **F-22: Full Data Export (COMPLETED)**
  - Single-click `.json` and `.csv` backup generation.
- [x] **F-23: Danger Zone Account Erasure (COMPLETED)**
  - Type-to-confirm `"DELETE MY DATA"` modal triggering complete database wipe and session invalidation.

### Phase 10: Pure Client-Side Financial Calculators & Legal Compliance
- [x] **F-05 through F-11: Complete Financial Calculator Suite (COMPLETED)**
  - `/calculators/xirr`: Newton-Raphson cash flow algorithm.
  - `/calculators/sip`: Future value formula with annual step-up.
  - `/calculators/lumpsum`: Compound growth simulator.
  - `/calculators/cagr`: Annualized compound growth rate.
  - `/calculators/emi`: Loan amortization schedule.
  - `/calculators/fd`: RBI quarterly compounding fixed deposit calculator.
- [x] **Legal & Utility Routes (COMPLETED)**
  - `/privacy`, `/terms`, `/refund-policy`, `/whats-new`.

---

## 4. Verification & Production Build Status
- **Test Suite**: 20/20 passing tests across 5 test suites (`npm test`).
- **TypeScript**: 0 errors (`npm run typecheck`).
- **Production Build**: 43 routes cleanly compiled with Next.js Turbopack (`npm run build`).
