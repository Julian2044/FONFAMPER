-- FONFAMPER - RPC para crear usuarios internos desde Admin
-- No se ejecuta automaticamente; aplicala manualmente en Supabase cuando valides la fase.
-- No crea usuarios en Supabase Auth. auth_user_id queda en null como "Acceso pendiente".
-- No requiere service_role_key ni secret keys.

drop function if exists public.create_saver_profile(text, text, text, text, text, numeric);

create or replace function public.create_internal_user_profile(
  p_full_name text,
  p_email text,
  p_role text,
  p_phone text default null,
  p_document_id text default null,
  p_create_account boolean default false,
  p_account_number text default null,
  p_initial_balance numeric default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_admin_profile public.profiles%rowtype;
  v_profile_id uuid;
  v_account_id uuid;
  v_movement_id uuid;
  v_account_number text;
  v_initial_balance numeric;
  v_amount_text text;
  v_role public.user_role;
begin
  select *
  into v_admin_profile
  from public.profiles p
  where p.auth_user_id = auth.uid()
    and p.role = 'ADMIN'
    and p.status = 'ACTIVO'
  limit 1;

  if not found then
    raise exception 'Solo un administrador activo puede crear usuarios internos.';
  end if;

  p_full_name := nullif(trim(p_full_name), '');
  p_email := lower(nullif(trim(p_email), ''));
  p_role := upper(nullif(trim(p_role), ''));
  p_phone := nullif(trim(p_phone), '');
  p_document_id := nullif(trim(p_document_id), '');
  p_account_number := nullif(trim(p_account_number), '');
  v_initial_balance := coalesce(p_initial_balance, 0);

  if p_full_name is null then
    raise exception 'El nombre completo es obligatorio.';
  end if;

  if p_email is null or p_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'El correo electronico no es valido.';
  end if;

  if p_role not in ('ADMIN', 'AHORRADOR') then
    raise exception 'El rol debe ser ADMIN o AHORRADOR.';
  end if;

  v_role := p_role::public.user_role;

  if not coalesce(p_create_account, false) then
    v_initial_balance := 0;
    p_account_number := null;
  end if;

  if v_initial_balance < 0 then
    raise exception 'El saldo inicial no puede ser negativo.';
  end if;

  if exists (select 1 from public.profiles p where lower(p.email) = p_email) then
    raise exception 'Ya existe un perfil con ese correo electronico.';
  end if;

  if p_document_id is not null and exists (
    select 1
    from public.profiles p
    where lower(p.document_id) = lower(p_document_id)
  ) then
    raise exception 'Ya existe un perfil con ese documento.';
  end if;

  insert into public.profiles (
    auth_user_id,
    full_name,
    email,
    role,
    status,
    phone,
    document_id,
    created_at,
    updated_at
  ) values (
    null,
    p_full_name,
    p_email,
    v_role,
    'ACTIVO',
    p_phone,
    p_document_id,
    now(),
    now()
  )
  returning id into v_profile_id;

  if coalesce(p_create_account, false) then
    v_account_number := coalesce(
      p_account_number,
      'FON-' || upper(substr(replace(v_profile_id::text, '-', ''), 1, 10))
    );

    insert into public.accounts (
      profile_id,
      account_number,
      initial_balance,
      current_balance,
      total_contributions,
      total_withdrawals,
      total_utilities,
      created_at,
      updated_at
    ) values (
      v_profile_id,
      v_account_number,
      v_initial_balance,
      v_initial_balance,
      0,
      0,
      0,
      now(),
      now()
    )
    returning id into v_account_id;

    if v_initial_balance > 0 then
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
      ) values (
        v_profile_id,
        v_account_id,
        v_admin_profile.id,
        'SALDO_INICIAL',
        'Saldo inicial',
        'Saldo inicial registrado al crear el usuario interno.',
        v_initial_balance,
        v_initial_balance,
        current_date,
        now()
      )
      returning id into v_movement_id;
    end if;
  end if;

  v_amount_text := '$ ' || replace(to_char(round(v_initial_balance), 'FM999G999G999G990'), ',', '.');

  insert into public.audit_logs (
    actor_profile_id,
    module,
    action,
    description,
    status,
    metadata,
    created_at
  ) values (
    v_admin_profile.id,
    'Usuarios',
    'Crear',
    v_admin_profile.full_name || ' creo el usuario interno ' || p_full_name || ' con acceso pendiente.',
    'Completado',
    jsonb_build_object(
      'profile_id', v_profile_id,
      'account_id', v_account_id,
      'movement_id', v_movement_id,
      'account_number', v_account_number,
      'full_name', p_full_name,
      'email', p_email,
      'role', v_role::text,
      'status', 'ACTIVO',
      'access_status', 'PENDIENTE',
      'has_savings_account', coalesce(p_create_account, false),
      'initial_balance', v_initial_balance,
      'initial_balance_text', v_amount_text
    ),
    now()
  );

  return jsonb_build_object(
    'profile_id', v_profile_id,
    'account_id', v_account_id,
    'movement_id', v_movement_id,
    'account_number', v_account_number,
    'auth_user_id', null,
    'access_status', 'PENDIENTE',
    'role', v_role::text,
    'has_savings_account', coalesce(p_create_account, false),
    'initial_balance', v_initial_balance
  );
end;
$$;

revoke execute on function public.create_internal_user_profile(text, text, text, text, text, boolean, text, numeric) from public;
revoke execute on function public.create_internal_user_profile(text, text, text, text, text, boolean, text, numeric) from anon;
grant execute on function public.create_internal_user_profile(text, text, text, text, text, boolean, text, numeric) to authenticated;

-- Pendiente para proximas fases:
-- - Activar acceso creando el usuario en Supabase Auth y enlazando profiles.auth_user_id.
-- - Editar usuario.
-- - Eliminar o bloquear usuario.
-- - Importacion por Excel.
