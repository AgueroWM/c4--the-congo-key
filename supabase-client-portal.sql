create table if not exists public.client_portal_settings (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create extension if not exists pgcrypto;

create table if not exists public.client_portals (
  id uuid primary key default gen_random_uuid(),
  project_id text unique not null,
  access_password text not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.map_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  lat double precision not null,
  long double precision not null,
  video_url text,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  before text not null,
  after text not null,
  duration text,
  surface text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  subject text,
  message text not null,
  attachment_url text,
  created_at timestamptz not null default now()
);

alter table public.client_portal_settings enable row level security;
alter table public.client_portals enable row level security;
alter table public.map_projects enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.contacts enable row level security;

grant select on public.client_portal_settings to anon, authenticated;
grant insert, update on public.client_portal_settings to authenticated;
grant all on public.client_portals to authenticated;
grant select on public.map_projects to anon, authenticated;
grant insert, update, delete on public.map_projects to authenticated;
grant select on public.portfolio_projects to anon, authenticated;
grant insert, update, delete on public.portfolio_projects to authenticated;
grant insert on public.contacts to anon;
grant select on public.contacts to authenticated;

drop policy if exists "Client portal settings readable by anon" on public.client_portal_settings;
create policy "Client portal settings readable by anon"
  on public.client_portal_settings
  for select
  to anon
  using (id = 'default');

drop policy if exists "Client portal settings editable by authenticated users" on public.client_portal_settings;
create policy "Client portal settings editable by authenticated users"
  on public.client_portal_settings
  for insert
  to authenticated
  with check (id = 'default');

drop policy if exists "Client portal settings updatable by authenticated users" on public.client_portal_settings;
create policy "Client portal settings updatable by authenticated users"
  on public.client_portal_settings
  for update
  to authenticated
  using (id = 'default')
  with check (id = 'default');

drop policy if exists "Client portals manageable by authenticated users" on public.client_portals;
create policy "Client portals manageable by authenticated users"
  on public.client_portals
  for all
  to authenticated
  using (true)
  with check (true);

create or replace function public.get_client_portal_by_credentials(
  input_project_id text,
  input_password text
)
returns table(data jsonb)
language sql
security definer
set search_path = public
as $$
  select cp.data
  from public.client_portals cp
  where upper(cp.project_id) = upper(input_project_id)
    and cp.access_password = input_password
  limit 1;
$$;

grant execute on function public.get_client_portal_by_credentials(text, text) to anon, authenticated;

insert into public.client_portals (project_id, access_password, data)
select
  coalesce(data->'project'->>'id', 'PRJ-C4-DEMO'),
  'client-demo-2026',
  data
from public.client_portal_settings
where id = 'default'
on conflict (project_id) do nothing;

drop policy if exists "Map projects readable by anon" on public.map_projects;
create policy "Map projects readable by anon"
  on public.map_projects
  for select
  to anon
  using (true);

drop policy if exists "Map projects manageable by authenticated users" on public.map_projects;
create policy "Map projects manageable by authenticated users"
  on public.map_projects
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Portfolio readable by anon" on public.portfolio_projects;
create policy "Portfolio readable by anon"
  on public.portfolio_projects
  for select
  to anon
  using (true);

drop policy if exists "Portfolio manageable by authenticated users" on public.portfolio_projects;
create policy "Portfolio manageable by authenticated users"
  on public.portfolio_projects
  for all
  to authenticated
  using (true)
  with check (true);

insert into public.map_projects (title, category, lat, long, video_url, description)
select *
from (
  values
    (
      'Entrepot industriel',
      'Commercial',
      -4.769::double precision,
      11.866::double precision,
      'https://cdn.coverr.co/videos/coverr-construction-site-of-a-building-2615/1080p.mp4',
      'Plateforme logistique moderne.'
    ),
    (
      'Immeuble tertiaire',
      'Commercial',
      -4.785::double precision,
      11.875::double precision,
      'https://cdn.coverr.co/videos/coverr-modern-house-with-a-pool-2618/1080p.mp4',
      'Programme de bureaux et services premium.'
    ),
    (
      'Hub logistique CMA CGM',
      'Logistique',
      -4.750::double precision,
      11.880::double precision,
      'https://cdn.coverr.co/videos/coverr-cargo-ship-at-port-2619/1080p.mp4',
      'Entrepot logistique de derniere generation.'
    )
) as seed(title, category, lat, long, video_url, description)
where not exists (
  select 1 from public.map_projects existing where existing.title = seed.title
);

insert into public.portfolio_projects (label, before, after, duration, surface)
select *
from (
  values
    (
      'A definir ensemble',
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586528116311-ad8ed7c508b0?q=80&w=1600&auto=format&fit=crop',
      'A definir ensemble',
      'A definir ensemble'
    ),
    (
      'A definir ensemble',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1600&auto=format&fit=crop',
      'A definir ensemble',
      'A definir ensemble'
    )
) as seed(label, before, after, duration, surface)
where not exists (
  select 1
  from public.portfolio_projects existing
  where existing.before = seed.before
    and existing.after = seed.after
);

drop policy if exists "Contacts insertable by anon" on public.contacts;
create policy "Contacts insertable by anon"
  on public.contacts
  for insert
  to anon
  with check (true);

drop policy if exists "Contacts readable by authenticated users" on public.contacts;
create policy "Contacts readable by authenticated users"
  on public.contacts
  for select
  to authenticated
  using (true);

insert into storage.buckets (id, name, public)
values
  ('site-assets', 'site-assets', true),
  ('client-documents', 'client-documents', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read for site assets" on storage.objects;
create policy "Public read for site assets"
  on storage.objects
  for select
  to anon
  using (bucket_id in ('site-assets', 'client-documents'));

drop policy if exists "Authenticated uploads for site assets" on storage.objects;
create policy "Authenticated uploads for site assets"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id in ('site-assets', 'client-documents'));

drop policy if exists "Authenticated updates for site assets" on storage.objects;
create policy "Authenticated updates for site assets"
  on storage.objects
  for update
  to authenticated
  using (bucket_id in ('site-assets', 'client-documents'))
  with check (bucket_id in ('site-assets', 'client-documents'));

drop policy if exists "Authenticated deletes for site assets" on storage.objects;
create policy "Authenticated deletes for site assets"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id in ('site-assets', 'client-documents'));

notify pgrst, 'reload schema';
