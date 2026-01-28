# Карта проекта DSGVO Scanner (Master Roadmap)

**Ready: 🟢 85%**
`[|||||||||--]`

## Обзор
SaaS-платформа для автоматического аудита веб-сайтов на соответствие DSGVO (GDPR). Ориентирована на специалистов по защите данных (DSB) и веб-агентства.

**Бизнес-модель:** B2B2B / White-Label SaaS
**Юридическая стратегия:** Индивидуальный предприниматель (Испания) -> Продажи в Германию (B2B).

## Технологический стек
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4, Shadcn/UI
- **Backend / Database:** Supabase (PostgreSQL + Auth + RLS)
- **Scanner Engine:** Playwright (Headless Browser) - *Requires migration to external microservice*
- **Payments:** Paddle (Merchant of Record) - *Pending Implementation*
- **Deployment:** Vercel (Region: Frankfurt `fra1`)

## 🏛 ФАЗА 0: Брендинг и Метаданные (Immediate)
- [x] **Метаданные приложения** (`app/layout.tsx`)
- [x] **Favicon:** Замена стандартного логотипа на символ щита/безопасности (SVG).
- [x] **OpenGraph (OG) теги:** Добавление `og:title`, `og:description`, `og:image`.

## ⚖️ ФАЗА 1: Юридическая база (Spain-Safe Strategy)
- [x] **Страница Impressum** (`app/impressum/page.tsx`)
- [x] **Страница Datenschutz** (`app/datenschutz/page.tsx`)
- [x] **Terms of Service (AGB):** Включен B2B дисклеймер.
- [x] **Cookie Consent (Dogfooding):** Внедрение кастомного баннера.

## ⚙️ ФАЗА 2: Ядро сканера (Technical)
- [x] **Архитектура сканера:** Базовая логика на API Route (Note: Needs optimization for Vercel timeouts).
- [x] **Playwright Integration:** Переход на Playwright для глубокого анализа сайтов.
- [x] **Симуляция поведения:** Скролл, ожидание `networkidle`.
- [x] **Модули обнаружения:** Cookie Interceptor, Request Interceptor (Google Fonts, GTM).

## 💼 ФАЗА 3: Агентский и White-Label функционал
- [x] **White-Label настройки:** Логотип, цвета, футер.
- [x] **PDF Отчеты:** Генерация через `@react-pdf/renderer` с брендингом агентства.
- [x] **База данных (Multi-Tenant):** Таблица `Agencies` с RLS защитой.

## 💰 ФАЗА 4: Монетизация и Checkout
- [ ] **Paddle Integration:** Использование Paddle как Merchant of Record (VAT, налоги).
- [ ] **Тарифные планы:** Starter, Agency, Enterprise.
- [ ] **B2B Waiver:** Чекбокс "Widerrufsrechtverzicht" на чекауте.

## 🛠 ФАЗА 5: Инфраструктура и DevOps
- [x] **CI/CD:** GitHub Actions -> Vercel.
- [x] **Тестирование:** Vitest + Playwright.
- [ ] **Error Tracking:** Интеграция Sentry.io.
- [x] **Локация серверов:** Frankfurt `fra1`.

## 🛡️ ФАЗА 6: Безопасность и Hardening (Security First)
- [x] **RLS Audit:** Проверка всех таблиц (Passed by Jule).
- [x] **SQL Injection Protection:** Zod валидация.
- [ ] **Scanner Isolation:** Вынос сканера в Docker/Microservice.

## ✨ ФАЗА 7: Профессиональный UI/UX и Compliance
- [x] **Professional Cookie Consent:** Реализация баннера.
- [x] **Smooth Custom Scrolling:** Плавный скролл.
- [x] **Mobile Responsiveness (NEW):**
    - [x] **Mobile Navbar:** Реализовано гамбургер-меню для Лендинга и Дашборда.
    - [x] **Layout Fixes:** Исправлены переполнения (overflow) на мобильных.
    - [x] **Button Alignment:** Адаптация кнопок в Hero-секции и карточках.
- [x] **Interactive Demo Slider:** Автоматический слайдер.
- [x] **Trust & Social Proof:** Секция "Счастливые команды".
- [ ] **Localization Polish:** Удаление русского текста из UI (Pending).

## 📢 ФАЗА 8: Маркетинг и Продвижение
- [ ] **LinkedIn Outreach**
- [ ] **German Platforms**
- [ ] **Content Strategy**

---
**Recent Updates (Jule Audit):**
- Added `AUDIT_REPORT.md` with critical architecture findings.
- Fixed Mobile Navigation & Layout issues (Navbar missing, content overflow).
