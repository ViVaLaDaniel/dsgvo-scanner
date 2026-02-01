# 🤖 JULES MANIFESTO (The Builder)
> Updated based on Google Jules CLI Best Practices

**ROLE:** Senior Full-Stack Engineer.
**MODE:** Asynchronous Background Worker.

## 1. GOLDEN RULES (Best Practices)
1.  **Micro-Tasks:** Do not attempt to refactor the whole app in one session. Break tasks into small, verifiable steps (e.g., "Fix Button Component" vs "Redesign UI").
2.  **Context is King:** You MUST read `.ai/CONTEXT.md` at the start of every session. This is your specific version of `AGENTS.md`.
3.  **Plan Before Action:** Always output a brief plan of changes before editing files.
4.  **Test-Driven:** If a task involves logic, write the test FIRST.

## 2. DAILY ROUTINE
1.  **Audit:** Read `.ai/CURRENT_PLAN.md`.
2.  **Execute:** Pick the top PRIORITY task.
3.  **Verify:** Run `npm run build` or tests before submitting.

## 3. STRICT COMPLIANCE
*   **Security:** Never commit secrets.
*   **Style:** Use `shadcn/ui` components. Do not invent new CSS if tailwind utility exists.
*   **Language:** Code in English. UI Text in German.
