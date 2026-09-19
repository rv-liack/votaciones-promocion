-- Migración 0001: esquema base de la plataforma de votación.
-- Regla central: el navegador NUNCA lee ni escribe tablas directamente.
-- Se activa RLS en todas las tablas SIN políticas para anon/authenticated.
-- Todo el acceso pasa por funciones SECURITY DEFINER (migración 0002).

create extension if not exists "pgcrypto";

-- Códigos de votación de un solo uso.
-- Código normalizado en mayúsculas, formato XXXX-XXXX,
-- alfabeto sin ambiguos: 23456789ABCDEFGHJKMNPQRSTUVWXYZ.
create table public.voter_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  batch text not null default 'main',
  used boolean not null default false,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  check (used = (used_at is not null))
);

-- Propuestas a calificar y votar.
create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  position int,
  promotion_name text,
  tagline text,
  description text,
  shirt_images text[] not null default '{}',
  jacket_images text[] not null default '{}',
  extra_info jsonb not null default '[]',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Votos anónimos: NO guardan referencia al código.
-- Varios votos/ratings comparten un ballot_id aleatorio generado por la función.
create table public.votes (
  ballot_id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals (id)
);

create table public.ratings (
  ballot_id uuid not null,
  proposal_id uuid not null references public.proposals (id),
  score smallint not null check (score between 1 and 10),
  primary key (ballot_id, proposal_id)
);

-- Registro de intentos de acceso para la limitación de intentos.
create table public.access_attempts (
  id bigint generated always as identity primary key,
  client_key text,
  success boolean not null,
  created_at timestamptz not null default now()
);
create index access_attempts_client_key_created_idx
  on public.access_attempts (client_key, created_at desc);

-- RLS activado en todas las tablas, sin políticas: anon/authenticated
-- no pueden leer ni escribir nada directamente.
alter table public.voter_codes enable row level security;
alter table public.proposals enable row level security;
alter table public.votes enable row level security;
alter table public.ratings enable row level security;
alter table public.access_attempts enable row level security;

-- Revocación explícita (defensa en profundidad; con RLS y sin
-- políticas el acceso directo ya está bloqueado).
revoke all on table public.voter_codes from anon, authenticated;
revoke all on table public.proposals from anon, authenticated;
revoke all on table public.votes from anon, authenticated;
revoke all on table public.ratings from anon, authenticated;
revoke all on table public.access_attempts from anon, authenticated;
