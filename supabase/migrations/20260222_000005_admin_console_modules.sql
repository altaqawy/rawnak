do $$
begin
  create type public.lead_status as enum ('new', 'in_progress', 'closed');
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.stock_direction as enum ('in', 'out');
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.invoice_status as enum ('draft', 'issued', 'paid', 'void');
exception
  when duplicate_object then null;
end;
$$;

alter table if exists public.analytics_events
  add column if not exists occurred_at timestamptz not null default timezone('utc', now()),
  add column if not exists device text,
  add column if not exists country_code text,
  add column if not exists props jsonb not null default '{}'::jsonb;

update public.analytics_events
set occurred_at = coalesce(created_at, occurred_at)
where occurred_at is null;

create index if not exists idx_analytics_events_occurred_at
  on public.analytics_events (occurred_at desc);

create index if not exists idx_analytics_events_country
  on public.analytics_events (country_code);

create index if not exists idx_analytics_events_locale_device
  on public.analytics_events (locale, device);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.leads_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers (id) on delete set null,
  name text,
  channel text,
  status public.lead_status not null default 'new',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  sku text unique,
  name_ar text,
  name_en text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.stock_moves (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.inventory_items (id) on delete cascade,
  direction public.stock_direction not null,
  quantity numeric not null check (quantity > 0),
  reference_type text,
  reference_id uuid,
  note text,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers (id) on delete set null,
  status public.invoice_status not null default 'draft',
  currency text default 'EGP',
  subtotal numeric,
  tax numeric,
  total numeric,
  issued_at timestamptz,
  due_at timestamptz,
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices (id) on delete set null,
  customer_id uuid references public.customers (id) on delete set null,
  amount numeric not null check (amount > 0),
  method text,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  amount numeric not null check (amount > 0),
  category text,
  occurred_at timestamptz not null default timezone('utc', now()),
  note text,
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_leads_requests_status on public.leads_requests (status);
create index if not exists idx_stock_moves_item_id on public.stock_moves (item_id);
create index if not exists idx_stock_moves_occurred_at on public.stock_moves (occurred_at desc);
create index if not exists idx_invoices_status on public.invoices (status);
create index if not exists idx_payments_occurred_at on public.payments (occurred_at desc);
create index if not exists idx_expenses_occurred_at on public.expenses (occurred_at desc);

drop trigger if exists set_customers_updated_at on public.customers;
create trigger set_customers_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

drop trigger if exists set_leads_requests_updated_at on public.leads_requests;
create trigger set_leads_requests_updated_at
before update on public.leads_requests
for each row
execute function public.set_updated_at();

drop trigger if exists set_inventory_items_updated_at on public.inventory_items;
create trigger set_inventory_items_updated_at
before update on public.inventory_items
for each row
execute function public.set_updated_at();

drop trigger if exists set_invoices_updated_at on public.invoices;
create trigger set_invoices_updated_at
before update on public.invoices
for each row
execute function public.set_updated_at();

grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.leads_requests to authenticated;
grant select, insert, update, delete on public.inventory_items to authenticated;
grant select, insert, update, delete on public.stock_moves to authenticated;
grant select, insert, update, delete on public.invoices to authenticated;
grant select, insert, update, delete on public.payments to authenticated;
grant select, insert, update, delete on public.expenses to authenticated;

alter table public.customers enable row level security;
alter table public.customers force row level security;
alter table public.leads_requests enable row level security;
alter table public.leads_requests force row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_items force row level security;
alter table public.stock_moves enable row level security;
alter table public.stock_moves force row level security;
alter table public.invoices enable row level security;
alter table public.invoices force row level security;
alter table public.payments enable row level security;
alter table public.payments force row level security;
alter table public.expenses enable row level security;
alter table public.expenses force row level security;

drop policy if exists customers_owner_all on public.customers;
create policy customers_owner_all
on public.customers
for all
using (public.is_owner())
with check (public.is_owner());

drop policy if exists leads_requests_owner_all on public.leads_requests;
create policy leads_requests_owner_all
on public.leads_requests
for all
using (public.is_owner())
with check (public.is_owner());

drop policy if exists inventory_items_owner_all on public.inventory_items;
create policy inventory_items_owner_all
on public.inventory_items
for all
using (public.is_owner())
with check (public.is_owner());

drop policy if exists stock_moves_owner_all on public.stock_moves;
create policy stock_moves_owner_all
on public.stock_moves
for all
using (public.is_owner())
with check (public.is_owner());

drop policy if exists invoices_owner_all on public.invoices;
create policy invoices_owner_all
on public.invoices
for all
using (public.is_owner())
with check (public.is_owner());

drop policy if exists payments_owner_all on public.payments;
create policy payments_owner_all
on public.payments
for all
using (public.is_owner())
with check (public.is_owner());

drop policy if exists expenses_owner_all on public.expenses;
create policy expenses_owner_all
on public.expenses
for all
using (public.is_owner())
with check (public.is_owner());
