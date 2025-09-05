-- Ensure the enum exists
do $$ begin
  create type public.user_role as enum ('patient','doctor','admin');
exception when duplicate_object then null; end $$;

-- Profiles table with correct columns
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'patient',
  full_name text,
  age smallint check (age is null or age between 1 and 120),
  weight_kg numeric(5,2) check (weight_kg is null or weight_kg between 0 and 500),
  height_cm numeric(5,2) check (height_cm is null or height_kg between 0 and 300),
  gender text,
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

-- If you previously had profiles.id, migrate it:
-- alter table public.profiles rename column id to user_id;

-- Update timestamp trigger
create or replace function public.profiles_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
for each row execute function public.profiles_updated_at();

-- Drop any old new-user trigger that inserts into wrong columns
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Correct new-user trigger to insert user_id/full_name
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles(user_id, role, full_name)
  values (new.id, 'patient', coalesce(new.raw_user_meta_data->>'full_name',''));
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();


drop trigger if exists on_auth_user_created on auth.users;