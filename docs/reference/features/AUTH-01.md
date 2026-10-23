# Feature Deep Dive: Authentication (Login & Registration)

**Feature ID:** AUTH-01  
**Feature Name:** User Authentication (Login / Registration / Password Reset)  
**Reference URL:** https://www.finboom.app/login  
**Investigation Status:** PARTIAL – SSR HTML analyzed; no live session observed  
**Date:** 2026-10-23

---

## 1. Overview

FinBoom uses a unified `/login` route for both sign-in and registration. The page supports:
1. Google OAuth (Supabase provider)
2. Email + Password (Supabase email auth)

Authentication state is persisted via an HTTP cookie (`fb-auth=1`) and is read client-side to toggle auth-aware UI elements using `data-auth="in"` / `data-auth="out"` HTML attributes.

---

## 2. Relevant Files / Modules

> **Note:** Source code is not accessible (remote hosted app). The following are inferred from Next.js RSC payload, chunk filenames, and component names observed in HTML.

| Component / Module | Evidence | Role |
|---|---|---|
| `/_next/static/immutable/chunks/09x5fddymwnrv.js` | Script loaded on `/login` only | Login page component bundle |
| `QueryProvider` (I[718928]) | RSC payload | React Query provider (data fetching) |
| `TooltipProvider` (I[746798]) | RSC payload | Radix UI tooltip context |
| `Toaster` (I[713354], richColors, top-right) | RSC payload | Sonner toast notifications |
| `ServiceWorkerRegister` (I[88577]) | RSC payload | PWA service worker |
| `InstallPrompt` (I[37186]) | RSC payload | PWA install prompt |
| `DeepLinkHandler` (I[431852]) | RSC payload | Mobile deep link handling |
| `BackButtonHandler` (I[229372]) | RSC payload | Capacitor/PWA back button |
| `StatusBarHandler` (I[282815]) | RSC payload | Mobile status bar (Capacitor) |
| `Analytics` (I[302355]) | RSC payload | Analytics tracking |
| `SessionTracker` (I[442311]) | RSC payload | Session activity tracking |
| Cookie: `fb-auth=1` | Inline script on all pages | Auth state indicator for client-side UI |
| Cookie: `finboom-theme=dark` | Inline script on all pages | Theme preference |
| Cookie: `finboom-font-scale` | Inline script on all pages | Font size preference |

---

## 3. Step-by-Step Technical Explanation

### 3.1 Page Load

```
User navigates to /login
  → Next.js App Router handles request server-side
  → Route group: (auth)/login/page.tsx (inferred from RSC payload: "login" segment, "(auth)" group)
  → SSR renders login form HTML
  → Sends HTML + RSC payload to browser
  → Browser reads cookies via inline script:
      if finboom-theme=dark → adds 'dark' class to <html>
      if finboom-font-scale=X → sets --font-scale CSS var
      if fb-auth=1 → adds 'is-authed' class to <html>
  → React hydrates
  → Login component (chunk 09x5fddymwnrv.js) activates
```

### 3.2 Google OAuth Flow (Inferred)

```
User clicks "Continue with Google"
  → Event handler calls Supabase client signInWithOAuth({ provider: 'google' })
  → Supabase constructs Google OAuth URL with:
      client_id: (Supabase project Google OAuth client)
      redirect_uri: https://[supabase-project].supabase.co/auth/v1/callback
      scope: openid email profile
  → Browser redirects to Google consent page
  → User grants permission
  → Google redirects to Supabase callback URL with auth code
  → Supabase exchanges code for access token + creates/updates user record
  → Supabase redirects to: https://www.finboom.app/auth/callback (or similar, inferred)
  → App callback handler:
      → Sets fb-auth=1 cookie (HTTP-only or JS-accessible)
      → Creates session
      → Redirects to /dashboard
```

### 3.3 Email/Password Registration (Inferred)

```
User enters email + password, clicks "Sign in" (registration mode)
  → React state holds form values
  → Client-side validation:
      email: HTML5 type=email validation
      password: minLength=8 (HTML attribute)
  → On submit: calls Supabase client signUp({ email, password })
  → Loading state shown (button disabled)
  → Supabase API response:
      Success: user created, session established
        → set fb-auth=1 cookie
        → redirect to /dashboard
      Error (duplicate email): 
        → Toaster notification: "User already registered" or similar
      Error (weak password):
        → Toaster notification
```

### 3.4 Email/Password Login (Inferred)

```
User enters email + password, clicks "Sign in"
  → Calls Supabase client signInWithPassword({ email, password })
  → Loading state shown
  → Supabase API:
      Success: session created
        → sets fb-auth=1 cookie
        → redirects to /dashboard
      Error (invalid credentials):
        → Toaster notification: "Invalid login credentials"
      Error (email not confirmed):
        → Toaster notification about email verification
```

### 3.5 Password Visibility Toggle

```
User clicks eye icon button (tabindex=-1)
  → React state toggle: showPassword = !showPassword
  → Input type switches: password ↔ text
  → Eye icon changes to eye-off icon (inferred)
```

### 3.6 Auth State Persistence

```
On page load (any page):
  → Inline script reads document.cookie
  → Checks for 'fb-auth=1'
  → If found: adds 'is-authed' class to <html>
  → CSS/JS then shows data-auth="in" elements, hides data-auth="out" elements
  
On logout (inferred):
  → Supabase client signOut()
  → Removes fb-auth cookie
  → Redirects to / or /login
```

---

## 4. Sequence Diagram

### Google OAuth Flow

```
User        Browser         finboom.app     Supabase Auth    Google
 |               |               |               |               |
 |--click Google-|               |               |               |
 |               |--signInWithOAuth('google')     |               |
 |               |               |--get OAuth URL|               |
 |               |               |<--OAuth URL---|               |
 |               |--redirect to Google consent---|               |
 |               |               |               |               |
 |               |<---Google consent page---------|               |
 |--grant perms--|               |               |               |
 |               |--POST grant---|               |               |
 |               |               |               |--callback---->|
 |               |               |               |<--auth code---|
 |               |               |               |--exchange---->|
 |               |               |               |<--tokens------|
 |               |               |               |--create user--|
 |               |               |<--redirect----|               |
 |               |--callback---->|               |               |
 |               |               |--set cookie---|               |
 |               |--redirect /dashboard          |               |
 |               |<--dashboard page              |               |
```

### Email/Password Flow

```
User        Browser         finboom.app     Supabase Auth
 |               |               |               |
 |--fill form--->|               |               |
 |--click submit-|               |               |
 |               |--client validate              |
 |               |--signInWithPassword---------->|
 |               |               |               |--verify hash--|
 |               |               |<--session JWT-|               |
 |               |               |--set cookie---|               |
 |               |--redirect /dashboard          |               |
```

---

## 5. Input Fields and Validation Rules

| Field | Type | Required | Constraint | Validation Method |
|---|---|---|---|---|
| Email | `email` | Yes | Valid email format | HTML5 `type=email` + client |
| Password | `password` | Yes | Minimum 8 characters | HTML5 `minLength=8` + client |

**Additional (Inferred):**
- Real-time format validation on blur (typical Supabase pattern)
- Server-side validation by Supabase (additional rules possible)
- Rate limiting on failed attempts (Supabase default)

---

## 6. State Transitions

```
[Unauthenticated]
    │
    ├──Google OAuth──────────────────────────────> [Authenticated]
    │   (success: fb-auth=1 cookie set)
    │
    ├──Email/Password Login──────────────────────> [Authenticated]
    │   (success: fb-auth=1 cookie set)
    │
    ├──Email/Password Login──────────────────────> [Unauthenticated]
    │   (failure: error toast shown)
    │
    └──Register──────────────────────────────────> [Authenticated]
        (success: account created, fb-auth=1 cookie set)

[Authenticated]
    │
    ├──Logout────────────────────────────────────> [Unauthenticated]
    │   (fb-auth cookie removed)
    │
    └──Session Expired───────────────────────────> [Unauthenticated]
        (redirect to /login on next authenticated request)
```

---

## 7. API Contracts (Observed/Inferred)

| Operation | Method | Endpoint (Inferred) | Payload | Response |
|---|---|---|---|---|
| Email Sign Up | POST | `https://[project].supabase.co/auth/v1/signup` | `{email, password}` | `{access_token, user, session}` or error |
| Email Sign In | POST | `https://[project].supabase.co/auth/v1/token?grant_type=password` | `{email, password}` | `{access_token, user, session}` or error |
| Google OAuth | GET | `https://[project].supabase.co/auth/v1/authorize?provider=google` | — | Redirect to Google |
| Sign Out | POST | `https://[project].supabase.co/auth/v1/logout` | Bearer token | 204 No Content |
| Password Reset | POST | `https://[project].supabase.co/auth/v1/recover` | `{email}` | 200 (always, for security) |

> **Note:** Exact Supabase project URL not observed. These are standard Supabase endpoints.

---

## 8. Session / Cookie Behavior

| Cookie | Visible | Value | Purpose | Lifetime |
|---|---|---|---|---|
| `fb-auth` | JS-accessible | `1` | UI auth-awareness toggle | Session or persistent (inferred persistent) |
| `finboom-theme` | JS-accessible | `dark` or absent | Theme preference | Persistent |
| `finboom-font-scale` | JS-accessible | `sm/base/lg/xl` | Font size | Persistent |

> **Note:** Supabase also sets its own `sb-` prefixed cookies for the actual JWT session. These were not observed in the inline script but are standard Supabase behavior.

---

## 9. Edge Case Table

| Edge Case | User Action | Expected Behavior | Confidence |
|---|---|---|---|
| Double-submit | Click "Sign in" twice | Button disabled after first click; only one request | INFERRED |
| Wrong email format | Type "notanemail" | HTML5 validation prevents submit | VERIFIED (type=email) |
| Short password | Type "1234567" (7 chars) | HTML5 validation prevents submit | VERIFIED (minLength=8) |
| Empty email | Submit with empty email | HTML5 required prevents submit | VERIFIED (required attr) |
| Empty password | Submit with empty password | HTML5 required prevents submit | VERIFIED (required attr) |
| Email duplicate (register) | Register with existing email | Error toast from Supabase | INFERRED |
| Wrong password | Login with wrong password | Error toast "Invalid credentials" | INFERRED |
| Google popup blocked | Browser blocks OAuth popup | Error message shown | INFERRED |
| Network failure on submit | Submit with no internet | Error toast; form re-enabled | INFERRED |
| Already logged in visiting /login | Direct URL navigation | Redirect to /dashboard | INFERRED |
| Session expired mid-session | Idle too long | Next API call fails; redirect to /login | INFERRED |
| Password reset with unregistered email | Request reset for unknown email | Success message (security: no enumeration) | INFERRED |
| Tab closed during OAuth | Close Google consent tab | Returns to /login (no session created) | INFERRED |
| Very long email | > 320 chars | Likely client or server validation error | UNVERIFIED |

---

## 10. Evidence List

| Evidence | Source | Type |
|---|---|---|
| Email input `id=email`, `type=email`, `required` | `/login` SSR HTML | VERIFIED |
| Password input `id=password`, `type=password`, `required`, `minLength=8` | `/login` SSR HTML | VERIFIED |
| Password visibility toggle button (`tabindex=-1`, eye SVG icon) | `/login` SSR HTML | VERIFIED |
| "Forgot password?" link → `/forgot-password` | `/login` SSR HTML | VERIFIED |
| "Continue with Google" button with Google SVG logo | `/login` SSR HTML | VERIFIED |
| Google OAuth path colors (#4285F4, #34A853, #FBBC05, #EA4335) | `/login` SSR HTML | VERIFIED |
| "No account yet? Create one" button `type=button` | `/login` SSR HTML | VERIFIED |
| Terms of Service + Privacy Policy links | `/login` SSR HTML | VERIFIED |
| `fb-auth=1` cookie → `is-authed` class on `<html>` | All pages inline script | VERIFIED |
| `Toaster` with `richColors=true` and `position=top-right` | `/login` RSC payload | VERIFIED |
| Route group `(auth)` in Next.js App Router | RSC payload structure | VERIFIED |
| `meta name="robots" content="noindex, nofollow"` on `/login` | `/login` SSR HTML | VERIFIED |
| Supabase mentioned in FAQ as backend | Homepage SSR HTML | VERIFIED |
| `QueryProvider` in root layout | RSC payload | VERIFIED |
| `DeepLinkHandler`, `BackButtonHandler`, `StatusBarHandler` | RSC payload | VERIFIED |

---

## 11. Unknowns and Assumptions

| Unknown | Assumption | Impact if Wrong |
|---|---|---|
| Whether email verification is required | Assumed: optional or auto-confirmed | If required, UJ-02 needs email check step |
| Supabase project URL / region | Not observable from HTML | Low (implementation detail) |
| Whether `fb-auth` is HttpOnly or JS-accessible | Assumed: JS-accessible (inline script reads it) | Medium (security consideration) |
| JWT expiry duration | Assumed: standard Supabase (1 hour access, 1 week refresh) | High (session handling in app) |
| Whether there's a profile setup step after registration | Unknown | High (onboarding flow completeness) |
| Rate limiting on failed logins | Assumed: Supabase default (10 requests/hour) | Low for UX design |
| Redirect after login (back to intended URL vs always /dashboard) | Assumed: always /dashboard | Medium (UX for protected links) |
| Whether `?mode=register` changes the server-rendered HTML | Unknown | Medium (SEO/SSR implications) |
| Registration additional fields (e.g., display name, country) | Unknown | High (profile completeness) |
| Error message copy | Unknown exact strings | Medium (UI copy) |
