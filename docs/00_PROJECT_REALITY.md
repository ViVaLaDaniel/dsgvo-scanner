# 🎯 00_PROJECT_REALITY.md (The Source of Truth)

**Date:** 2026-02-06
**Status:** Active Development / MVP Phase
**Architecture:** Hybrid (Next.js @ Vercel + Node.js Worker @ DigitalOcean)

---

## 🏗️ 1. Architecture Reality
The project uses a **Hybrid Architecture** to bypass Vercel's serverless timeouts.

- **Frontend / API:** Next.js 16 (App Router) hosted on **Vercel**.
- **Database:** Supabase (PostgreSQL + Auth) in **Frankfurt**.
- **Scanner Engine:**
  - **Logic:** `lib/scan-engine.ts` contains the logic for both Local and Remote scanning.
  - **Execution:** Heavy scanning (Playwright) runs on a **DigitalOcean Droplet** (`scanner.n8ndo.es`).
  - **Integration:** Vercel API sends a request to the Droplet -> Droplet runs Playwright -> Returns JSON.

> **Roadmap Alignment:** Следующий крупный шаг — перенос сканирования в асинхронные очереди и укрепление надежности согласно [`ROADMAP.md`](./ROADMAP.md).

## 💳 2. Payments Reality
- **Provider:** **Paddle** (NOT Stripe).
- **Status:** Integrated.
- **Logic:** `app/api/webhooks/paddle/route.ts` handles subscription events.
- **Plans:** Starter (10 sites), Professional (50 sites), Business (200 sites).

## 🔍 3. Scanner Capabilities (Current vs. Planned)

| Feature | Current Status | Planned ("Scanner 110%") |
| :--- | :--- | :--- |
| **Engine** | Playwright (Headless Chrome) | Playwright (Optimized) |
| **Scope** | Single URL (Homepage only) | **Recursive Crawl** (3-5 pages deep) |
| **Interaction** | Basic Auto-Scroll | **Smart Interaction** (Click "Reject Cookies", "Load Map") |
| **Detection** | Network, Cookies, HTML Regex | + LocalStorage, Pixel tracking, Dynamic script injection |
| **Evidence** | Text logs | **Screenshots** of violations |
| **Performance** | Hybrid (Fast) | Queued (BullMQ for multi-page jobs) |

## ⚖️ 4. Legal Status
- **Impressum:** ✅ Done (`app/impressum/page.tsx`) - Needs final address check.
- **Datenschutzerklärung:** ✅ Done (`app/datenschutz/page.tsx`).
- **AGB (Terms):** ❌ **MISSING**. Need to create `app/agb/page.tsx`.
- **Cookie Consent:** ✅ Implemented on the scanner site itself (Dogfooding).

---

## 🛠️ 5. Next Steps (Priority)
1.  **Legal:** Create AGB page.
2.  **Scanner Upgrade:** Implement "Scanner 110%" specs (Deep Crawl, Interaction).
3.  **Stability:** Ensure DigitalOcean worker is running the latest code.
