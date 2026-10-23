# FinBoom – Feature Matrix

> **Source:** Static HTML analysis of finboom.app. Browser automation unavailable.  
> **Legend:** VERIFIED = confirmed in SSR HTML | INFERRED = implied by structure/copy | UNVERIFIED = not observed

---

## F-01: User Registration

| Field | Detail |
|---|---|
| **ID** | F-01 |
| **Route** | `/login?mode=register` |
| **Auth Required** | No |
| **Preconditions** | User not logged in |
| **Status** | INFERRED (form confirmed, register-specific behavior inferred) |

**Observed:**
- Google OAuth button ("Continue with Google")
- Email + Password form (email, password min 8 chars)
- "No account yet? Create one" inline button (toggles mode)
- Legal acceptance: Terms of Service + Privacy Policy

**Inferred Behavior:**
- Google OAuth: initiates Supabase Google provider flow → consent → callback → session created
- Email registration: validates email format + password length → creates account → redirects to `/dashboard`
- Duplicate email: shows error toast

---

## F-02: User Login

| Field | Detail |
|---|---|
| **ID** | F-02 |
| **Route** | `/login` |
| **Auth Required** | No |
| **Preconditions** | User has existing account |
| **Status** | INFERRED (form confirmed, submit behavior inferred) |

**Observed:**
- Google OAuth button
- Email input (`type=email`, required)
- Password input (`type=password`, required, `minLength=8`)
- Password visibility toggle
- "Forgot password?" link
- "Sign in" submit button
- Toaster for notifications

**Inferred Behavior:**
- Submits credentials to Supabase auth API
- Success: sets `fb-auth=1` cookie → redirect to `/dashboard`
- Failure: shows error toast ("Invalid credentials" or similar)
- Google: Supabase OAuth flow

---

## F-03: Password Reset

| Field | Detail |
|---|---|
| **ID** | F-03 |
| **Route** | `/forgot-password` |
| **Auth Required** | No |
| **Preconditions** | User has email-based account |
| **Status** | INFERRED (route confirmed, form not in SSR HTML) |

**Inferred:**
- Email input → submit → Supabase sends reset email
- User clicks link in email → reset password form (likely `/reset-password?token=...`)

---

## F-04: Demo Mode (Read-Only Exploration)

| Field | Detail |
|---|---|
| **ID** | F-04 |
| **Route** | `/demo`, `/demo/allocation`, `/demo/snapshots`, `/demo/money/insights` |
| **Auth Required** | No |
| **Preconditions** | None |
| **Status** | SHELL VERIFIED, content INFERRED |

**Observed:**
- SSR renders "Loading demo..." placeholder
- 4 demo tabs: Dashboard, Allocation, Net worth history, Insights
- Dark mode toggle
- "Start free →" CTA button

**Inferred:**
- Pre-populated static or server-side demo dataset
- All demo data is read-only; no writes possible
- Same UI as authenticated dashboard but with fixed data
- Demo tabs mirror authenticated routes: `/dashboard`, `/allocation`, `/snapshots`, `/money/insights`

---

## F-05: Financial Calculators (General)

| Field | Detail |
|---|---|
| **ID** | F-05 |
| **Route** | `/calculators` |
| **Auth Required** | No |
| **Status** | VERIFIED |

**Observed:**
- 6 live calculators + 2 "Soon" planned
- All calculations in browser (stated explicitly in page copy)
- Nothing entered is stored or sent

---

## F-06: XIRR Calculator

| Field | Detail |
|---|---|
| **ID** | F-06 |
| **Route** | `/calculators/xirr` |
| **Auth Required** | No |
| **Status** | INFERRED |

**Description:** Computes annualized return (XIRR) on a series of irregular cash flows (SIP or lumpsum investments with varying dates and amounts).

**Expected Inputs:**
- Multiple rows of: Date + Amount (investments and redemption value)
- Add row / remove row controls
- Calculate button

**Expected Output:**
- XIRR % per annum

---

## F-07: SIP Calculator

| Field | Detail |
|---|---|
| **ID** | F-07 |
| **Route** | `/calculators/sip` |
| **Auth Required** | No |
| **Status** | INFERRED |

**Description:** Projects future value of a monthly SIP with optional annual step-up.

**Expected Inputs:**
- Monthly SIP amount (₹)
- Expected annual return (%)
- Investment duration (years)
- Optional: Annual step-up rate (%)

**Expected Output:**
- Invested amount vs. estimated returns chart
- Final corpus value

---

## F-08: Lumpsum Calculator

| Field | Detail |
|---|---|
| **ID** | F-08 |
| **Route** | `/calculators/lumpsum` |
| **Auth Required** | No |
| **Status** | INFERRED |

**Expected Inputs:** One-time investment amount, expected return %, duration  
**Expected Output:** Maturity value, growth chart

---

## F-09: CAGR Calculator

| Field | Detail |
|---|---|
| **ID** | F-09 |
| **Route** | `/calculators/cagr` |
| **Auth Required** | No |
| **Status** | INFERRED |

**Expected Inputs:** Initial value, final value, number of years  
**Expected Output:** CAGR %

---

## F-10: EMI Calculator

| Field | Detail |
|---|---|
| **ID** | F-10 |
| **Route** | `/calculators/emi` |
| **Auth Required** | No |
| **Status** | INFERRED |

**Expected Inputs:** Loan amount (₹), annual interest rate (%), loan tenure (years or months)  
**Expected Output:** Monthly EMI, total interest payable, principal + interest breakdown

---

## F-11: FD Calculator

| Field | Detail |
|---|---|
| **ID** | F-11 |
| **Route** | `/calculators/fd` |
| **Auth Required** | No |
| **Status** | INFERRED |

**Expected Inputs:** Principal amount, annual interest rate, tenure, compounding frequency  
**Expected Output:** Maturity value, interest earned

---

## F-12: Asset Tracking (20+ Classes)

| Field | Detail |
|---|---|
| **ID** | F-12 |
| **Route** | `/assets` (and possibly `/dashboard`) |
| **Auth Required** | Yes |
| **Status** | INFERRED |

**Observed Evidence:**
- Hero carousel shows "67 assets" across 6 asset classes
- FAQ confirms: EPF, PPF, NPS, SSY, Sovereign Gold Bonds, ULIPs, equity, mutual funds, FDs, real estate, gold, crypto
- Features section: "20+ Asset Classes"
- Free tier: up to 25 assets; Pro: unlimited

**Inferred:**
- Form to add asset: type selector (20+ options), name, amount, currency, purchase date, other fields per type
- List view of all assets grouped by class
- Edit and delete per asset
- Asset value updates manually or via import

---

## F-13: Import from Zerodha / Groww / CSV

| Field | Detail |
|---|---|
| **ID** | F-13 |
| **Route** | `/assets` or `/import` (unverified) |
| **Auth Required** | Yes |
| **Status** | INFERRED |

**Observed Evidence:**
- Features section: "Import from Zerodha & Groww"
- How It Works step 2: "use CSV/Excel templates, or import directly from Zerodha or Groww"

**Inferred:**
- Upload CSV/Excel file
- Parse and map columns to asset fields
- Preview and confirm before saving
- Also supports direct Zerodha/Groww CSV format export

---

## F-14: Income & Expense Tracking

| Field | Detail |
|---|---|
| **ID** | F-14 |
| **Route** | `/money` (inferred) |
| **Auth Required** | Yes |
| **Status** | INFERRED |

**Observed Evidence:**
- Hero carousel slide 2: Income ₹1.8L, Expenses ₹72K (23 entries), Savings Rate 60%
- Features: "Log your salary, freelance income, rent, groceries, and EMIs. Monthly trends, category breakdowns, and savings rate."
- Demo nav: `/demo/money/insights`

**Inferred:**
- Add transaction: type (income/expense), amount, category, date, notes
- Category system (Rent, EMI, Groceries, Utilities, etc.)
- Monthly view with bar chart (income vs expenses)
- Top expenses breakdown with progress bars
- Savings rate calculation: (income - expenses) / income

---

## F-15: Goals Management

| Field | Detail |
|---|---|
| **ID** | F-15 |
| **Route** | `/goals` (inferred) |
| **Auth Required** | Yes |
| **Status** | INFERRED |

**Observed Evidence:**
- Hero carousel slide 3: "3 Active" goals, 2 on track; Retirement 42%, Emergency Fund 85%, Child Education 18%
- Pricing: Free = 3 goals; Pro = unlimited
- Essentials Check in carousel: Term Insurance, Health Cover, Emergency Fund status

**Inferred:**
- Create goal: name, target amount, target date, current amount
- Goal progress % auto-calculated
- On-track vs behind-schedule status
- Essentials check: special goals for Term Insurance, Health Cover, Emergency Fund

---

## F-16: Net Worth Snapshots

| Field | Detail |
|---|---|
| **ID** | F-16 |
| **Route** | `/snapshots` (inferred) |
| **Auth Required** | Yes |
| **Status** | INFERRED |

**Observed Evidence:**
- Hero carousel slide 3: "12 snapshots since Jan 2025"
- Pricing: Free = 2 snapshots/month; Pro = unlimited
- Demo nav: `/demo/snapshots` ("Net worth history")

**Inferred:**
- "Take a snapshot" action (manual trigger)
- Stores point-in-time net worth
- History chart showing net worth over time
- Free users limited to 2 per month

---

## F-17: Asset Allocation View

| Field | Detail |
|---|---|
| **ID** | F-17 |
| **Route** | `/allocation` or `/demo/allocation` |
| **Auth Required** | Yes |
| **Status** | INFERRED |

**Observed Evidence:**
- Hero carousel slide 4: Donut chart (Equity 26%, MF 21%, RE 24%, Gold 8%, EPF+PPF 14%, Others 7%)
- Demo nav: "Allocation" tab

**Inferred:**
- Donut/pie chart of portfolio by asset class
- Value breakdown list
- Percentage breakdown
- Possibly rebalancing suggestions (unverified)

---

## F-18: Multi-Currency Support

| Field | Detail |
|---|---|
| **ID** | F-18 |
| **Route** | Global (applies to all asset pages) |
| **Auth Required** | Yes |
| **Status** | INFERRED |

**Observed Evidence:**
- Hero carousel slide 4: "3 currencies: INR, USD, SGD"
- Homepage stats: "45+ currencies"
- FAQ: "45+ currencies (USD, EUR, SGD, GBP, AED). Live FX rates refresh every 6 hours."
- Meta description: "170+ currencies"

**Inferred:**
- Each asset can be denominated in any supported currency
- Dashboard shows consolidated total in base currency
- FX rates fetched from external source every 6 hours
- User can set base currency preference

---

## F-19: Dark Mode

| Field | Detail |
|---|---|
| **ID** | F-19 |
| **Route** | Global |
| **Auth Required** | No |
| **Status** | VERIFIED (code observed) |

**Verified:**
- `finboom-theme=dark` cookie → adds `dark` class to `<html>`
- Dark mode toggle in demo header confirmed in HTML
- CSS uses `dark:` variant classes throughout

---

## F-20: Font Scale Preference

| Field | Detail |
|---|---|
| **ID** | F-20 |
| **Route** | Global (likely in Settings) |
| **Auth Required** | Inferred yes |
| **Status** | VERIFIED (code observed) |

**Verified:**
- `finboom-font-scale` cookie values: `sm=0.9, base=1, lg=1.1, xl=1.25`
- Sets `--font-scale` CSS custom property on `<html>`
- 4 available sizes

---

## F-21: Pro Plan / Payment

| Field | Detail |
|---|---|
| **ID** | F-21 |
| **Route** | Unknown (inferred: `/upgrade` or modal) |
| **Auth Required** | Yes |
| **Status** | INFERRED |

**Observed Evidence:**
- Multiple reviews mention "Purchased Pro"
- Reviews say "one time payment"
- Pricing section shows Free vs Pro tiers
- 14-day Pro trial mentioned

**Inferred:**
- One-time payment model (not subscription, based on review language "purchased")
- Unlocks: unlimited assets, unlimited liabilities & goals, family profiles, advanced features
- 14-day free trial available
- Payment likely via Razorpay or similar Indian payment gateway (unverified)

---

## F-22: Data Export

| Field | Detail |
|---|---|
| **ID** | F-22 |
| **Route** | `/settings` (inferred) |
| **Auth Required** | Yes |
| **Status** | INFERRED |

**Observed Evidence:**
- Privacy section: "Export all your data (assets, liabilities, snapshots, goals, transactions) as CSV or JSON anytime."
- FAQ: "You can export all your data as CSV or JSON anytime"
- Privacy pillar: "Full Data Export"

**Inferred:**
- Button to export all data
- Format choices: CSV or JSON
- Immediate download (no email)

---

## F-23: Account Deletion

| Field | Detail |
|---|---|
| **ID** | F-23 |
| **Route** | `/settings` (inferred) |
| **Auth Required** | Yes |
| **Status** | INFERRED |

**Observed Evidence:**
- FAQ: "delete your account and all your financial data from Settings"
- Privacy pillar: "Delete Any Time"

**Inferred:**
- Confirmation dialog before deletion
- Deletes account + all associated data permanently

---

## F-24: Family Profiles (Pro)

| Field | Detail |
|---|---|
| **ID** | F-24 |
| **Route** | Unknown |
| **Auth Required** | Yes (Pro) |
| **Status** | INFERRED |

**Observed Evidence:**
- Pricing: "Pro plan that unlocks unlimited tracking, family profiles, and advanced features"

---

## F-25: Financial Health Check / Essentials

| Field | Detail |
|---|---|
| **ID** | F-25 |
| **Route** | Inferred: `/essentials` or part of dashboard |
| **Auth Required** | Yes |
| **Status** | INFERRED |

**Observed Evidence:**
- Hero carousel: Essentials Check with Term Insurance ✓, Health Cover ✓, Emergency Fund ⚠ (partial)
- Pricing Free tier: "Financial health check"

---

## F-26: PWA / Install

| Field | Detail |
|---|---|
| **ID** | F-26 |
| **Route** | Global |
| **Auth Required** | No |
| **Status** | VERIFIED (code observed) |

**Verified:**
- `/manifest.json` linked
- `ServiceWorkerRegister` component in root layout
- `InstallPrompt` component in root layout
- `DeepLinkHandler` component (deep links for mobile app)
- `BackButtonHandler` and `StatusBarHandler` components (Capacitor/PWA mobile)
- Apple Touch Icon, apple-mobile-web-app-capable meta tags

**Inferred:**
- "Add to Home Screen" prompt on mobile browsers
- Possibly available as Capacitor native app wrapper

---

## F-27: Analytics / Session Tracking

| Field | Detail |
|---|---|
| **ID** | F-27 |
| **Route** | Global |
| **Auth Required** | No |
| **Status** | VERIFIED (code observed) |

**Verified:**
- `Analytics` component in root layout
- `SessionTracker` component in root layout

**Inferred:**
- Privacy-respecting analytics (no ad trackers claimed on homepage)
- Session duration and page view tracking
- May use Plausible, Umami, or similar privacy-first tool (unverified)

---

## Feature Tier Summary

| Feature | Free | Pro |
|---|---|---|
| Assets | Up to 25 | Unlimited |
| Liabilities | Up to 5 | Unlimited |
| Goals | Up to 3 | Unlimited |
| Snapshots/month | 2 | Unlimited |
| Income/Expense tracking | Basic | Full (inferred) |
| Financial health check | Yes | Yes |
| Family profiles | No | Yes |
| Multi-currency | Yes | Yes |
| Import (Zerodha/Groww) | Yes | Yes |
| Data export | Yes | Yes |
| Calculators | Yes | Yes |
| Advanced features | No | Yes |
| 14-day Pro trial | Yes (new accounts) | N/A |
