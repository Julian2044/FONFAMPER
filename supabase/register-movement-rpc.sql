-- FONFAMPER - RPC para registrar movimientos desde Admin
-- Esta función reemplaza el flujo visual temporal del formulario de movimientos.
-- No se ejecuta automáticamente; aplícala manualmente en Supabase cuando valides la app.
-- No incluye INSERT/UPDATE/DELETE por UI genérica. Solo esta RPC controla el flujo real.

create or replace function public.register_movement(
  target_profile_id uuid,
  p_movement_type public.movement_type,
  p_concept text,
  p_description text,
  p_amount numeric,
  p_movement_date date
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_admin_profile public.profiles%rowtype;
  v_target_profile public.profiles%rowtype;
  v_account public.accounts%rowtype;
  v_previous_balance numeric;
  v_new_balance numeric;
  v_movement_id uuid;
  v_amount_text text;
  v_previous_text text;
  v_new_text text;
  v_action_title text;
  v_notification_body text;
  v_admin_name text;
  v_target_name text;
begin
  select *
  into v_admin_profile
  from public.profiles p
  where p.auth_user_id = auth.uid()
    and p.role = 'ADMIN'
    and p.status = 'ACTIVO'
  limit 1;

  if not found then
    raise exception 'Solo un administrador activo puede registrar movimientos.';
  end if;

  if target_profile_id is null then
    raise exception 'Selecciona un usuario válido.';
  end if;

  if p_movement_type not in ('APORTE', 'RETIRO', 'AJUSTE') then
    raise exception 'El tipo de movimiento debe ser APORTE, RETIRO o AJUSTE.';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'El valor debe ser mayor a cero.';
  end if;

  select *
  into v_target_profile
  from public.profiles p
  where p.id = target_profile_id
    and p.status = 'ACTIVO'
  limit 1;

  if not found then
    raise exception 'El perfil destino no existe o no está activo.';
  end if;

  select *
  into v_account
  from public.accounts a
  where a.profile_id = target_profile_id
  limit 1
  for update;

  if not found then
    raise exception 'El perfil seleccionado no tiene cuenta de ahorro.';
  end if;

  v_previous_balance := v_account.current_balance;

  if p_movement_type = 'APORTE' then
    v_new_balance := v_previous_balance + p_amount;
  elsif p_movement_type = 'RETIRO' then
    v_new_balance := v_previous_balance - p_amount;
    if v_new_balance < 0 then
      raise exception 'El retiro no puede dejar saldo negativo.';
    end if;
  else
    v_new_balance := v_previous_balance + p_amount;
  end if;

  update public.accounts a
  set current_balance = v_new_balance,
      total_contributions = case when p_movement_type = 'APORTE' then a.total_contributions + p_amount else a.total_contributions end,
      total_withdrawals = case when p_movement_type = 'RETIRO' then a.total_withdrawals + p_amount else a.total_withdrawals end,
      updated_at = now()
  where a.id = v_account.id;

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
    v_target_profile.id,
    v_account.id,
    v_admin_profile.id,
    p_movement_type,
    p_concept,
    p_description,
    p_amount,
    v_new_balance,
    p_movement_date,
    now()
  )
  returning id into v_movement_id;

  v_amount_text := '$ ' || replace(to_char(round(p_amount), 'FM999G999G999G990'), ',', '.');
  v_previous_text := '$ ' || replace(to_char(round(v_previous_balance), 'FM999G999G999G990'), ',', '.');
  v_new_text := '$ ' || replace(to_char(round(v_new_balance), 'FM999G999G999G990'), ',', '.');
  v_admin_name := v_admin_profile.full_name;
  v_target_name := v_target_profile.full_name;

  v_action_title := case p_movement_type
    when 'APORTE' then 'Nuevo aporte registrado'
    when 'RETIRO' then 'Nuevo retiro registrado'
    else 'Ajuste registrado'
  end;

  v_notification_body := case p_movement_type
    when 'APORTE' then 'Se registró un aporte por ' || v_amount_text || ' en tu cuenta. Tu nuevo saldo es ' || v_new_text || '.'
    when 'RETIRO' then 'Se registró un retiro por ' || v_amount_text || ' en tu cuenta. Tu nuevo saldo es ' || v_new_text || '.'
    else 'Se registró un ajuste por ' || v_amount_text || ' en tu cuenta. Tu nuevo saldo es ' || v_new_text || '.'
  end;

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
    'Movimientos',
    'Crear',
    v_admin_name || ' registró un ' || p_movement_type || ' para ' || v_target_name || ' por ' || v_amount_text || '.',
    'Completado',
    jsonb_build_object(
      'movement_id', v_movement_id,
      'target_profile_id', v_target_profile.id,
      'target_profile_name', v_target_name,
      'movement_type', p_movement_type,
      'amount', p_amount,
      'previous_balance', v_previous_balance,
      'new_balance', v_new_balance
    ),
    now()
  );

  insert into public.notifications (
    profile_id,
    notification_type,
    title,
    body,
    is_read,
    action_href,
    created_at
  ) values (
    v_target_profile.id,
    'MOVIMIENTO',
    v_action_title,
    v_notification_body,
    false,
    '/ahorrador/movimientos',
    now()
  );

  return jsonb_build_object(
    'movement_id', v_movement_id,
    'profile_id', v_target_profile.id,
    'account_id', v_account.id,
    'previous_balance', v_previous_balance,
    'new_balance', v_new_balance,
    'movement_type', p_movement_type,
    'amount', p_amount
  );
end;
$$;

revoke execute on function public.register_movement(uuid, public.movement_type, text, text, numeric, date) from public;
revoke execute on function public.register_movement(uuid, public.movement_type, text, text, numeric, date) from anon;
grant execute on function public.register_movement(uuid, public.movement_type, text, text, numeric, date) to authenticated;

-- Pendiente para próximas fases:
-- - Crear RPCs equivalentes para editar usuario, generar estados de cuenta e importar Excel.
-- - Crear policies de escritura si alguna parte deja de usar RPC segura.
