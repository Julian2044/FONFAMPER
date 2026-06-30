-- FONFAMPER - RPCs para editar usuarios internos y habilitar cuenta de ahorro.
-- No se ejecuta automaticamente; aplicala manualmente en Supabase cuando valides la fase.
-- No elimina usuarios, cuentas ni movimientos.

create or replace function public.update_internal_user_profile(
  p_profile_id uuid,
  p_full_name text,
  p_phone text,
  p_document_id text,
  p_role text,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_admin_profile public.profiles%rowtype;
  v_target_profile public.profiles%rowtype;
  v_role public.user_role;
  v_previous jsonb;
  v_current jsonb;
begin
  select *
  into v_admin_profile
  from public.profiles p
  where p.auth_user_id = auth.uid()
    and p.role = 'ADMIN'
    and p.status = 'ACTIVO'
  limit 1;

  if not found then
    raise exception 'Solo un administrador activo puede editar usuarios.';
  end if;

  if p_profile_id is null then
    raise exception 'Selecciona un usuario valido.';
  end if;

  select *
  into v_target_profile
  from public.profiles p
  where p.id = p_profile_id
  limit 1
  for update;

  if not found then
    raise exception 'El usuario interno no existe.';
  end if;

  p_full_name := nullif(trim(p_full_name), '');
  p_phone := nullif(trim(p_phone), '');
  p_document_id := nullif(trim(p_document_id), '');
  p_role := upper(nullif(trim(p_role), ''));
  p_status := upper(nullif(trim(p_status), ''));

  if p_full_name is null then
    raise exception 'El nombre completo es obligatorio.';
  end if;

  if p_role is null or p_role not in ('ADMIN', 'AHORRADOR') then
    raise exception 'El rol debe ser ADMIN o AHORRADOR.';
  end if;

  if p_status is null or p_status not in ('ACTIVO', 'INACTIVO', 'BLOQUEADO') then
    raise exception 'El estado debe ser ACTIVO, INACTIVO o BLOQUEADO.';
  end if;

  if p_document_id is not null and exists (
    select 1
    from public.profiles p
    where lower(p.document_id) = lower(p_document_id)
      and p.id <> p_profile_id
  ) then
    raise exception 'Ya existe otro perfil con ese documento.';
  end if;

  v_role := p_role::public.user_role;
  v_previous := jsonb_build_object(
    'full_name', v_target_profile.full_name,
    'phone', v_target_profile.phone,
    'document_id', v_target_profile.document_id,
    'role', v_target_profile.role::text,
    'status', v_target_profile.status
  );

  update public.profiles p
  set
    full_name = p_full_name,
    phone = p_phone,
    document_id = p_document_id,
    role = v_role,
    status = p_status,
    updated_at = now()
  where p.id = p_profile_id
  returning jsonb_build_object(
    'full_name', p.full_name,
    'phone', p.phone,
    'document_id', p.document_id,
    'role', p.role::text,
    'status', p.status
  )
  into v_current;

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
    'Editar',
    v_admin_profile.full_name || ' edito el usuario interno ' || p_full_name || '.',
    'Completado',
    jsonb_build_object(
      'profile_id', p_profile_id,
      'email', v_target_profile.email,
      'previous', v_previous,
      'current', v_current
    ),
    now()
  );

  return jsonb_build_object(
    'profile_id', p_profile_id,
    'email', v_target_profile.email,
    'previous', v_previous,
    'current', v_current
  );
end;
$$;

revoke execute on function public.update_internal_user_profile(uuid, text, text, text, text, text) from public;
revoke execute on function public.update_internal_user_profile(uuid, text, text, text, text, text) from anon;
grant execute on function public.update_internal_user_profile(uuid, text, text, text, text, text) to authenticated;

create or replace function public.enable_savings_account(
  p_profile_id uuid,
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
  v_target_profile public.profiles%rowtype;
  v_account_id uuid;
  v_movement_id uuid;
  v_account_number text;
  v_initial_balance numeric;
  v_amount_text text;
begin
  select *
  into v_admin_profile
  from public.profiles p
  where p.auth_user_id = auth.uid()
    and p.role = 'ADMIN'
    and p.status = 'ACTIVO'
  limit 1;

  if not found then
    raise exception 'Solo un administrador activo puede habilitar cuentas de ahorro.';
  end if;

  if p_profile_id is null then
    raise exception 'Selecciona un usuario valido.';
  end if;

  select *
  into v_target_profile
  from public.profiles p
  where p.id = p_profile_id
  limit 1;

  if not found then
    raise exception 'El usuario interno no existe.';
  end if;

  if exists (select 1 from public.accounts a where a.profile_id = p_profile_id) then
    raise exception 'Este usuario ya tiene una cuenta de ahorro habilitada.';
  end if;

  p_account_number := nullif(trim(p_account_number), '');
  v_initial_balance := coalesce(p_initial_balance, 0);

  if v_initial_balance < 0 then
    raise exception 'El saldo inicial no puede ser negativo.';
  end if;

  if p_account_number is not null and exists (
    select 1
    from public.accounts a
    where lower(a.account_number) = lower(p_account_number)
  ) then
    raise exception 'Ya existe una cuenta con ese numero.';
  end if;

  v_account_number := coalesce(
    p_account_number,
    'FON-' || upper(substr(replace(p_profile_id::text, '-', ''), 1, 10))
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
    p_profile_id,
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
      p_profile_id,
      v_account_id,
      v_admin_profile.id,
      'SALDO_INICIAL',
      'Saldo inicial',
      'Saldo inicial registrado al habilitar la cuenta de ahorro.',
      v_initial_balance,
      v_initial_balance,
      current_date,
      now()
    )
    returning id into v_movement_id;
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
    'Habilitar cuenta',
    v_admin_profile.full_name || ' habilito una cuenta de ahorro para ' || v_target_profile.full_name || '.',
    'Completado',
    jsonb_build_object(
      'profile_id', p_profile_id,
      'account_id', v_account_id,
      'movement_id', v_movement_id,
      'account_number', v_account_number,
      'initial_balance', v_initial_balance,
      'initial_balance_text', v_amount_text
    ),
    now()
  );

  return jsonb_build_object(
    'profile_id', p_profile_id,
    'account_id', v_account_id,
    'movement_id', v_movement_id,
    'account_number', v_account_number,
    'initial_balance', v_initial_balance,
    'current_balance', v_initial_balance
  );
end;
$$;

revoke execute on function public.enable_savings_account(uuid, text, numeric) from public;
revoke execute on function public.enable_savings_account(uuid, text, numeric) from anon;
grant execute on function public.enable_savings_account(uuid, text, numeric) to authenticated;
