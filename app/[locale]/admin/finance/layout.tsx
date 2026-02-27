import { type ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { ModuleShell } from '@/components/dashboard/ModuleShell';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function FinanceModuleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  await requireOwner(locale);
  const t = await getTranslations('adminHub');

  return (
    <ModuleShell
      locale={locale}
      title={t('cards.finance.title')}
      subtitle={t('cards.finance.description')}
      links={[
        { href: `/${locale}/admin/finance`, label: t('links.moduleOverview') },
        { href: `/${locale}/admin/finance/invoices`, label: t('links.invoices') },
        { href: `/${locale}/admin/finance/payments`, label: t('links.payments') },
        { href: `/${locale}/admin/finance/expenses`, label: t('links.expenses') },
        { href: `/${locale}/admin/finance/cashflow`, label: t('links.cashflow') },
        { href: `/${locale}/admin/finance/pl`, label: t('links.profitLoss') },
      ]}
    >
      {children}
    </ModuleShell>
  );
}

