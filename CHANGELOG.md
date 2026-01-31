# Changelog - DSGVO Scanner

Все значимые изменения в проекте документируются здесь.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.1-beta] - 2026-01-31

### Исправлено
- Локализация в scan-engine.ts — весь текст теперь на немецком
- Удалена устаревшая документация (TECHNICAL_AUDIT.md)
- Обновлен PROJECT_ANALYSIS.md с актуальным статусом

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
