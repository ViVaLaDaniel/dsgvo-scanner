# Security & Gap Audit Report (Phase 2)

**Date:** 24.05.2024
**Scope:** Backend, Database, Infrastructure

This report outlines the critical security gaps and implementation steps required after the introduction of the new Backend Engine (Puppeteer Worker).

---

## 1. CRITICAL SECURITY GAPS (Must Fix Immediately)

### 🚨 Middleware Missing (Server-Side Route Protection)
**Severity: CRITICAL**
Currently, there is no `middleware.ts` in the project root.
*   **Risk:** Users can potentially access `/dashboard/*` routes by just knowing the URL, even if they are not logged in (Client-side checks in `useEffect` are NOT secure; they only hide UI, but data is fetched via Supabase Client which relies on RLS, which is good, but the UI experience is broken).
*   **Fix:** Create `middleware.ts` to redirect unauthenticated users to `/login`.

### 🚨 Supabase Service Role Key Exposure Risk
**Severity: HIGH**
The new Scanner Worker (`scanner-worker/index.js`) requires `SUPABASE_SERVICE_ROLE_KEY`.
*   **Risk:** If this key is ever committed to GitHub or exposed in `NEXT_PUBLIC_` variables, attackers get full admin access to your database.
*   **Fix:**
    *   Ensure `.env` in the worker directory is in `.gitignore`.
    *   **NEVER** use `SERVICE_ROLE_KEY` in the Frontend (Next.js App).

### 🚨 RLS Policies on `user_profiles`
**Severity: MEDIUM**
The SQL script creates `user_profiles`. Ensure that the `insert` policy is handled correctly. Usually, Supabase handles user creation via Auth Triggers.
*   **Fix:** Add a Trigger in SQL to automatically create a `user_profiles` entry when a new user signs up via `auth.users`.

---

## 2. INFRASTRUCTURE GAPS (Deployment)

### ❌ Dockerfile for Worker
To deploy the worker to DigitalOcean, you need a Dockerfile that includes the Chromium binaries required by Puppeteer.
*   **Action:** Create `scanner-worker/Dockerfile`.

### ❌ Process Management
If the Node.js script crashes, who restarts it?
*   **Action:** Use `pm2` or Docker Restart Policies (`restart: always`) in `docker-compose.yml`.

---

## 3. IMPLEMENTATION PLAN (Next Steps)

1.  **Run the SQL Migration:** Execute `supabase/migrations/20240524_init_schema.sql` in your Supabase Dashboard SQL Editor.
2.  **Deploy Worker:**
    *   Copy `scanner-worker` folder to DigitalOcean.
    *   Create `.env` file there with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
    *   Run `npm install` and `node index.js`.
3.  **Secure Frontend:** Add `middleware.ts`.

---

## 4. MISSING FEATURES FOR "REAL MVP"

*   **PDF Generation:** Still missing. The worker saves JSON results. We need an API route in Next.js that reads this JSON and generates a PDF using `react-pdf` or `pdfkit`.
*   **Email Notifications:** The worker should probably trigger an email when a scan is finished.
