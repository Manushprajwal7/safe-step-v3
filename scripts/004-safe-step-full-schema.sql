-- 0) SCHEMA NOTES
-- Uses auth.users as identity. profiles.user_id is PK and FK to auth.users.
-- Roles: 'patient' | 'doctor' | 'admin'. Defaults to 'patient'.
-- All tables enable RLS with least-privilege policies.

-- 1) ENUMS
do $$ begin
  create type public.user_role as enum ('patient','doctor','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.session_status as enum ('active','paused','ended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.foot_side as enum ('left','right','both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.diabetes_type as enum ('type1','type2','prediabetic','unspecified');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.mood3 as enum ('good','okay','bad');
exception when duplicate_object then null; end $$;

-- 2) UTILS
create or replace function public.current_user_id() returns uuid
language sql stable as $$
  select auth.uid()
$$;

create or replace function public.is_admin() returns boolean
language sql stable as $$
  select exists(
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  )
$$;

create or replace function public.is_doctor() returns boolean
language sql stable as $$
  select exists(
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'doctor'
  )
$$;

-- 3) TABLES

-- 3.1 PROFILES
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'patient',
  full_name text,
  age smallint check (age is null or age between 1 and 120),
  weight_kg numeric(5,2) check (weight_kg is null or weight_kg between 0 and 500),
  height_cm numeric(5,2) check (height_cm is null or height_cm between 0 and 300),
  gender text check (gender in ('male','female','other') or gender is null),
  profession text,
  diabetes public.diabetes_type default 'unspecified',
  diagnosis_date date,
  symptoms text[],
  conditions text[],
  activity_level text,
  footwear_type text,
  prior_injuries text,
  blood_sugar_mg_dl numeric(6,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.profiles_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
for each row execute function public.profiles_updated_at();

-- 3.2 SESSIONS
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(user_id) on delete cascade,
  status public.session_status not null default 'active',
  label text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

-- 3.3 SESSION SAMPLES (pressure matrices)
create table if not exists public.session_samples (
  id bigserial primary key,
  session_id uuid not null references public.sessions(id) on delete cascade,
  ts timestamptz not null default now(),
  foot public.foot_side not null default 'both',
  grid_width smallint not null default 3 check (grid_width between 1 and 64),
  grid_height smallint not null default 3 check (grid_height between 1 and 64),
  pressure jsonb not null,       -- 2D array numbers
  stats jsonb,                   -- e.g. {"mean":12.3,"max":45}
  created_at timestamptz not null default now()
);

create index if not exists idx_session_samples_session_ts on public.session_samples(session_id, ts desc);

-- 3.4 PREDICTIONS
create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  condition text not null,       -- normal | prediabetic | neuropathy | ...
  confidence numeric(5,4) check (confidence between 0 and 1),
  model_version text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- 3.5 ASSESSMENTS (Daily Foot Check)
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(user_id) on delete cascade,
  symptoms jsonb,     -- keys: cuts, sores, swelling, redness, blisters, ingrown_toenails
  mood public.mood3,
  notes text,
  created_at timestamptz not null default now()
);

-- 3.6 REPORTS (aggregates / exports / generated docs)
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(user_id) on delete cascade,
  type text not null check (type in ('session','assessment','manual')),
  payload jsonb not null,
  created_at timestamptz not null default now()
);

-- 3.7 CHAT MESSAGES (simple)
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(user_id) on delete cascade,
  sender text not null check (sender in ('patient','assistant','staff')),
  message text not null,
  created_at timestamptz not null default now()
);

-- 3.8 ADMIN ANALYTICS VIEW
create or replace view public.admin_kpis as
select
  (select count(*)::int from public.profiles) as total_patients,
  coalesce(round(avg(s.avg_score)::numeric,0),0) as avg_health_score,
  (select count(*)::int from public.sessions s2 where s2.started_at::date = now()::date) as sessions_today,
  (select count(*)::int from public.predictions p where lower(p.condition) like '%high%risk%') as high_risk_patients
from (
  -- naive score (example): lower mean pressure => better
  select ss.session_id, avg((ss.pressure->0->>0)::numeric) as avg_score
  from public.session_samples ss
  group by ss.session_id
) s;

-- 4) RLS
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.session_samples enable row level security;
alter table public.predictions enable row level security;
alter table public.assessments enable row level security;
alter table public.reports enable row level security;
alter table public.chat_messages enable row level security;

-- PROFILES
drop policy if exists p_profiles_self_select on public.profiles;
create policy p_profiles_self_select on public.profiles
for select using (user_id = auth.uid() or public.is_admin() or public.is_doctor());

-- Separate policies for insert and update
-- Insert policy
drop policy if exists p_profiles_self_insert on public.profiles;
create policy p_profiles_self_insert on public.profiles
for insert with check (user_id = auth.uid());

-- Update policy
drop policy if exists p_profiles_self_update on public.profiles;
create policy p_profiles_self_update on public.profiles
for update using (user_id = auth.uid() or public.is_admin());

-- SESSIONS
drop policy if exists p_sessions_patient on public.sessions;
create policy p_sessions_patient on public.sessions
for all using (patient_id = auth.uid() or public.is_admin() or public.is_doctor())
with check (patient_id = auth.uid() or public.is_admin());

-- SAMPLES
drop policy if exists p_samples_patient on public.session_samples;
create policy p_samples_patient on public.session_samples
for all using (
  exists (select 1 from public.sessions s where s.id = session_id and (s.patient_id = auth.uid() or public.is_admin() or public.is_doctor()))
)
with check (
  exists (select 1 from public.sessions s where s.id = session_id and (s.patient_id = auth.uid() or public.is_admin()))
);

-- PREDICTIONS
drop policy if exists p_predictions_patient on public.predictions;
create policy p_predictions_patient on public.predictions
for all using (
  exists (select 1 from public.sessions s where s.id = session_id and (s.patient_id = auth.uid() or public.is_admin() or public.is_doctor()))
)
with check (
  exists (select 1 from public.sessions s where s.id = session_id and (s.patient_id = auth.uid() or public.is_admin()))
);

-- ASSESSMENTS
drop policy if exists p_assessments_patient on public.assessments;
create policy p_assessments_patient on public.assessments
for all using (patient_id = auth.uid() or public.is_admin() or public.is_doctor())
with check (patient_id = auth.uid() or public.is_admin());

-- REPORTS
drop policy if exists p_reports_patient on public.reports;
create policy p_reports_patient on public.reports
for all using (patient_id = auth.uid() or public.is_admin() or public.is_doctor())
with check (patient_id = auth.uid() or public.is_admin());

-- CHAT
drop policy if exists p_chat_patient on public.chat_messages;
create policy p_chat_patient on public.chat_messages
for all using (patient_id = auth.uid() or public.is_admin() or public.is_doctor())
with check (patient_id = auth.uid() or public.is_admin());

-- 5) DEFAULT PROFILE HELPER
-- Create profile on user signup (can be triggered in Supabase SQL or with a trigger on auth.users).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles(user_id, role, full_name)
  values (new.id, 'patient', coalesce(new.raw_user_meta_data->>'full_name',''));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
