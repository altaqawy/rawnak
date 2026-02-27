'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { WorldMapPanel } from '@/components/dashboard/WorldMapPanel';

type DashboardData = {
  kpis: {
    sessions: number;
    uniqueVisitors: number;
    pageviews: number;
    totalEvents: number;
    conversions: number;
    newCustomers: number;
    outstandingInvoicesCount: number;
    outstandingInvoicesTotal: number;
  };
  pageviewsByDay: Array<{ date: string; value: number }>;
  countryStats: Array<{ countryCode: string; value: number }>;
  topPages: Array<{ pageSlug: string; views: number }>;
  recentEvents: Array<{
    id: string;
    occurred_at: string;
    event_name: string;
    page_slug: string | null;
    country_code: string | null;
  }>;
  financeSummary: { cashIn: number; cashOut: number };
  inventorySummary: { stockIn: number; stockOut: number };
  latestCustomers: Array<{ id: string; name: string | null; created_at: string }>;
  latestLeads: Array<{ id: string; name: string | null; status: string; created_at: string }>;
  recentFinance: Array<{ kind: 'payment' | 'expense'; id: string; amount: number; occurred_at: string }>;
};

export function AdminDashboardClient({
  data,
  labels,
}: {
  data: DashboardData;
  labels: Record<string, string>;
}) {
  const kpiCards = [
    { label: labels.sessions, value: data.kpis.sessions },
    { label: labels.uniqueVisitors, value: data.kpis.uniqueVisitors },
    { label: labels.pageviews, value: data.kpis.pageviews },
    { label: labels.totalEvents, value: data.kpis.totalEvents },
    { label: labels.conversions, value: data.kpis.conversions },
    { label: labels.newCustomers, value: data.kpis.newCustomers },
    {
      label: labels.outstandingInvoices,
      value: `${data.kpis.outstandingInvoicesCount} / ${data.kpis.outstandingInvoicesTotal}`,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <article key={card.label} className="glass-card rounded-2xl border border-border/70 p-4">
            <p className="text-start text-xs text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-start text-2xl font-semibold text-foreground">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <article className="glass-card rounded-2xl border border-border/70 p-4">
          <h2 className="text-start text-sm font-medium text-foreground">{labels.pageviewsTrend}</h2>
          <div className="mt-3 h-[320px]">
            {data.pageviewsByDay.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border/70">
                <p className="text-sm text-muted-foreground">{labels.noData}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.pageviewsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={labels.pageviews}
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
        <WorldMapPanel
          countries={data.countryStats}
          emptyLabel={labels.noGeoData}
          mapLabel={labels.map}
          listLabel={labels.list}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="glass-card rounded-2xl border border-border/70 p-4">
          <h2 className="text-start text-sm font-medium text-foreground">{labels.financeMini}</h2>
          <div className="mt-3 grid gap-2">
            <p className="text-start text-sm text-muted-foreground">
              {labels.cashIn}: {data.financeSummary.cashIn}
            </p>
            <p className="text-start text-sm text-muted-foreground">
              {labels.cashOut}: {data.financeSummary.cashOut}
            </p>
          </div>
        </article>
        <article className="glass-card rounded-2xl border border-border/70 p-4">
          <h2 className="text-start text-sm font-medium text-foreground">{labels.inventoryMini}</h2>
          <div className="mt-3 grid gap-2">
            <p className="text-start text-sm text-muted-foreground">
              {labels.stockIn}: {data.inventorySummary.stockIn}
            </p>
            <p className="text-start text-sm text-muted-foreground">
              {labels.stockOut}: {data.inventorySummary.stockOut}
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
