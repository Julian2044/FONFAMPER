-- Fase 10: flags de cambio obligatorio de contrasena.

alter table public.profiles
  add column if not exists must_change_password boolean not null default false;

alter table public.profiles
  add column if not exists password_changed_at timestamptz null;

create or replace function public.mark_password_changed()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_auth_uid uuid := auth.uid();
begin
  if v_auth_uid is null then
    raise exception 'Usuario no autenticado.' using errcode = '28000';
  end if;

  update public.profiles
  set
    must_change_password = false,
    password_changed_at = now(),
    updated_at = now()
  where auth_user_id = v_auth_uid;

  if not found then
    raise exception 'No existe un perfil vinculado al usuario autenticado.' using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function public.mark_password_changed() from public;
revoke execute on function public.mark_password_changed() from anon;
grant execute on function public.mark_password_changed() to authenticated;
