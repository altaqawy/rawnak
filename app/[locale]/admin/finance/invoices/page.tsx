import { getTranslations } from 'next-intl/server';
import { createInvoiceAction } from '@/app/[locale]/admin/actions/console';
import { requireOwner } from '@/lib/auth/guards';
import { listInvoices } from '@/lib/admin-console/repository';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export default async function AdminFinanceInvoicesPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  await requireOwner(locale);
  const t = await getTranslations('adminModules');
  const q = pickParam(query.q)?.trim().toLowerCase();
  const invoices = (await listInvoices()).filter((inv: any) => {
    if (!q) return true;
    return inv.id.toLowerCase().includes(q) || String(inv.status || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('finance.invoices')}</h1>
      </header>
      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <form action={createInvoiceAction.bind(null, locale)} className="grid gap-3 md:grid-cols-3">
          <input name="customer_id" placeholder={t('fields.customerId')} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <select name="status" className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm">
            <option value="draft">draft</option>
            <option value="issued">issued</option>
            <option value="paid">paid</option>
            <option value="void">void</option>
          </select>
          <input name="currency" defaultValue="EGP" className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <input name="subtotal" placeholder={t('fields.subtotal')} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <input name="tax" placeholder={t('fields.tax')} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <input name="total" placeholder={t('fields.total')} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <input name="issued_at" type="date" className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <input name="due_at" type="date" className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
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
        {invoices.length === 0 ? <p className="text-sm text-muted-foreground">{t('empty')}</p> : (
          <div className="space-y-2">{(invoices as any[]).map((inv) => (
            <div key={inv.id} className="rounded-md border border-border/70 p-3 text-sm text-muted-foreground">
              {(inv.id) + ' · ' + inv.status + ' · ' + (inv.total ?? 0)}
            </div>
          ))}</div>
        )}
      </section>
    </div>
  );
}
