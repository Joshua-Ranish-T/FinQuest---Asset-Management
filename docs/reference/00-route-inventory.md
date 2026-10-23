# FinBoom – Route Inventory

> **Investigation method:** Static HTML fetched via HTTP (Next.js SSR pages).  
> Browser automation (Playwright) was **unavailable** in this environment (CDN 404 on driver download).  
> All interactive behaviour is **inferred** from the SSR HTML payload; no live interactions were performed.  
> Authenticated-only routes (/dashboard, /assets, etc.) returned redirect HTML only—their real content is not visible.

---

## Exploration Checklist

| Route | Method | Status |
|---|---|---|
| `/` | Static HTML fetch | ✅ Inspected |
| `/login` | Static HTML fetch | ✅ Inspected |
| `/login?mode=register` | Inferred from HTML links | 🔶 Inferred (same page, mode param) |
| `/forgot-password` | Static HTML fetch | ✅ Inspected |
| `/demo` | Static HTML fetch | ✅ Inspected (shell only – JS loads content) |
| `/demo/allocation` | Inferred from demo nav | 🔶 Inferred |
| `/demo/snapshots` | Inferred from demo nav | 🔶 Inferred |
| `/demo/money/insights` | Inferred from demo nav | 🔶 Inferred |
| `/calculators` | Static HTML fetch | ✅ Inspected |
| `/calculators/xirr` | Inferred from calculators page | 🔶 Inferred |
| `/calculators/sip` | Inferred from calculators page | 🔶 Inferred |
| `/calculators/lumpsum` | Inferred from calculators page | 🔶 Inferred |
| `/calculators/cagr` | Inferred from calculators page | 🔶 Inferred |
| `/calculators/emi` | Inferred from calculators page | 🔶 Inferred |
| `/calculators/fd` | Inferred from calculators page | 🔶 Inferred |
| `/dashboard` | Static HTML fetch | ⚠️ Auth-redirect (no real content) |
| `/assets` | Static HTML fetch | ⚠️ Auth-redirect (no real content) |
| `/privacy` | Static HTML fetch | ✅ Inspected |
| `/terms` | Static HTML fetch | ✅ Inspected |
| `/refund-policy` | Static HTML fetch | ✅ Inspected |
| `/whats-new` | Static HTML fetch | ✅ Inspected |
| `/settings` | Not fetched | ❌ Unverified |
| `/goals` | Not fetched | ❌ Unverified |
| `/money` | Not fetched | ❌ Unverified |
| `/snapshots` | Not fetched | ❌ Unverified |
| `/profile` | Not fetched | ❌ Unverified |

---

## Tech Stack (Observed)

| Layer | Evidence |
|---|---|
| Framework | Next.js (App Router, Turbopack) |
| Rendering | SSR + Client Hydration |
| Auth cookie | `fb-auth=1` (JS reads this to show/hide `data-auth="in"` elements) |
| Theme cookie | `finboom-theme=dark` → adds `dark` class to html |
| Font scale cookie | `finboom-font-scale=sm/base/lg/xl` → CSS `--font-scale` var |
| Data layer | Supabase on AWS |
| Analytics | `Analytics`, `SessionTracker` components in root layout |
| PWA | `/manifest.json`, `ServiceWorkerRegister` component, Apple/Android meta |
| Toast | `Toaster` (top-right, rich colours) via Sonner |

---

## R-01: Homepage

**URL:** `https://www.finboom.app/`  
**Auth required:** No  
**Status:** VERIFIED

### Purpose
Public marketing page. Communicates value proposition, showcases features, reviews, and pricing.

### Navigation (Header)
- Logo → `/`
- "How It Works" → `#how-it-works`
- "Features" → `#features`
- "Calculators" → `/calculators`
- "Reviews" → `#reviews`
- "Pricing" → `#pricing`
- "Privacy" → `#privacy`
- "Sign in" → `/login`
- "Get Started Free" → `/login?mode=register`
- Hamburger (mobile) → Sheet drawer (MarketingMobileNav component)

### Page Sections

**Hero Section**
- H1: "All your money. In one place."
- Description + CTAs: "Get Started Free" and "Try the live demo"
- Stats: 45+ currencies | 20+ asset classes | No bank logins
- Social proof: Trusted by 10,000+ users
- Dashboard Carousel (desktop only): 4 slides auto-rotating
  1. Net Worth Dashboard (net worth chart + summary cards)
  2. Income & Expenses (monthly bar chart + top expenses breakdown)
  3. Goals & Essentials (goal progress bars + essentials checklist)
  4. Asset Allocation (donut chart + allocation by value)
  - Controls: prev/next chevron buttons, dot pagination indicators with labels

**Reviews Section** (`#reviews`)
- Infinite horizontal marquee of review cards (CSS `animate-marquee`)
- Each card: 5-star rating, quote, avatar (colored circle + initial), name, @handle

**How It Works Section** (`#how-it-works`)
- 3 steps: Sign up (Google) → Add assets → See dashboard

**Features Section** (`#features`)
- Grid of feature cards: 20+ Asset Classes, Income & Expense Tracking, Import from Zerodha & Groww, multi-currency, goals, privacy, etc.

**Privacy Section** (`#privacy`)
- 4 pillars: No Broker Access, No Data Selling, Full Data Export, Delete Any Time

**Pricing Section** (`#pricing`)
- Free plan: 0 rupees forever, 25 assets, 5 liabilities, 3 goals, 2 snapshots/month, basic tracking, financial health check
- Pro plan: Unlimited assets, family profiles, advanced features (price inferred as one-time payment based on reviews mentioning "purchased Pro")
- 14-day Pro trial mentioned

**Testimonials Section**
- 3-column card grid with longer user quotes

**FAQ Section** (`#faq`)
- HTML details/summary accordion (no JS needed)
- 5 questions about bank connections, pricing, Indian assets, NRI/multi-currency, data security

**CTA Section**
- "Start tracking your wealth today"

### Footer
- Links: Calculators | Support | Privacy Policy | Terms of Service | Refund Policy | What's New
- Copyright: 2026 Finance Boosan - Made in India

### Mobile Behaviour
- Header nav hidden; hamburger button shows
- Dashboard carousel hidden on mobile
- All grids stack to single column

### Auth-Aware Behaviour (cookie-based client-side)
- `data-auth="in"` elements shown when `fb-auth=1` cookie is present
- `data-auth="out"` elements hidden when logged in

---

## R-02: Login / Register

**URL:** `https://www.finboom.app/login`  
**URL variant:** `https://www.finboom.app/login?mode=register`  
**Auth required:** No  
**Status:** VERIFIED  
**Meta robots:** noindex, nofollow

### Purpose
Unified authentication page for sign-in and registration. Mode toggled via `mode=register` query param or inline "Create one" button.

### UI Elements

**Form Fields**
- "Continue with Google" button (Google OAuth)
- Divider: "or use email"
- Email input: `type=email`, required, placeholder `you@example.com`
- Password input: `type=password`, required, `minLength=8`, placeholder `Your password`
- Password visibility toggle (eye icon)
- "Forgot password?" link → `/forgot-password`
- "Sign in" submit button (primary, full-width)
- "No account yet? Create one" button (toggles mode, inferred)
- Legal: Terms of Service + Privacy Policy links

### States
- Default: empty form
- Loading: inferred spinner on submit
- Error: inferred Toaster notification
- Google flow: redirect to Google consent

---

## R-03: Forgot Password

**URL:** `https://www.finboom.app/forgot-password`  
**Auth required:** No  
**Status:** INSPECTED (page exists, form content not in SSR HTML)

### Purpose
Request password reset email.

---

## R-04: Demo

**URL:** `https://www.finboom.app/demo`  
**Auth required:** No  
**Status:** SHELL VERIFIED (content loads client-side)

### Purpose
Read-only unauthenticated demo with pre-populated sample data.

### Navigation Tabs
- Dashboard → `/demo`
- Allocation → `/demo/allocation`
- Net worth history → `/demo/snapshots`
- Insights → `/demo/money/insights`

### Controls
- Dark mode toggle
- "Start free →" CTA → `/login?mode=register`

### Loading State (Verified)
- SSR: "Loading demo..." placeholder div
- Content hydrates client-side from multiple JS chunks

---

## R-05 to R-07: Demo Sub-pages

**URLs:** `/demo/allocation`, `/demo/snapshots`, `/demo/money/insights`  
**Status:** INFERRED from demo nav links

---

## R-08: Calculators

**URL:** `https://www.finboom.app/calculators`  
**Auth required:** No  
**Status:** VERIFIED

### Purpose
6 free in-browser financial calculators. Nothing stored.

### Available Calculators
**Returns:**
- XIRR Calculator → `/calculators/xirr` — Annualized return on SIPs
- SIP Calculator → `/calculators/sip` — Future value of monthly SIP with step-up
- Lumpsum Calculator → `/calculators/lumpsum` — Growth of one-time investment
- CAGR Calculator → `/calculators/cagr` — Compound annual growth rate

**Loans:**
- EMI Calculator → `/calculators/emi` — Monthly instalment + interest + principal

**Planning:**
- FD Calculator → `/calculators/fd` — Fixed deposit maturity value
- SWP with Inflation — COMING SOON
- Retirement Calculator — COMING SOON

### Auth-Aware Header
- Logged out: Sign in + Get Started Free
- Logged in: Back to Dashboard (verified via `data-auth` attributes)

---

## R-09: Calculator Sub-pages

**URLs:** `/calculators/xirr`, `/calculators/sip`, `/calculators/lumpsum`, `/calculators/cagr`, `/calculators/emi`, `/calculators/fd`  
**Status:** INFERRED

### Expected Pattern (not individually fetched)
- Input form (numbers, sliders)
- Real-time calculated output
- All computation client-side (browser JS)
- No server calls for calculation

---

## R-10: Dashboard (Authenticated)

**URL:** `https://www.finboom.app/dashboard`  
**Auth required:** Yes  
**Status:** AUTH-GATED (redirect only)

### Inferred Content (from demo + hero carousel)
- Net Worth summary card
- Total Assets card
- Liabilities card
- Net Worth Over Time line chart
- Income & Expenses panel
- Goals & Essentials panel
- Asset Allocation donut chart

---

## R-11 to R-20: Authenticated Routes

| Route | Status | Inferred Purpose |
|---|---|---|
| `/assets` | Auth-gated | Add/edit/delete asset tracking |
| `/liabilities` | Unverified | Loan/debt tracking |
| `/goals` | Unverified | Financial goal management |
| `/money` | Unverified | Income & expense log |
| `/money/insights` | Unverified | Cashflow analytics |
| `/snapshots` | Unverified | Net worth history snapshots |
| `/allocation` | Unverified | Portfolio allocation view |
| `/essentials` | Unverified | Financial health checklist |
| `/settings` | Unverified | Account settings, data export, account deletion |
| `/profile` | Unverified | User profile management |

---

## R-21: Privacy Policy

**URL:** `https://www.finboom.app/privacy`  
**Auth required:** No | **Status:** INSPECTED

---

## R-22: Terms of Service

**URL:** `https://www.finboom.app/terms`  
**Auth required:** No | **Status:** INSPECTED

---

## R-23: Refund Policy

**URL:** `https://www.finboom.app/refund-policy`  
**Auth required:** No | **Status:** INSPECTED

---

## R-24: What's New

**URL:** `https://www.finboom.app/whats-new`  
**Auth required:** No | **Status:** INSPECTED

---

## Authentication Model

| Cookie | Value | Effect |
|---|---|---|
| `fb-auth=1` | Set on login | html gets `is-authed` class; auth-aware elements switch |
| `finboom-theme=dark` | User preference | html gets `dark` class |
| `finboom-font-scale` | sm/base/lg/xl | Sets `--font-scale` CSS variable |

---

## Data Persistence (From FAQ)
- Backend: Supabase (PostgreSQL) on AWS
- Encrypted in transit and at rest
- Row-level security per user
- Passwords: bcrypt hashed
- Export: CSV or JSON from Settings
- Delete: Full account + data deletion from Settings
