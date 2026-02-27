import { type ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { ModuleShell } from '@/components/dashboard/ModuleShell';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function TeamModuleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  await requireOwner(locale);
  const t = await getTranslations('adminHub');

  return (
    <ModuleShell
      locale={locale}
      title={t('cards.team.title')}
      subtitle={t('cards.team.description')}
      links={[
        { href: `/${locale}/admin/team`, label: t('links.moduleOverview') },
        { href: `/${locale}/admin/team/users`, label: t('links.users') },
        { href: `/${locale}/admin/team/audit`, label: t('links.audit') },
      ]}
    >
      {children}
    </ModuleShell>
  );
}

