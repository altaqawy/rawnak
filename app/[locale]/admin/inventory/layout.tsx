import { type ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { ModuleShell } from '@/components/dashboard/ModuleShell';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function InventoryModuleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  await requireOwner(locale);
  const t = await getTranslations('adminHub');

  return (
    <ModuleShell
      locale={locale}
      title={t('cards.inventory.title')}
      subtitle={t('cards.inventory.description')}
      links={[
        { href: `/${locale}/admin/inventory`, label: t('links.moduleOverview') },
        { href: `/${locale}/admin/inventory/items`, label: t('links.inventoryItems') },
        { href: `/${locale}/admin/inventory/moves`, label: t('links.stockMoves') },
        { href: `/${locale}/admin/inventory/ledger`, label: t('links.stockLedger') },
      ]}
    >
      {children}
    </ModuleShell>
  );
}

