import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { getDashboardData } from '@/lib/admin-console/repository';
import { listOwnerPages } from '@/lib/builder/repository';
import { AdminHubClient } from '@/components/dashboard/AdminHubClient';

type PageProps = {
  params: Promise<{ locale: string }>;
};

type HubCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  links: Array<{ href: string; label: string }>;
};

export default async function AdminOwnerOverviewPage({ params }: PageProps) {
  const { locale } = await params;
  await requireOwner(locale);

  const [dashboardData, pages, tHub, tDashboard] = await Promise.all([
    getDashboardData({}),
    listOwnerPages(),
    getTranslations('adminHub'),
    getTranslations('adminDashboard'),
  ]);

  const isArabic = locale === 'ar';

  const draftPages = pages.filter((page) => page.status === 'draft').length;
  const newLeads = dashboardData.latestLeads.filter((lead) => lead.status === 'new').length;
  const failedEvents = dashboardData.recentEvents.filter((event) => /(error|fail)/i.test(event.event_name)).length;

  const inboxItems = [
    {
      id: 'draft-pages',
      count: draftPages,
      href: `/${locale}/admin/site/pages`,
      title: isArabic ? 'صفحات مسودة' : 'Draft pages',
      detail: isArabic ? 'تحتاج مراجعة قبل النشر.' : 'Need review before publishing.',
    },
    {
      id: 'new-leads',
      count: newLeads,
      href: `/${locale}/admin/crm/leads`,
      title: isArabic ? 'طلبات جديدة' : 'New leads',
      detail: isArabic ? 'تم استلامها وتحتاج متابعة.' : 'Received and waiting follow-up.',
    },
    {
      id: 'outstanding',
      count: dashboardData.kpis.outstandingInvoicesCount,
      href: `/${locale}/admin/finance/invoices`,
      title: isArabic ? 'فواتير غير مسددة' : 'Outstanding invoices',
      detail: isArabic ? 'تحقق من حالة التحصيل.' : 'Check collection status.',
    },
    {
      id: 'failed-events',
      count: failedEvents,
      href: `/${locale}/admin/dashboard`,
      title: isArabic ? 'أحداث تحتاج تدقيق' : 'Events to review',
      detail: isArabic ? 'راجع السجل التحليلي للأحداث الأخيرة.' : 'Review recent event logs.',
    },
  ].filter((item) => item.count > 0);

  const cards: HubCard[] = [
    {
      id: 'content',
      title: tHub('cards.content.title'),
      description: tHub('cards.content.description'),
      href: `/${locale}/admin/site`,
      links: [
        { href: `/${locale}/admin/site/pages`, label: tHub('links.pages') },
        { href: `/${locale}/admin/site/builder`, label: tHub('links.builder') },
        { href: `/${locale}/admin/site/templates`, label: tHub('links.templates') },
        { href: `/${locale}/admin/site/media`, label: tHub('links.media') },
        { href: `/${locale}/admin/site/seo`, label: tHub('links.seo') },
        { href: `/${locale}/admin/site/site-settings`, label: tHub('links.siteSettings') },
      ],
    },
    {
      id: 'crm',
      title: tHub('cards.crm.title'),
      description: tHub('cards.crm.description'),
      href: `/${locale}/admin/crm`,
      links: [
        { href: `/${locale}/admin/crm/customers`, label: tHub('links.customers') },
        { href: `/${locale}/admin/crm/leads`, label: tHub('links.leads') },
      ],
    },
    {
      id: 'team',
      title: tHub('cards.team.title'),
      description: tHub('cards.team.description'),
      href: `/${locale}/admin/team`,
      links: [
        { href: `/${locale}/admin/team/users`, label: tHub('links.users') },
        { href: `/${locale}/admin/team/audit`, label: tHub('links.audit') },
      ],
    },
    {
      id: 'ops',
      title: tHub('cards.ops.title'),
      description: tHub('cards.ops.description'),
      href: `/${locale}/admin/ops`,
      links: [
        { href: `/${locale}/admin/ops/orders`, label: tHub('links.orders') },
        { href: `/${locale}/admin/ops/deliveries`, label: tHub('links.deliveries') },
      ],
    },
    {
      id: 'inventory',
      title: tHub('cards.inventory.title'),
      description: tHub('cards.inventory.description'),
      href: `/${locale}/admin/inventory`,
      links: [
        { href: `/${locale}/admin/inventory/items`, label: tHub('links.inventoryItems') },
        { href: `/${locale}/admin/inventory/moves`, label: tHub('links.stockMoves') },
        { href: `/${locale}/admin/inventory/ledger`, label: tHub('links.stockLedger') },
      ],
    },
    {
      id: 'finance',
      title: tHub('cards.finance.title'),
      description: tHub('cards.finance.description'),
      href: `/${locale}/admin/finance`,
      links: [
        { href: `/${locale}/admin/finance/invoices`, label: tHub('links.invoices') },
        { href: `/${locale}/admin/finance/payments`, label: tHub('links.payments') },
        { href: `/${locale}/admin/finance/expenses`, label: tHub('links.expenses') },
        { href: `/${locale}/admin/finance/cashflow`, label: tHub('links.cashflow') },
        { href: `/${locale}/admin/finance/pl`, label: tHub('links.profitLoss') },
      ],
    },
    {
      id: 'reports',
      title: tHub('cards.reports.title'),
      description: tHub('cards.reports.description'),
      href: `/${locale}/admin/reports`,
      links: [
        { href: `/${locale}/admin/reports/website`, label: tHub('links.reportWebsite') },
        { href: `/${locale}/admin/reports/customers`, label: tHub('links.reportCustomers') },
        { href: `/${locale}/admin/reports/team`, label: tHub('links.reportTeam') },
        { href: `/${locale}/admin/reports/inventory`, label: tHub('links.reportInventory') },
        { href: `/${locale}/admin/reports/finance`, label: tHub('links.reportFinance') },
      ],
    },
    {
      id: 'settings',
      title: tHub('cards.settings.title'),
      description: tHub('cards.settings.description'),
      href: `/${locale}/admin/settings`,
      links: [
        { href: `/${locale}/admin/settings`, label: tHub('links.siteSettings') },
        { href: `/${locale}/admin/settings/security`, label: tHub('links.security') },
        { href: `/${locale}/admin/settings/integrations`, label: tHub('links.integrations') },
      ],
    },
  ];

  return (
    <div className='space-y-6'>
      <header className='glass-card rounded-2xl border border-border/70 p-6'>
        <h1 className='text-start text-2xl font-semibold text-foreground'>
          {isArabic ? 'مركز قيادة المالك' : 'Owner Control Center'}
        </h1>
        <p className='mt-2 text-start text-sm text-muted-foreground'>
          {isArabic
            ? 'عرض تنفيذي سريع للمهام اليومية والتنقل بين الوحدات.'
            : 'Executive inbox and quick module navigation.'}
        </p>
      </header>

      <section className='glass-card rounded-2xl border border-border/70 p-6'>
        <div className='flex items-center justify-between gap-3'>
          <h2 className='text-start text-base font-medium text-foreground'>
            {isArabic ? 'صندوق المهام' : 'Inbox'}
          </h2>
          <Link
            href={`/${locale}/admin/dashboard`}
            className='rounded-md border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground'
          >
            {isArabic ? 'فتح التحليلات' : 'Open analytics'}
          </Link>
        </div>
        {inboxItems.length === 0 ? (
          <p className='mt-3 text-sm text-muted-foreground'>
            {isArabic ? 'لا توجد عناصر تتطلب إجراء الآن.' : 'No action items right now.'}
          </p>
        ) : (
          <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {inboxItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className='rounded-xl border border-border/70 bg-card/60 p-4 transition-colors hover:bg-card/80'
              >
                <p className='text-xs text-muted-foreground'>{item.title}</p>
                <p className='mt-1 text-2xl font-semibold text-foreground'>{item.count}</p>
                <p className='mt-2 text-xs text-muted-foreground'>{item.detail}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <article className='glass-card rounded-2xl border border-border/70 p-4'>
          <p className='text-start text-xs text-muted-foreground'>{tDashboard('kpi.sessions')}</p>
          <p className='mt-2 text-start text-2xl font-semibold text-foreground'>{dashboardData.kpis.sessions}</p>
        </article>
        <article className='glass-card rounded-2xl border border-border/70 p-4'>
          <p className='text-start text-xs text-muted-foreground'>{tDashboard('kpi.pageviews')}</p>
          <p className='mt-2 text-start text-2xl font-semibold text-foreground'>{dashboardData.kpis.pageviews}</p>
        </article>
        <article className='glass-card rounded-2xl border border-border/70 p-4'>
          <p className='text-start text-xs text-muted-foreground'>{tDashboard('kpi.newCustomers')}</p>
          <p className='mt-2 text-start text-2xl font-semibold text-foreground'>{dashboardData.kpis.newCustomers}</p>
        </article>
        <article className='glass-card rounded-2xl border border-border/70 p-4'>
          <p className='text-start text-xs text-muted-foreground'>{tDashboard('kpi.conversions')}</p>
          <p className='mt-2 text-start text-2xl font-semibold text-foreground'>{dashboardData.kpis.conversions}</p>
        </article>
      </section>

      <AdminHubClient
        cards={cards}
        labels={{
          searchPlaceholder: tHub('search'),
          favorites: tHub('favorites.title'),
          noFavorites: tHub('favorites.empty'),
          pin: tHub('favorites.pin'),
          unpin: tHub('favorites.unpin'),
        }}
      />
    </div>
  );
}
