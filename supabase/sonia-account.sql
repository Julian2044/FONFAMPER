-- FONFAMPER - Alta manual de cuenta para Sonia Perez
-- Ejecutar solo cuando quieras habilitar a Sonia como administradora con perfil de ahorro.
-- Este script no modifica la estructura ni depende de login real.

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
  'FON-SONIA-0001',
  0,
  0,
  0,
  0,
  0,
  now(),
  now()
from sonia_profile
on conflict (profile_id) do update set
  account_number = excluded.account_number,
  initial_balance = excluded.initial_balance,
  current_balance = excluded.current_balance,
  total_contributions = excluded.total_contributions,
  total_withdrawals = excluded.total_withdrawals,
  total_utilities = excluded.total_utilities,
  updated_at = now();

-- Resultado esperado:
-- - Sonia Perez queda como ADMIN en profiles.
-- - Sonia también queda habilitada como ahorradora porque tiene account asociado.
-- - El selector de consignaciones puede mostrarla.
-- - Los movimientos a su nombre actualizan su saldo y su historial.
