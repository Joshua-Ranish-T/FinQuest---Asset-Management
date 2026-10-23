# FinBoom – Technical Architecture & System Design

> **Status:** Architecture Blueprint & Implementation Guide  
> **Target Application:** High-Fidelity FinBoom Wealth Management System  
> **Target Environment:** Node.js 22+, Next.js 15 (App Router), TypeScript, PostgreSQL / Supabase, Vanilla CSS Design System

---

## 1. System Architecture Overview

```
                      +------------------------------------------------+
                      |                 Client Browser                 |
                      |   - Next.js SSR Hydration                      |
                      |   - PWA Service Worker Cache                   |
                      |   - Sonner Toaster / Theme / Font Scale Engine |
                      |   - Pure Client Financial Calculators (XIRR)   |
                      +-----------------------+------------------------+
                                              |
                                     HTTPS / WSS / JWT
                                              |
                                              v
                      +------------------------------------------------+
                      |         Next.js App Router (Full-Stack)        |
                      |   - Route Handlers (/api/*)                    |
                      |   - Middleware (Auth & Cookie Session Guard)   |
                      |   - Server Actions / Optimistic Mutations      |
                      +-----------------------+------------------------+
                                              |
                                              v
                      +------------------------------------------------+
                      |         Supabase / PostgreSQL Data Tier        |
                      |   - Row-Level Security (RLS) per User ID       |
                      |   - Postgres Functions (Snapshot aggregation)  |
                      |   - Managed Auth (Google OAuth + Bcrypt)       |
                      |   - Foreign Exchange Rates Cache Table         |
                      +------------------------------------------------+
```

---

## 2. Recommended Technology Stack

Based on exact findings from reference site exploration, current Node.js v22.4.1 environment, and strict performance/aesthetic requirements:

| Tier | Recommended Technology | Justification & Alignment with Reference Site |
|---|---|---|
| **Framework** | **Next.js 15 (App Router with Turbopack)** | FinBoom runs Next.js App Router with server-rendered shells and client hydration chunks. Provides top-tier SEO for marketing/calculator pages and fast authenticated SPA transitions. |
| **Language** | **TypeScript 5.x** | Guarantees strict financial data types, currency representations, and compiler-verified schemas. |
| **Styling & Design System** | **Vanilla CSS + Custom Properties Design System** | Reference site uses custom CSS variables for `--font-scale` (`sm`, `base`, `lg`, `xl`), `.dark` theme tokens, glassmorphism cards, and fluid grid layouts without Tailwind overhead. |
| **Database & Auth** | **Supabase (PostgreSQL with RLS)** | Directly matches production FinBoom infrastructure confirmed in FAQ. Native support for Row-Level Security (guaranteeing private user data isolation) and Google OAuth. |
| **Client State & Cache** | **TanStack React Query v5** | Verified in reference RSC chunks (`QueryProvider [718928]`). Handles automatic caching, background refetching, and optimistic mutations for transactions and assets. |
| **UI Primitives & Icons** | **Radix UI Primitives + Lucide React** | Verified in reference chunks (`TooltipProvider [746798]`). High accessibility (ARIA 1.2 compliant), seamless keyboard navigation. |
| **Notifications** | **Sonner** | Verified directly in production DOM (`Toaster [713354]` with `richColors` and `position="top-right"`). |
| **Data Visualization** | **Recharts** | Lightweight SVG charting for net worth trajectory, asset allocation donut charts, and monthly expense distribution. |
| **Financial Math** | **decimal.js** | Prevents floating-point errors (e.g., `0.1 + 0.2 === 0.30000000000000004`) in currency arithmetic and loan amortization. |

---

## 3. Frontend Architecture

### 3.1 Route Hierarchy
```
src/
├── app/
│   ├── (marketing)/                # Public marketing group
│   │   ├── layout.tsx              # Sticky header + Footer + auth-aware buttons
│   │   ├── page.tsx                # Hero, Carousel, Marquee, FAQ, Pricing
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── refund-policy/page.tsx
│   │   └── whats-new/page.tsx
│   ├── (auth)/                     # Authentication group
│   │   ├── layout.tsx              # Minimal centered card layout
│   │   ├── login/page.tsx          # Dual Sign-in / Register
│   │   └── forgot-password/page.tsx
│   ├── (tools)/                    # Free public tools
│   │   ├── calculators/
│   │   │   ├── page.tsx            # Calculators catalog
│   │   │   ├── xirr/page.tsx
│   │   │   ├── sip/page.tsx
│   │   │   ├── lumpsum/page.tsx
│   │   │   ├── cagr/page.tsx
│   │   │   ├── emi/page.tsx
│   │   │   └── fd/page.tsx
│   │   └── demo/
│   │       ├── layout.tsx          # Demo banner + tab nav
│   │       ├── page.tsx            # Read-only dashboard
│   │       ├── allocation/page.tsx
│   │       ├── snapshots/page.tsx
│   │       └── money/insights/page.tsx
│   ├── (app)/                      # Authenticated application
│   │   ├── layout.tsx              # App Shell: Sidebar / BottomNav / UserMenu
│   │   ├── dashboard/page.tsx      # Consolidated overview
│   │   ├── assets/page.tsx         # 20+ asset classes list & import
│   │   ├── liabilities/page.tsx    # Loans and debts
│   │   ├── money/
│   │   │   ├── page.tsx            # Income & Expense ledger
│   │   │   └── insights/page.tsx   # Cashflow analysis & savings rate
│   │   ├── goals/page.tsx          # Financial goals & progress
│   │   ├── snapshots/page.tsx      # Net worth history & capture
│   │   ├── allocation/page.tsx     # Allocation analytics
│   │   ├── essentials/page.tsx     # Insurance & emergency checklist
│   │   └── settings/page.tsx       # Profile, Preferences, Export, Wipe
│   └── api/                        # Backend REST Route Handlers
```

### 3.2 Design System Tokens & Cookie Syncing

The application embeds an inline SSR script in `layout.tsx` to read user preferences prior to painting, preventing Flash of Unstyled Content (FOUC):
- **Theme**: Cookie `finboom-theme=dark|light`. Adds `dark` class to `document.documentElement`.
- **Font Scale**: Cookie `finboom-font-scale=sm|base|lg|xl`. Sets `--font-scale: 0.875rem | 1rem | 1.125rem | 1.25rem`.
- **Auth Toggle**: Cookie `fb-auth=1`. Dynamically exposes `[data-auth="in"]` nodes and hides `[data-auth="out"]` nodes.

```css
:root {
  --font-scale: 1rem;
  --bg-primary: #0a0b0d;
  --bg-surface: #12141a;
  --bg-surface-elevated: #1a1d26;
  --border-color: rgba(255, 255, 255, 0.08);
  --accent-primary: #10b981; /* Emerald Green */
  --accent-primary-hover: #059669;
  --accent-gold: #f59e0b;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --danger: #ef4444;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

---

## 4. Backend & Security Architecture

### 4.1 Authentication & Authorization
- **Session Management**: Supabase GoTrue Auth issuing signed JWTs.
- **Edge Middleware (`middleware.ts`)**:
  - Intercepts requests to `/dashboard`, `/assets`, `/goals`, `/money`, `/snapshots`, `/settings`.
  - Reads session cookie. If missing or expired, redirects to `/login?redirect=<url>`.
  - Reads `fb-auth` cookie. If valid session exists, sets `fb-auth=1` on response.

### 4.2 Row-Level Security (RLS) Policies
Every relational table is partitioned by `user_id`:
```sql
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only read their own assets"
ON assets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own assets"
ON assets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own assets"
ON assets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own assets"
ON assets FOR DELETE USING (auth.uid() = user_id);
```

### 4.3 Quota Enforcement Engine
Database trigger or API middleware enforces Free Tier caps before insert:
- `assets`: Count $\le 25$ for Free users.
- `liabilities`: Count $\le 5$ for Free users.
- `goals`: Count $\le 3$ for Free users.
- `snapshots`: Maximum 2 records created within the current calendar month (`DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`).

---

## 5. Accessibility & Responsive Requirements

### 5.1 Responsive Breakpoints
- **Mobile (< 768px)**:
  - Header displays Hamburger Sheet trigger (`data-slot="sheet-trigger"`).
  - Marketing dashboard carousel hidden; replaced with structured feature cards.
  - Authenticated layout switches to persistent bottom navigation bar.
- **Tablet (768px - 1024px)**:
  - 2-column dashboard grid.
  - Compact sidebar navigation.
- **Desktop (> 1024px)**:
  - Full multi-column dashboard with interactive carousel on homepage.
  - Collapsible left sidebar navigation in authenticated app.

### 5.2 Accessibility Standards (WCAG 2.1 AA)
- Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`.
- Keyboard navigation: Full tab stops, explicit `:focus-visible` styling with emerald outline.
- Screen readers: Form inputs explicitly linked with `<label for="...">`.
- Notifications: `aria-live="polite"` on toasts (`aria-label="Notifications alt+T"`).
