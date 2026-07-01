-- FONFAMPER - Soportes privados para movimientos
-- No se ejecuta automaticamente; aplicalo manualmente en Supabase cuando valides la fase.
-- La escritura se realiza desde server actions con service role. El frontend solo lee por RLS.

create table if not exists public.movement_attachments (
  id uuid primary key default gen_random_uuid(),
  movement_id uuid not null references public.movements(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  uploaded_by uuid references public.profiles(id),
  bucket text not null default 'movement-supports',
  storage_path text not null,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  created_at timestamptz not null default now()
);

create index if not exists movement_attachments_movement_id_idx on public.movement_attachments(movement_id);
create index if not exists movement_attachments_profile_id_idx on public.movement_attachments(profile_id);
create index if not exists movement_attachments_uploaded_by_idx on public.movement_attachments(uploaded_by);

alter table public.movement_attachments enable row level security;

drop policy if exists "AUTH read movement attachments as active admin" on public.movement_attachments;
create policy "AUTH read movement attachments as active admin"
on public.movement_attachments
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.role = 'ADMIN'
      and p.status = 'ACTIVO'
  )
);

drop policy if exists "AUTH read own movement attachments" on public.movement_attachments;
create policy "AUTH read own movement attachments"
on public.movement_attachments
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.id = movement_attachments.profile_id
      and p.status = 'ACTIVO'
  )
);

grant select on table public.movement_attachments to authenticated;
grant select, insert, update, delete on table public.movement_attachments to service_role;

-- Bucket privado para soportes de movimientos.
-- Si tu proyecto no permite administrar storage.buckets por SQL, crea manualmente
-- un bucket privado llamado movement-supports en Supabase Storage.
insert into storage.buckets (id, name, public)
values ('movement-supports', 'movement-supports', false)
on conflict (id) do update
set public = false;
