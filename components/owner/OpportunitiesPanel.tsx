/**
 * Opportunities Panel Component
 * Display growth opportunities for Owner Dashboard
 */

import Link from 'next/link';
import type { OpportunityItem } from '@/lib/owner-console/types';
import { PanelWrapper, PanelEmpty } from './PanelStates';

type OpportunitiesPanelProps = {
  opportunities: OpportunityItem[];
  locale: string;
  labels: {
    title: string;
    noOpportunities: string;
    needsConfiguration: string;
    viewAll: string;
  };
};

const severityColors = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export function OpportunitiesPanel({
  opportunities,
  locale,
  labels,
}: OpportunitiesPanelProps) {
  if (opportunities.length === 0) {
    return (
      <PanelWrapper title={labels.title} status="empty">
        <PanelEmpty message={labels.noOpportunities} />
      </PanelWrapper>
    );
  }

  const displayedOpportunities = opportunities.slice(0, 6);

  return (
    <PanelWrapper title={labels.title} status="ok">
      <div className="space-y-3">
        {displayedOpportunities.map((opp) => (
          <div key={opp.id} className="rounded-lg border border-border/50 p-4">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{opp.title}</h4>
                {opp.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{opp.description}</p>
                )}
              </div>
              <span
                className={`ml-2 inline-block whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${severityColors[opp.severity]}`}
              >
                {opp.severity}
              </span>
            </div>
            {opp.evidence && Object.keys(opp.evidence).length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                {Object.entries(opp.evidence)
                  .slice(0, 2)
                  .map(([key, value]) => (
                    <p key={key}>
                      {key}: {String(value)}
                    </p>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {opportunities.length > 6 && (
        <Link
          href={`/${locale}/admin/owner/opportunities`}
          className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {labels.viewAll}
          <span className="ml-1">→</span>
        </Link>
      )}
    </PanelWrapper>
  );
}
