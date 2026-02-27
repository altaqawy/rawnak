/**
 * Shared UI Components for Owner Console Panels
 * Handles Loading, Empty, Error, and Not Configured states
 */

import type { PropsWithChildren } from 'react';

type PanelStateProps = PropsWithChildren<{
  message: string;
  icon?: string;
  variant?: 'empty' | 'error' | 'not_configured' | 'loading';
}>;

/**
 * Loading skeleton for panels
 */
export function PanelLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="space-y-3">
      <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-3 w-full animate-pulse rounded bg-muted" />
        ))}
      </div>
    </div>
  );
}

/**
 * Empty state for panels (no data found)
 */
export function PanelEmpty({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/50 bg-muted/20 p-6 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * Not configured state for panels (missing schema/config)
 */
export function PanelNotConfigured({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-yellow-200 bg-yellow-50/50 p-6 text-center dark:border-yellow-900 dark:bg-yellow-950/20">
      <p className="text-sm text-yellow-900 dark:text-yellow-200">{message}</p>
    </div>
  );
}

/**
 * Error state for panels (query failure)
 */
export function PanelError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-red-200 bg-red-50/50 p-6 text-center dark:border-red-900 dark:bg-red-950/20">
      <p className="text-sm text-red-900 dark:text-red-200">{message}</p>
    </div>
  );
}

/**
 * Generic panel wrapper with status badge
 */
export function PanelWrapper({
  title,
  status,
  children,
  note,
}: {
  title: string;
  status: 'ok' | 'loading' | 'empty' | 'error' | 'not_configured';
  children: React.ReactNode;
  note?: string;
}) {
  const statusColors = {
    ok: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    loading: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    empty: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    not_configured: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  return (
    <div className="glass-card rounded-2xl border border-border/70 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColors[status]}`}>
          {status.replace('_', ' ')}
        </span>
      </div>
      {note && <p className="mb-4 text-xs text-muted-foreground">{note}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

/**
 * KPI Card Component
 */
export function KPICard({
  label,
  value,
  status,
  note,
  currency,
}: {
  label: string;
  value?: number;
  status: 'ok' | 'empty' | 'error' | 'not_configured';
  note?: string;
  currency?: string;
}) {
  return (
    <div className="glass-card rounded-xl border border-border/70 p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {status === 'ok' && value !== undefined ? (
        <div className="mt-2">
          <p className="text-2xl font-bold text-foreground">
            {currency ? `${currency} ` : ''}
            {value.toLocaleString()}
          </p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{note || 'Not available'}</p>
      )}
      <div className="mt-2 inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
        {status}
      </div>
    </div>
  );
}

/**
 * Health status badge
 */
export function HealthBadge({ status }: { status: 'green' | 'yellow' | 'red' | 'unknown' | 'not_configured' }) {
  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    unknown: 'bg-gray-500',
    not_configured: 'bg-gray-400',
  };

  return <div className={`h-3 w-3 rounded-full ${colors[status]}`} />;
}
