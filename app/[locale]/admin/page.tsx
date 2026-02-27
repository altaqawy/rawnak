import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { AdminHubClient } from '@/components/dashboard/AdminHubClient';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminHubPage({ params }: PageProps) {
  const { locale } = await params;
  await requireOwner(locale);
  const t = await getTranslations('adminHub');

  const cards = [
    {
      id: 'content',
      title: t('cards.content.title'),
      description: t('cards.content.description'),
      href: `/${locale}/admin/content`,
      links: [
        { href: `/${locale}/admin/content/pages`, label: t('links.pages') },
        { href: `/${locale}/admin/content/builder`, label: t('links.builder') },
        { href: `/${locale}/admin/content/templates`, label: t('links.templates') },
        { href: `/${locale}/admin/content/reactbits`, label: t('links.reactBits') },
        { href: `/${locale}/admin/content/media`, label: t('links.media') },
        { href: `/${locale}/admin/content/seo`, label: t('links.seo') },
        { href: `/${locale}/admin/content/site-settings`, label: t('links.siteSettings') },
      ],
    },
    {
      id: 'crm',
      title: t('cards.crm.title'),
      description: t('cards.crm.description'),
      href: `/${locale}/admin/crm`,
      links: [
        { href: `/${locale}/admin/crm/customers`, label: t('links.customers') },
        { href: `/${locale}/admin/crm/leads`, label: t('links.leads') },
      ],
    },
    {
      id: 'team',
      title: t('cards.team.title'),
      description: t('cards.team.description'),
      href: `/${locale}/admin/team`,
      links: [
        { href: `/${locale}/admin/team/users`, label: t('links.users') },
        { href: `/${locale}/admin/team/audit`, label: t('links.audit') },
      ],
    },
    {
      id: 'ops',
      title: t('cards.ops.title'),
      description: t('cards.ops.description'),
      href: `/${locale}/admin/ops`,
      links: [{ href: `/${locale}/admin/ops/orders`, label: t('links.orders') }],
    },
    {
      id: 'inventory',
      title: t('cards.inventory.title'),
      description: t('cards.inventory.description'),
      href: `/${locale}/admin/inventory`,
      links: [
        { href: `/${locale}/admin/inventory/items`, label: t('links.inventoryItems') },
        { href: `/${locale}/admin/inventory/moves`, label: t('links.stockMoves') },
        { href: `/${locale}/admin/inventory/ledger`, label: t('links.stockLedger') },
      ],
    },
    {
      id: 'finance',
      title: t('cards.finance.title'),
      description: t('cards.finance.description'),
      href: `/${locale}/admin/finance`,
      links: [
        { href: `/${locale}/admin/finance/invoices`, label: t('links.invoices') },
        { href: `/${locale}/admin/finance/payments`, label: t('links.payments') },
        { href: `/${locale}/admin/finance/expenses`, label: t('links.expenses') },
        { href: `/${locale}/admin/finance/cashflow`, label: t('links.cashflow') },
        { href: `/${locale}/admin/finance/pl`, label: t('links.profitLoss') },
      ],
    },
    {
      id: 'reports',
      title: t('cards.reports.title'),
      description: t('cards.reports.description'),
      href: `/${locale}/admin/reports`,
      links: [
        { href: `/${locale}/admin/reports/website`, label: t('links.reportWebsite') },
        { href: `/${locale}/admin/reports/customers`, label: t('links.reportCustomers') },
        { href: `/${locale}/admin/reports/inventory`, label: t('links.reportInventory') },
        { href: `/${locale}/admin/reports/finance`, label: t('links.reportFinance') },
      ],
    },
    {
      id: 'settings',
      title: t('cards.settings.title'),
      description: t('cards.settings.description'),
      href: `/${locale}/admin/settings`,
      links: [
        { href: `/${locale}/admin/settings`, label: t('links.siteSettings') },
        { href: `/${locale}/admin/settings/security`, label: t('links.security') },
        { href: `/${locale}/admin/settings/integrations`, label: t('links.integrations') },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('title')}</h1>
        <p className="mt-2 text-start text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>

      <AdminHubClient
        cards={cards}
        labels={{
          searchPlaceholder: t('search'),
          favorites: t('favorites.title'),
          noFavorites: t('favorites.empty'),
          pin: t('favorites.pin'),
          unpin: t('favorites.unpin'),
        }}
      />
    </div>
  );
}
