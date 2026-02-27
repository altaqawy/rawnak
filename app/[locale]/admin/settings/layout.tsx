import { type ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { ModuleShell } from '@/components/dashboard/ModuleShell';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function SettingsModuleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  await requireOwner(locale);
  const t = await getTranslations('adminHub');

  return (
    <ModuleShell
      locale={locale}
      title={t('cards.settings.title')}
      subtitle={t('cards.settings.description')}
      links={[
        { href: `/${locale}/admin/settings`, label: t('links.siteSettings') },
        { href: `/${locale}/admin/settings/security`, label: t('links.security') },
        { href: `/${locale}/admin/settings/integrations`, label: t('links.integrations') },
      ]}
    >
      {children}
    </ModuleShell>
  );
}

