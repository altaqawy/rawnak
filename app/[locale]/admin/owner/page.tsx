/**
 * Owner Dashboard Page
 * Unified executive overview of the business
 */

import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { getOwnerSnapshot } from '@/lib/owner-console/repository';
import { OwnerDashboard } from '@/components/owner/OwnerDashboard';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function OwnerDashboardPage({ params }: PageProps) {
  const { locale } = await params;

  // 1. Verify ownership at server level
  await requireOwner(locale);

  // 2. Load unified snapshot
  const snapshot = await getOwnerSnapshot({ locale });

  // 3. Get translations
  const t = await getTranslations('ownerDashboard');

  // 4. Prepare labels
  const labels = {
    title: t('title'),
    subtitle: t('subtitle'),
    revenue: t('kpi.revenue'),
    activeOrders: t('kpi.activeOrders'),
    customerSatisfaction: t('kpi.customerSatisfaction'),
    performanceScore: t('kpi.performanceScore'),
    healthStatus: t('health.title'),
    moduleName: {
      analytics: t('modules.analytics'),
      crm: t('modules.crm'),
      finance: t('modules.finance'),
      inventory: t('modules.inventory'),
      operations: t('modules.operations'),
      content: t('modules.content'),
      team: t('modules.team'),
      reports: t('modules.reports'),
      settings: t('modules.settings'),
    },
    opportunities: t('opportunities.title'),
    noOpportunities: t('opportunities.empty'),
    challenges: t('challenges.title'),
    noChallenges: t('challenges.empty'),
    quickActions: t('quickActions.title'),
    viewAll: t('actions.viewAll'),
  };

  return <OwnerDashboard snapshot={snapshot} labels={labels} />;
}
