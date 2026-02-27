import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { getOwnerAnalyticsDashboard } from '@/lib/analytics/repository';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export default async function AdminAnalyticsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  await requireOwner(locale);
  const t = await getTranslations('analytics');

  const from = pickParam(query.from) ?? '';
  const to = pickParam(query.to) ?? '';
  const localeFilter = pickParam(query.locale);
  const entityFilter = pickParam(query.entityType);

  const data = await getOwnerAnalyticsDashboard({
    from: from || null,
    to: to || null,
    locale: localeFilter === 'ar' || localeFilter === 'en' ? localeFilter : null,
    entityType: entityFilter || null,
  });

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('title')}</h1>
        <p className="mt-2 text-start text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <form className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <label htmlFor="analytics-from" className="block text-start text-xs text-muted-foreground">
              {t('filters.from')}
            </label>
            <input
              id="analytics-from"
              type="date"
              name="from"
              defaultValue={from}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="analytics-to" className="block text-start text-xs text-muted-foreground">
              {t('filters.to')}
            </label>
            <input
              id="analytics-to"
              type="date"
              name="to"
              defaultValue={to}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="analytics-locale" className="block text-start text-xs text-muted-foreground">
              {t('filters.locale')}
            </label>
            <select
              id="analytics-locale"
              name="locale"
              defaultValue={localeFilter ?? ''}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            >
              <option value="">{t('filters.all')}</option>
              <option value="ar">AR</option>
              <option value="en">EN</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="analytics-entity" className="block text-start text-xs text-muted-foreground">
              {t('filters.entityType')}
            </label>
            <select
              id="analytics-entity"
              name="entityType"
              defaultValue={entityFilter ?? ''}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            >
              <option value="">{t('filters.all')}</option>
              <option value="services">{t('entity.services')}</option>
              <option value="products">{t('entity.products')}</option>
              <option value="kits">{t('entity.kits')}</option>
              <option value="portfolio">{t('entity.portfolio')}</option>
            </select>
          </div>
          <div className="md:col-span-4">
            <button type="submit" className="rounded-md border border-border/70 bg-card/70 px-4 py-2 text-xs">
              {t('filters.apply')}
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <article className="glass-card rounded-2xl border border-border/70 p-5">
          <p className="text-start text-xs text-muted-foreground">{t('cards.totalEvents')}</p>
          <p className="mt-2 text-start text-2xl font-semibold text-foreground">{data.summary.total_events}</p>
        </article>
        <article className="glass-card rounded-2xl border border-border/70 p-5">
          <p className="text-start text-xs text-muted-foreground">{t('cards.pageViews')}</p>
          <p className="mt-2 text-start text-2xl font-semibold text-foreground">{data.summary.page_views}</p>
        </article>
        <article className="glass-card rounded-2xl border border-border/70 p-5">
          <p className="text-start text-xs text-muted-foreground">{t('cards.clicks')}</p>
          <p className="mt-2 text-start text-2xl font-semibold text-foreground">{data.summary.clicks}</p>
        </article>
        <article className="glass-card rounded-2xl border border-border/70 p-5">
          <p className="text-start text-xs text-muted-foreground">{t('cards.completed')}</p>
          <p className="mt-2 text-start text-2xl font-semibold text-foreground">{data.summary.completed}</p>
        </article>
        <article className="glass-card rounded-2xl border border-border/70 p-5">
          <p className="text-start text-xs text-muted-foreground">{t('cards.ctr')}</p>
          <p className="mt-2 text-start text-2xl font-semibold text-foreground">{data.summary.ctr}%</p>
        </article>
        <article className="glass-card rounded-2xl border border-border/70 p-5">
          <p className="text-start text-xs text-muted-foreground">{t('cards.completionRate')}</p>
          <p className="mt-2 text-start text-2xl font-semibold text-foreground">{data.summary.completion_rate}%</p>
        </article>
      </section>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-start text-base font-medium text-foreground">{t('tables.entities')}</h2>
        {data.entityStats.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border/70">
            <table className="min-w-full divide-y divide-border/70 text-sm">
              <thead className="bg-card/60 text-start text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-start">{t('columns.entityType')}</th>
                  <th className="px-3 py-2 text-start">{t('columns.entity')}</th>
                  <th className="px-3 py-2 text-start">{t('columns.clicks')}</th>
                  <th className="px-3 py-2 text-start">{t('columns.completed')}</th>
                  <th className="px-3 py-2 text-start">{t('columns.rate')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {data.entityStats.map((row) => (
                  <tr key={`${row.entity_type}-${row.entity_id ?? row.entity_slug ?? 'na'}`}>
                    <td className="px-3 py-2 text-start text-foreground">{row.entity_type ?? '-'}</td>
                    <td className="px-3 py-2 text-start text-muted-foreground">
                      {row.entity_label || row.entity_slug || row.entity_id || '-'}
                    </td>
                    <td className="px-3 py-2 text-start text-muted-foreground">{row.clicks}</td>
                    <td className="px-3 py-2 text-start text-muted-foreground">{row.completed}</td>
                    <td className="px-3 py-2 text-start text-muted-foreground">{row.completion_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-start text-base font-medium text-foreground">{t('tables.pages')}</h2>
        {data.pageStats.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border/70">
            <table className="min-w-full divide-y divide-border/70 text-sm">
              <thead className="bg-card/60 text-start text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-start">{t('columns.page')}</th>
                  <th className="px-3 py-2 text-start">{t('columns.views')}</th>
                  <th className="px-3 py-2 text-start">{t('columns.clicks')}</th>
                  <th className="px-3 py-2 text-start">{t('columns.completed')}</th>
                  <th className="px-3 py-2 text-start">{t('columns.rate')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {data.pageStats.map((row) => (
                  <tr key={row.page_slug}>
                    <td className="px-3 py-2 text-start text-foreground">{row.page_slug}</td>
                    <td className="px-3 py-2 text-start text-muted-foreground">{row.page_views}</td>
                    <td className="px-3 py-2 text-start text-muted-foreground">{row.clicks}</td>
                    <td className="px-3 py-2 text-start text-muted-foreground">{row.completed}</td>
                    <td className="px-3 py-2 text-start text-muted-foreground">{row.completion_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-start text-base font-medium text-foreground">{t('tables.recent')}</h2>
        {data.recentEvents.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border/70">
            <table className="min-w-full divide-y divide-border/70 text-sm">
              <thead className="bg-card/60 text-start text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-start">{t('columns.time')}</th>
                  <th className="px-3 py-2 text-start">{t('columns.event')}</th>
                  <th className="px-3 py-2 text-start">{t('columns.page')}</th>
                  <th className="px-3 py-2 text-start">{t('columns.entity')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {data.recentEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="px-3 py-2 text-start text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-start text-foreground">{event.event_name}</td>
                    <td className="px-3 py-2 text-start text-muted-foreground">{event.page_slug || '-'}</td>
                    <td className="px-3 py-2 text-start text-muted-foreground">
                      {event.entity_label || event.entity_slug || event.entity_id || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
