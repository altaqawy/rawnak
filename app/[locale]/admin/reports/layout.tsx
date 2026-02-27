import { type ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { ModuleShell } from '@/components/dashboard/ModuleShell';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ReportsModuleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  await requireOwner(locale);
  const t = await getTranslations('adminHub');

  return (
    <ModuleShell
      locale={locale}
      title={t('cards.reports.title')}
      subtitle={t('cards.reports.description')}
      links={[
        { href: `/${locale}/admin/reports`, label: t('links.moduleOverview') },
        { href: `/${locale}/admin/reports/website`, label: t('links.reportWebsite') },
        { href: `/${locale}/admin/reports/customers`, label: t('links.reportCustomers') },
        { href: `/${locale}/admin/reports/team`, label: t('links.reportTeam') },
        { href: `/${locale}/admin/reports/inventory`, label: t('links.reportInventory') },
        { href: `/${locale}/admin/reports/finance`, label: t('links.reportFinance') },
      ]}
    >
      {children}
    </ModuleShell>
  );
}

