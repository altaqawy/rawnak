import { type ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { ModuleShell } from '@/components/dashboard/ModuleShell';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function SiteModuleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  await requireOwner(locale);
  const tHub = await getTranslations('adminHub');

  return (
    <ModuleShell
      locale={locale}
      title={tHub('cards.content.title')}
      subtitle={tHub('cards.content.description')}
      links={[
        { href: `/${locale}/admin/site/pages`, label: tHub('links.pages') },
        { href: `/${locale}/admin/site/builder`, label: tHub('links.builder') },
        { href: `/${locale}/admin/site/templates`, label: tHub('links.templates') },
        { href: `/${locale}/admin/site/media`, label: tHub('links.media') },
        { href: `/${locale}/admin/site/seo`, label: tHub('links.seo') },
        { href: `/${locale}/admin/site/site-settings`, label: tHub('links.siteSettings') },
      ]}
    >
      {children}
    </ModuleShell>
  );
}
