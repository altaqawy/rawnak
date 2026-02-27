/**
 * Stats Overview Component
 * Display KPI cards for Owner Dashboard
 */

import type { KPIs } from '@/lib/owner-console/types';
import { KPICard } from './PanelStates';

type StatsOverviewProps = {
  kpis: KPIs;
  labels: {
    revenue: string;
    activeOrders: string;
    customerSatisfaction: string;
    performanceScore: string;
  };
};

export function StatsOverview({ kpis, labels }: StatsOverviewProps) {
  // Filter out undefined KPIs
  const visibleKpis = Object.entries(kpis)
    .filter(([_, kpi]) => kpi !== undefined)
    .slice(0, 4); // Show max 4 KPI cards

  if (visibleKpis.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/50 bg-muted/20 p-8 text-center">
        <p className="text-sm text-muted-foreground">No KPIs configured yet</p>
      </div>
    );
  }

  const labelMap: Record<string, string> = {
    revenue: labels.revenue,
    activeOrders: labels.activeOrders,
    customerSatisfaction: labels.customerSatisfaction,
    performanceScore: labels.performanceScore,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {visibleKpis.map(([key, kpi]) => (
        <KPICard
          key={key}
          label={labelMap[key] || key}
          value={kpi?.value}
          status={kpi?.status || 'empty'}
          note={kpi?.note}
          currency={kpi?.currency}
        />
      ))}
    </div>
  );
}
