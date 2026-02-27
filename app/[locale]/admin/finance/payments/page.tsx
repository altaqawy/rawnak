import { getTranslations } from 'next-intl/server';
import { createPaymentAction } from '@/app/[locale]/admin/actions/console';
import { requireOwner } from '@/lib/auth/guards';
import { listPayments } from '@/lib/admin-console/repository';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export default async function AdminFinancePaymentsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  await requireOwner(locale);
  const t = await getTranslations('adminModules');
  const q = pickParam(query.q)?.trim().toLowerCase();
  const rows = (await listPayments()).filter((row: any) => {
    if (!q) return true;
    return String(row.method || '').toLowerCase().includes(q) || row.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('finance.payments')}</h1>
      </header>
      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <form action={createPaymentAction.bind(null, locale)} className="grid gap-3 md:grid-cols-3">
          <input name="invoice_id" placeholder={t('fields.invoiceId')} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <input name="customer_id" placeholder={t('fields.customerId')} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <input name="amount" placeholder={t('fields.amount')} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <input name="method" placeholder={t('fields.method')} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <input name="occurred_at" type="date" className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <div className="md:col-span-3">
            <button type="submit" className="rounded-md border border-border/70 bg-card/70 px-4 py-2 text-xs">{t('actions.create')}</button>
          </div>
        </form>
      </section>
      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <form className="flex items-center gap-2">
            <input
              name="q"
              defaultValue={pickParam(query.q) ?? ''}
              placeholder={t('fields.search')}
              className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
            <button type="submit" className="rounded-md border border-border/70 bg-card/70 px-4 py-2 text-xs">
              {t('actions.filter')}
            </button>
          </form>
          <a href={`/api/admin/export?dataset=finance`} className="rounded-md border border-border/70 bg-card/70 px-4 py-2 text-xs text-muted-foreground">
            {t('actions.exportCsv')}
          </a>
        </div>
        {rows.length === 0 ? <p className="text-sm text-muted-foreground">{t('empty')}</p> : (
          <div className="space-y-2">{(rows as any[]).map((row) => (
            <div key={row.id} className="rounded-md border border-border/70 p-3 text-sm text-muted-foreground">
              {row.amount + ' · ' + (row.method || '-') + ' · ' + new Date(row.occurred_at).toLocaleString()}
            </div>
          ))}</div>
        )}
      </section>
    </div>
  );
}
