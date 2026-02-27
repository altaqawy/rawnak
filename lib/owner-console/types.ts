/**
 * Owner Console Type Definitions
 * Unified data model for the Executive Dashboard
 */

export type PanelStatus = 'ok' | 'empty' | 'not_configured' | 'error';
export type HealthStatus = 'green' | 'yellow' | 'red' | 'unknown' | 'not_configured';
export type SeverityLevel = 'low' | 'medium' | 'high';

export type KPIValue = {
  value?: number;
  currency?: string;
  status: PanelStatus;
  note?: string;
};

export type KPIs = {
  revenue?: KPIValue;
  activeOrders?: KPIValue;
  customerSatisfaction?: KPIValue;
  performanceScore?: KPIValue;
};

export type HealthCheckModule = {
  moduleId: 'analytics' | 'crm' | 'finance' | 'inventory' | 'operations' | 'content' | 'team' | 'reports' | 'settings';
  status: HealthStatus;
  reason?: string;
  lastSignalAt?: string; // ISO format only if real data exists
};

export type OpportunityItem = {
  id: string;
  title: string;
  description?: string;
  severity: SeverityLevel;
  moduleId: string;
  evidence?: Record<string, unknown>;
};

export type ChallengeItem = {
  id: string;
  title: string;
  description?: string;
  severity: SeverityLevel;
  moduleId: string;
  evidence?: Record<string, unknown>;
};

export type QuickAction = {
  id: string;
  label: string;
  href: string;
  moduleId: string;
};

export type ChartSeries = {
  id: string;
  label: string;
  points: Array<{ x: string; y: number }>;
};

export type Charts = {
  enabled: boolean;
  series?: ChartSeries[];
  status: PanelStatus;
  note?: string;
};

export type OwnerSnapshot = {
  scope: {
    orgId?: string;
    ownerId?: string;
    locale: string;
  };
  kpis: KPIs;
  health: HealthCheckModule[];
  opportunities: OpportunityItem[];
  challenges: ChallengeItem[];
  quickActions: QuickAction[];
  charts?: Charts;
};
