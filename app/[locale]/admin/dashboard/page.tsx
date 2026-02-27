import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { AdminDashboardClient } from '@/components/dashboard/AdminDashboardClient';
import { getDashboardData } from '@/lib/admin-console/repository';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export default async function AdminDashboardPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  await requireOwner(locale);

  const data = await getDashboardData({
    from: pickParam(query.from),
    to: pickParam(query.to),
    locale: pickParam(query.locale),
    device: pickParam(query.device),
    country: pickParam(query.country),
    eventType: pickParam(query.eventType),
    pageSlug: pickParam(query.pageSlug),
  });

  const t = await getTranslations('adminDashboard');

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('title')}</h1>
        <p className="mt-2 text-start text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <form className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          <input type="date" name="from" defaultValue={pickParam(query.from) ?? ''} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <input type="date" name="to" defaultValue={pickParam(query.to) ?? ''} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <select name="locale" defaultValue={pickParam(query.locale) ?? ''} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm">
            <option value="">{t('filters.all')}</option>
            <option value="ar">AR</option>
            <option value="en">EN</option>
          </select>
          <select name="device" defaultValue={pickParam(query.device) ?? ''} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm">
            <option value="">{t('filters.all')}</option>
            <option value="mobile">{t('filters.mobile')}</option>
            <option value="tablet">{t('filters.tablet')}</option>
            <option value="desktop">{t('filters.desktop')}</option>
          </select>
          <input name="country" defaultValue={pickParam(query.country) ?? ''} placeholder={t('filters.country')} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <input name="eventType" defaultValue={pickParam(query.eventType) ?? ''} placeholder={t('filters.eventType')} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <div className="md:col-span-3 lg:col-span-6">
            <button type="submit" className="rounded-md border border-border/70 bg-card/70 px-4 py-2 text-xs text-muted-foreground">{t('filters.apply')}</button>
          </div>
        </form>
      </section>

      <AdminDashboardClient
        data={data}
        labels={{
          sessions: t('kpi.sessions'),
          uniqueVisitors: t('kpi.uniqueVisitors'),
          pageviews: t('kpi.pageviews'),
          totalEvents: t('kpi.totalEvents'),
          conversions: t('kpi.conversions'),
          newCustomers: t('kpi.newCustomers'),
          outstandingInvoices: t('kpi.outstandingInvoices'),
          pageviewsTrend: t('charts.pageviewsTrend'),
          noData: t('empty.noData'),
          noGeoData: t('empty.noGeoData'),
          map: t('map.map'),
          list: t('map.list'),
          financeMini: t('mini.finance'),
          inventoryMini: t('mini.inventory'),
          cashIn: t('mini.cashIn'),
          cashOut: t('mini.cashOut'),
          stockIn: t('mini.stockIn'),
          stockOut: t('mini.stockOut'),
        }}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="glass-card rounded-2xl border border-border/70 p-4">
          <h2 className="text-start text-sm font-medium text-foreground">{t('tables.topPages')}</h2>
          {data.topPages.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{t('empty.noData')}</p>
          ) : (
            <div className="mt-3 space-y-2">
              {data.topPages.map((item) => (
                <div key={item.pageSlug} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{item.pageSlug}</span>
                  <span className="text-muted-foreground">{item.views}</span>
                </div>
              ))}
            </div>
          )}
        </article>
        <article className="glass-card rounded-2xl border border-border/70 p-4">
          <h2 className="text-start text-sm font-medium text-foreground">{t('tables.recentEvents')}</h2>
          {data.recentEvents.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{t('empty.noData')}</p>
          ) : (
            <div className="mt-3 space-y-2">
              {data.recentEvents.map((item) => (
                <div key={item.id} className="text-sm text-muted-foreground">
                  {item.event_name} · {item.page_slug || '-'} · {new Date(item.occurred_at).toLocaleString()}
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="glass-card rounded-2xl border border-border/70 p-4">
          <h2 className="text-start text-sm font-medium text-foreground">{t('tables.latestCustomers')}</h2>
          {data.latestCustomers.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{t('empty.noData')}</p>
          ) : (
            <div className="mt-3 space-y-2">
              {data.latestCustomers.map((item) => (
                <div key={item.id} className="text-sm text-muted-foreground">
                  {(item.name || '-') + ' | ' + new Date(item.created_at).toLocaleString()}
                </div>
              ))}
            </div>
          )}
        </article>
        <article className="glass-card rounded-2xl border border-border/70 p-4">
          <h2 className="text-start text-sm font-medium text-foreground">{t('tables.recentFinance')}</h2>
          {data.recentFinance.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{t('empty.noData')}</p>
          ) : (
            <div className="mt-3 space-y-2">
              {data.recentFinance.map((item) => (
                <div key={`${item.kind}-${item.id}`} className="text-sm text-muted-foreground">
                  {item.kind} | {item.amount} | {new Date(item.occurred_at).toLocaleString()}
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
