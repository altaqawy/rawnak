import { type ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { ModuleShell } from '@/components/dashboard/ModuleShell';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function OpsModuleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  await requireOwner(locale);
  const t = await getTranslations('adminHub');

  return (
    <ModuleShell
      locale={locale}
      title={t('cards.ops.title')}
      subtitle={t('cards.ops.description')}
      links={[
        { href: `/${locale}/admin/ops`, label: t('links.moduleOverview') },
        { href: `/${locale}/admin/ops/orders`, label: t('links.orders') },
        { href: `/${locale}/admin/ops/deliveries`, label: t('links.deliveries') },
      ]}
    >
      {children}
    </ModuleShell>
  );
}

