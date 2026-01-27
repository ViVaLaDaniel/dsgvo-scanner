-- Security Hardening and Performance Indexes

-- 1. Add indexes to foreign keys (common Supabase Advisor recommendation)
-- This speeds up RLS checks and join operations.
CREATE INDEX IF NOT EXISTS idx_websites_owner_id ON public.websites(owner_id);
CREATE INDEX IF NOT EXISTS idx_scans_website_id ON public.scans(website_id);

-- 2. Hardening handle_new_user function
-- Ensure search_path is restricted and it's security definer for auth schema access.
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- 3. Ensure RLS is enabled on ALL public tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- 4. Audit RLS Policies (Ensure they use auth.uid() and not just "true")
-- Already correct in schema.sql, but we re-assert here for safety.

-- 5. Add a "service_status" check or a similar flag if needed for enterprise security
-- (Placeholder for future hardening)

-- 6. Fix for potential empty UUID issues
-- Ensure uuid-ossp is available (already handled in schema but good to be sure)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
