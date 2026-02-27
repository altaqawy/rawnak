/**
 * Health Check Component
 * Display module health status for Owner Dashboard
 */

import type { HealthCheckModule } from '@/lib/owner-console/types';
import { HealthBadge, PanelWrapper } from './PanelStates';

type HealthCheckProps = {
  health: HealthCheckModule[];
  labels: {
    healthStatus: string;
    moduleName: Record<string, string>;
  };
};

export function HealthCheck({ health, labels }: HealthCheckProps) {
  if (health.length === 0) {
    return (
      <PanelWrapper title={labels.healthStatus} status="empty">
        <p className="text-sm text-muted-foreground">No module data available</p>
      </PanelWrapper>
    );
  }

  const statusText = {
    green: 'Healthy',
    yellow: 'Warning',
    red: 'Critical',
    unknown: 'Unknown',
    not_configured: 'Not Configured',
  };

  return (
    <PanelWrapper title={labels.healthStatus} status="ok">
      <div className="space-y-3">
        {health.map((module) => (
          <div key={module.moduleId} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
            <div className="flex items-center gap-3">
              <HealthBadge status={module.status} />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {labels.moduleName[module.moduleId] || module.moduleId}
                </p>
                {module.reason && <p className="text-xs text-muted-foreground">{module.reason}</p>}
                {module.lastSignalAt && (
                  <p className="text-xs text-muted-foreground">
                    Last signal: {new Date(module.lastSignalAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase">{statusText[module.status]}</span>
          </div>
        ))}
      </div>
    </PanelWrapper>
  );
}
