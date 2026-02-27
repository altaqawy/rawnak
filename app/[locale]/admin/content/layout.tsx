import { type ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { ModuleShell } from '@/components/dashboard/ModuleShell';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ContentModuleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  await requireOwner(locale);
  const t = await getTranslations('adminHub');

  return (
    <ModuleShell
      locale={locale}
      title={t('cards.content.title')}
      subtitle={t('cards.content.description')}
      links={[
        { href: `/${locale}/admin/content`, label: t('links.moduleOverview') },
        { href: `/${locale}/admin/content/pages`, label: t('links.pages') },
        { href: `/${locale}/admin/content/builder`, label: t('links.builder') },
        { href: `/${locale}/admin/content/templates`, label: t('links.templates') },
        { href: `/${locale}/admin/content/reactbits`, label: t('links.reactBits') },
        { href: `/${locale}/admin/content/media`, label: t('links.media') },
        { href: `/${locale}/admin/content/seo`, label: t('links.seo') },
        { href: `/${locale}/admin/content/site-settings`, label: t('links.siteSettings') },
      ]}
    >
      {children}
    </ModuleShell>
  );
}
