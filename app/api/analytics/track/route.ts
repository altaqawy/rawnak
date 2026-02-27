import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { recordAnalyticsEvent } from '@/lib/analytics/repository';
import type { AnalyticsEventName } from '@/lib/analytics/types';

type TrackPayload = {
  eventName?: string;
  pageSlug?: string;
  locale?: 'ar' | 'en';
  entityType?: string;
  entityId?: string;
  entitySlug?: string;
  entityLabel?: string;
  blockId?: string;
  blockType?: string;
  targetUrl?: string;
  sessionId?: string;
  visitorId?: string;
  metadata?: Record<string, unknown>;
};

const ALLOWED_EVENTS = new Set<AnalyticsEventName>([
  'page_view',
  'block_click',
  'content_click',
  'cta_click',
  'operation_completed',
]);

function sanitize(value: unknown, max = 180): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.slice(0, max);
}

function detectDevice(payload: TrackPayload, userAgent: string | null): 'mobile' | 'tablet' | 'desktop' | null {
  const metaDevice = payload.metadata?.device;
  if (metaDevice === 'mobile' || metaDevice === 'tablet' || metaDevice === 'desktop') return metaDevice;
  const ua = (userAgent ?? '').toLowerCase();
  if (!ua) return null;
  if (ua.includes('ipad') || ua.includes('tablet')) return 'tablet';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'mobile';
  return 'desktop';
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as TrackPayload;
    if (!payload?.eventName || !ALLOWED_EVENTS.has(payload.eventName as AnalyticsEventName)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    let userId: string | null = null;
    try {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
    } catch {
      userId = null;
    }

    const ua = sanitize(request.headers.get('user-agent'), 500);
    const referrer = sanitize(request.headers.get('referer'), 500);
    const countryHeader =
      request.headers.get('x-vercel-ip-country') ??
      request.headers.get('cf-ipcountry') ??
      request.headers.get('x-country-code');
    const countryCode = sanitize(countryHeader, 2)?.toUpperCase() ?? null;
    const device = detectDevice(payload, ua);

    await recordAnalyticsEvent({
      eventName: payload.eventName as AnalyticsEventName,
      pageSlug: sanitize(payload.pageSlug, 120),
      locale: payload.locale === 'ar' || payload.locale === 'en' ? payload.locale : null,
      entityType: sanitize(payload.entityType, 60),
      entityId: sanitize(payload.entityId, 80),
      entitySlug: sanitize(payload.entitySlug, 120),
      entityLabel: sanitize(payload.entityLabel, 200),
      blockId: sanitize(payload.blockId, 120),
      blockType: sanitize(payload.blockType, 60),
      targetUrl: sanitize(payload.targetUrl, 500),
      sessionId: sanitize(payload.sessionId, 120),
      visitorId: sanitize(payload.visitorId, 120),
      userId,
      device,
      countryCode,
      metadata: {
        ...(payload.metadata ?? {}),
        referrer,
        userAgent: ua,
      },
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
