-- FONFAMPER - RLS AUTH POLICIES
-- Objetivo:
-- - Cerrar las policies demo temporales.
-- - Permitir lectura real solo a usuarios autenticados.
-- - Restringir el acceso por rol usando auth.uid() y public.profiles.role.
-- - No incluye INSERT/UPDATE/DELETE. El CRUD se implementará en una fase posterior.

begin;

-- Helpers seguros para evitar repetir la lógica de validación en cada policy.
-- Estas funciones se ejecutan con privilegios del propietario para leer profiles sin depender
-- de policies recursivas sobre la misma tabla.

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id
  from public.profiles p
  where p.auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.role = 'ADMIN'
      and p.status = 'ACTIVO'
  );
$$;

grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.is_active_admin() to authenticated;

-- Revocar lectura directa a anon en tablas sensibles.
-- anon ya no debe poder leer datos sensibles por fuera de las policies RLS.

revoke select on table public.profiles from anon;
revoke select on table public.accounts from anon;
revoke select on table public.movements from anon;
revoke select on table public.notifications from anon;
revoke select on table public.audit_logs from anon;

-- Mantener acceso de lectura para authenticated; el control fino lo hace RLS.

grant usage on schema public to authenticated;
grant select on table public.profiles to authenticated;
grant select on table public.accounts to authenticated;
grant select on table public.movements to authenticated;
grant select on table public.notifications to authenticated;
grant select on table public.audit_logs to authenticated;

-- DEMO POLICY REPLACEMENT:
-- Eliminamos las policies demo que permitían lectura amplia.
-- A partir de aquí, la lectura depende de auth.uid() y del rol del perfil autenticado.

drop policy if exists "DEMO read profiles" on public.profiles;
drop policy if exists "DEMO read accounts" on public.accounts;
drop policy if exists "DEMO read movements" on public.movements;
drop policy if exists "DEMO read notifications" on public.notifications;
drop policy if exists "DEMO read audit logs" on public.audit_logs;

-- profiles
-- AHORRADOR: solo puede leer su propio profile.
-- ADMIN activo: puede leer todos los profiles.

drop policy if exists "AUTH read profiles own or admin" on public.profiles;
create policy "AUTH read profiles own or admin"
on public.profiles
for select
to authenticated
using (
  id = public.current_profile_id()
  or public.is_active_admin()
);

-- accounts
-- AHORRADOR: solo puede leer su propia cuenta.
-- ADMIN activo: puede leer todas las cuentas.

drop policy if exists "AUTH read accounts own or admin" on public.accounts;
create policy "AUTH read accounts own or admin"
on public.accounts
for select
to authenticated
using (
  profile_id = public.current_profile_id()
  or public.is_active_admin()
);

-- movements
-- AHORRADOR: solo puede leer sus propios movimientos.
-- ADMIN activo: puede leer todos los movimientos.

drop policy if exists "AUTH read movements own or admin" on public.movements;
create policy "AUTH read movements own or admin"
on public.movements
for select
to authenticated
using (
  profile_id = public.current_profile_id()
  or public.is_active_admin()
);

-- notifications
-- AHORRADOR: solo puede leer sus propias notificaciones.
-- ADMIN activo: puede leer todas las notificaciones.

drop policy if exists "AUTH read notifications own or admin" on public.notifications;
create policy "AUTH read notifications own or admin"
on public.notifications
for select
to authenticated
using (
  profile_id = public.current_profile_id()
  or public.is_active_admin()
);

-- audit_logs
-- Solo ADMIN activo puede leer la auditoría.

drop policy if exists "AUTH read audit logs admin only" on public.audit_logs;
create policy "AUTH read audit logs admin only"
on public.audit_logs
for select
to authenticated
using (
  public.is_active_admin()
);

-- Pendiente para CRUD:
-- - INSERT/UPDATE/DELETE de profiles, accounts, movements, notifications y audit_logs.
-- - Políticas de escritura separadas por rol.
-- - Auditoría de cambios cuando el CRUD exista.

-- Resultado esperado:
-- - anon ya no puede leer tablas sensibles.
-- - authenticated solo ve sus propios datos o, si es ADMIN activo, toda la información administrativa.

commit;
