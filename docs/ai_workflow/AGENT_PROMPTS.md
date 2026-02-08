# AI Agent Prompts

This file contains the prompts and instructions for the AI agents used in this project.

> **Alignment Rule:** All agents must validate recommendations against [`docs/ROADMAP.md`](../ROADMAP.md).

---

## 1. Jule: Daily Super-Audit

*This is the recurring daily prompt for the Jule agent, focused on continuous improvement, quality, and innovation.*

**Objective:** A detailed, merciless review of the codebase to ensure "Pixel Perfect" quality, 100% security, and solid logic. PLUS: Innovation & Vibe Check.

**Instructions:**
1.  **Read Context:** Review `.ai/CONTEXT.md` and `.ai/CURRENT_PLAN.md`.
2.  **Audit Dimensions:**
    *   **UI/UX (Vibe Check):** Check against "Premium & Trustworthy" goal. Does it feel modern? Are animations smooth? **Propose "Vibe" improvements** (e.g., glassmorphism, micro-interactions) to make it look state-of-the-art.
    *   **Innovation:** Briefly search or recall recent Next.js/Supabase best practices. Are we using deprecated features? Can we use something newer/faster?
    *   **Security:** Scan for Vulnerabilities (SQLi, XSS, RLS policies in Supabase).
    *   **Logic:** Check critical flows (Scanning, PDF Generation, Auth). Are there edge cases missed?
    *   **Code Quality:** Check for "any" types, missing tests, or hardcoded strings (German UI, English Code).
3.  **Outputs (Deliverables):**
    *   **Update Plan:** Edit `.ai/CURRENT_PLAN.md` with checked off items and NEW tasks based on your findings.
    *   **Report:** Create a new file `.ai/daily_reports/REPORT_YYYY-MM-DD.md` with specific findings AND an "Innovation & Vibe" section.
    *   **Fixes:** If you find critical bugs, fix them in this session.

**Tone:** Be strict but visionary. Don't just fix bugs—suggest how to make it *cool*.

---

## 2. Jule: Full 360-Degree Project Audit

*This was the initial, comprehensive audit assignment for the Jule agent. It is preserved here as a reference for the scope and depth of a full project review.*

**Objective:** Perform a 360-degree audit of the **DSGVO Scanner** project. Your goal is to identify ALL potential weaknesses, security vulnerabilities, UI/UX flaws, and compliance issues, specifically for the German market.

**Project Context:**
- **Repository**: Accessible on GitHub (Current Branch: `main`)
- **Tech Stack**: Next.js 15+, Supabase (Auth/DB/RLS), Tailwind CSS 4, Playwright (Scanner Engine).
- **Core Business**: B2B SaaS for German Data Protection Officers (DSB).
- **Current Completion**: ~75% (Phase 7 Refinement).

**Infrastructure Details:**
- **Supabase URL**: `https://yskgcyjqtcpezfxdteho.supabase.co`
- **Supabase Anon Key**: Consult `.env.local` for the key.
- **Primary Region**: Frankfurt (`fra1`) for Vercel and Supabase (Compliance requirement).

**Audit Checklist:**

### 1. **Security & Data Privacy (DSGVO/GDPR)**
- **Supabase RLS**: Audit ALL tables (`websites`, `user_profiles`, `scans`) to ensure no user can access another's data.
- **Data Residence**: Verify that no data leaks to non-EU servers (GFonts, CDNs).
- **Auth Hardening**: Check session handling, cookie security (Strict/Lax), and protection against common attacks (SQLi, XSS, Brute force).

### 2. **German Compliance (Legal)**
- **Impressum & Datenschutz**: Check for completeness according to § 5 DDG and DSGVO.
- **Cookie Banner**: Verify TCF 2.2 / TTDSG compliance (Reject all, Accept all, Granular settings).
- **White-Labeling**: Ensure agency branding doesn't accidentally reveal the core SaaS provider if not intended.

### 3. **UI/UX & Performance**
- **Lighthouse Performance**: Aim for 100/100. Audit images, fonts, and bundle size.
- **Accessibility (WCAG 2.1)**: Check contrast, ARIA labels, and keyboard navigation.
- **Premium Aesthetics**: Validate glassmorphism effects, shadows, and micro-animations.
- **Mobile Experience**: Rigorous check on all dashboard pages.

### 4. **Code Quality & Maintenance**
- **Testing**: Review existing Vitest/Playwright setup. Identify gaps in test coverage.
- **Scalability**: Audit the Scanner Engine (Playwright) performance under load. Are there memory leaks or potential blockages?
- **Error Handling**: Are errors communicated clearly to the user? (Sentry integration status).

**Test Credentials:**
> [!IMPORTANT]
> Use the following account for deep testing of the dashboard:
> - **Email**: `tester1@dsgvo-scanner.de`
> - **Password**: `ScannerTest2026`

**Output Template:**
Provide a detailed report in `AUDIT_REPORT.md` categorized by:
1. **Critical Vulnerabilities** (Immediate fix).
2. **Legal & Compliance Risks** (High priority).
3. **UX & Performance Improvements** (Optimization).
4. **Codebase Recommendations** (Maintainability).

---
**Start by reading `PROJECT_MAP.md` and `task.md` to understand the current trajectory.**
