# Changelog

### [0.2.0] - 2026-02-01
#### Добавлено
- **Email Service (Resend)**: Интеграция API для отправки ссылок на отчеты клиентам.
- **Риск-Аналитика**: Динамические графики (AreaChart) на Dashboard для отслеживания среднего скора.
- **SEO & Search**: Роботы (`robots.ts`), карта сайта (`sitemap.ts`) и JSON-LD микроразметка.
- **Resilient Scanning**: Оптимизация ожидания загрузки сайтов и ускоренная прокрутка для обнаружения всех метрик.
- **Copy-to-Clipboard**: Умный механизм копирования с поддержкой локальных (не HTTPS) сред и визуальным подтверждением.

#### Исправлено
- Исправлены таймауты при анализе "тяжелых" сайтов (переход на `load` событие).
- Улучшена иерархия SEO-заголовков (H1).
- Исправлено отображение немецких символов в PDF.

---

## [2026-02-01] - Major Architecture & UI Overhaul
### Added
- **Custom Hooks Implementation**: Extracted business logic into `useScanner`, `useWebsites`, `useDashboard`, `useSettings`, and `useScanDetail`.
- **Skeleton Loaders**: Integrated across all Dashboard pages for improved perceived performance.
- **Supabase Storage Support**: Added bucket and API logic for uploading agency logos.
- **Improved PDF Reporting**: 
    - Full German UTF-8 character support (Umlaute).
    - Modern Inter font integration.
    - Premium layout redesign with custom branding colors.

### Changed
- **Dashboard Refactoring**: Simplified page components by moving data fetching to hooks.
- **Polling Logic**: Optimized scanner status polling to reduce database load.
- **Settings Page**: Enhanced branding controls with real image uploads.

### Fixed
- UTF-8 encoding issues in PDF generation.
- Website list sync errors during active scans.
