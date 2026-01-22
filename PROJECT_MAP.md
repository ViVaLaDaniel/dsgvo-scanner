# Карта проекта DSGVO Scanner (Supabase Edition)

## Обзор
Приложение SaaS для автоматической проверки веб-сайтов на соответствие DSGVO (GDPR). Ориентировано на агентства и внешних специалистов по защите данных (DSB).

## Технологический стек
- **Frontend:** Next.js 15+ (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4, Shadcn/UI, Lucide React
- **Backend / Database:** Supabase (PostgreSQL + Auth + RLS)
- **Deployment:** Vercel

## Структура базы данных (Supabase)
### `user_profiles`
Расширенная информация о пользователях (связана с `auth.users`).
- `id`: UUID (FK к auth.users)
- `company_name`: Название компании
- `plan`: Тарифный план (starter, professional, business)
- `website_limit`: Лимит сайтов
- `subscription_status`: Статус подписки (trial, active, past_due, canceled)

### `websites`
Сайты, добавленные пользователями для мониторинга.
- `id`: UUID
- `url`: URL сайта
- `domain`: Домен (извлекается из URL)
- `client_name`: Имя манданта (клиента)
- `owner_id`: Ссылка на владельца (auth.users)
- `scan_frequency`: Частота сканирования (daily, weekly, monthly)
- `status`: Статус (active, paused, error)

### `scans`
История и результаты сканирований.
- `id`: UUID
- `website_id`: Ссылка на сайт
- `status`: Статус (pending, running, completed, failed)
- `violations_count`: Кол-во нарушений
- `risk_score`: Оценка риска (0-100)
- `results`: JSONB с деталями (Google Fonts, Cookies, etc.)

## Структура файлов
- `/app`: Маршруты приложения
  - `/dashboard`: Защищенная зона (обзор, список сайтов, настройки)
  - `/login`, `/register`: Аутентификация
- `/lib/supabase`: Клиенты Supabase (browser/server)
- `/types/supabase.ts`: TypeScript интерфейсы для БД
- `middleware.ts`: Защита маршрутов и управление сессиями

## Текущий статус функционала
- [x] Миграция на Supabase (Auth + DB)
- [x] Аутентификация (SignUp с метаданными, SignIn, SignOut)
- [x] Middleware защита маршрутов (защита `/dashboard`)
- [x] CRUD веб-сайтов (Добавление/Удаление в Supabase)
- [x] Динамический Dashboard (загрузка реальных данных из Supabase)
- [ ] **Логика сканера** (Пока заглушка в БД)
- [ ] Детальный просмотр отчетов
- [ ] Настройки профиля
- [ ] Экспорт PDF
- [ ] Email уведомления