alter table if exists public.pages
  add column if not exists nav_label_ar text,
  add column if not exists nav_label_en text,
  add column if not exists show_in_nav boolean not null default false,
  add column if not exists nav_order integer not null default 100,
  add column if not exists is_system boolean not null default false;

create index if not exists idx_pages_nav_published
  on public.pages (show_in_nav, nav_order, status);

alter table if exists public.media
  add column if not exists media_type text not null default 'file';

create table if not exists public.theme_revisions (
  id uuid primary key default gen_random_uuid(),
  snapshot_json jsonb not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_theme_revisions_created_at
  on public.theme_revisions (created_at desc);

grant select, insert, update, delete on public.theme_revisions to authenticated;

alter table public.theme_revisions enable row level security;
alter table public.theme_revisions force row level security;

drop policy if exists theme_revisions_owner_all on public.theme_revisions;
create policy theme_revisions_owner_all
on public.theme_revisions
for all
using (public.is_owner())
with check (public.is_owner());

create or replace function public.get_published_nav_pages()
returns table (
  slug text,
  nav_label_ar text,
  nav_label_en text,
  title_ar text,
  title_en text,
  nav_order integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.slug,
    p.nav_label_ar,
    p.nav_label_en,
    p.title_ar,
    p.title_en,
    p.nav_order
  from public.pages p
  where p.status = 'published'
    and p.show_in_nav = true
  order by p.nav_order asc, p.updated_at asc;
$$;

grant execute on function public.get_published_nav_pages() to anon, authenticated;

insert into public.pages (
  slug,
  status,
  title_ar,
  title_en,
  nav_label_ar,
  nav_label_en,
  show_in_nav,
  nav_order,
  is_system,
  blocks_json
)
values
  ('home', 'published', null, null, null, null, true, 1, true, '[]'::jsonb),
  ('services', 'published', null, null, null, null, true, 2, true, '[]'::jsonb),
  ('products', 'published', null, null, null, null, true, 3, true, '[]'::jsonb),
  ('diy', 'published', null, null, null, null, true, 4, true, '[]'::jsonb),
  ('portfolio', 'published', null, null, null, null, true, 5, true, '[]'::jsonb),
  ('about', 'published', null, null, null, null, true, 6, true, '[]'::jsonb),
  ('contact', 'published', null, null, null, null, true, 7, true, '[]'::jsonb)
on conflict (slug) do update
set
  show_in_nav = excluded.show_in_nav,
  nav_order = excluded.nav_order,
  is_system = true,
  status = 'published';

insert into storage.buckets (id, name, public, file_size_limit)
values ('rawnak-media', 'rawnak-media', false, 10485760)
on conflict (id) do update
set
  public = false,
  file_size_limit = 10485760;

drop policy if exists "rawnak media owner select" on storage.objects;
create policy "rawnak media owner select"
on storage.objects
for select
to authenticated
using (bucket_id = 'rawnak-media' and public.is_owner());

drop policy if exists "rawnak media owner insert" on storage.objects;
create policy "rawnak media owner insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'rawnak-media' and public.is_owner());

drop policy if exists "rawnak media owner update" on storage.objects;
create policy "rawnak media owner update"
on storage.objects
for update
to authenticated
using (bucket_id = 'rawnak-media' and public.is_owner())
with check (bucket_id = 'rawnak-media' and public.is_owner());

drop policy if exists "rawnak media owner delete" on storage.objects;
create policy "rawnak media owner delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'rawnak-media' and public.is_owner());
