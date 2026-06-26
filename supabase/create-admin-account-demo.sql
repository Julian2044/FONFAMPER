-- FONFAMPER - Alta manual de cuenta para Sonia Perez
-- Este archivo se ejecuta manualmente en Supabase cuando se quiera habilitar a Sonia
-- como usuaria con cuenta de ahorro sin cambiar su rol ADMIN.

with sonia_profile as (
  select p.id
  from public.profiles p
  where p.email = 'sonia.perez@email.com'
  limit 1
)
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
)
select
  sonia_profile.id,
  'FON-SONIA-001',
  0,
  0,
  0,
  0,
  0,
  now(),
  now()
from sonia_profile
where not exists (
  select 1
  from public.accounts a
  where a.profile_id = sonia_profile.id
);

-- Resultado esperado:
-- - Sonia sigue siendo ADMIN en profiles.
-- - Sonia obtiene una cuenta de ahorro en accounts si no existe.
-- - El selector de consignaciones la puede mostrar porque tiene cuenta y está activa.
-- - No se crea ningún movimiento SALDO_INICIAL.
