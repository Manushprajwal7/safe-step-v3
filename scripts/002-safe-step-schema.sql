/* Safe Step - Core Schema, Constraints, Indices, RLS */
/* Initial schema for profiles, onboarding, sessions, samples, reports, assessments, chat, devices and helper security functions */

-- Prereqs
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- helper updated_at function (idempotent)
do $$
begin
  create or replace function public.set_current_timestamp_updated_at()
  returns trigger
  language plpgsql
  as $f$
  begin
    new.updated_at = now();
    return new;
  end;
  $f$;
exception when duplicate_function then
  -- ignore
end $$;

-- 1) Profiles (Auth users metadata and roles)
create table if not exists public.profiles (
  id uuid primary key default auth.uid(),
  email text unique,
  full_name text,
  role text not null default 'patient' check (role in ('patient','doctor','admin')),
  created_at timestamptz not null default now()
);

-- Keep profiles synced on signup if not present
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 2) Onboarding (patient medical intake)
create table if not exists public.onboarding (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  age int check (age between 1 and 120),
  weight_kg numeric(5,2) check (weight_kg > 0),
  height_cm numeric(5,2) check (height_cm > 0),
  gender text,
  profession text,
  diabetes_type text check (diabetes_type in ('type1','type2','prediabetic','none')),
  diagnosis_date date,
  foot_symptoms text[],
  pre_existing_conditions text[],
  activity_level text,
  footwear_type text,
  prior_injuries text,
  blood_sugar_mgdl numeric(6,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_onboarding_user on public.onboarding(user_id);
create trigger set_onboarding_updated_at
before update on public.onboarding
for each row execute procedure public.set_current_timestamp_updated_at();

-- 3) Sessions (patient capture sessions) and 4) Session Samples
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active','paused','ended')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  note text
);
create index if not exists idx_sessions_user on public.sessions(user_id);

create table if not exists public.session_samples (
  id bigserial primary key,
  session_id uuid not null references public.sessions(id) on delete cascade,
  captured_at timestamptz not null default now(),
  -- pressure matrix or vector from sensors (esp32)
  pressure jsonb not null,
  foot text default 'both' check (foot in ('left','right','both'))
);
create index if not exists idx_samples_session on public.session_samples(session_id);
create index if not exists idx_samples_captured_at on public.session_samples(captured_at);

-- 5) Reports / Predictions
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete set null,
  condition text not null,                      -- e.g., normal | prediabetic | neuropathy
  confidence numeric(5,2) check (confidence between 0 and 100),
  model_version text,
  recommendation text,
  created_at timestamptz not null default now()
);
create index if not exists idx_reports_user on public.reports(user_id);
create index if not exists idx_reports_session on public.reports(session_id);

-- 6) Assessments (daily foot check)
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  check_date timestamptz not null default now(),
  symptoms text[],
  feeling text check (feeling in ('good','okay','bad')),
  notes text
);
create index if not exists idx_assessments_user on public.assessments(user_id);

-- 7) Chat messages
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_chat_user on public.chat_messages(user_id);

-- 8) Device registrations (optional ESP32 pairing)
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  esp32_id text,
  token text,
  created_at timestamptz not null default now()
);
create index if not exists idx_devices_user on public.devices(user_id);

-- Security helpers (so RLS can elevate admins/doctors cleanly)
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as
$$ select exists(select 1 from public.profiles p where p.id = uid and p.role = 'admin') $$;

create or replace function public.is_doctor(uid uuid)
returns boolean language sql stable as
$$ select exists(select 1 from public.profiles p where p.id = uid and p.role = 'doctor') $$;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.onboarding enable row level security;
alter table public.sessions enable row level security;
alter table public.session_samples enable row level security;
alter table public.reports enable row level security;
alter table public.assessments enable row level security;
alter table public.chat_messages enable row level security;
alter table public.devices enable row level security;

-- Profiles RLS
drop policy if exists "self read profile" on public.profiles;
create policy "self read profile" on public.profiles
for select using (id = auth.uid() or public.is_admin(auth.uid()) or public.is_doctor(auth.uid()));

drop policy if exists "self update profile" on public.profiles;
create policy "self update profile" on public.profiles
for update using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "admin manage profiles" on public.profiles;
create policy "admin manage profiles" on public.profiles
for all using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Onboarding RLS
drop policy if exists "own onboarding" on public.onboarding;
create policy "own onboarding" on public.onboarding
for all using (user_id = auth.uid() or public.is_admin(auth.uid()) or public.is_doctor(auth.uid()))
with check (user_id = auth.uid() or public.is_admin(auth.uid()) or public.is_doctor(auth.uid()));

-- Sessions RLS
drop policy if exists "own sessions" on public.sessions;
create policy "own sessions" on public.sessions
for all using (user_id = auth.uid() or public.is_admin(auth.uid()) or public.is_doctor(auth.uid()))
with check (user_id = auth.uid() or public.is_admin(auth.uid()) or public.is_doctor(auth.uid()));

-- Session samples RLS (by parent session)
drop policy if exists "by parent session" on public.session_samples;
create policy "by parent session" on public.session_samples
for all using (
  exists(select 1 from public.sessions s
         where s.id = session_samples.session_id
           and (s.user_id = auth.uid() or public.is_admin(auth.uid()) or public.is_doctor(auth.uid())))
)
with check (
  exists(select 1 from public.sessions s
         where s.id = session_samples.session_id
           and (s.user_id = auth.uid() or public.is_admin(auth.uid())))
);

-- Reports RLS
drop policy if exists "own reports" on public.reports;
create policy "own reports" on public.reports
for all using (user_id = auth.uid() or public.is_admin(auth.uid()) or public.is_doctor(auth.uid()))
with check (user_id = auth.uid() or public.is_admin(auth.uid()) or public.is_doctor(auth.uid()));

-- Assessments RLS
drop policy if exists "own assessments" on public.assessments;
create policy "own assessments" on public.assessments
for all using (user_id = auth.uid() or public.is_admin(auth.uid()) or public.is_doctor(auth.uid()))
with check (user_id = auth.uid() or public.is_admin(auth.uid()));

-- Chat RLS
drop policy if exists "own chat" on public.chat_messages;
create policy "own chat" on public.chat_messages
for all using (user_id = auth.uid() or public.is_admin(auth.uid()) or public.is_doctor(auth.uid()))
with check (user_id = auth.uid() or public.is_admin(auth.uid()) or public.is_doctor(auth.uid()));

-- Devices RLS
drop policy if exists "own devices" on public.devices;
create policy "own devices" on public.devices
for all using (user_id = auth.uid() or public.is_admin(auth.uid()))
with check (user_id = auth.uid() or public.is_admin(auth.uid()));
