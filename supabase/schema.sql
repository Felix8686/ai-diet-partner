-- AI Diet Partner MVP schema
-- 先用于定义数据边界；前端当前仍使用 mock data。

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  age int check (age between 16 and 100),
  sex text,
  height_cm numeric(5,2),
  weight_kg numeric(5,2),
  primary_goal text,
  weekly_food_budget numeric(10,2),
  weekday_cook_minutes int,
  outside_meals_per_week int,
  lunch_scene text,
  kitchen_capabilities text[] default '{}',
  liked_foods text[] default '{}',
  disliked_foods text[] default '{}',
  dietary_restrictions text[] default '{}',
  shopping_places text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists food_environment_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  source_place text,
  typical_price numeric(10,2),
  frequency text,
  availability_stability text,
  nutrition jsonb default '{}'::jsonb,
  user_feedback text,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  strategy text,
  status text not null default 'active',
  generated_from jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(user_id, week_start)
);

create table if not exists meal_plan_items (
  id uuid primary key default gen_random_uuid(),
  weekly_plan_id uuid not null references weekly_plans(id) on delete cascade,
  plan_date date not null,
  meal_kind text not null,
  title text not null,
  scene text,
  prep_minutes int,
  alternatives jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  weekly_plan_id uuid not null references weekly_plans(id) on delete cascade,
  name text not null,
  category text,
  amount text,
  estimated_price numeric(10,2),
  purchased boolean not null default false
);

create table if not exists daily_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_date date not null,
  execution_status text not null,
  snack_level text,
  deviation_reasons text[] default '{}',
  note text,
  created_at timestamptz not null default now(),
  unique(user_id, plan_date)
);

alter table profiles enable row level security;
alter table food_environment_items enable row level security;
alter table weekly_plans enable row level security;
alter table daily_feedback enable row level security;

create policy "profiles_owner" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "food_env_owner" on food_environment_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "weekly_plans_owner" on weekly_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_feedback_owner" on daily_feedback for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
