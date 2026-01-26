-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USER PROFILES
create table public.user_profiles (
  id uuid references auth.users on delete cascade not null primary key,
  company_name text,
  plan text check (plan in ('starter', 'professional', 'business')) default 'starter',
  website_limit int default 10,
  subscription_status text check (subscription_status in ('trial', 'active', 'past_due', 'canceled')) default 'trial',
  trial_ends_at timestamptz default (now() + interval '14 days'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for user_profiles
alter table public.user_profiles enable row level security;

create policy "Users can view own profile"
  on public.user_profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on public.user_profiles for update
  using ( auth.uid() = id );

-- 2. WEBSITES
create table public.websites (
  id uuid default uuid_generate_v4() primary key,
  url text not null,
  domain text not null,
  client_name text not null,
  owner_id uuid references auth.users not null,
  scan_frequency text check (scan_frequency in ('daily', 'weekly', 'monthly')) default 'weekly',
  last_scan_at timestamptz,
  next_scan_at timestamptz,
  status text check (status in ('active', 'paused', 'error')) default 'active',
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for websites
alter table public.websites enable row level security;

create policy "Users can view own websites"
  on public.websites for select
  using ( auth.uid() = owner_id );

create policy "Users can insert own websites"
  on public.websites for insert
  with check ( auth.uid() = owner_id );

create policy "Users can update own websites"
  on public.websites for update
  using ( auth.uid() = owner_id );

create policy "Users can delete own websites"
  on public.websites for delete
  using ( auth.uid() = owner_id );

-- 3. SCANS
create table public.scans (
  id uuid default uuid_generate_v4() primary key,
  website_id uuid references public.websites on delete cascade not null,
  status text check (status in ('pending', 'running', 'completed', 'failed')) default 'pending',
  violations_count int default 0,
  risk_score int default 100,
  results jsonb, -- Stores the JSON structure defined in ScanResults type
  error_log text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for scans
alter table public.scans enable row level security;

create policy "Users can view scans for their websites"
  on public.scans for select
  using ( exists (
    select 1 from public.websites
    where websites.id = scans.website_id
    and websites.owner_id = auth.uid()
  ));

create policy "Users can insert scans for their websites"
  on public.scans for insert
  with check ( exists (
    select 1 from public.websites
    where websites.id = scans.website_id
    and websites.owner_id = auth.uid()
  ));

-- Service Role Policy (Implicitly has full access, but being explicit for clarity/audit)
-- Note: Service Role bypasses RLS by default, so specific policies aren't strictly needed for it,
-- but good to keep in mind.

-- 4. REALTIME SETUP
-- Enable Realtime for 'scans' table so the worker can listen for new inserts
alter publication supabase_realtime add table public.scans;

-- 5. TRIGGER FOR UPDATED_AT
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_user_profiles_updated_at before update on public.user_profiles for each row execute procedure update_updated_at_column();
create trigger update_websites_updated_at before update on public.websites for each row execute procedure update_updated_at_column();
create trigger update_scans_updated_at before update on public.scans for each row execute procedure update_updated_at_column();
