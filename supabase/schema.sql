-- FONFAMPER Supabase schema
-- Development baseline. This file is idempotent and can be executed multiple times.
-- No real authentication rules are enforced yet; see FUTURE AUTH POLICIES at the end.

create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('ADMIN', 'AHORRADOR');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.movement_type as enum ('SALDO_INICIAL', 'APORTE', 'RETIRO', 'AJUSTE');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.notification_type as enum ('MOVIMIENTO', 'ESTADO_CUENTA', 'SEGURIDAD', 'PERFIL');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  full_name text not null,
  email text not null unique,
  role public.user_role not null,
  status text not null default 'ACTIVO',
  phone text,
  document_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_status_expected_values check (status in ('ACTIVO', 'INACTIVO', 'BLOQUEADO'))
);

comment on column public.profiles.status is 'Expected values: ACTIVO, INACTIVO, BLOQUEADO.';

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  account_number text unique,
  initial_balance numeric(14, 2) not null default 0,
  current_balance numeric(14, 2) not null default 0,
  total_contributions numeric(14, 2) not null default 0,
  total_withdrawals numeric(14, 2) not null default 0,
  total_utilities numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accounts_initial_balance_non_negative check (initial_balance >= 0),
  constraint accounts_current_balance_non_negative check (current_balance >= 0),
  constraint accounts_total_contributions_non_negative check (total_contributions >= 0),
  constraint accounts_total_withdrawals_non_negative check (total_withdrawals >= 0),
  constraint accounts_total_utilities_non_negative check (total_utilities >= 0)
);

create table if not exists public.movements (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  movement_type public.movement_type not null,
  concept text not null,
  description text,
  amount numeric(14, 2) not null default 0,
  balance_after numeric(14, 2) not null default 0,
  movement_date date not null default current_date,
  created_at timestamptz not null default now(),
  constraint movements_amount_non_negative check (amount >= 0),
  constraint movements_balance_after_non_negative check (balance_after >= 0)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  notification_type public.notification_type not null,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  action_href text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id) on delete set null,
  module text not null,
  action text not null,
  description text not null,
  status text not null default 'Completado',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists accounts_set_updated_at on public.accounts;
create trigger accounts_set_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_status_expected_values'
  ) then
    alter table public.profiles
      add constraint profiles_status_expected_values check (status in ('ACTIVO', 'INACTIVO', 'BLOQUEADO'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.accounts'::regclass
      and conname = 'accounts_initial_balance_non_negative'
  ) then
    alter table public.accounts
      add constraint accounts_initial_balance_non_negative check (initial_balance >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.accounts'::regclass
      and conname = 'accounts_current_balance_non_negative'
  ) then
    alter table public.accounts
      add constraint accounts_current_balance_non_negative check (current_balance >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.accounts'::regclass
      and conname = 'accounts_total_contributions_non_negative'
  ) then
    alter table public.accounts
      add constraint accounts_total_contributions_non_negative check (total_contributions >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.accounts'::regclass
      and conname = 'accounts_total_withdrawals_non_negative'
  ) then
    alter table public.accounts
      add constraint accounts_total_withdrawals_non_negative check (total_withdrawals >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.accounts'::regclass
      and conname = 'accounts_total_utilities_non_negative'
  ) then
    alter table public.accounts
      add constraint accounts_total_utilities_non_negative check (total_utilities >= 0);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.movements'::regclass
      and conname = 'movements_amount_non_negative'
  ) then
    alter table public.movements
      add constraint movements_amount_non_negative check (amount >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.movements'::regclass
      and conname = 'movements_balance_after_non_negative'
  ) then
    alter table public.movements
      add constraint movements_balance_after_non_negative check (balance_after >= 0);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.accounts'::regclass
      and conname = 'accounts_profile_id_unique'
  ) then
    alter table public.accounts
      add constraint accounts_profile_id_unique unique (profile_id);
  end if;
end $$;

create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists movements_profile_id_idx on public.movements(profile_id);
create index if not exists movements_account_id_idx on public.movements(account_id);
create index if not exists movements_movement_date_idx on public.movements(movement_date);
create index if not exists notifications_profile_id_idx on public.notifications(profile_id);
create index if not exists notifications_is_read_idx on public.notifications(is_read);
create index if not exists audit_logs_actor_profile_id_idx on public.audit_logs(actor_profile_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at);

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.movements enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- DEMO POLICY:
-- Esta politica es temporal mientras no existe autenticacion real.
-- En la fase de Auth se reemplazara por politicas basadas en auth.uid() y roles.
drop policy if exists "DEMO read profiles" on public.profiles;
create policy "DEMO read profiles"
on public.profiles
for select
to anon, authenticated
using (true);

-- DEMO POLICY:
-- Esta politica es temporal mientras no existe autenticacion real.
-- En la fase de Auth se reemplazara por politicas basadas en auth.uid() y roles.
drop policy if exists "DEMO read accounts" on public.accounts;
create policy "DEMO read accounts"
on public.accounts
for select
to anon, authenticated
using (true);

-- DEMO POLICY:
-- Esta politica es temporal mientras no existe autenticacion real.
-- En la fase de Auth se reemplazara por politicas basadas en auth.uid() y roles.
drop policy if exists "DEMO read movements" on public.movements;
create policy "DEMO read movements"
on public.movements
for select
to anon, authenticated
using (true);

-- DEMO POLICY:
-- Esta politica es temporal mientras no existe autenticacion real.
-- En la fase de Auth se reemplazara por politicas basadas en auth.uid() y roles.
drop policy if exists "DEMO read notifications" on public.notifications;
create policy "DEMO read notifications"
on public.notifications
for select
to anon, authenticated
using (true);

-- DEMO POLICY:
-- Esta politica es temporal mientras no existe autenticacion real.
-- En la fase de Auth se reemplazara por politicas basadas en auth.uid() y roles.
drop policy if exists "DEMO read audit logs" on public.audit_logs;
create policy "DEMO read audit logs"
on public.audit_logs
for select
to anon, authenticated
using (true);

with upsert_sonia as (
  insert into public.profiles (full_name, email, role, status, phone)
  values ('Sonia Perez', 'sonia.perez@email.com', 'ADMIN', 'ACTIVO', null)
  on conflict (email) do update
    set full_name = excluded.full_name,
        role = excluded.role,
        status = excluded.status,
        phone = excluded.phone,
        updated_at = now()
  returning id
),
upsert_camilo as (
  insert into public.profiles (full_name, email, role, status, phone, document_id)
  values ('Camilo Perez', 'camilo.perez@email.com', 'AHORRADOR', 'ACTIVO', '+57 300 *** ** 45', 'C.C. 1.234.*** ***')
  on conflict (email) do update
    set full_name = excluded.full_name,
        role = excluded.role,
        status = excluded.status,
        phone = excluded.phone,
        document_id = excluded.document_id,
        updated_at = now()
  returning id
)
insert into public.accounts (
  profile_id,
  account_number,
  initial_balance,
  current_balance,
  total_contributions,
  total_withdrawals,
  total_utilities
)
select
  upsert_camilo.id,
  'FON-CAMILO-001',
  900000,
  950000,
  50000,
  0,
  0
from upsert_camilo
on conflict (profile_id) do update
  set account_number = excluded.account_number,
      initial_balance = excluded.initial_balance,
      current_balance = excluded.current_balance,
      total_contributions = excluded.total_contributions,
      total_withdrawals = excluded.total_withdrawals,
      total_utilities = excluded.total_utilities,
      updated_at = now();

with camilo_profile as (
  select id from public.profiles where email = 'camilo.perez@email.com'
),
sonia_profile as (
  select id from public.profiles where email = 'sonia.perez@email.com'
),
camilo_account as (
  select id from public.accounts where profile_id = (select id from camilo_profile)
)
insert into public.movements (
  profile_id,
  account_id,
  created_by,
  movement_type,
  concept,
  description,
  amount,
  balance_after,
  movement_date,
  created_at
)
select
  (select id from camilo_profile),
  (select id from camilo_account),
  (select id from sonia_profile),
  'SALDO_INICIAL',
  'Saldo acumulado anterior',
  'Saldo acumulado anterior',
  900000,
  900000,
  date '2022-12-31',
  timestamptz '2024-05-14 09:18:00-05'
where not exists (
  select 1
  from public.movements
  where account_id = (select id from camilo_account)
    and movement_type = 'SALDO_INICIAL'
    and concept = 'Saldo acumulado anterior'
    and movement_date = date '2022-12-31'
);

with camilo_profile as (
  select id from public.profiles where email = 'camilo.perez@email.com'
),
sonia_profile as (
  select id from public.profiles where email = 'sonia.perez@email.com'
),
camilo_account as (
  select id from public.accounts where profile_id = (select id from camilo_profile)
)
insert into public.movements (
  profile_id,
  account_id,
  created_by,
  movement_type,
  concept,
  description,
  amount,
  balance_after,
  movement_date,
  created_at
)
select
  (select id from camilo_profile),
  (select id from camilo_account),
  (select id from sonia_profile),
  'APORTE',
  'Aporte de enero',
  'Aporte mensual de enero',
  50000,
  950000,
  date '2023-01-15',
  timestamptz '2024-05-14 10:35:00-05'
where not exists (
  select 1
  from public.movements
  where account_id = (select id from camilo_account)
    and movement_type = 'APORTE'
    and concept = 'Aporte de enero'
    and movement_date = date '2023-01-15'
);

with camilo_profile as (
  select id from public.profiles where email = 'camilo.perez@email.com'
),
notification_seed as (
  select * from (
    values
      ('MOVIMIENTO'::public.notification_type, 'Nuevo aporte registrado', 'Se registro un aporte por $50.000 en tu cuenta.', false, '/ahorrador/notificaciones', timestamptz '2023-01-15 10:35:00-05'),
      ('ESTADO_CUENTA'::public.notification_type, 'Estado de cuenta disponible', 'Tu estado de cuenta de enero 2023 ya esta disponible.', false, '/ahorrador/estado-cuenta', timestamptz '2023-01-15 11:00:00-05'),
      ('SEGURIDAD'::public.notification_type, 'Inicio de sesion exitoso', 'Se detecto un inicio de sesion desde Chrome en Windows.', true, '/ahorrador/notificaciones', now()),
      ('SEGURIDAD'::public.notification_type, 'Verificacion en dos pasos activada', 'Tu cuenta cuenta con una capa adicional de proteccion.', true, '/ahorrador/perfil', now() - interval '8 days')
  ) as seed(notification_type, title, body, is_read, action_href, created_at)
)
insert into public.notifications (
  profile_id,
  notification_type,
  title,
  body,
  is_read,
  action_href,
  created_at
)
select
  (select id from camilo_profile),
  seed.notification_type,
  seed.title,
  seed.body,
  seed.is_read,
  seed.action_href,
  seed.created_at
from notification_seed seed
where not exists (
  select 1
  from public.notifications n
  where n.profile_id = (select id from camilo_profile)
    and n.title = seed.title
);

with sonia_profile as (
  select id from public.profiles where email = 'sonia.perez@email.com'
),
audit_seed as (
  select * from (
    values
      ((select id from sonia_profile), 'Usuarios', 'Editar', 'Edito el usuario Camilo Perez. Campos modificados: Rol, Estado.', 'Completado', timestamptz '2024-05-14 10:35:00-05'),
      ((select id from sonia_profile), 'Movimientos', 'Crear', 'Creo un movimiento de aporte para Camilo Perez por $50.000.', 'Completado', timestamptz '2024-05-14 09:18:00-05'),
      (null::uuid, 'Seguridad', 'Inicio de sesion', 'Inicio de sesion exitoso desde 192.168.1.45 (Chrome - Windows).', 'Completado', timestamptz '2024-05-12 18:21:00-05')
  ) as seed(actor_profile_id, module, action, description, status, created_at)
)
insert into public.audit_logs (
  actor_profile_id,
  module,
  action,
  description,
  status,
  created_at
)
select
  seed.actor_profile_id,
  seed.module,
  seed.action,
  seed.description,
  seed.status,
  seed.created_at
from audit_seed seed
where not exists (
  select 1
  from public.audit_logs a
  where a.description = seed.description
    and a.created_at = seed.created_at
);

-- FUTURE AUTH POLICIES
-- AHORRADOR solo podra leer su propio profile, account, movements y notifications.
-- ADMIN podra leer y gestionar todos los profiles, accounts y movements.
-- audit_logs solo deberia ser visible para ADMIN.
-- notifications solo visibles para el usuario dueno o ADMIN.
-- Estas reglas se implementaran cuando exista Supabase Auth real y se pueda mapear auth.uid() contra profiles.auth_user_id.
