# Login Test Plan

## Application Overview

Users sign in at `/login` with email and password (Supabase Auth). Every page under `/workspace` requires a signed-in user; signed-out visitors are redirected to `/login`. A successful sign-in redirects to `/workspace`, and signing out redirects back to `/login`.

## Test Scenarios

### 1. Login

**Seed:** `tests/seed.spec.ts`

#### 1.1. redirects-signed-out-user-to-login

**File:** `tests/login/redirects-signed-out-user-to-login.spec.ts`

**Steps:**
  1. Open `/workspace` while signed out
    - expect: the URL is `/login`
    - expect: the "Sign in" heading is visible

#### 1.2. rejects-wrong-password

**File:** `tests/login/rejects-wrong-password.spec.ts`

**Steps:**
  1. Type `nobody@example.com` into the Email field
  2. Type `not-the-password` into the Password field
  3. Click "Sign in"
    - expect: the URL is `/login?error=...`
    - expect: the message "Invalid login credentials" is visible

#### 1.3. signs-in-and-out

**File:** `tests/login/signs-in-and-out.spec.ts`

Requires `E2E_EMAIL` and `E2E_PASSWORD` in `.env.local`; skipped otherwise.

**Steps:**
  1. Type the test account email into the Email field
  2. Type the test account password into the Password field
  3. Click "Sign in"
    - expect: the URL is `/workspace`
    - expect: the "Sign out" button is visible
  4. Click "Sign out"
    - expect: the URL is `/login`
  5. Open `/workspace` again
    - expect: the URL is `/login` (the session is gone)
