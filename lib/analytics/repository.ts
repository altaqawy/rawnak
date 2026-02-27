import 'server-only';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { isSupabaseAdminConfigured, isSupabaseConfigured } from '@/lib/supabase/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { AnalyticsEventName } from '@/lib/analytics/types';

export type AnalyticsEventInput = {
  eventName: AnalyticsEventName;
  pageSlug?: string | null;
  locale?: 'ar' | 'en' | null;
  entityType?: string | null;
  entityId?: string | null;
  entitySlug?: string | null;
  entityLabel?: string | null;
  blockId?: string | null;
  blockType?: string | null;
  targetUrl?: string | null;
  sessionId?: string | null;
  visitorId?: string | null;
  userId?: string | null;
  device?: 'mobile' | 'tablet' | 'desktop' | null;
  countryCode?: string | null;
  metadata?: Record<string, unknown>;
};

type AnalyticsSummary = {
  total_events: number;
  page_views: number;
  clicks: number;
  completed: number;
  ctr: number;
  completion_rate: number;
};

type AnalyticsPageStat = {
  page_slug: string;
  page_views: number;
  clicks: number;
  completed: number;
  completion_rate: number;
};

type AnalyticsEntityStat = {
  entity_type: string;
  entity_id: string | null;
  entity_slug: string | null;
  entity_label: string | null;
  clicks: number;
  completed: number;
  completion_rate: number;
};

type AnalyticsRecentEvent = {
  id: string;
  created_at: string;
  event_name: AnalyticsEventName;
  page_slug: string | null;
  locale: 'ar' | 'en' | null;
  entity_type: string | null;
  entity_id: string | null;
  entity_slug: string | null;
  entity_label: string | null;
  block_id: string | null;
  block_type: string | null;
  target_url: string | null;
};

export type AnalyticsDashboardData = {
  summary: AnalyticsSummary;
  pageStats: AnalyticsPageStat[];
  entityStats: AnalyticsEntityStat[];
  recentEvents: AnalyticsRecentEvent[];
};

export type AnalyticsFilters = {
  from?: string | null;
  to?: string | null;
  locale?: 'ar' | 'en' | null;
  entityType?: string | null;
};

function parseDateStart(value?: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return `${normalized}T00:00:00.000Z`;
}

function parseDateEnd(value?: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return `${normalized}T23:59:59.999Z`;
}

function normalizeText(value?: string | null, max = 180): string | null {
  if (!value) return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.slice(0, max);
}

function normalizeUuid(value?: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    normalized,
  )
    ? normalized
    : null;
}

export async function recordAnalyticsEvent(input: AnalyticsEventInput): Promise<void> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) return;

  const admin = createSupabaseAdminClient();
  await admin.from('analytics_events').insert({
    event_name: input.eventName,
    page_slug: normalizeText(input.pageSlug, 120),
    locale: input.locale ?? null,
    entity_type: normalizeText(input.entityType, 60),
    entity_id: normalizeUuid(input.entityId),
    entity_slug: normalizeText(input.entitySlug, 120),
    entity_label: normalizeText(input.entityLabel, 200),
    block_id: normalizeText(input.blockId, 120),
    block_type: normalizeText(input.blockType, 60),
    target_url: normalizeText(input.targetUrl, 500),
    session_id: normalizeText(input.sessionId, 120),
    visitor_id: normalizeText(input.visitorId, 120),
    user_id: normalizeUuid(input.userId),
    device: normalizeText(input.device, 20),
    country_code: normalizeText(input.countryCode, 2)?.toUpperCase() ?? null,
    metadata: input.metadata ?? {},
  });
}

export async function getOwnerAnalyticsDashboard(filters: AnalyticsFilters): Promise<AnalyticsDashboardData> {
  if (!isSupabaseConfigured()) {
    return {
      summary: {
        total_events: 0,
        page_views: 0,
        clicks: 0,
        completed: 0,
        ctr: 0,
        completion_rate: 0,
      },
      pageStats: [],
      entityStats: [],
      recentEvents: [],
    };
  }

  const supabase = await createSupabaseServerClient();
  const fromAt = parseDateStart(filters.from);
  const toAt = parseDateEnd(filters.to);
  const locale = filters.locale ?? null;
  const entityType = normalizeText(filters.entityType ?? null, 60);

  const [summaryResult, pageStatsResult, entityStatsResult, recentEventsResult] = await Promise.all([
    supabase.rpc('get_owner_analytics_summary', {
      from_at: fromAt,
      to_at: toAt,
      locale_filter: locale,
    }),
    supabase.rpc('get_owner_analytics_page_stats', {
      from_at: fromAt,
      to_at: toAt,
      locale_filter: locale,
    }),
    supabase.rpc('get_owner_analytics_entity_stats', {
      from_at: fromAt,
      to_at: toAt,
      locale_filter: locale,
      entity_filter: entityType,
    }),
    supabase
      .from('analytics_events')
      .select(
        'id, created_at, event_name, page_slug, locale, entity_type, entity_id, entity_slug, entity_label, block_id, block_type, target_url',
      )
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  const summaryData = (summaryResult.data?.[0] as AnalyticsSummary | undefined) ?? {
    total_events: 0,
    page_views: 0,
    clicks: 0,
    completed: 0,
    ctr: 0,
    completion_rate: 0,
  };

  return {
    summary: summaryData,
    pageStats: (pageStatsResult.data as AnalyticsPageStat[] | null) ?? [],
    entityStats: (entityStatsResult.data as AnalyticsEntityStat[] | null) ?? [],
    recentEvents: (recentEventsResult.data as AnalyticsRecentEvent[] | null) ?? [],
  };
}
