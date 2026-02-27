/**
 * Owner Dashboard Main Component
 * Executive overview of all business modules
 */

import type { OwnerSnapshot } from '@/lib/owner-console/types';
import { StatsOverview } from './StatsOverview';
import { HealthCheck } from './HealthCheck';
import { OpportunitiesPanel } from './OpportunitiesPanel';
import { ChallengesPanel } from './ChallengesPanel';
import { QuickActions } from './QuickActions';

type OwnerDashboardProps = {
  snapshot: OwnerSnapshot;
  labels: {
    title: string;
    subtitle: string;
    revenue: string;
    activeOrders: string;
    customerSatisfaction: string;
    performanceScore: string;
    healthStatus: string;
    moduleName: Record<string, string>;
    opportunities: string;
    noOpportunities: string;
    challenges: string;
    noChallenges: string;
    quickActions: string;
    viewAll: string;
  };
};

export function OwnerDashboard({ snapshot, labels }: OwnerDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{labels.title}</h1>
        <p className="mt-2 text-start text-sm text-muted-foreground">{labels.subtitle}</p>
      </header>

      {/* KPI Cards Row */}
      <section>
        <StatsOverview
          kpis={snapshot.kpis}
          labels={{
            revenue: labels.revenue,
            activeOrders: labels.activeOrders,
            customerSatisfaction: labels.customerSatisfaction,
            performanceScore: labels.performanceScore,
          }}
        />
      </section>

      {/* Health Check */}
      <section>
        <HealthCheck
          health={snapshot.health}
          labels={{
            healthStatus: labels.healthStatus,
            moduleName: labels.moduleName,
          }}
        />
      </section>

      {/* Opportunities and Challenges Row */}
      <section className="grid gap-6 lg:grid-cols-2">
        <OpportunitiesPanel
          opportunities={snapshot.opportunities}
          locale={snapshot.scope.locale}
          labels={{
            title: labels.opportunities,
            noOpportunities: labels.noOpportunities,
            needsConfiguration: 'Opportunities detection needs configuration',
            viewAll: labels.viewAll,
          }}
        />
        <ChallengesPanel
          challenges={snapshot.challenges}
          locale={snapshot.scope.locale}
          labels={{
            title: labels.challenges,
            noChallenges: labels.noChallenges,
            needsConfiguration: 'Challenges detection needs configuration',
            viewAll: labels.viewAll,
          }}
        />
      </section>

      {/* Quick Actions */}
      <section>
        <QuickActions
          actions={snapshot.quickActions}
          labels={{
            title: labels.quickActions,
          }}
        />
      </section>
    </div>
  );
}
