do $$
begin
  create type public.page_status as enum ('draft', 'published');
exception
  when duplicate_object then null;
end;
$$;

alter table if exists public.site_settings
  add column if not exists customers_signup_enabled boolean,
  add column if not exists bg_motion_enabled boolean,
  add column if not exists bg_intensity_light numeric(3, 2),
  add column if not exists bg_intensity_dark numeric(3, 2),
  add column if not exists active_theme_tokens_json jsonb;

alter table if exists public.site_settings
  alter column brand_name_ar drop not null,
  alter column brand_name_en drop not null,
  alter column tagline_ar drop not null,
  alter column tagline_en drop not null,
  alter column logo_path drop not null;

update public.site_settings
set
  customers_signup_enabled = coalesce(customers_signup_enabled, allow_customer_signup, true),
  bg_motion_enabled = coalesce(bg_motion_enabled, background_motion_enabled, true),
  bg_intensity_light = coalesce(bg_intensity_light, background_effect_intensity_light, 1.00),
  bg_intensity_dark = coalesce(bg_intensity_dark, background_effect_intensity_dark, 1.00),
  active_theme_tokens_json = coalesce(active_theme_tokens_json, '{}'::jsonb)
where id = 1;

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (btrim(slug) <> ''),
  status public.page_status not null default 'draft',
  title_ar text,
  title_en text,
  blocks_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.page_revisions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  snapshot_json jsonb not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  name text,
  snapshot_json jsonb not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.theme_presets (
  id uuid primary key default gen_random_uuid(),
  name text,
  tokens_json jsonb not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  alt_ar text,
  alt_en text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details_json jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_pages_status_slug on public.pages (status, slug);
create index if not exists idx_pages_updated_at on public.pages (updated_at desc);
create index if not exists idx_page_revisions_page_created on public.page_revisions (page_id, created_at desc);
create index if not exists idx_templates_created_at on public.templates (created_at desc);
create index if not exists idx_theme_presets_created_at on public.theme_presets (created_at desc);
create index if not exists idx_media_created_at on public.media (created_at desc);
create index if not exists idx_audit_log_created_at on public.audit_log (created_at desc);
create index if not exists idx_audit_log_action on public.audit_log (action);
create index if not exists idx_audit_log_entity on public.audit_log (entity_type, entity_id);

drop trigger if exists set_pages_updated_at on public.pages;
create trigger set_pages_updated_at
before update on public.pages
for each row
execute function public.set_updated_at();

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and public.current_app_role() = 'owner';
$$;

create or replace function public.get_published_page_by_slug(input_slug text)
returns table (
  id uuid,
  slug text,
  status public.page_status,
  title_ar text,
  title_en text,
  blocks_json jsonb,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.slug, p.status, p.title_ar, p.title_en, p.blocks_json, p.updated_at
  from public.pages p
  where p.slug = input_slug
    and p.status = 'published'
  limit 1;
$$;

create or replace function public.get_public_site_settings()
returns table (
  brand_name_ar text,
  brand_name_en text,
  tagline_ar text,
  tagline_en text,
  logo_path text,
  customers_signup_enabled boolean,
  bg_motion_enabled boolean,
  bg_intensity_light numeric(3, 2),
  bg_intensity_dark numeric(3, 2),
  active_theme_tokens_json jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.brand_name_ar,
    s.brand_name_en,
    s.tagline_ar,
    s.tagline_en,
    s.logo_path,
    coalesce(s.customers_signup_enabled, true),
    coalesce(s.bg_motion_enabled, true),
    coalesce(s.bg_intensity_light, 1.00),
    coalesce(s.bg_intensity_dark, 1.00),
    coalesce(s.active_theme_tokens_json, '{}'::jsonb)
  from public.site_settings s
  where s.id = 1;
$$;

grant select, insert, update, delete on public.pages to authenticated;
grant select, insert, update, delete on public.page_revisions to authenticated;
grant select, insert, update, delete on public.templates to authenticated;
grant select, insert, update, delete on public.theme_presets to authenticated;
grant select, insert, update, delete on public.media to authenticated;
grant select, insert, update, delete on public.audit_log to authenticated;
grant select, insert, update, delete on public.site_settings to authenticated;

grant execute on function public.get_published_page_by_slug(text) to anon, authenticated;
grant execute on function public.get_public_site_settings() to anon, authenticated;

revoke select on public.site_settings from anon;

alter table public.pages enable row level security;
alter table public.pages force row level security;
alter table public.page_revisions enable row level security;
alter table public.page_revisions force row level security;
alter table public.templates enable row level security;
alter table public.templates force row level security;
alter table public.theme_presets enable row level security;
alter table public.theme_presets force row level security;
alter table public.media enable row level security;
alter table public.media force row level security;
alter table public.audit_log enable row level security;
alter table public.audit_log force row level security;

alter table public.site_settings enable row level security;
alter table public.site_settings force row level security;

drop policy if exists pages_owner_all on public.pages;
create policy pages_owner_all
on public.pages
for all
using (public.is_owner())
with check (public.is_owner());

drop policy if exists page_revisions_owner_all on public.page_revisions;
create policy page_revisions_owner_all
on public.page_revisions
for all
using (public.is_owner())
with check (public.is_owner());

drop policy if exists templates_owner_all on public.templates;
create policy templates_owner_all
on public.templates
for all
using (public.is_owner())
with check (public.is_owner());

drop policy if exists theme_presets_owner_all on public.theme_presets;
create policy theme_presets_owner_all
on public.theme_presets
for all
using (public.is_owner())
with check (public.is_owner());

drop policy if exists media_owner_all on public.media;
create policy media_owner_all
on public.media
for all
using (public.is_owner())
with check (public.is_owner());

drop policy if exists audit_log_owner_all on public.audit_log;
create policy audit_log_owner_all
on public.audit_log
for all
using (public.is_owner())
with check (public.is_owner());

drop policy if exists site_settings_select_all on public.site_settings;
drop policy if exists site_settings_update_owner_admin on public.site_settings;
drop policy if exists site_settings_insert_owner on public.site_settings;
drop policy if exists site_settings_delete_owner on public.site_settings;
drop policy if exists site_settings_owner_all on public.site_settings;
create policy site_settings_owner_all
on public.site_settings
for all
using (public.is_owner())
with check (public.is_owner());
