# FinBoom – User Journeys

> **Source:** Static HTML analysis. No live interactions performed.  
> INFERRED journeys are based on standard patterns + observed HTML structure.  
> VERIFIED means the HTML directly confirmed the step.

---

## UJ-01: New User Registration via Google

**Feature:** F-01 (Registration)  
**Preconditions:** User not logged in; has Google account  
**Starting page:** Homepage or any `data-auth="out"` CTA

### Journey Steps

| Step | User Action | System Behavior | UI Response |
|---|---|---|---|
| 1 | Clicks "Get Started Free" | Navigate to `/login?mode=register` | Login page loads |
| 2 | Sees form with Google button | Page renders registration mode (inferred) | "Continue with Google" prominent |
| 3 | Clicks "Continue with Google" | Supabase Google OAuth initiated | Redirect to Google consent page |
| 4 | Grants Google permission | Supabase receives OAuth callback | Redirect back to finboom.app |
| 5 | Account created | Supabase creates user record; sets `fb-auth=1` cookie | Redirect to `/dashboard` |
| 6 | Lands on dashboard | Dashboard loads with empty state | Onboarding prompt to add first asset (inferred) |

**Success:** User lands on `/dashboard` with new empty account  
**Failure (Google denied):** Returns to `/login` with error (inferred)  
**Failure (existing Google account):** Logs in instead of registering

### Edge Cases
| Case | Expected Behavior |
|---|---|
| User already logged in visits `/login` | Redirect to `/dashboard` (inferred) |
| Google OAuth popup blocked | Error message shown (inferred) |
| Network failure during OAuth | Return to login with error toast |

---

## UJ-02: New User Registration via Email

**Feature:** F-01 (Registration)  
**Preconditions:** User not logged in; valid email address available

### Journey Steps

| Step | User Action | System Behavior | UI Response |
|---|---|---|---|
| 1 | Navigates to `/login` | Page loads | Login form shown |
| 2 | Clicks "Create one" | Mode switches to register | Form may add additional fields (inferred: name) |
| 3 | Enters email | Client validates format | Inline validation (inferred) |
| 4 | Enters password (min 8 chars) | Client validates length | Password strength indicator (inferred) |
| 5 | Submits form | POST to Supabase auth API | Loading state on button |
| 6 | Account created | Supabase creates user; email verification (inferred) | Redirect to `/dashboard` or "check email" message |

**Validation Rules:**
- Email: valid email format (enforced by `type=email`)
- Password: minimum 8 characters (`minLength=8`)
- Both fields required (`required` attribute)

**Edge Cases:**
| Case | Expected Behavior |
|---|---|
| Email already registered | Error toast: "Email already in use" or similar |
| Password < 8 chars | Browser native validation or toast |
| Invalid email format | Browser native validation or toast |
| Network failure | Error toast; button re-enabled |
| Double submit | Button disabled on first submit (inferred) |

---

## UJ-03: Returning User Login

**Feature:** F-02 (Login)  
**Preconditions:** User has existing account (email/password or Google)

### Journey Steps (Email Login)

| Step | User Action | System Behavior | UI Response |
|---|---|---|---|
| 1 | Navigates to `/login` | Page loads | Login form shown |
| 2 | Enters email + password | — | Fields populated |
| 3 | Optionally toggles password visibility | Shows/hides password text | Eye icon toggles |
| 4 | Clicks "Sign in" | POST to Supabase auth | Button shows loading |
| 5 | Auth succeeds | `fb-auth=1` cookie set | Redirect to `/dashboard` |

**Edge Cases:**
| Case | Expected Behavior |
|---|---|
| Wrong password | Error toast: "Invalid credentials" |
| Non-existent email | Same error (security: no enumeration) |
| Account locked (brute force) | Error (inferred Supabase handles) |
| Session expired cookie | Redirect to login on dashboard load |

---

## UJ-04: Password Reset

**Feature:** F-03  
**Preconditions:** User has email account; access to email inbox

### Journey Steps

| Step | User Action | System Behavior | UI Response |
|---|---|---|---|
| 1 | On login page, clicks "Forgot password?" | Navigate to `/forgot-password` | Forgot password form loads |
| 2 | Enters email address | — | Email field populated |
| 3 | Submits form | Supabase sends reset email | Success message shown |
| 4 | Opens email, clicks reset link | Navigate to reset URL (token) | New password form |
| 5 | Enters new password | Validates min length | Password input |
| 6 | Submits new password | Supabase updates password | Redirect to login or dashboard |

**Edge Cases:**
| Case | Expected Behavior |
|---|---|
| Email not registered | Same success message (security: no enumeration) |
| Reset link expired | Error: "Link expired, request new one" |
| Same password as old | May allow (inferred, Supabase default) |

---

## UJ-05: Demo Exploration (Unauthenticated)

**Feature:** F-04  
**Preconditions:** None  
**Starting page:** Homepage

### Journey Steps

| Step | User Action | System Behavior | UI Response |
|---|---|---|---|
| 1 | Clicks "Try the live demo" on homepage | Navigate to `/demo` | Demo shell loads with "Loading demo..." |
| 2 | JS hydrates | Client fetches demo data | Dashboard content replaces placeholder |
| 3 | Views Dashboard tab | — | Net worth cards, charts shown |
| 4 | Clicks "Allocation" tab | Navigate to `/demo/allocation` | Allocation donut chart shown |
| 5 | Clicks "Net worth history" tab | Navigate to `/demo/snapshots` | Historical chart shown |
| 6 | Clicks "Insights" tab | Navigate to `/demo/money/insights` | Cashflow insights shown |
| 7 | Clicks dark mode toggle | Toggles `dark` class | UI switches to dark theme |
| 8 | Clicks "Start free →" | Navigate to `/login?mode=register` | Registration page |

**Loading State (Verified):** "Loading demo…" text shown during hydration  
**Empty State:** Not applicable (pre-populated data)  
**No writes possible:** Demo is read-only

---

## UJ-06: Using XIRR Calculator

**Feature:** F-06  
**Preconditions:** None  
**Starting page:** `/calculators`

### Journey Steps

| Step | User Action | System Behavior | UI Response |
|---|---|---|---|
| 1 | Visits `/calculators` | Page loads | All calculator cards shown |
| 2 | Clicks "XIRR Calculator" | Navigate to `/calculators/xirr` | XIRR form loads |
| 3 | Enters investment date + amount (row 1) | — | Row populated |
| 4 | Clicks "Add row" or similar | New row added | Additional date/amount inputs |
| 5 | Enters final redemption row (negative = outflow, positive = inflow) | — | All rows populated |
| 6 | Clicks "Calculate" or form auto-updates | XIRR algorithm runs in browser | Result shown: "X.X% p.a." |
| 7 | Modifies any input | Auto-recalculates (inferred) | Updated result |

**Validation (Inferred):**
- At least 2 cash flow entries required
- One positive (redemption) + one or more negative (investments)
- Dates must be valid
- Amounts must be numeric

**Privacy:** Nothing sent to server. All computation client-side.

---

## UJ-07: Using EMI Calculator

**Feature:** F-10  
**Starting page:** `/calculators`

### Journey Steps

| Step | User Action | System Behavior | UI Response |
|---|---|---|---|
| 1 | Clicks "EMI Calculator" on calculators page | Navigate to `/calculators/emi` | EMI form loads |
| 2 | Enters loan amount | — | Numeric input populated |
| 3 | Enters annual interest rate | — | Rate input populated |
| 4 | Enters tenure (months or years) | — | Tenure populated |
| 5 | Clicks Calculate or live update | EMI formula: P × r × (1+r)^n / ((1+r)^n - 1) | Monthly EMI, total interest, breakup shown |

**Output:**
- Monthly EMI amount
- Total amount payable
- Total interest payable
- Principal vs interest breakup (pie chart or table, inferred)

---

## UJ-08: Adding an Asset (Authenticated)

**Feature:** F-12  
**Preconditions:** Logged in; within free asset limit (25) or Pro plan  
**Starting page:** `/assets` or `/dashboard`

### Journey Steps (Inferred)

| Step | User Action | System Behavior | UI Response |
|---|---|---|---|
| 1 | Clicks "Add Asset" button | Dialog/drawer opens | Asset type selector shown |
| 2 | Selects asset type (e.g., "Mutual Fund") | Form fields adapt to type | Relevant fields shown |
| 3 | Fills in asset name, amount, currency, date | — | Fields populated |
| 4 | Fills type-specific fields (e.g., units, NAV for MF) | — | Calculated current value shown |
| 5 | Clicks "Save" or "Add" | POST to Supabase | Loading state |
| 6 | Asset saved | Asset count incremented | Asset appears in list; dashboard updates |

**Free Tier Limit:**
- At 25 assets, "Add Asset" may show upgrade prompt
- Pro upgrade flow initiates

**Edge Cases:**
| Case | Expected Behavior |
|---|---|
| Free limit reached | "Upgrade to Pro" modal or banner |
| Network error on save | Error toast; form retained |
| Duplicate asset name | Likely allowed (no deduplication) |
| Invalid amount (negative/text) | Form validation error |

---

## UJ-09: Importing Assets from Zerodha CSV

**Feature:** F-13  
**Preconditions:** Logged in; Zerodha account CSV export ready  
**Starting page:** `/assets` or `/import` (route unverified)

### Journey Steps (Inferred)

| Step | User Action | System Behavior | UI Response |
|---|---|---|---|
| 1 | Clicks "Import" or similar | Import dialog opens | File format instructions shown |
| 2 | Selects "Zerodha" as source | — | Specific CSV format info shown |
| 3 | Uploads CSV file | File parsed client-side | Preview table shown |
| 4 | Reviews mapped columns | — | Confirmation screen |
| 5 | Clicks "Import" | Data saved to Supabase | Success: N assets added |
| 6 | Navigates to assets list | — | New assets visible |

---

## UJ-10: Logging an Income/Expense Transaction

**Feature:** F-14  
**Preconditions:** Logged in  
**Starting page:** `/money` (inferred route)

### Journey Steps (Inferred)

| Step | User Action | System Behavior | UI Response |
|---|---|---|---|
| 1 | Navigates to money/transactions page | Page loads | Transaction list shown |
| 2 | Clicks "Add transaction" | Form or dialog opens | Amount, type, category, date fields |
| 3 | Selects type: Income or Expense | — | Category options change accordingly |
| 4 | Selects category (e.g., "Rent", "Salary") | — | Category selected |
| 5 | Enters amount and date | — | Fields populated |
| 6 | Optionally adds notes | — | Notes field |
| 7 | Clicks Save | POST to Supabase | Transaction appears in list |
| 8 | Dashboard/insights update | — | Savings rate, monthly totals recalculated |

**Observed categories (from carousel):** Rent, EMI, Groceries, Utilities (expense categories)

---

## UJ-11: Creating a Financial Goal

**Feature:** F-15  
**Preconditions:** Logged in; within goal limit (3 free, unlimited Pro)  
**Starting page:** `/goals` (inferred)

### Journey Steps (Inferred)

| Step | User Action | System Behavior | UI Response |
|---|---|---|---|
| 1 | Navigates to goals page | — | Goals list shown |
| 2 | Clicks "Add Goal" | Dialog/form opens | Goal form fields shown |
| 3 | Enters goal name (e.g., "Retirement") | — | Name field |
| 4 | Enters target amount | — | Amount field |
| 5 | Enters target date | — | Date picker |
| 6 | Optionally links to assets | Assets associated with goal | Progress calculated automatically |
| 7 | Clicks Save | POST to Supabase | Goal appears with 0% progress |
| 8 | As assets grow, goal progress updates | — | % progress and on-track status |

**Observed goal categories:** Retirement, Emergency Fund, Child Education  
**Essentials check:** Term Insurance, Health Cover, Emergency Fund (pre-defined goals/flags)

---

## UJ-12: Taking a Net Worth Snapshot

**Feature:** F-16  
**Preconditions:** Logged in; within snapshot limit (2/month free, unlimited Pro)  
**Starting page:** `/snapshots` or `/dashboard`

### Journey Steps (Inferred)

| Step | User Action | System Behavior | UI Response |
|---|---|---|---|
| 1 | Navigates to snapshots page or clicks snapshot button | — | Current net worth shown |
| 2 | Clicks "Take Snapshot" | Current net worth calculated | Confirmation prompt |
| 3 | Confirms | Snapshot record saved with timestamp and value | Snapshot added to history |
| 4 | Views history chart | — | Line chart showing net worth over time |

**Free limit:** 2 per month — at limit, shows upgrade prompt

---

## UJ-13: Exporting Data

**Feature:** F-22  
**Preconditions:** Logged in  
**Starting page:** `/settings` (inferred)

### Journey Steps (Inferred)

| Step | User Action | System Behavior | UI Response |
|---|---|---|---|
| 1 | Navigates to Settings | — | Settings page loads |
| 2 | Finds "Export Data" section | — | Export options shown |
| 3 | Selects format: CSV or JSON | — | Radio/button selection |
| 4 | Clicks "Download" or "Export" | Server generates file | Download begins immediately |
| 5 | File saved locally | — | File download complete |

**Exported data includes:** assets, liabilities, snapshots, goals, transactions (confirmed in privacy copy)

---

## UJ-14: Upgrading to Pro

**Feature:** F-21  
**Preconditions:** Logged in; on Free plan  
**Starting page:** Any upgrade trigger (limit hit, pricing page, settings)

### Journey Steps (Inferred)

| Step | User Action | System Behavior | UI Response |
|---|---|---|---|
| 1 | Hits free limit (e.g., 26th asset) or clicks "Upgrade" | — | Upgrade prompt/modal |
| 2 | Views Pro plan details | — | Feature comparison |
| 3 | Clicks "Upgrade to Pro" | — | Payment page/modal |
| 4 | Enters payment details | Razorpay or similar (inferred) | Payment form |
| 5 | Confirms payment | One-time payment processed | Pro features unlocked |
| 6 | Returns to app | Account upgraded | Limits removed |

**Payment model:** One-time (confirmed by multiple reviews saying "purchased Pro")  
**14-day trial:** Available for new accounts (mentioned in pricing)

---

## UJ-15: Deleting Account

**Feature:** F-23  
**Preconditions:** Logged in  
**Starting page:** `/settings`

### Journey Steps (Inferred)

| Step | User Action | System Behavior | UI Response |
|---|---|---|---|
| 1 | Navigates to Settings | — | Settings page |
| 2 | Finds "Delete Account" option | — | Danger zone section |
| 3 | Clicks "Delete Account" | — | Confirmation dialog |
| 4 | Types confirmation text or clicks confirm | — | Final confirm button |
| 5 | Confirms | Supabase deletes all user data | Account deleted |
| 6 | Redirected to homepage | Session cleared; cookie removed | Homepage (logged out) |

**Data deleted:** All assets, liabilities, goals, transactions, snapshots, profile data  
**Irreversible:** Cannot be undone

---

## UJ-16: Switching App Theme (Dark/Light)

**Feature:** F-19  
**Preconditions:** None  
**Starting page:** Demo page or any page with toggle

### Journey Steps (Verified)

| Step | User Action | System Behavior | UI Response |
|---|---|---|---|
| 1 | Clicks dark mode toggle (moon icon) | Sets/removes `dark` class on `<html>` | UI transitions to dark/light |
| 2 | Sets `finboom-theme=dark` or removes cookie | Cookie persists preference | Preference remembered on reload |

---

## UJ-17: Installing PWA

**Feature:** F-26  
**Preconditions:** Mobile browser or Chrome desktop  
**Starting page:** Any page

### Journey Steps (Inferred)

| Step | User Action | System Behavior | UI Response |
|---|---|---|---|
| 1 | Browses finboom.app on mobile | `InstallPrompt` component checks eligibility | Install banner shown |
| 2 | Clicks "Add to Home Screen" | Browser installation initiated | App icon added to home screen |
| 3 | Opens installed app | Loads as standalone PWA | App bar hidden, standalone mode |
| 4 | Deep links from notifications | `DeepLinkHandler` processes URL | Opens specific page in app |
