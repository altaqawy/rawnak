import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function FinanceModulePage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations('adminHub');

  return (
    <section className="glass-card rounded-2xl border border-border/70 p-6">
      <div className="grid gap-2 sm:grid-cols-2">
        <Link href={`/${locale}/admin/finance/invoices`} className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground">
          {t('links.invoices')}
        </Link>
        <Link href={`/${locale}/admin/finance/payments`} className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground">
          {t('links.payments')}
        </Link>
        <Link href={`/${locale}/admin/finance/expenses`} className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground">
          {t('links.expenses')}
        </Link>
        <Link href={`/${locale}/admin/finance/cashflow`} className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground">
          {t('links.cashflow')}
        </Link>
        <Link href={`/${locale}/admin/finance/pl`} className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground">
          {t('links.profitLoss')}
        </Link>
      </div>
    </section>
  );
}

