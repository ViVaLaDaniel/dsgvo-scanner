-- Database Schema for DSGVO Scanner (Synced with Production)

-- 0) Расширение для UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) Таблица профилей (связана с auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  company_name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter',
  website_limit INTEGER NOT NULL DEFAULT 10,
  subscription_status TEXT NOT NULL DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS для профилей
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON public.user_profiles
      FOR SELECT
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.user_profiles
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2) Таблица сайтов
CREATE TABLE IF NOT EXISTS public.websites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  client_name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scan_frequency TEXT NOT NULL DEFAULT 'weekly',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS для сайтов
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'websites'
      AND policyname = 'Users can view own websites'
  ) THEN
    CREATE POLICY "Users can view own websites"
      ON public.websites
      FOR SELECT
      USING (auth.uid() = owner_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'websites'
      AND policyname = 'Users can insert own websites'
  ) THEN
    CREATE POLICY "Users can insert own websites"
      ON public.websites
      FOR INSERT
      WITH CHECK (auth.uid() = owner_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'websites'
      AND policyname = 'Users can update own websites'
  ) THEN
    CREATE POLICY "Users can update own websites"
      ON public.websites
      FOR UPDATE
      USING (auth.uid() = owner_id)
      WITH CHECK (auth.uid() = owner_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'websites'
      AND policyname = 'Users can delete own websites'
  ) THEN
    CREATE POLICY "Users can delete own websites"
      ON public.websites
      FOR DELETE
      USING (auth.uid() = owner_id);
  END IF;
END $$;

-- 3) Таблица результатов сканирования
CREATE TABLE IF NOT EXISTS public.scans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  violations_count INTEGER DEFAULT 0,
  risk_score INTEGER DEFAULT 0,
  results JSONB,
  error_log TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS для scans
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'scans'
      AND policyname = 'Users can view own scans'
  ) THEN
    CREATE POLICY "Users can view own scans"
      ON public.scans
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.websites w
          WHERE w.id = scans.website_id
            AND w.owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'scans'
      AND policyname = 'Users can insert own scans'
  ) THEN
    CREATE POLICY "Users can insert own scans"
      ON public.scans
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.websites w
          WHERE w.id = scans.website_id
            AND w.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- 4) Таблица агентств (White-Label)
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

-- RLS для агентств
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

-- 4) Функция автосоздания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, company_name, plan, website_limit)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'Unbekannt'),
    COALESCE(NEW.raw_user_meta_data->>'plan', 'starter'),
    CASE
      WHEN NEW.raw_user_meta_data->>'plan' = 'professional' THEN 50
      WHEN NEW.raw_user_meta_data->>'plan' = 'business' THEN 200
      ELSE 10
    END
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 5) Функция для автоматического создания агентства
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

-- 6) Триггер
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- 7) Триггер на создание агентства
DROP TRIGGER IF EXISTS on_user_profile_created ON public.user_profiles;
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_agency();
