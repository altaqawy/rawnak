'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type CountryPoint = {
  code: string;
  lat: number;
  lng: number;
};

const COUNTRY_POINTS: Record<string, CountryPoint> = {
  US: { code: 'US', lat: 38, lng: -97 },
  CA: { code: 'CA', lat: 56, lng: -106 },
  MX: { code: 'MX', lat: 23, lng: -102 },
  BR: { code: 'BR', lat: -14, lng: -51 },
  AR: { code: 'AR', lat: -38, lng: -63 },
  GB: { code: 'GB', lat: 55, lng: -3 },
  FR: { code: 'FR', lat: 46, lng: 2 },
  DE: { code: 'DE', lat: 51, lng: 10 },
  ES: { code: 'ES', lat: 40, lng: -4 },
  IT: { code: 'IT', lat: 42, lng: 12 },
  EG: { code: 'EG', lat: 26, lng: 30 },
  SA: { code: 'SA', lat: 24, lng: 45 },
  AE: { code: 'AE', lat: 24, lng: 54 },
  IN: { code: 'IN', lat: 20, lng: 78 },
  PK: { code: 'PK', lat: 30, lng: 70 },
  TR: { code: 'TR', lat: 39, lng: 35 },
  RU: { code: 'RU', lat: 60, lng: 100 },
  CN: { code: 'CN', lat: 35, lng: 103 },
  JP: { code: 'JP', lat: 36, lng: 138 },
  ID: { code: 'ID', lat: -5, lng: 120 },
  AU: { code: 'AU', lat: -25, lng: 133 },
  ZA: { code: 'ZA', lat: -30, lng: 25 },
  NG: { code: 'NG', lat: 9, lng: 8 },
};

function projectToSvg(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return { x, y };
}

export function WorldMapPanel({
  countries,
  emptyLabel,
  mapLabel,
  listLabel,
}: {
  countries: Array<{ countryCode: string; value: number }>;
  emptyLabel: string;
  mapLabel: string;
  listLabel: string;
}) {
  const [mode, setMode] = useState<'map' | 'list'>('map');

  const maxValue = useMemo(() => {
    if (countries.length === 0) return 0;
    return Math.max(...countries.map((item) => item.value));
  }, [countries]);

  const points = useMemo(() => {
    return countries
      .map((item) => {
        const point = COUNTRY_POINTS[item.countryCode.toUpperCase()];
        if (!point) return null;
        const projected = projectToSvg(point.lat, point.lng);
        const radius = maxValue > 0 ? 4 + (item.value / maxValue) * 14 : 4;
        return {
          ...item,
          ...projected,
          radius,
        };
      })
      .filter(Boolean) as Array<{ countryCode: string; value: number; x: number; y: number; radius: number }>;
  }, [countries, maxValue]);

  return (
    <article className="glass-card rounded-2xl border border-border/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('map')}
            className={cn(
              'rounded-md border border-border/70 px-2 py-1 text-xs',
              mode === 'map' ? 'bg-card/80 text-foreground' : 'bg-card/50 text-muted-foreground',
            )}
          >
            {mapLabel}
          </button>
          <button
            type="button"
            onClick={() => setMode('list')}
            className={cn(
              'rounded-md border border-border/70 px-2 py-1 text-xs',
              mode === 'list' ? 'bg-card/80 text-foreground' : 'bg-card/50 text-muted-foreground',
            )}
          >
            {listLabel}
          </button>
        </div>
      </div>

      {mode === 'map' ? (
        <div className="relative rounded-xl border border-border/70 bg-card/30 p-2">
          <svg viewBox="0 0 1000 500" className="h-[280px] w-full">
            <rect x="0" y="0" width="1000" height="500" fill="transparent" />
            <g fill="none" stroke="currentColor" className="text-border/60">
              <path d="M20 120h200l120 70 50 100-40 70-150 30-160-40z" />
              <path d="M360 110h100l40 50 10 90-80 40-60-50z" />
              <path d="M420 260l90 10 80 130-70 50-110-20-50-90z" />
              <path d="M560 90h220l150 90-10 90-120 40-60 80-90-20-80-130z" />
              <path d="M800 360l130 20 40 70-80 30-90-40z" />
            </g>
            {points.map((point) => (
              <g key={point.countryCode}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={point.radius}
                  className="fill-primary/70 stroke-primary/80"
                />
              </g>
            ))}
          </svg>
          {countries.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/70">
              <p className="text-sm text-muted-foreground">{emptyLabel}</p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl border border-border/70 bg-card/30 p-3">
          {countries.length === 0 ? (
            <p className="text-sm text-muted-foreground">{emptyLabel}</p>
          ) : (
            <div className="space-y-2">
              {countries.slice(0, 10).map((item) => (
                <div key={item.countryCode} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{item.countryCode}</span>
                  <span className="text-muted-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
