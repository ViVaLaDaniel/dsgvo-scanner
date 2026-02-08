# Changelog - DSGVO Scanner

Все значимые изменения в проекте документируются здесь.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]
### Added
- **Market Leader Roadmap**: единая стратегия и фазы роста до №1 позиции.
### Changed
- Документация синхронизирована с Roadmap (ссылки и направления).

## [0.2.0] - 2026-02-01
### Added
- **Email Service (Resend)**: Интеграция API для отправки ссылок на отчеты клиентам.
- **Риск-Аналитика**: Динамические графики (AreaChart) на Dashboard для отслеживания среднего скора.
- **SEO & Search**: Роботы (`robots.ts`), карта сайта (`sitemap.ts`) и JSON-LD микроразметка.
- **Resilient Scanning**: Оптимизация ожидания загрузки сайтов и ускоренная прокрутка для обнаружения всех метрик.
- **Copy-to-Clipboard**: Умный механизм копирования с поддержкой локальных (не HTTPS) сред и визуальным подтверждением.
- **Custom Hooks Implementation**: Extracted business logic into `useScanner`, `useWebsites`, `useDashboard`, `useSettings`, and `useScanDetail`.
- **Skeleton Loaders**: Integrated across all Dashboard pages for improved perceived performance.
- **Supabase Storage Support**: Added bucket and API logic for uploading agency logos.
- **Improved PDF Reporting**: Full German UTF-8 character support, Inter font integration, and premium layout redesign.

### Changed
- **Dashboard Refactoring**: Simplified page components by moving data fetching to hooks.
- **Polling Logic**: Optimized scanner status polling to reduce database load.
- **Settings Page**: Enhanced branding controls with real image uploads.

### Fixed
- Исправлены таймауты при анализе "тяжелых" сайтов (переход на `load` событие).
- Улучшена иерархия SEO-заголовков (H1).
- Исправлено отображение немецких символов в PDF.
- UTF-8 encoding issues in PDF generation.
- Website list sync errors during active scans.

---

## [1.0.5-beta] - 2026-01-31

### Добавлено
- **Paddle Billing Integration**: Полный цикл монетизации с вебхуками.
- **Remote Browser Support**: Поддержка `Browserless.io` для работы на Vercel.
- **Dashboard Progress Bars**: Визуализация лимитов сайтов в реальном времени.

### Исправлено
- **Purge Russian Text**: Полная очистка интерфейса от остатков русского языка.
- **Vercel Build Fix**: Удален `pnpm-lock.yaml`, переход на стандартный `npm`.
- **Scan Schema Migration**: Исправлены ошибки 500 при сканировании из-за отсутствующих колонок.
- **Limit Enforcement**: Блокировка добавления сайтов при превышении лимита тарифа.

---

## [1.0.1-beta] - 2026-01-31

---

## [1.0.0-beta] - 2026-01-27

### Добавлено
- **Профессиональный Cookie Banner** в соответствии с TCF 2.2/TTDSG
- **Плавный кастомный скролл** с ускорением
- **Интерактивный Demo Slider** с автопереключением
- **Секция "Счастливые команды"** — социальное доказательство
- **Модальное окно Demo Request** с формой
- **Упрощенный Auth Flow** — только Email/Password + Request форма

### Изменено
- Удалены все метки "Beta" из UI — Production Ready
- Упрощен нижний CTA блок

### Безопасность
- Добавлена Zod валидация во все формы Dashboard
- Проверен RLS на всех таблицах Supabase

---

## [0.9.0-alpha] - 2026-01-26

### Добавлено
- **Инфраструктура тестирования**: Vitest + Playwright
- Unit тесты для scan-engine
- E2E тесты для auth flow

### Исправлено
- Проблемы с Node.js путями на Windows

---

## [0.8.0-alpha] - 2026-01-19

### Добавлено
- **Playwright Scanner Engine** — реальное сканирование сайтов
- Network Interception для Google Fonts, GTM, GA, YouTube, FontAwesome
- Cookie анализ до согласия пользователя
- Auto-scroll для trigger lazy-loaded ресурсов
- API Route `/api/scan` с полной интеграцией

### Изменено
- Миграция с mock сканера на настоящий Playwright

---

## [0.7.0-alpha] - 2026-01-15

### Добавлено
- **PDF отчеты** с @react-pdf/renderer
- White-Label брендинг в отчетах
- Таблица `agencies` для мульти-тенантности

---

## [0.6.0-alpha] - 2026-01-10

### Добавлено
- **Supabase интеграция** — Auth + Database
- Таблицы: `user_profiles`, `websites`, `scans`
- RLS политики для всех таблиц
- Триггер автосоздания профиля при регистрации

---

## [0.5.0-alpha] - 2026-01-05

### Добавлено
- **Dashboard UI** — статистика, управление сайтами
- Страницы Impressum и Datenschutz
- Базовая структура проекта Next.js 15+

---

## [0.1.0-alpha] - 2024-12-20

### Добавлено
- Инициализация проекта
- Next.js + Tailwind CSS + Shadcn/UI
- Базовые UI компоненты
