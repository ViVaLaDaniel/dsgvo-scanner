-- Phase 3: Agency & White-Label Setup

-- 1) Создание таблицы агентств
CREATE TABLE IF NOT EXISTS public.agencies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  brand_color TEXT NOT NULL DEFAULT '#2563eb',
  contact_email TEXT,
  report_footer TEXT NOT NULL DEFAULT 'Professionelles DSGVO-Monitoring',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_agency_owner UNIQUE (owner_id)
);

-- 2) RLS для агентств
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'agencies'
      AND policyname = 'Users can view own agency'
  ) THEN
    CREATE POLICY "Users can view own agency"
      ON public.agencies
      FOR SELECT
      USING (auth.uid() = owner_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'agencies'
      AND policyname = 'Users can insert own agency'
  ) THEN
    CREATE POLICY "Users can insert own agency"
      ON public.agencies
      FOR INSERT
      WITH CHECK (auth.uid() = owner_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'agencies'
      AND policyname = 'Users can update own agency'
  ) THEN
    CREATE POLICY "Users can update own agency"
      ON public.agencies
      FOR UPDATE
      USING (auth.uid() = owner_id)
      WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;

-- 3) Функция для автоматического создания агентства при создании профиля
CREATE OR REPLACE FUNCTION public.handle_new_agency()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.agencies (owner_id, name, contact_email)
  VALUES (
    NEW.id,
    NEW.company_name,
    (SELECT email FROM auth.users WHERE id = NEW.id)
  )
  ON CONFLICT (owner_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 4) Триггер на создание профиля (после handle_new_user)
DROP TRIGGER IF EXISTS on_user_profile_created ON public.user_profiles;
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_agency();

-- 5) Обратная совместимость: создание записей для существующих пользователей
INSERT INTO public.agencies (owner_id, name)
SELECT id, company_name FROM public.user_profiles
ON CONFLICT (owner_id) DO NOTHING;
