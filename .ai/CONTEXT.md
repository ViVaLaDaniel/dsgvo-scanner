# DSGVO Scanner - AI Context & Guidelines

## 1. Project Overview
**Name:** DSGVO Scanner
**Goal:** SaaS for German Data Protection Officers (DSB) to scan websites for GDPR compliance.
**Current Status:** MVP Phase.

## 2. Tech Stack (Strict)
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend/DB:** Supabase (Auth, Postgres)
- **Payments:** Paddle
- **Testing:** Vitest (Unit), Playwright (E2E)

## 3. Coding Standards ("The Rules")
1.  **Language:** 
    - Code structures (variables, functions, comments) must be in **English**.
    - User Interface (Text, Labels, Alerts) must be in **German**.
2.  **Architecture:**
    - Use Server Components by default. Use `"use client"` only when necessary.
    - Modular grouping: `/components/domain-name/` (e.g., `/components/reporting`, `/components/scanning`).
3.  **Quality:**
    - No `any` types. Strict Zod validation for all inputs.
    - Accessibility (WCAG) is mandatory.

## 4. Current Objectives (Roadmap)
- Refactor scanning engine for stability.
- Enhance UI/UX to be "Premium & Trustworthy".
- Ensure 100% test coverage for critical paths.
