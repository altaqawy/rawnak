import Link from 'next/link';
import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { canManageUsersAndRoles } from '@/lib/auth/roles';
import { requireStaff } from '@/lib/auth/guards';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  const context = await requireStaff(locale);
  const t = await getTranslations('admin');

  const navSections =
    context.role === 'owner'
      ? [
          {
            title: t('sections.main'),
            items: [
              { href: `/${locale}/admin/owner`, label: t('nav.owner') },
              { href: `/${locale}/admin`, label: t('nav.hub') },
              { href: `/${locale}/admin/dashboard`, label: t('nav.dashboard') },
            ],
          },
          {
            title: t('sections.modules'),
            items: [
              { href: `/${locale}/admin/content`, label: t('nav.contentModule') },
              { href: `/${locale}/admin/crm`, label: t('nav.crmModule') },
              { href: `/${locale}/admin/team`, label: t('nav.teamModule') },
              { href: `/${locale}/admin/ops`, label: t('nav.opsModule') },
              { href: `/${locale}/admin/inventory`, label: t('nav.inventoryModule') },
              { href: `/${locale}/admin/finance`, label: t('nav.financeModule') },
              { href: `/${locale}/admin/reports`, label: t('nav.reportsModule') },
              { href: `/${locale}/admin/settings`, label: t('nav.settings') },
            ],
          },
        ]
      : [
          {
            title: t('sections.dashboard'),
            items: [{ href: `/${locale}/admin`, label: t('nav.overview') }],
          },
          {
            title: t('sections.content'),
            items: [
              { href: `/${locale}/admin/services`, label: t('nav.services') },
              { href: `/${locale}/admin/products`, label: t('nav.products') },
              { href: `/${locale}/admin/kits`, label: t('nav.kits') },
              { href: `/${locale}/admin/portfolio`, label: t('nav.portfolio') },
            ],
          },
          {
            title: t('sections.team'),
            items: [
              ...(canManageUsersAndRoles(context.role)
                ? [{ href: `/${locale}/admin/users`, label: t('nav.users') }]
                : []),
            ],
          },
        ];

  return (
    <section
      className={
        context.role === 'owner'
          ? 'mx-auto w-full max-w-none px-4 py-10 md:px-6 md:py-14'
          : 'mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14'
      }
    >
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="glass-card h-fit rounded-2xl border border-border/70 p-4 md:p-5">
          <p className="text-start text-sm font-medium text-foreground">{t('title')}</p>
          <p className="mt-1 text-start text-xs text-muted-foreground">
            {t(`roles.${context.role}`)}
          </p>
          <div className="mt-4">
            <SidebarNav sections={navSections} />
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
