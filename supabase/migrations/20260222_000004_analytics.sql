create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (
    event_name in ('page_view', 'block_click', 'content_click', 'cta_click', 'operation_completed')
  ),
  page_slug text,
  locale text check (locale in ('ar', 'en')),
  entity_type text,
  entity_id uuid,
  entity_slug text,
  entity_label text,
  block_id text,
  block_type text,
  target_url text,
  session_id text,
  visitor_id text,
  user_id uuid references auth.users (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_analytics_events_created_at
  on public.analytics_events (created_at desc);

create index if not exists idx_analytics_events_event_name
  on public.analytics_events (event_name);

create index if not exists idx_analytics_events_page_slug
  on public.analytics_events (page_slug);

create index if not exists idx_analytics_events_entity
  on public.analytics_events (entity_type, entity_id);

grant select, insert, update, delete on public.analytics_events to authenticated;

alter table public.analytics_events enable row level security;
alter table public.analytics_events force row level security;

drop policy if exists analytics_events_owner_all on public.analytics_events;
create policy analytics_events_owner_all
on public.analytics_events
for all
using (public.is_owner())
with check (public.is_owner());

create or replace function public.get_owner_analytics_summary(
  from_at timestamptz default null,
  to_at timestamptz default null,
  locale_filter text default null
)
returns table (
  total_events bigint,
  page_views bigint,
  clicks bigint,
  completed bigint,
  ctr numeric,
  completion_rate numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with filtered as (
    select *
    from public.analytics_events ae
    where
      (from_at is null or ae.created_at >= from_at)
      and (to_at is null or ae.created_at <= to_at)
      and (locale_filter is null or ae.locale = locale_filter)
  ),
  agg as (
    select
      count(*)::bigint as total_events,
      count(*) filter (where event_name = 'page_view')::bigint as page_views,
      count(*) filter (where event_name in ('block_click', 'content_click', 'cta_click'))::bigint as clicks,
      count(*) filter (where event_name = 'operation_completed')::bigint as completed
    from filtered
  )
  select
    agg.total_events,
    agg.page_views,
    agg.clicks,
    agg.completed,
    case when agg.page_views = 0 then 0 else round((agg.clicks::numeric / agg.page_views::numeric) * 100, 2) end as ctr,
    case when agg.clicks = 0 then 0 else round((agg.completed::numeric / agg.clicks::numeric) * 100, 2) end as completion_rate
  from agg
  where public.is_owner();
$$;

create or replace function public.get_owner_analytics_page_stats(
  from_at timestamptz default null,
  to_at timestamptz default null,
  locale_filter text default null
)
returns table (
  page_slug text,
  page_views bigint,
  clicks bigint,
  completed bigint,
  completion_rate numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(ae.page_slug, 'unknown') as page_slug,
    count(*) filter (where ae.event_name = 'page_view')::bigint as page_views,
    count(*) filter (where ae.event_name in ('block_click', 'content_click', 'cta_click'))::bigint as clicks,
    count(*) filter (where ae.event_name = 'operation_completed')::bigint as completed,
    case
      when count(*) filter (where ae.event_name in ('block_click', 'content_click', 'cta_click')) = 0 then 0
      else round(
        (
          (count(*) filter (where ae.event_name = 'operation_completed'))::numeric
          / (count(*) filter (where ae.event_name in ('block_click', 'content_click', 'cta_click'))::numeric)
        ) * 100,
        2
      )
    end as completion_rate
  from public.analytics_events ae
  where
    (from_at is null or ae.created_at >= from_at)
    and (to_at is null or ae.created_at <= to_at)
    and (locale_filter is null or ae.locale = locale_filter)
    and public.is_owner()
  group by coalesce(ae.page_slug, 'unknown')
  order by page_views desc, clicks desc;
$$;

create or replace function public.get_owner_analytics_entity_stats(
  from_at timestamptz default null,
  to_at timestamptz default null,
  locale_filter text default null,
  entity_filter text default null
)
returns table (
  entity_type text,
  entity_id uuid,
  entity_slug text,
  entity_label text,
  clicks bigint,
  completed bigint,
  completion_rate numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    ae.entity_type,
    ae.entity_id,
    max(ae.entity_slug) as entity_slug,
    max(ae.entity_label) as entity_label,
    count(*) filter (where ae.event_name in ('content_click', 'cta_click', 'block_click'))::bigint as clicks,
    count(*) filter (where ae.event_name = 'operation_completed')::bigint as completed,
    case
      when count(*) filter (where ae.event_name in ('content_click', 'cta_click', 'block_click')) = 0 then 0
      else round(
        (
          (count(*) filter (where ae.event_name = 'operation_completed'))::numeric
          / (count(*) filter (where ae.event_name in ('content_click', 'cta_click', 'block_click'))::numeric)
        ) * 100,
        2
      )
    end as completion_rate
  from public.analytics_events ae
  where
    (from_at is null or ae.created_at >= from_at)
    and (to_at is null or ae.created_at <= to_at)
    and (locale_filter is null or ae.locale = locale_filter)
    and (entity_filter is null or ae.entity_type = entity_filter)
    and ae.entity_type is not null
    and public.is_owner()
  group by ae.entity_type, ae.entity_id
  order by completed desc, clicks desc;
$$;

grant execute on function public.get_owner_analytics_summary(timestamptz, timestamptz, text) to authenticated;
grant execute on function public.get_owner_analytics_page_stats(timestamptz, timestamptz, text) to authenticated;
grant execute on function public.get_owner_analytics_entity_stats(timestamptz, timestamptz, text, text) to authenticated;
