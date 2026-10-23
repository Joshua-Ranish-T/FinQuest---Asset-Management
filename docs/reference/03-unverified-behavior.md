# FinBoom – Unverified Behavior

> This document tracks behavior that is inferred, assumed, or unknown.  
> Nothing here was directly observed. These are hypotheses to validate during implementation.

---

## Methodology Note

Browser automation (Playwright) failed due to CDN 404 on driver download.  
All investigation used static HTTP fetch of SSR HTML. Consequently:
- All authenticated routes were inaccessible (server redirects)
- Client-side interactions (form submissions, animations, modals) could not be tested
- API calls, network requests, and state transitions could not be observed
- Demo content (loaded by client-side JS) was not inspectable

---

## UB-01: Login Mode Toggle (Register vs Sign-In)

**Behavior:** Clicking "Create one" on the login page switches to registration mode.  
**Evidence:** "No account yet? Create one" button with `type=button` confirmed in HTML. `/login?mode=register` CTA in header.  
**Assumption:** JS handles mode switch client-side; server may also render different initial state based on `?mode=register` param.  
**Unknowns:**
- Does the form add extra fields (e.g., name) in register mode?
- Does `?mode=register` set the initial tab/mode server-side?
- Is there email verification on registration?

---

## UB-02: Email Verification Flow

**Behavior:** After registration, user may need to verify email.  
**Evidence:** None directly observed. Supabase supports email confirmation.  
**Assumption:** Supabase sends confirmation email; user clicks link to activate.  
**Unknowns:**
- Is email verification required or optional?
- Does the app show "check your email" screen?
- What happens if user tries to log in before verification?

---

## UB-03: Dashboard Initial State (Empty vs Populated)

**Behavior:** New user sees empty state with onboarding prompt.  
**Evidence:** Demo shows populated data; new accounts have 0 assets.  
**Assumptions:**
- Empty state shows "Add your first asset" CTA
- Possibly a welcome/onboarding tour
**Unknowns:**
- Is there a multi-step onboarding wizard?
- Does the app show sample data for new users?

---

## UB-04: Asset Form Fields Per Asset Type

**Behavior:** Asset form changes fields based on selected asset type (EPF, mutual fund, stock, real estate, etc.)  
**Evidence:** "20+ asset classes" confirmed; carousel shows Equity, MF, Real Estate, Gold, EPF+PPF.  
**Assumption:** Dynamic form with type-specific fields.  
**Unknowns:**
- Full list of 20+ supported asset types
- Exact fields for each type (e.g., units + NAV for MF, grams + price for gold, etc.)
- Whether current value is auto-calculated or manually entered
- Whether stock prices are fetched live from any API

---

## UB-05: Live Price / NAV Fetching

**Behavior:** Some asset types may fetch live prices (stocks, mutual funds, gold).  
**Evidence:** FX rates confirmed as refreshing every 6 hours. No mention of live stock/NAV prices.  
**Assumption:** Likely manual entry (app is "manual-first").  
**Unknowns:**
- Are NSE/BSE stock prices fetched automatically?
- Are AMFI NAV prices fetched for mutual funds?
- Or does user manually update prices?

---

## UB-06: Pro Plan Price

**Behavior:** Pro plan requires one-time payment.  
**Evidence:** Reviews say "purchased Pro" (one-time language); pricing section shows Pro card but price was not in fetched SSR HTML (likely rendered client-side or in second card JSON not captured).  
**Unknowns:**
- Exact price (INR)
- Whether price varies by region
- Payment gateway used (likely Razorpay for India)
- Refund policy specifics (refund-policy page fetched but content not parsed)

---

## UB-07: 14-Day Pro Trial Mechanics

**Behavior:** New accounts get a 14-day Pro trial.  
**Evidence:** "14-day Pro trial available" stated in pricing section Free plan description.  
**Unknowns:**
- Does trial start immediately on signup?
- Is credit card required for trial?
- What happens to data after trial ends (downgrade to free limits)?
- Are users warned before trial expiry?

---

## UB-08: Asset Import Validation

**Behavior:** CSV import validates and maps columns.  
**Evidence:** Import feature confirmed in copy; exact UI/UX not observed.  
**Unknowns:**
- Exact CSV column format for Zerodha, Groww, and generic CSV
- Whether a template CSV is downloadable
- What happens with unmapped columns?
- Error handling for malformed CSV

---

## UB-09: Transaction Categories

**Behavior:** Income/expense transactions are categorized.  
**Evidence:** Carousel shows Rent, EMI, Groceries, Utilities categories. Savings Rate calculation confirmed.  
**Unknowns:**
- Full category list for expenses
- Full category list for income (salary, freelance, dividends, rental income?)
- Whether categories are customizable
- Whether there are sub-categories

---

## UB-10: Goal Linking to Assets

**Behavior:** Goals may be linked to specific assets to auto-calculate progress.  
**Evidence:** "Emergency Fund" shows ₹3.2L / ₹5L needed – implies a target amount and current amount tracked.  
**Unknowns:**
- How current amount is tracked (linked assets vs manual entry)
- Whether multiple assets can be linked to one goal
- On-track status calculation algorithm

---

## UB-11: Essentials Check Logic

**Behavior:** Essentials Check shows health status for Term Insurance, Health Cover, Emergency Fund.  
**Evidence:** Hero carousel shows check icons (met) and warning icon (partial) for these three.  
**Unknowns:**
- Where are these configured (special goal types or separate section)?
- How does user indicate they have term insurance? (policy amount? yes/no?)
- What triggers the warning vs. check state?
- Are these three fixed or configurable?

---

## UB-12: Multi-Currency Base Currency Setting

**Behavior:** User can set a base currency for consolidated net worth display.  
**Evidence:** FAQ says "consolidated net worth in INR, or any base currency you choose."  
**Unknowns:**
- Where is base currency configured (settings? profile?)
- Available base currencies (all 45+?)
- FX rate source (which provider/API?)
- How stale data is handled when FX rates are 6h old

---

## UB-13: Family Profiles

**Behavior:** Pro users can add family profiles.  
**Evidence:** Pricing section: "family profiles" listed under Pro.  
**Unknowns:**
- How many family profiles allowed?
- Is each profile a separate account or sub-profile?
- Can family profiles be shared/viewed by other family members?
- How is data separated between profiles?

---

## UB-14: Snapshot Limit Enforcement

**Behavior:** Free users limited to 2 snapshots per month.  
**Evidence:** Pricing states "2 net worth snapshots / month" for Free.  
**Unknowns:**
- What happens when limit is reached (block + upgrade prompt, or soft warning)?
- Does the limit reset on calendar month or rolling 30 days?
- Are historical snapshots accessible after downgrade from Pro?

---

## UB-15: Settings Page Content

**Behavior:** Settings page allows account management, data export, account deletion, and preference changes.  
**Evidence:** FAQ references "Settings" for export and deletion. Font scale cookie observed.  
**Unknowns:**
- Full list of settings available
- Profile editing (name, email, avatar)
- Notification preferences
- Billing/subscription management section
- Whether font scale toggle is in settings

---

## UB-16: Mobile Navigation (Hamburger Menu)

**Behavior:** On mobile, hamburger button opens a Sheet/drawer for navigation.  
**Evidence:** `<button aria-label="Open menu" data-slot="sheet-trigger">` confirmed in header HTML. `MarketingMobileNav` component referenced in RSC payload.  
**Unknowns:**
- Exact links in mobile nav drawer
- Whether it mirrors desktop nav exactly
- Animation/slide direction of drawer

---

## UB-17: Toaster Notification System

**Behavior:** App shows toast notifications for success/error states.  
**Evidence:** `<section aria-label="Notifications alt+T">` confirmed in HTML. `Toaster` component with `richColors` and `position="top-right"` confirmed.  
**Unknowns:**
- Exact error messages for each failure case
- Auto-dismiss timeout
- Whether toasts are stackable

---

## UB-18: Deep Links and PWA Behavior

**Behavior:** App supports deep links and back button handling for PWA mode.  
**Evidence:** `DeepLinkHandler`, `BackButtonHandler`, `StatusBarHandler` components confirmed in root layout RSC payload.  
**Unknowns:**
- Whether a native app exists (iOS App Store / Google Play) or only PWA
- Deep link URL scheme
- StatusBarHandler purpose (likely Capacitor/Ionic native shell)

---

## UB-19: Authenticated Dashboard Navigation Structure

**Behavior:** Authenticated app has a sidebar or bottom nav for navigating between sections.  
**Evidence:** Demo page confirms sections: Dashboard, Allocation, Snapshots, Insights. Authenticated routes at `/dashboard`, `/assets`, `/goals`, `/money`, etc. inferred.  
**Unknowns:**
- Sidebar vs. top nav vs. bottom nav (mobile)
- Complete list of navigation items
- Whether /money/insights is nested under /money or a tab
- Whether /assets and /liabilities are under a parent /portfolio or similar

---

## UB-20: XIRR Algorithm Implementation

**Behavior:** XIRR calculator uses Newton-Raphson or similar iterative method in browser.  
**Evidence:** Description says "annualized return on SIPs and irregular investments." Calculation confirmed as client-side.  
**Unknowns:**
- Convergence behavior with edge cases (all-same-date, very long tenures)
- Handling of no solution (returns NaN? Error message?)
- Whether multiple XIRR rates are handled (rare case)

---

## UB-21: Data Synchronization (Multi-Device)

**Behavior:** Data syncs across devices since stored in Supabase (cloud).  
**Evidence:** Supabase backend confirmed in FAQ.  
**Unknowns:**
- Real-time sync vs. on-load fetch
- Conflict resolution if same asset edited on two devices simultaneously
- Offline support via Service Worker

---

## UB-22: Error Boundary Behavior

**Behavior:** App uses error boundaries.  
**Evidence:** `error.tsx` referenced in Next.js RSC payload (`"error":"$c"` pattern, error scripts included).  
**Unknowns:**
- What the error page looks like
- Whether errors are logged to Sentry or similar
- Whether users see a "retry" option

---

## Summary Table

| ID | Category | Confidence | Priority to Verify |
|---|---|---|---|
| UB-01 | Auth | Medium | High |
| UB-02 | Auth | Medium | High |
| UB-03 | Onboarding | Low | High |
| UB-04 | Assets | Low | Critical |
| UB-05 | Assets | Low | High |
| UB-06 | Billing | Medium | High |
| UB-07 | Billing | Medium | Medium |
| UB-08 | Import | Low | Medium |
| UB-09 | Transactions | Medium | High |
| UB-10 | Goals | Low | Medium |
| UB-11 | Essentials | Low | Medium |
| UB-12 | Currency | Medium | Medium |
| UB-13 | Pro Features | Low | Low |
| UB-14 | Limits | Medium | Medium |
| UB-15 | Settings | Low | High |
| UB-16 | Mobile | Medium | Medium |
| UB-17 | UX | High | Low |
| UB-18 | PWA/Native | Medium | Low |
| UB-19 | Navigation | Low | Critical |
| UB-20 | Calculator | Low | Medium |
| UB-21 | Sync | Low | Low |
| UB-22 | Errors | Low | Low |
