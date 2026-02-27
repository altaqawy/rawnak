import Link from 'next/link';
import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { AdminDensityToggle } from '@/components/admin/AdminDensityToggle';
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
  const isArabic = locale === 'ar';
  const canChangeDensity = context.role === 'owner' || context.role === 'admin';

  const navSections =
    context.role === 'owner'
      ? [
          {
            title: t('sections.modules'),
            items: [
              { href: `/${locale}/admin`, label: t('nav.hub') },
              { href: `/${locale}/admin/site`, label: t('nav.contentModule') },
              { href: `/${locale}/admin/crm`, label: t('nav.crmModule') },
              { href: `/${locale}/admin/inventory`, label: t('nav.inventoryModule') },
              { href: `/${locale}/admin/finance`, label: t('nav.financeModule') },
              { href: `/${locale}/admin/ops`, label: t('nav.opsModule') },
              { href: `/${locale}/admin/reports`, label: t('nav.reportsModule') },
              { href: `/${locale}/admin/system`, label: isArabic ? 'النظام' : 'System' },
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
      id='admin-root'
      data-admin-density='comfortable'
      className={
        context.role === 'owner'
          ? 'admin-shell mx-auto w-full max-w-[1360px] px-3 py-4 md:px-4 md:py-6'
          : 'admin-shell mx-auto w-full max-w-6xl px-3 py-4 md:px-4 md:py-6'
      }
    >
      <div
        className={
          isArabic
            ? 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]'
            : 'grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]'
        }
      >
        {isArabic ? (
          <>
            <div className='admin-main min-w-0 space-y-4'>
              <div className='flex items-center justify-end gap-2'>
                <AdminDensityToggle locale={locale} enabled={canChangeDensity} />
              </div>
              <div>{children}</div>
            </div>
            <aside className='glass-card h-fit rounded-2xl border border-border/70 p-4'>
              <p className='text-start text-sm font-medium text-foreground'>{t('title')}</p>
              <p className='mt-1 text-start text-xs text-muted-foreground'>{t(`roles.${context.role}`)}</p>
              <div className='mt-3'>
                <SidebarNav sections={navSections} />
              </div>
              <div className='mt-3 flex flex-wrap gap-2'>
                <Link
                  href={`/${locale}`}
                  className='rounded-md border border-border/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground'
                >
                  {t('actions.site')}
                </Link>
                <Link
                  href={`/auth/logout?locale=${locale}`}
                  className='rounded-md border border-border/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground'
                >
                  {t('actions.logout')}
                </Link>
              </div>
            </aside>
          </>
        ) : (
          <>
            <aside className='glass-card h-fit rounded-2xl border border-border/70 p-4'>
              <p className='text-start text-sm font-medium text-foreground'>{t('title')}</p>
              <p className='mt-1 text-start text-xs text-muted-foreground'>{t(`roles.${context.role}`)}</p>
              <div className='mt-3'>
                <SidebarNav sections={navSections} />
              </div>
              <div className='mt-3 flex flex-wrap gap-2'>
                <Link
                  href={`/${locale}`}
                  className='rounded-md border border-border/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground'
                >
                  {t('actions.site')}
                </Link>
                <Link
                  href={`/auth/logout?locale=${locale}`}
                  className='rounded-md border border-border/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground'
                >
                  {t('actions.logout')}
                </Link>
              </div>
            </aside>
            <div className='admin-main min-w-0 space-y-4'>
              <div className='flex items-center justify-end gap-2'>
                <AdminDensityToggle locale={locale} enabled={canChangeDensity} />
              </div>
              <div>{children}</div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
