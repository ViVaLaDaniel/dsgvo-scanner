# Карта проекта DSGVO Scanner (Master Roadmap)

**Ready: 🚀 95% (Release Candidate)**
`[|||||||||||||.]`

> [!IMPORTANT]
> **Source of Truth:** См. [00_PROJECT_REALITY.md](./00_PROJECT_REALITY.md) для актуального статуса архитектуры и функционала.  
> **Market Strategy:** См. [ROADMAP.md](./ROADMAP.md) — план стать №1 на рынке.

## Обзор
SaaS-платформа для автоматического аудита веб-сайтов на соответствие DSGVO (GDPR). Ориентирована на специалистов по защите данных (DSB) и веб-агентства.

**Deployment:** [https://dsgvo-scanner-plum.vercel.app/](https://dsgvo-scanner-plum.vercel.app/)
**Бизнес-модель:** B2B2B / White-Label SaaS
**Юридическая стратегия:** Индивидуальный предприниматель (Испания) -> Продажи в Германию (B2B).

## Технологический стек
- **Frontend:** Next.js 16.1.3 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4, Shadcn/UI
- **Backend / Database:** Supabase (PostgreSQL + Auth + RLS)
- **Scanner Engine:** Hybrid (Vercel + DigitalOcean Droplet with Playwright)
- **Payments:** Paddle (Merchant of Record)
- **Deployment:** Vercel (Region: Frankfurt `fra1`)

---

## 🏛 ФАЗА 0: Брендинг и Метаданные (Done)
- [x] **Метаданные приложения** (`app/layout.tsx`)
- [x] **Favicon:** Замена стандартного логотипа на символ щита/безопасности (SVG).
- [x] **OpenGraph (OG) теги:** Добавление `og:title`, `og:description`, `og:image`.

## ⚖️ ФАЗА 1: Юридическая база (In Progress)
*Цель: 100% соответствие для испанского ИП, продающего в Германию.*
- [x] **Страница Impressum** (`app/impressum/page.tsx`)
- [x] **Страница Datenschutz** (`app/datenschutz/page.tsx`)
- [ ] **Terms of Service (AGB):** ❌ Требуется создать страницу `app/agb/page.tsx`.
- [x] **Cookie Consent (Dogfooding):** Внедрение кастомного баннера.

## ⚙️ ФАЗА 2: Ядро сканера v1.0 (MVP Done)
*Цель: Точное обнаружение нарушений с помощью Headless Browser.*
- [x] **Архитектура сканера:** Hybrid (Vercel -> DigitalOcean).
- [x] **Playwright Integration:** Запуск Headless Chrome на дроплете.
- [x] **Модули обнаружения:**
    - Cookie Interceptor.
    - Request Interceptor (Google Fonts, GTM, GA, etc.).
    - Static HTML Analysis (Master Regex).

## 🚀 ФАЗА 2.5: Scanner 2.0 "110% Coverage" (Planned)
*Цель: Глубокий анализ и симуляция пользователя.*
- [ ] **Deep Crawl:** Рекурсивный обход внутренних страниц (Privacy Policy, Impressum, Checkout).
- [ ] **Smart Interaction:**
    - Клик "Reject All" в Cookie Banner.
    - Проверка блокировки скриптов после отказа.
- [ ] **Evidence Gathering:** Скриншоты нарушений (Google Maps, YouTube embeds).
- [ ] **Full Page Scroll:** Умный скролл для lazy-loading элементов.

## 💼 ФАЗА 3: Агентский и White-Label функционал (Done)
- [x] **White-Label настройки:** Логотип, цвета, футер.
- [x] **PDF Отчеты:** Генерация через `@react-pdf/renderer`.
- [x] **База данных (Multi-Tenant):** RLS защита.
- [x] **Email Integration:** Resend API.

## 💰 ФАЗА 4: Монетизация (Done)
*Цель: Автоматизация доходов через Paddle.*
- [x] **Paddle Integration:** Webhook + SDK.
- [x] **Тарифные планы:** Starter, Professional, Business.
- [x] **Subscription Logic:** Обновление лимитов в БД при оплате.

## 🛠 ФАЗА 5: Инфраструктура и DevOps (Done)
- [x] **CI/CD:** GitHub Actions -> Vercel.
- [x] **Тестирование:** Vitest + Playwright.
- [x] **Локация серверов:** Frankfurt `fra1`.

## 🛡️ ФАЗА 6: Безопасность (In Progress)
- [x] **RLS Audit:** Выполнено.
- [x] **Input Sanitization:** Zod.
- [ ] **Security Headers:** Content-Security-Policy review.

## 📈 Текущий статус функционала
- [x] Авторизация (Supabase).
- [x] Dashboard.
- [x] Юридические страницы (кроме AGB).
- [x] Сканер (v1.0).
- [x] Оплата (Paddle).

---
**Next Steps Priority:**
1. Создать AGB.
2. Спроектировать Scanner 2.0.
