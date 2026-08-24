-- ============================================================================
-- Lead & Grow — core schema
-- Run against a Supabase Postgres project (SQL Editor, or `supabase db push`)
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- PROFILES  (one row per auth.users row)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  current_stage smallint not null default 1 check (current_stage between 1 and 5),
  streak_count integer not null default 0,
  last_active_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helper: is the current session an admin? (security-definer avoids RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- LEADERSHIP PARAMETERS (the 12 dimensions)
-- ----------------------------------------------------------------------------
create table if not exists public.parameters (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  icon text,
  sort_order smallint not null default 0
);

-- ----------------------------------------------------------------------------
-- ASSESSMENT QUESTIONS (36 questions, mapped to the 12 parameters)
-- ----------------------------------------------------------------------------
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  parameter_id uuid not null references public.parameters (id) on delete cascade,
  prompt text not null,
  sort_order smallint not null default 0,
  active boolean not null default true
);

-- ----------------------------------------------------------------------------
-- LEADERSHIP DEVELOPMENT STAGES (reference data, 5 stages)
-- ----------------------------------------------------------------------------
create table if not exists public.leadership_stages (
  id smallint primary key,
  key text not null unique,
  name text not null,
  description text,
  min_score smallint not null default 0,
  sort_order smallint not null default 0
);

-- ----------------------------------------------------------------------------
-- ASSESSMENT SESSIONS + ANSWERS + PER-PARAMETER SCORES
-- ----------------------------------------------------------------------------
create table if not exists public.assessment_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  overall_score numeric(5, 2),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.assessment_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.assessment_sessions (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  value smallint not null check (value between 1 and 5),
  created_at timestamptz not null default now(),
  unique (session_id, question_id)
);

create table if not exists public.parameter_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.assessment_sessions (id) on delete cascade,
  parameter_id uuid not null references public.parameters (id) on delete cascade,
  score numeric(5, 2) not null,
  unique (session_id, parameter_id)
);

-- ----------------------------------------------------------------------------
-- CONTENT LIBRARY (recommended videos / exercises across learning categories)
-- ----------------------------------------------------------------------------
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (
    category in (
      'YOGA', 'BREATHWORK', 'MEDITATION', 'MENTAL_RESET', 'VEDIC_WISDOM',
      'COMMUNICATION', 'EMOTIONAL_INTELLIGENCE', 'LEADERSHIP',
      'SELF_AWARENESS', 'STRESS_MANAGEMENT'
    )
  ),
  practice_stage text not null default 'learn' check (practice_stage in ('reset', 'learn', 'practice', 'reflect')),
  description text,
  video_url text,
  duration_minutes smallint not null default 5,
  target_parameter_id uuid references public.parameters (id) on delete set null,
  min_score smallint not null default 0,
  max_score smallint not null default 100,
  active boolean not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- DAILY 15-MINUTE PRACTICE SESSIONS
-- ----------------------------------------------------------------------------
create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  practice_date date not null default current_date,
  content_item_id uuid references public.content_items (id) on delete set null,
  reset_done boolean not null default false,
  learn_done boolean not null default false,
  practice_done boolean not null default false,
  reflect_done boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, practice_date)
);

-- ----------------------------------------------------------------------------
-- REFLECTIONS / JOURNAL
-- ----------------------------------------------------------------------------
create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  practice_session_id uuid references public.practice_sessions (id) on delete set null,
  reflection_date date not null default current_date,
  prompt text,
  response text,
  mood text check (mood in ('great', 'good', 'okay', 'low')),
  key_takeaways text[] default '{}',
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- ACHIEVEMENTS
-- ----------------------------------------------------------------------------
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  description text,
  icon text,
  sort_order smallint not null default 0
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.parameters enable row level security;
alter table public.questions enable row level security;
alter table public.leadership_stages enable row level security;
alter table public.assessment_sessions enable row level security;
alter table public.assessment_answers enable row level security;
alter table public.parameter_scores enable row level security;
alter table public.content_items enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.reflections enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

-- profiles: user reads/updates self; admin reads/updates all
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- reference tables: readable by any authenticated user, writable by admin only
create policy "parameters_read_all" on public.parameters for select using (auth.role() = 'authenticated');
create policy "parameters_write_admin" on public.parameters for all using (public.is_admin()) with check (public.is_admin());

create policy "questions_read_all" on public.questions for select using (auth.role() = 'authenticated');
create policy "questions_write_admin" on public.questions for all using (public.is_admin()) with check (public.is_admin());

create policy "stages_read_all" on public.leadership_stages for select using (auth.role() = 'authenticated');
create policy "stages_write_admin" on public.leadership_stages for all using (public.is_admin()) with check (public.is_admin());

create policy "content_read_all" on public.content_items for select using (auth.role() = 'authenticated');
create policy "content_write_admin" on public.content_items for all using (public.is_admin()) with check (public.is_admin());

create policy "achievements_read_all" on public.achievements for select using (auth.role() = 'authenticated');
create policy "achievements_write_admin" on public.achievements for all using (public.is_admin()) with check (public.is_admin());

-- user-owned data: own rows only, admin sees/edits all
create policy "sessions_owner_or_admin" on public.assessment_sessions
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "answers_owner_or_admin" on public.assessment_answers
  for all using (
    exists (select 1 from public.assessment_sessions s where s.id = session_id and (s.user_id = auth.uid() or public.is_admin()))
  ) with check (
    exists (select 1 from public.assessment_sessions s where s.id = session_id and (s.user_id = auth.uid() or public.is_admin()))
  );

create policy "scores_owner_or_admin" on public.parameter_scores
  for all using (
    exists (select 1 from public.assessment_sessions s where s.id = session_id and (s.user_id = auth.uid() or public.is_admin()))
  ) with check (
    exists (select 1 from public.assessment_sessions s where s.id = session_id and (s.user_id = auth.uid() or public.is_admin()))
  );

create policy "practice_owner_or_admin" on public.practice_sessions
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "reflections_owner_or_admin" on public.reflections
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "user_achievements_owner_or_admin" on public.user_achievements
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

-- ----------------------------------------------------------------------------
-- keep profiles.updated_at fresh
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute procedure public.touch_updated_at();
