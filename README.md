<h1 align="center">
  ?? FinQuest — Personal Asset &amp; Net-Worth Manager
</h1>

<p align="center">
  <strong>Track every rupee. Own your financial future.</strong><br/>
  A privacy-first, full-stack personal finance app built with Next.js 16, React 19, and optional Supabase persistence.
</p>

<p align="center">
  <a href="#-features">Features</a> ·
  <a href="#-tech-stack">Tech Stack</a> ·
  <a href="#-getting-started">Getting Started</a> ·
  <a href="#%EF%B8%8F-environment-variables">Env Vars</a> ·
  <a href="#-project-structure">Structure</a> ·
  <a href="#%EF%B8%8F-database">Database</a> ·
  <a href="#-testing">Testing</a> ·
  <a href="#-deployment">Deployment</a> ·
  <a href="#-contributing">Contributing</a>
</p>

---

## ? Features

### ?? Asset Management
- Add, edit, and delete assets across **10+ categories** — equities, mutual funds, EPF, PPF, gold, real estate, crypto, fixed deposits, savings, and more
- Per-asset **quantity × price** valuation with real-time total calculation
- **CSV / JSON bulk import** with error reporting and duplicate detection
- **CSV export** for offline analysis

### ?? Liability Tracking
- Log loans, credit-card balances, mortgages and any other debt
- Tracks principal, EMI amount and due date
- Instantly reflected in **net-worth calculation**

### ?? Financial Goals
- Create savings goals with a target amount and deadline
- Track progress with a live progress bar and percentage indicator
- Linked to current net worth for real-time gap analysis

### ?? Dashboard & Analytics
- **Net-worth summary** — total assets, liabilities, and net-worth in one glance
- **Breakdown by asset category** with visual indicators
- Cash-flow insights (income vs expenses)

### ?? Portfolio Snapshots
- Take point-in-time snapshots of your full portfolio
- Compare snapshots across dates to visualize wealth growth

### ?? Authentication & Accounts
- Email + password sign-up / sign-in with JWT session cookies
- Password visibility toggle, forgot-password flow
- Account settings: display name, email, plan badge
- **Plan tiers**: Free (up to 10 assets, 3 goals) · Pro (unlimited)

### ?? Personalisation
- Dark / Light / System theme switcher (persisted via cookie — no flash on load)
- Font-scale accessibility control (3 sizes)

### ?? Billing (Stripe-ready)
- Upgrade to **FinQuest Pro** from the in-app Pricing page or quota prompt

### ?? Data Export & Portability
- Full account data export as JSON
- Portfolio export as CSV
- Account deletion with confirmation

### ??? Privacy-First Architecture
- **No bank API connections** — you enter data, you own it
- Works fully offline with the local JSON store backend

---

## ?? Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI Library | [React 19](https://react.dev/) |
| Language | TypeScript 5 |
| Styling | Vanilla CSS (custom design system, zero UI-framework deps) |
| Icons | [Lucide React](https://lucide.dev/) |
| Toasts | [Sonner](https://sonner.emilkowal.ski/) |
| Precision Math | [Decimal.js](https://mikemcl.github.io/decimal.js/) |
| Database (opt.) | [Supabase](https://supabase.com/) (PostgreSQL) |
| Local Persistence | JSON file store (`data/finquest-store.json`) |
| Auth | JWT + HTTP-only cookies |
| Unit Tests | [Vitest](https://vitest.dev/) |
| E2E Tests | Custom fetch-based runner (`scripts/run-all-e2e.mjs`) |
| Deployment | [Vercel](https://vercel.com/) / any Node.js host |

---

## ?? Getting Started

### Prerequisites

- **Node.js >= 18** (LTS recommended)
- **npm >= 9**

### 1. Clone the repository

```bash
git clone https://github.com/Joshua-Ranish-T/FinQuest---Asset-Management.git
cd FinQuest---Asset-Management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and set at minimum:

```env
JWT_SECRET=your-super-secret-key-min-32-chars
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Demo login** (works with the local store backend out of the box):
> Email: `demo@finquest.app` · Password: `demo1234`

---

## ?? Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `JWT_SECRET` | ? | — | Secret for signing JWT session tokens. Use a 32+ char random string in production. |
| `NEXT_PUBLIC_SUPABASE_URL` | ? | — | Your Supabase project URL. Omit to use the local JSON store. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ? | — | Supabase anonymous (public) API key. |
| `LOCAL_STORE_PATH` | ? | `data/finquest-store.json` | Path for the local JSON data store. |
| `NEXT_PUBLIC_APP_URL` | ? | `http://localhost:3000` | Public URL (used in emails, redirects). |

Copy `.env.example` for a pre-filled template with comments.

---

## ?? Project Structure

```
.
+-- public/                  # Static assets (favicon, og-image)
+-- src/
¦   +-- app/                 # Next.js App Router pages & API routes
¦   ¦   +-- (auth)/          # Sign-in, sign-up, forgot-password
¦   ¦   +-- api/v1/          # REST API: assets, liabilities, goals, snapshots, billing, account
¦   ¦   +-- assets/          # Asset list & bulk-import pages
¦   ¦   +-- dashboard/       # Main dashboard
¦   ¦   +-- goals/           # Goals tracker
¦   ¦   +-- liabilities/     # Liabilities tracker
¦   ¦   +-- pricing/         # Pricing & plan upgrade page
¦   ¦   +-- settings/        # User settings & account management
¦   ¦   +-- snapshots/       # Portfolio snapshots
¦   ¦   +-- globals.css      # Global design-system tokens & base styles
¦   ¦   +-- layout.tsx       # Root layout with theme & font-scale sync
¦   +-- components/
¦   ¦   +-- layout/          # Header, Footer, Sidebar
¦   ¦   +-- theme/           # ThemeSync (cookie <-> CSS class hydration)
¦   ¦   +-- ui/              # Shared UI: Button, Modal, Badge, Spinner...
¦   +-- lib/
¦   ¦   +-- auth.ts          # JWT sign / verify helpers
¦   ¦   +-- db/
¦   ¦   ¦   +-- index.ts     # DB adapter (local JSON store or Supabase)
¦   ¦   ¦   +-- demo-fixtures.ts  # Seeded demo data
¦   ¦   +-- utils.ts         # Shared utilities (formatting, math...)
¦   +-- middleware.ts         # Auth guard for protected routes
¦   +-- types/               # Shared TypeScript interfaces
+-- data/                    # Local JSON store — git-ignored
+-- supabase/
¦   +-- schema.sql           # Full Supabase schema (run once to bootstrap)
+-- tests/                   # Vitest unit tests (34 tests, 6 suites)
+-- scripts/
¦   +-- run-all-e2e.mjs      # Custom E2E HTTP test runner
+-- docs/                    # Project documentation & QA reports
+-- .env.example             # Environment variable template
+-- next.config.ts
+-- tsconfig.json
+-- vitest.config.ts
```

---

## ??? Database

FinQuest supports **two persistence backends**:

### A) Local JSON Store *(default — zero setup)*

Data is saved to `data/finquest-store.json` on the server filesystem.
Perfect for single-user local development or self-hosted single-node deployments.

No environment variables required beyond `JWT_SECRET`.

### B) Supabase (PostgreSQL — multi-user, cloud)

1. Create a free project at [supabase.com](https://supabase.com).
2. Run the bootstrap schema in the Supabase SQL Editor (paste `supabase/schema.sql`).
3. Add credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

The DB adapter automatically selects the correct backend.

---

## ?? Testing

### Unit Tests

```bash
npm test
```

Runs **34 unit tests** across 6 suites (Vitest).

### End-to-End Tests

```bash
node scripts/run-all-e2e.mjs
```

HTTP-based E2E suite testing all API endpoints against a running dev server.

---

## ?? Deployment

### Deploy to Vercel *(recommended)*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FJoshua-Ranish-T%2FFinQuest---Asset-Management)

Add environment variables in the Vercel dashboard (at minimum `JWT_SECRET` + Supabase credentials).

> **Note:** On Vercel, use the **Supabase** backend — the local JSON store requires a persistent filesystem not available on serverless.

### Self-Hosted (Node.js)

```bash
npm run build
npm start
```

---

## ?? Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

**Before submitting:** `npm test` · `npm run typecheck` · `npm run lint`

---

## ?? License

Licensed under the **MIT License**.

---

## ?? Acknowledgements

[Next.js](https://nextjs.org/) · [Supabase](https://supabase.com/) · [Lucide](https://lucide.dev/) · [Sonner](https://sonner.emilkowal.ski/) · [Decimal.js](https://mikemcl.github.io/decimal.js/)

---

<p align="center">Made with ?? by <a href="https://github.com/Joshua-Ranish-T">Joshua Ranish T</a></p>
