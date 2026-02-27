'use client';

import type { AnalyticsEventName } from '@/lib/analytics/types';

type ClientEventPayload = {
  eventName: AnalyticsEventName;
  pageSlug?: string;
  locale?: 'ar' | 'en';
  entityType?: string;
  entityId?: string;
  entitySlug?: string;
  entityLabel?: string;
  blockId?: string;
  blockType?: string;
  targetUrl?: string;
  metadata?: Record<string, unknown>;
};

const ENDPOINT = '/api/analytics/track';

function ensureKey(storageKey: string): string {
  if (typeof window === 'undefined') return '';
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;
  const value = crypto.randomUUID();
  window.localStorage.setItem(storageKey, value);
  return value;
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  const key = 'rawnak_analytics_session_id';
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const value = crypto.randomUUID();
  window.sessionStorage.setItem(key, value);
  return value;
}

function getViewportDevice(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function trackAnalyticsEvent(input: ClientEventPayload) {
  if (typeof window === 'undefined') return;

  const body = JSON.stringify({
    ...input,
    sessionId: getSessionId(),
    visitorId: ensureKey('rawnak_analytics_visitor_id'),
    metadata: {
      ...(input.metadata ?? {}),
      device: getViewportDevice(),
    },
  });

  const blob = new Blob([body], { type: 'application/json' });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(ENDPOINT, blob);
    return;
  }

  void fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  });
}
