import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { listExpenses, listInvoices, listPayments } from '@/lib/admin-console/repository';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminFinanceReportPage({ params }: PageProps) {
  const { locale } = await params;
  await requireOwner(locale);
  const t = await getTranslations('adminModules');
  const [invoices, payments, expenses] = await Promise.all([
    listInvoices(),
    listPayments(),
    listExpenses(),
  ]);

  const outstanding = invoices.filter((invoice: any) => invoice.status !== 'paid' && invoice.status !== 'void');
  const outstandingTotal = outstanding.reduce((sum: number, invoice: any) => sum + Number(invoice.total ?? 0), 0);
  const paidIn = payments.reduce((sum: number, payment: any) => sum + Number(payment.amount ?? 0), 0);
  const paidOut = expenses.reduce((sum: number, expense: any) => sum + Number(expense.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('reports.finance')}</h1>
        <a
          href={`/api/admin/export?dataset=finance`}
          className="mt-3 inline-block rounded-md border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground"
        >
          {t('actions.exportCsv')}
        </a>
      </header>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <article className="glass-card rounded-2xl border border-border/70 p-4">
          <p className="text-sm text-muted-foreground">{t('finance.invoices')}</p>
          <p className="mt-2 text-xl font-semibold text-foreground">{invoices.length}</p>
        </article>
        <article className="glass-card rounded-2xl border border-border/70 p-4">
          <p className="text-sm text-muted-foreground">{t('finance.outstanding')}</p>
          <p className="mt-2 text-xl font-semibold text-foreground">{outstandingTotal}</p>
        </article>
        <article className="glass-card rounded-2xl border border-border/70 p-4">
          <p className="text-sm text-muted-foreground">{t('finance.cashIn')}</p>
          <p className="mt-2 text-xl font-semibold text-foreground">{paidIn}</p>
        </article>
        <article className="glass-card rounded-2xl border border-border/70 p-4">
          <p className="text-sm text-muted-foreground">{t('finance.cashOut')}</p>
          <p className="mt-2 text-xl font-semibold text-foreground">{paidOut}</p>
        </article>
      </section>
    </div>
  );
}

