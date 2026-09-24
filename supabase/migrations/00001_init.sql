-- FaithMatch — schéma initial (extrait du PRD §31).
-- À appliquer dans ton projet Supabase (Dashboard → SQL Editor, ou `supabase db push`).

-- ── Profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  user_id   uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  age        int,
  city       text,
  country    text,
  religion   jsonb,           -- { religion, pratique }
  preferences jsonb,          -- { age, sexe, religion, pratique, situation, ville }
  family     jsonb,           -- { enfants, nombre, travail, demenagement, parents, importance }
  quiz       jsonb,           -- { "0": 2, "1": 0, ... } réponses du questionnaire
  onboarding jsonb,           -- vue complète de l'onboarding (persistée côté app)
  compatibility_score int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Un utilisateur ne peut lire/modifier que SON profil (les profils publics
-- destinés au matching auront une politique dédiée, à ajouter en V1).
create policy "profil: lecture du sien"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "profil: création du sien"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "profil: mise à jour du sien"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Création automatique du profil à l'inscription ──────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, first_name, age, city, country)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    nullif(new.raw_user_meta_data ->> 'age', '')::int,
    new.raw_user_meta_data ->> 'city',
    new.raw_user_meta_data ->> 'country'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();