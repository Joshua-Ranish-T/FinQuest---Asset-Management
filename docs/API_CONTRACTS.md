# FinBoom – API Contracts & Data Specifications

> **Status:** Implementation-Ready API Specification  
> **Protocol:** RESTful JSON over HTTPS  
> **Auth:** Bearer JWT / Secure HTTP-Only Cookie Session  
> **Base URL:** `/api/v1`

---

## 1. Global Standards & Error Envelope

All API endpoints return JSON. Every error response conforms to a standard error structure:

```json
{
  "success": false,
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "Free tier is limited to 25 assets. Upgrade to Pro for unlimited assets.",
    "details": {
      "current_count": 25,
      "max_allowed": 25,
      "upgrade_url": "/pricing"
    }
  }
}
```

### Standard Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure or malformed payload.
- `401 Unauthorized`: Missing or invalid session JWT.
- `403 Forbidden`: Resource belongs to another user or tier quota exceeded.
- `404 Not Found`: Entity does not exist.
- `409 Conflict`: Duplicate unique key (e.g., email already registered).
- `422 Unprocessable Entity`: Semantic validation failure (e.g., CSV schema mismatch).
- `500 Internal Server Error`: Unexpected server exception.

---

## 2. Core Data Entities & Schema

```
                     +--------------------+
                     |       users        |
                     +--------------------+
                               | 1
                               |
             +-----------------+-----------------+
             | 1               | 1               | 1
             v                 v                 v
     +---------------+ +---------------+ +---------------+
     |    assets     | |  liabilities  | | transactions  |
     +---------------+ +---------------+ +---------------+
             ^                 |                 |
             | M               |                 |
     +---------------+         |                 |
     |     goals     |         |                 |
     +---------------+         |                 |
             |                 |                 |
             +--------+--------+                 |
                      |                          |
                      v                          v
             +---------------+          +-----------------+
             |   snapshots   |          | categories (opt)|
             +---------------+          +-----------------+
```

### 2.1 Database Schema (PostgreSQL)

```sql
-- User Profile & Subscription
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  base_currency TEXT NOT NULL DEFAULT 'INR',
  theme TEXT NOT NULL DEFAULT 'dark',
  font_scale TEXT NOT NULL DEFAULT 'base',
  subscription_status TEXT NOT NULL DEFAULT 'free', -- 'free' | 'pro'
  pro_purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assets
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  asset_class TEXT NOT NULL, -- 'EQUITY', 'MUTUAL_FUND', 'EPF', 'PPF', 'GOLD', 'REAL_ESTATE', 'CRYPTO', 'FD', 'CASH', etc.
  institution TEXT,          -- e.g. 'HDFC Bank', 'Zerodha', 'EPFO'
  quantity NUMERIC(18, 6) DEFAULT 1,
  buy_price NUMERIC(18, 2) DEFAULT 0,
  current_value NUMERIC(18, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Liabilities
CREATE TABLE liabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  liability_type TEXT NOT NULL, -- 'HOME_LOAN', 'CAR_LOAN', 'PERSONAL_LOAN', 'CREDIT_CARD', etc.
  lender TEXT,
  principal_outstanding NUMERIC(18, 2) NOT NULL,
  interest_rate NUMERIC(5, 2),  -- e.g. 8.50%
  monthly_emi NUMERIC(18, 2),
  currency TEXT NOT NULL DEFAULT 'INR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions (Income & Expenses)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,           -- 'INCOME' | 'EXPENSE'
  category TEXT NOT NULL,       -- 'Rent', 'Groceries', 'Salary', etc.
  amount NUMERIC(18, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Goals
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC(18, 2) NOT NULL,
  target_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'CUSTOM',
  linked_asset_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Net Worth Snapshots
CREATE TABLE snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_assets NUMERIC(18, 2) NOT NULL,
  total_liabilities NUMERIC(18, 2) NOT NULL,
  net_worth NUMERIC(18, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FX Exchange Rates (Synced every 6 hours)
CREATE TABLE fx_rates (
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC(18, 6) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (from_currency, to_currency)
);
```

---

## 3. API Endpoints Contract

### 3.1 Authentication & Profile

#### `POST /api/v1/auth/register`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "full_name": "Test User"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "user": {
      "id": "e4b2d17c-2b28-4e12-8cf0-21e1a5f4c4a1",
      "email": "user@example.com",
      "subscription_status": "free"
    }
  }
  ```

#### `GET /api/v1/profile`
- **Headers**: `Authorization: Bearer <token>` or session cookie
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "e4b2d17c-2b28-4e12-8cf0-21e1a5f4c4a1",
      "email": "user@example.com",
      "full_name": "Test User",
      "base_currency": "INR",
      "theme": "dark",
      "font_scale": "base",
      "subscription_status": "free",
      "limits": {
        "assets_count": 12,
        "assets_max": 25,
        "snapshots_this_month": 1,
        "snapshots_max_per_month": 2
      }
    }
  }
  ```

---

### 3.2 Assets Management (`/api/v1/assets`)

#### `GET /api/v1/assets`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "7f8b9c2a-9e23-4b12-b234-918237465abc",
        "name": "Nifty 50 Index Fund",
        "asset_class": "MUTUAL_FUND",
        "institution": "Groww",
        "quantity": 142.5,
        "buy_price": 210.0,
        "current_value": 34500.0,
        "currency": "INR"
      }
    ],
    "summary": {
      "total_value_in_base_currency": 34500.0,
      "base_currency": "INR",
      "count": 1
    }
  }
  ```

#### `POST /api/v1/assets`
- **Validation**: Enforces Free Tier cap (rejects if count $\ge 25$ and user is Free).
- **Request Body**:
  ```json
  {
    "name": "HDFC Bank Shares",
    "asset_class": "EQUITY",
    "institution": "Zerodha",
    "quantity": 50,
    "buy_price": 1450.00,
    "current_value": 82500.00,
    "currency": "INR"
  }
  ```
- **Response `201 Created`**: Returns created asset object.
- **Response `403 Forbidden`**:
  ```json
  {
    "success": false,
    "error": {
      "code": "ASSET_LIMIT_REACHED",
      "message": "Free tier limit reached (25 assets). Upgrade to Pro for unlimited assets."
    }
  }
  ```

---

### 3.3 CSV Import (`POST /api/v1/assets/import`)
- **Content-Type**: `multipart/form-data`
- **Form Fields**: `file` (CSV, max 5MB), `source` (`ZERODHA` | `GROWW` | `GENERIC`), `deduplicate` (boolean).
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "imported_count": 18,
    "skipped_count": 0,
    "errors": []
  }
  ```

---

### 3.4 Snapshots Management (`/api/v1/snapshots`)

#### `POST /api/v1/snapshots`
- Calculates total assets and total liabilities dynamically in a database transaction, saves snapshot record.
- **Quota Rule**: Checks if user has already created 2 snapshots in the current calendar month.
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "snapshot-uuid",
      "total_assets": 4500000.00,
      "total_liabilities": 1200000.00,
      "net_worth": 3300000.00,
      "snapshot_date": "2026-10-23"
    }
  }
  ```

---

### 3.5 Pro Subscription & Webhook (`/api/v1/billing`)

#### `POST /api/v1/billing/create-order`
- Generates Razorpay Order ID for one-time Pro checkout.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "order_id": "order_EKzXm255d678",
    "amount": 299900,
    "currency": "INR",
    "key_id": "rzp_live_xxx"
  }
  ```

#### `POST /api/v1/billing/webhook`
- Idempotent signature verification (`x-razorpay-signature`).
- Upgrades `profiles.subscription_status = 'pro'`.

---

### 3.6 Data Export & Account Wipe (`/api/v1/account`)

#### `GET /api/v1/account/export?format=json|csv`
- Generates download payload containing all user data tables.
- **Response**: `Content-Disposition: attachment; filename="finboom-export-2026-10-23.json"`.

#### `DELETE /api/v1/account`
- **Request Body**:
  ```json
  {
    "confirmation": "DELETE MY DATA"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "All user data and authentication identities permanently deleted."
  }
  ```
