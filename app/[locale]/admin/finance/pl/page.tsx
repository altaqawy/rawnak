import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { listExpenses, listPayments } from '@/lib/admin-console/repository';

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminFinanceProfitLossPage({ params }: PageProps) {
  const { locale } = await params;
  await requireOwner(locale);
  const t = await getTranslations('adminModules');
  const [payments, expenses] = await Promise.all([listPayments(), listExpenses()]);
  const revenue = (payments as any[]).reduce((sum, p) => sum + Number(p.amount ?? 0), 0);
  const costs = (expenses as any[]).reduce((sum, e) => sum + Number(e.amount ?? 0), 0);
  const profit = revenue - costs;

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('finance.profitLoss')}</h1>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="glass-card rounded-2xl border border-border/70 p-6">
          <p className="text-start text-sm text-muted-foreground">{t('finance.revenue')}</p>
          <p className="mt-2 text-start text-2xl font-semibold text-foreground">{revenue}</p>
        </article>
        <article className="glass-card rounded-2xl border border-border/70 p-6">
          <p className="text-start text-sm text-muted-foreground">{t('finance.expenseTotal')}</p>
          <p className="mt-2 text-start text-2xl font-semibold text-foreground">{costs}</p>
        </article>
        <article className="glass-card rounded-2xl border border-border/70 p-6">
          <p className="text-start text-sm text-muted-foreground">{t('finance.netProfit')}</p>
          <p className="mt-2 text-start text-2xl font-semibold text-foreground">{profit}</p>
        </article>
      </section>
    </div>
  );
}
