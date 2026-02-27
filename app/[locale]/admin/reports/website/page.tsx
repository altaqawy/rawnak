import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { getDashboardData } from '@/lib/admin-console/repository';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export default async function AdminWebsiteReportPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  await requireOwner(locale);
  const t = await getTranslations('adminModules');
  const data = await getDashboardData({
    from: pickParam(query.from),
    to: pickParam(query.to),
    locale: pickParam(query.locale),
    device: pickParam(query.device),
    country: pickParam(query.country),
    eventType: pickParam(query.eventType),
    pageSlug: pickParam(query.pageSlug),
  });

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('reports.website')}</h1>
        <a href={`/api/admin/export?dataset=website`} className="mt-3 inline-block rounded-md border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground">{t('actions.exportCsv')}</a>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="glass-card rounded-2xl border border-border/70 p-4"><p className="text-sm text-muted-foreground">{t('reports.pageviews')}: {data.kpis.pageviews}</p></article>
        <article className="glass-card rounded-2xl border border-border/70 p-4"><p className="text-sm text-muted-foreground">{t('reports.events')}: {data.kpis.totalEvents}</p></article>
      </section>
    </div>
  );
}
