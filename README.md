# FinQuest — Personal Asset & Net-Worth Manager

**Track every rupee. Own your financial future.**

FinQuest is a privacy-focused personal finance application for tracking assets, liabilities, financial goals, and overall net worth in one place.

> **Purpose:** FinQuest is a test application built to explore and evaluate [REA (Reverse Engineer Anything)](https://github.com/morluto/rea), an AI-assisted reverse-engineering tool. It provides a real-world full-stack project for analyzing application features, APIs, authentication, data models, and code structure.

## Features

- **Dashboard:** View total net worth, assets, liabilities, portfolio allocation, and financial summaries.
- **Asset Management:** Track 10+ asset categories, including stocks, mutual funds, EPF, PPF, gold, real estate, cryptocurrency, fixed deposits, and savings.
- **Asset Valuation:** Calculate asset values using quantities and prices.
- **Liability Tracking:** Manage loans, credit cards, mortgages, outstanding balances, EMIs, and due dates.
- **Financial Goals:** Create and monitor savings and investment goals.
- **Portfolio Snapshots:** Save historical portfolio values and track changes over time.
- **Import & Export:** Import assets using CSV or JSON, export portfolio data to CSV, and export account data to JSON.
- **Authentication:** Email/password login, JWT-based sessions, password recovery, and account settings.
- **Privacy & Settings:** Manage appearance, font size, account data, and account deletion.
- **Free & Pro Tiers:** Support for asset and goal limits, with a Pro tier designed for unlimited usage.
- **Themes:** Light, dark, and system theme options.
- **Flexible Storage:** Use a local JSON data store or configure Supabase with PostgreSQL.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Vanilla CSS
- **Icons & Notifications:** Lucide React, Sonner
- **Calculations:** Decimal.js
- **Database:** Local JSON storage or Supabase/PostgreSQL
- **Authentication:** JWT and HTTP-only session cookies
- **Testing:** Vitest and custom end-to-end test scripts

## Getting Started

### Prerequisites

- Node.js 18 or later, subject to the requirements of the installed dependencies
- npm 9 or later
- Git

### Installation

```bash
git clone https://github.com/Joshua-Ranish-T/FinQuest---Asset-Management.git
cd FinQuest---Asset-Management
npm install
```

Create your local environment file:

```bash
cp .env.example .env.local
```

Set a secure `JWT_SECRET` of at least 32 characters in `.env.local`, then start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Account

For the local JSON store setup, the documented demo credentials are:

- **Email:** `demo@finquest.app`
- **Password:** `demo1234`

Use these credentials only in a local test environment.

## Environment Variables

| Variable | Purpose |
|---|---|
| `JWT_SECRET` | Secret used to sign authentication tokens |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public client key |
| `LOCAL_STORE_PATH` | Local JSON storage path; defaults to `data/finquest-store.json` |
| `NEXT_PUBLIC_APP_URL` | Application URL; defaults to `http://localhost:3000` |

Supabase variables are needed when using the Supabase backend.

## Testing

Run the available checks:

```bash
npm test
npm run typecheck
npm run lint
node scripts/run-all-e2e.mjs
```

## Storage & Deployment

- **Local development:** The app can use a local JSON file for data storage.
- **Cloud deployment:** Configure Supabase/PostgreSQL for persistent, multi-user storage.
- **Vercel:** Use a persistent database such as Supabase rather than relying on the serverless filesystem for application data.

## Using FinQuest to Test REA

FinQuest serves as a practical test project for evaluating REA's ability to investigate a full-stack application, including:

- Discovering features from the codebase.
- Understanding pages, components, and application structure.
- Exploring API routes and request flows.
- Analyzing authentication and authorization logic.
- Identifying data models and storage mechanisms.
- Understanding asset calculations and financial workflows.
- Reviewing configuration, tests, and project documentation.

The goal is to assess how effectively REA can analyze a realistic application and explain how its components work together.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
