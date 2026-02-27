import { type ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { ModuleShell } from '@/components/dashboard/ModuleShell';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function CrmModuleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  await requireOwner(locale);
  const t = await getTranslations('adminHub');

  return (
    <ModuleShell
      locale={locale}
      title={t('cards.crm.title')}
      subtitle={t('cards.crm.description')}
      links={[
        { href: `/${locale}/admin/crm`, label: t('links.moduleOverview') },
        { href: `/${locale}/admin/crm/customers`, label: t('links.customers') },
        { href: `/${locale}/admin/crm/leads`, label: t('links.leads') },
      ]}
    >
      {children}
    </ModuleShell>
  );
}

