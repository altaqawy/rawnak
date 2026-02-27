import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ReportsModulePage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations('adminHub');

  return (
    <section className="glass-card rounded-2xl border border-border/70 p-6">
      <div className="grid gap-2 sm:grid-cols-2">
        <Link href={`/${locale}/admin/reports/website`} className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground">
          {t('links.reportWebsite')}
        </Link>
        <Link href={`/${locale}/admin/reports/customers`} className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground">
          {t('links.reportCustomers')}
        </Link>
        <Link href={`/${locale}/admin/reports/team`} className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground">
          {t('links.reportTeam')}
        </Link>
        <Link href={`/${locale}/admin/reports/inventory`} className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground">
          {t('links.reportInventory')}
        </Link>
        <Link href={`/${locale}/admin/reports/finance`} className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground">
          {t('links.reportFinance')}
        </Link>
      </div>
    </section>
  );
}

