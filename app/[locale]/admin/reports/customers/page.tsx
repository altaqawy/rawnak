import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { listCustomers, listLeads } from '@/lib/admin-console/repository';

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminCustomersReportPage({ params }: PageProps) {
  const { locale } = await params;
  await requireOwner(locale);
  const t = await getTranslations('adminModules');
  const [customers, leads] = await Promise.all([listCustomers(), listLeads()]);

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('reports.customers')}</h1>
        <a href={`/api/admin/export?dataset=customers`} className="mt-3 inline-block rounded-md border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground">{t('actions.exportCsv')}</a>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="glass-card rounded-2xl border border-border/70 p-4"><p className="text-sm text-muted-foreground">{t('reports.customersCount')}: {customers.length}</p></article>
        <article className="glass-card rounded-2xl border border-border/70 p-4"><p className="text-sm text-muted-foreground">{t('reports.leadsCount')}: {leads.length}</p></article>
      </section>
    </div>
  );
}
