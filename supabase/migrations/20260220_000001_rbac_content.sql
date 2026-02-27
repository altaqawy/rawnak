create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum (
    'owner',
    'admin',
    'supervisor',
    'employee',
    'customer'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.content_scope as enum (
    'all',
    'services',
    'products',
    'kits',
    'portfolio'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.content_status as enum ('draft', 'published');
exception
  when duplicate_object then null;
end;
$$;

create or replace function public.is_valid_scope_array(scopes public.content_scope[])
returns boolean
language plpgsql
immutable
as $$
begin
  if scopes is null or cardinality(scopes) = 0 then
    return true;
  end if;

  if 'all'::public.content_scope = any(scopes) and cardinality(scopes) > 1 then
    return false;
  end if;

  return true;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.lock_created_by()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and new.created_by <> old.created_by then
    raise exception 'created_by is immutable';
  end if;

  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  locale text check (locale in ('ar', 'en')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'customer',
  scopes public.content_scope[],
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint user_roles_scopes_check check (public.is_valid_scope_array(scopes))
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  status public.content_status not null default 'draft',
  title_ar text not null check (btrim(title_ar) <> ''),
  title_en text not null check (btrim(title_en) <> ''),
  description_ar text,
  description_en text,
  slug text not null unique check (btrim(slug) <> ''),
  created_by uuid not null references auth.users (id) on delete restrict,
  assigned_to uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  status public.content_status not null default 'draft',
  title_ar text not null check (btrim(title_ar) <> ''),
  title_en text not null check (btrim(title_en) <> ''),
  description_ar text,
  description_en text,
  slug text not null unique check (btrim(slug) <> ''),
  created_by uuid not null references auth.users (id) on delete restrict,
  assigned_to uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.kits (
  id uuid primary key default gen_random_uuid(),
  status public.content_status not null default 'draft',
  title_ar text not null check (btrim(title_ar) <> ''),
  title_en text not null check (btrim(title_en) <> ''),
  description_ar text,
  description_en text,
  slug text not null unique check (btrim(slug) <> ''),
  created_by uuid not null references auth.users (id) on delete restrict,
  assigned_to uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  status public.content_status not null default 'draft',
  title_ar text not null check (btrim(title_ar) <> ''),
  title_en text not null check (btrim(title_en) <> ''),
  description_ar text,
  description_en text,
  slug text not null unique check (btrim(slug) <> ''),
  created_by uuid not null references auth.users (id) on delete restrict,
  assigned_to uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  brand_name_ar text not null,
  brand_name_en text not null,
  tagline_ar text not null,
  tagline_en text not null,
  logo_path text not null,
  allow_customer_signup boolean not null default true,
  background_effect_intensity_light numeric(3, 2) not null default 1.00 check (background_effect_intensity_light >= 0 and background_effect_intensity_light <= 2),
  background_effect_intensity_dark numeric(3, 2) not null default 1.00 check (background_effect_intensity_dark >= 0 and background_effect_intensity_dark <= 2),
  background_motion_enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.site_settings (
  id,
  brand_name_ar,
  brand_name_en,
  tagline_ar,
  tagline_en,
  logo_path
)
values (
  1,
  'رونق أوفيشال',
  'Rawnak Official',
  'علامة واحدة… إمكانيات لا تنتهي.',
  'One brand. Endless possibilities.',
  '/brand/rawnak-logo.png'
)
on conflict (id) do nothing;

create index if not exists idx_services_status on public.services (status);
create index if not exists idx_services_created_by on public.services (created_by);
create index if not exists idx_services_assigned_to on public.services (assigned_to);

create index if not exists idx_products_status on public.products (status);
create index if not exists idx_products_created_by on public.products (created_by);
create index if not exists idx_products_assigned_to on public.products (assigned_to);

create index if not exists idx_kits_status on public.kits (status);
create index if not exists idx_kits_created_by on public.kits (created_by);
create index if not exists idx_kits_assigned_to on public.kits (assigned_to);

create index if not exists idx_portfolio_status on public.portfolio_items (status);
create index if not exists idx_portfolio_created_by on public.portfolio_items (created_by);
create index if not exists idx_portfolio_assigned_to on public.portfolio_items (assigned_to);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_user_roles_updated_at on public.user_roles;
create trigger set_user_roles_updated_at
before update on public.user_roles
for each row
execute function public.set_updated_at();

drop trigger if exists set_services_updated_at on public.services;
create trigger set_services_updated_at
before update on public.services
for each row
execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists set_kits_updated_at on public.kits;
create trigger set_kits_updated_at
before update on public.kits
for each row
execute function public.set_updated_at();

drop trigger if exists set_portfolio_items_updated_at on public.portfolio_items;
create trigger set_portfolio_items_updated_at
before update on public.portfolio_items
for each row
execute function public.set_updated_at();

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

drop trigger if exists lock_services_created_by on public.services;
create trigger lock_services_created_by
before update on public.services
for each row
execute function public.lock_created_by();

drop trigger if exists lock_products_created_by on public.products;
create trigger lock_products_created_by
before update on public.products
for each row
execute function public.lock_created_by();

drop trigger if exists lock_kits_created_by on public.kits;
create trigger lock_kits_created_by
before update on public.kits
for each row
execute function public.lock_created_by();

drop trigger if exists lock_portfolio_created_by on public.portfolio_items;
create trigger lock_portfolio_created_by
before update on public.portfolio_items
for each row
execute function public.lock_created_by();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, locale)
  values (
    new.id,
    case
      when coalesce(new.raw_user_meta_data ->> 'locale', '') in ('ar', 'en')
        then new.raw_user_meta_data ->> 'locale'
      else null
    end
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role, scopes)
  values (new.id, 'customer', null)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

insert into public.profiles (id)
select u.id
from auth.users u
on conflict (id) do nothing;

insert into public.user_roles (user_id, role, scopes)
select u.id, 'customer', null
from auth.users u
on conflict (user_id) do nothing;

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select ur.role
      from public.user_roles ur
      where ur.user_id = auth.uid()
    ),
    'customer'::public.app_role
  );
$$;

create or replace function public.current_app_scopes()
returns public.content_scope[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select ur.scopes
      from public.user_roles ur
      where ur.user_id = auth.uid()
    ),
    '{}'::public.content_scope[]
  );
$$;

create or replace function public.role_has_scope(required_scope public.content_scope)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then false
    when public.current_app_role() in ('owner', 'admin') then true
    when public.current_app_role() = 'supervisor'
      then (
        'all'::public.content_scope = any(public.current_app_scopes())
        or required_scope = any(public.current_app_scopes())
      )
    else false
  end;
$$;

grant usage on schema public to anon, authenticated;

grant select on public.site_settings to anon;
grant select on public.services to anon;
grant select on public.products to anon;
grant select on public.kits to anon;
grant select on public.portfolio_items to anon;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.user_roles to authenticated;
grant select, insert, update, delete on public.services to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.kits to authenticated;
grant select, insert, update, delete on public.portfolio_items to authenticated;
grant select, insert, update, delete on public.site_settings to authenticated;

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.user_roles enable row level security;
alter table public.user_roles force row level security;
alter table public.services enable row level security;
alter table public.services force row level security;
alter table public.products enable row level security;
alter table public.products force row level security;
alter table public.kits enable row level security;
alter table public.kits force row level security;
alter table public.portfolio_items enable row level security;
alter table public.portfolio_items force row level security;
alter table public.site_settings enable row level security;
alter table public.site_settings force row level security;

drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists profiles_select_owner_admin on public.profiles;
create policy profiles_select_owner_admin
on public.profiles
for select
using (public.current_app_role() in ('owner', 'admin'));

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists profiles_update_owner_admin on public.profiles;
create policy profiles_update_owner_admin
on public.profiles
for update
using (public.current_app_role() in ('owner', 'admin'))
with check (public.current_app_role() in ('owner', 'admin'));

drop policy if exists user_roles_select_self on public.user_roles;
create policy user_roles_select_self
on public.user_roles
for select
using (auth.uid() = user_id);

drop policy if exists user_roles_select_owner_admin on public.user_roles;
create policy user_roles_select_owner_admin
on public.user_roles
for select
using (public.current_app_role() in ('owner', 'admin'));

drop policy if exists user_roles_owner_insert on public.user_roles;
create policy user_roles_owner_insert
on public.user_roles
for insert
with check (public.current_app_role() = 'owner');

drop policy if exists user_roles_owner_update on public.user_roles;
create policy user_roles_owner_update
on public.user_roles
for update
using (public.current_app_role() = 'owner')
with check (public.current_app_role() = 'owner');

drop policy if exists user_roles_owner_delete on public.user_roles;
create policy user_roles_owner_delete
on public.user_roles
for delete
using (public.current_app_role() = 'owner');

drop policy if exists user_roles_admin_insert on public.user_roles;
create policy user_roles_admin_insert
on public.user_roles
for insert
with check (
  public.current_app_role() = 'admin'
  and role <> 'owner'
);

drop policy if exists user_roles_admin_update on public.user_roles;
create policy user_roles_admin_update
on public.user_roles
for update
using (
  public.current_app_role() = 'admin'
  and role <> 'owner'
)
with check (
  public.current_app_role() = 'admin'
  and role <> 'owner'
);

drop policy if exists user_roles_admin_delete on public.user_roles;
create policy user_roles_admin_delete
on public.user_roles
for delete
using (
  public.current_app_role() = 'admin'
  and role <> 'owner'
);

drop policy if exists site_settings_select_all on public.site_settings;
create policy site_settings_select_all
on public.site_settings
for select
using (true);

drop policy if exists site_settings_update_owner_admin on public.site_settings;
create policy site_settings_update_owner_admin
on public.site_settings
for update
using (public.current_app_role() in ('owner', 'admin'))
with check (public.current_app_role() in ('owner', 'admin'));

drop policy if exists site_settings_insert_owner on public.site_settings;
create policy site_settings_insert_owner
on public.site_settings
for insert
with check (public.current_app_role() = 'owner');

drop policy if exists site_settings_delete_owner on public.site_settings;
create policy site_settings_delete_owner
on public.site_settings
for delete
using (public.current_app_role() = 'owner');

drop policy if exists services_public_read_published on public.services;
create policy services_public_read_published
on public.services
for select
using (status = 'published');

drop policy if exists services_staff_read on public.services;
create policy services_staff_read
on public.services
for select
using (
  public.current_app_role() in ('owner', 'admin')
  or (
    public.current_app_role() = 'supervisor'
    and public.role_has_scope('services')
  )
  or (
    public.current_app_role() = 'employee'
    and auth.uid() is not null
    and (created_by = auth.uid() or assigned_to = auth.uid())
  )
);

drop policy if exists services_staff_insert on public.services;
create policy services_staff_insert
on public.services
for insert
with check (
  auth.uid() is not null
  and created_by = auth.uid()
  and (
    public.current_app_role() in ('owner', 'admin')
    or (
      public.current_app_role() = 'supervisor'
      and public.role_has_scope('services')
    )
    or (
      public.current_app_role() = 'employee'
      and status = 'draft'
    )
  )
);

drop policy if exists services_staff_update on public.services;
create policy services_staff_update
on public.services
for update
using (
  auth.uid() is not null
  and (
    public.current_app_role() in ('owner', 'admin')
    or (
      public.current_app_role() = 'supervisor'
      and public.role_has_scope('services')
    )
    or (
      public.current_app_role() = 'employee'
      and status = 'draft'
      and (created_by = auth.uid() or assigned_to = auth.uid())
    )
  )
)
with check (
  auth.uid() is not null
  and (
    public.current_app_role() in ('owner', 'admin')
    or (
      public.current_app_role() = 'supervisor'
      and public.role_has_scope('services')
    )
    or (
      public.current_app_role() = 'employee'
      and status = 'draft'
      and (created_by = auth.uid() or assigned_to = auth.uid())
    )
  )
);

drop policy if exists services_staff_delete on public.services;
create policy services_staff_delete
on public.services
for delete
using (
  public.current_app_role() in ('owner', 'admin')
  or (
    public.current_app_role() = 'supervisor'
    and public.role_has_scope('services')
  )
);

drop policy if exists products_public_read_published on public.products;
create policy products_public_read_published
on public.products
for select
using (status = 'published');

drop policy if exists products_staff_read on public.products;
create policy products_staff_read
on public.products
for select
using (
  public.current_app_role() in ('owner', 'admin')
  or (
    public.current_app_role() = 'supervisor'
    and public.role_has_scope('products')
  )
  or (
    public.current_app_role() = 'employee'
    and auth.uid() is not null
    and (created_by = auth.uid() or assigned_to = auth.uid())
  )
);

drop policy if exists products_staff_insert on public.products;
create policy products_staff_insert
on public.products
for insert
with check (
  auth.uid() is not null
  and created_by = auth.uid()
  and (
    public.current_app_role() in ('owner', 'admin')
    or (
      public.current_app_role() = 'supervisor'
      and public.role_has_scope('products')
    )
    or (
      public.current_app_role() = 'employee'
      and status = 'draft'
    )
  )
);

drop policy if exists products_staff_update on public.products;
create policy products_staff_update
on public.products
for update
using (
  auth.uid() is not null
  and (
    public.current_app_role() in ('owner', 'admin')
    or (
      public.current_app_role() = 'supervisor'
      and public.role_has_scope('products')
    )
    or (
      public.current_app_role() = 'employee'
      and status = 'draft'
      and (created_by = auth.uid() or assigned_to = auth.uid())
    )
  )
)
with check (
  auth.uid() is not null
  and (
    public.current_app_role() in ('owner', 'admin')
    or (
      public.current_app_role() = 'supervisor'
      and public.role_has_scope('products')
    )
    or (
      public.current_app_role() = 'employee'
      and status = 'draft'
      and (created_by = auth.uid() or assigned_to = auth.uid())
    )
  )
);

drop policy if exists products_staff_delete on public.products;
create policy products_staff_delete
on public.products
for delete
using (
  public.current_app_role() in ('owner', 'admin')
  or (
    public.current_app_role() = 'supervisor'
    and public.role_has_scope('products')
  )
);

drop policy if exists kits_public_read_published on public.kits;
create policy kits_public_read_published
on public.kits
for select
using (status = 'published');

drop policy if exists kits_staff_read on public.kits;
create policy kits_staff_read
on public.kits
for select
using (
  public.current_app_role() in ('owner', 'admin')
  or (
    public.current_app_role() = 'supervisor'
    and public.role_has_scope('kits')
  )
  or (
    public.current_app_role() = 'employee'
    and auth.uid() is not null
    and (created_by = auth.uid() or assigned_to = auth.uid())
  )
);

drop policy if exists kits_staff_insert on public.kits;
create policy kits_staff_insert
on public.kits
for insert
with check (
  auth.uid() is not null
  and created_by = auth.uid()
  and (
    public.current_app_role() in ('owner', 'admin')
    or (
      public.current_app_role() = 'supervisor'
      and public.role_has_scope('kits')
    )
    or (
      public.current_app_role() = 'employee'
      and status = 'draft'
    )
  )
);

drop policy if exists kits_staff_update on public.kits;
create policy kits_staff_update
on public.kits
for update
using (
  auth.uid() is not null
  and (
    public.current_app_role() in ('owner', 'admin')
    or (
      public.current_app_role() = 'supervisor'
      and public.role_has_scope('kits')
    )
    or (
      public.current_app_role() = 'employee'
      and status = 'draft'
      and (created_by = auth.uid() or assigned_to = auth.uid())
    )
  )
)
with check (
  auth.uid() is not null
  and (
    public.current_app_role() in ('owner', 'admin')
    or (
      public.current_app_role() = 'supervisor'
      and public.role_has_scope('kits')
    )
    or (
      public.current_app_role() = 'employee'
      and status = 'draft'
      and (created_by = auth.uid() or assigned_to = auth.uid())
    )
  )
);

drop policy if exists kits_staff_delete on public.kits;
create policy kits_staff_delete
on public.kits
for delete
using (
  public.current_app_role() in ('owner', 'admin')
  or (
    public.current_app_role() = 'supervisor'
    and public.role_has_scope('kits')
  )
);

drop policy if exists portfolio_public_read_published on public.portfolio_items;
create policy portfolio_public_read_published
on public.portfolio_items
for select
using (status = 'published');

drop policy if exists portfolio_staff_read on public.portfolio_items;
create policy portfolio_staff_read
on public.portfolio_items
for select
using (
  public.current_app_role() in ('owner', 'admin')
  or (
    public.current_app_role() = 'supervisor'
    and public.role_has_scope('portfolio')
  )
  or (
    public.current_app_role() = 'employee'
    and auth.uid() is not null
    and (created_by = auth.uid() or assigned_to = auth.uid())
  )
);

drop policy if exists portfolio_staff_insert on public.portfolio_items;
create policy portfolio_staff_insert
on public.portfolio_items
for insert
with check (
  auth.uid() is not null
  and created_by = auth.uid()
  and (
    public.current_app_role() in ('owner', 'admin')
    or (
      public.current_app_role() = 'supervisor'
      and public.role_has_scope('portfolio')
    )
    or (
      public.current_app_role() = 'employee'
      and status = 'draft'
    )
  )
);

drop policy if exists portfolio_staff_update on public.portfolio_items;
create policy portfolio_staff_update
on public.portfolio_items
for update
using (
  auth.uid() is not null
  and (
    public.current_app_role() in ('owner', 'admin')
    or (
      public.current_app_role() = 'supervisor'
      and public.role_has_scope('portfolio')
    )
    or (
      public.current_app_role() = 'employee'
      and status = 'draft'
      and (created_by = auth.uid() or assigned_to = auth.uid())
    )
  )
)
with check (
  auth.uid() is not null
  and (
    public.current_app_role() in ('owner', 'admin')
    or (
      public.current_app_role() = 'supervisor'
      and public.role_has_scope('portfolio')
    )
    or (
      public.current_app_role() = 'employee'
      and status = 'draft'
      and (created_by = auth.uid() or assigned_to = auth.uid())
    )
  )
);

drop policy if exists portfolio_staff_delete on public.portfolio_items;
create policy portfolio_staff_delete
on public.portfolio_items
for delete
using (
  public.current_app_role() in ('owner', 'admin')
  or (
    public.current_app_role() = 'supervisor'
    and public.role_has_scope('portfolio')
  )
);
