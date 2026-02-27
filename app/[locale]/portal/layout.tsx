import Link from 'next/link';
import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { requireCustomer } from '@/lib/auth/guards';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function PortalLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  const context = await requireCustomer(locale);
  const t = await getTranslations('portal');

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="glass-card h-fit rounded-2xl border border-border/70 p-4 md:p-5">
          <p className="text-start text-sm font-medium text-foreground">{t('title')}</p>
          <p className="mt-1 text-start text-xs text-muted-foreground">{context.user?.email ?? ''}</p>
          <div className="mt-4">
            <SidebarNav
              items={[
                { href: `/${locale}/portal`, label: t('nav.overview') },
                { href: `/${locale}/portal/profile`, label: t('nav.profile') },
                { href: `/${locale}/portal/requests`, label: t('nav.requests') },
              ]}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/${locale}`}
              className="rounded-md border border-border/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('actions.site')}
            </Link>
            <Link
              href={`/auth/logout?locale=${locale}`}
              className="rounded-md border border-border/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('actions.logout')}
            </Link>
          </div>
        </aside>

        <div>{children}</div>
      </div>
    </section>
  );
}
