/**
 * Opportunities Detailed Page
 * Full list of business growth opportunities
 */

import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { getOwnerSnapshot } from '@/lib/owner-console/repository';
import { PanelEmpty } from '@/components/owner/PanelStates';

type PageProps = {
  params: Promise<{ locale: string }>;
};

const severityColors = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export default async function OpportunitiesPage({ params }: PageProps) {
  const { locale } = await params;

  // Verify ownership at server level
  await requireOwner(locale);

  // Load snapshot
  const snapshot = await getOwnerSnapshot({ locale });

  // Get translations
  const t = await getTranslations('ownerDashboard.opportunities');

  const opportunities = snapshot.opportunities;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-start text-2xl font-semibold text-foreground">{t('title')}</h1>
            <p className="mt-2 text-start text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
          <Link
            href={`/${locale}/admin/owner`}
            className="rounded-md border border-border/70 px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="glass-card rounded-2xl border border-border/70 p-6">
        {opportunities.length === 0 ? (
          <PanelEmpty message={t('empty')} />
        ) : (
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <div key={opp.id} className="rounded-lg border border-border/50 p-5 transition-all hover:border-primary/30 hover:bg-accent/50">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{opp.title}</h3>
                    {opp.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{opp.description}</p>
                    )}
                  </div>
                  <span
                    className={`ml-3 inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${severityColors[opp.severity]}`}
                  >
                    {opp.severity}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Module: {opp.moduleId}</span>
                  {opp.evidence && Object.keys(opp.evidence).length > 0 && (
                    <details className="cursor-pointer">
                      <summary>View evidence</summary>
                      <div className="mt-2 space-y-1 rounded bg-muted/50 p-3">
                        {Object.entries(opp.evidence).map(([key, value]) => (
                          <p key={key}>
                            <strong>{key}:</strong> {String(value)}
                          </p>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
