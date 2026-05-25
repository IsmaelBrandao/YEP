-- YEP — esquema do banco (Postgres / Supabase)
-- Rode este SQL no Supabase: Dashboard -> SQL Editor -> New query -> Run.
-- Cria as tabelas de favoritos e reportes de preço, com Row Level Security
-- garantindo que cada usuário só acessa os próprios dados.

-- ── Favoritos ────────────────────────────────────────────────────────────
create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  station_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, station_id)
);

alter table public.favorites enable row level security;

create policy "favorites_select_own"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "favorites_insert_own"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites_delete_own"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- ── Reportes de preço ────────────────────────────────────────────────────
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  station_id text not null,
  station_name text not null,
  fuel text not null,
  price numeric(5, 2) not null,
  photo_uri text,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "reports_select_own"
  on public.reports for select
  using (auth.uid() = user_id);

create policy "reports_insert_own"
  on public.reports for insert
  with check (auth.uid() = user_id);

create index if not exists reports_user_created_idx
  on public.reports (user_id, created_at desc);

-- ── Serviços do posto (crowdsourcing) ────────────────────────────────────
-- Cada usuário registra os serviços que viu em um posto. O app agrega os
-- registros de todos (leitura pública) para mostrar o consenso da comunidade.
create table if not exists public.station_services (
  user_id uuid not null references auth.users (id) on delete cascade,
  station_id text not null,
  conveniencia boolean not null default false,
  calibragem boolean not null default false,
  lavagem boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, station_id)
);

alter table public.station_services enable row level security;

create policy "station_services_select_all"
  on public.station_services for select
  using (true);

create policy "station_services_insert_own"
  on public.station_services for insert
  with check (auth.uid() = user_id);

create policy "station_services_update_own"
  on public.station_services for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "station_services_delete_own"
  on public.station_services for delete
  using (auth.uid() = user_id);

create index if not exists station_services_station_idx
  on public.station_services (station_id);
