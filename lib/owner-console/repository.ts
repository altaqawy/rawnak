/**
 * Owner Console Repository
 * Single entry point for loading unified Owner Dashboard data
 */

import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireOwner } from '@/lib/auth/guards';
import type { OwnerSnapshot, HealthCheckModule, OpportunityItem, ChallengeItem, QuickAction } from './types';

/**
 * Main function: Load complete Owner Snapshot
 * This is the ONLY public entry point for Owner Console data.
 *
 * @param params.locale - Current locale (ar/en)
 * @returns Complete OwnerSnapshot with all panels, or appropriate empty/not_configured states
 */
export async function getOwnerSnapshot(params: {
  locale: string;
}): Promise<OwnerSnapshot> {
  const { locale } = params;

  // 1. Verify ownership at server level
  const authContext = await requireOwner(locale);

  // 2. Initialize empty snapshot with basic structure
  const snapshot: OwnerSnapshot = {
    scope: {
      orgId: undefined, // TODO: Extract from session/auth when org system is available
      ownerId: authContext.user?.id,
      locale,
    },
    kpis: {
      revenue: { status: 'not_configured', note: 'Not configured' },
      activeOrders: { status: 'not_configured', note: 'Not configured' },
      customerSatisfaction: { status: 'not_configured', note: 'Not configured' },
      performanceScore: { status: 'not_configured', note: 'Not configured' },
    },
    health: [],
    opportunities: [],
    challenges: [],
    quickActions: [],
  };

  // 3. If scope is incomplete, return snapshot with not_configured states
  if (!snapshot.scope.ownerId && !snapshot.scope.orgId) {
    return snapshot;
  }

  try {
    const supabase = await createSupabaseServerClient();

    // 4. Try to load data from each module
    // For now, we return the initial structure as modules are not fully configured
    // TODO: Add queries for analytics, crm, finance, inventory, operations when tables are ready

    // 5. Load health checks (placeholder - no signals yet)
    const healthModules: HealthCheckModule[] = [
      { moduleId: 'analytics', status: 'unknown', reason: 'No data available' },
      { moduleId: 'crm', status: 'unknown', reason: 'No data available' },
      { moduleId: 'finance', status: 'unknown', reason: 'No data available' },
      { moduleId: 'inventory', status: 'unknown', reason: 'No data available' },
      { moduleId: 'operations', status: 'unknown', reason: 'No data available' },
      { moduleId: 'content', status: 'unknown', reason: 'No data available' },
      { moduleId: 'team', status: 'unknown', reason: 'No data available' },
      { moduleId: 'reports', status: 'unknown', reason: 'No data available' },
      { moduleId: 'settings', status: 'unknown', reason: 'No data available' },
    ];

    snapshot.health = healthModules;

    // 6. Load quick actions (links to module pages)
    const quickActions: QuickAction[] = [
      {
        id: 'dashboard',
        label: 'View Dashboard',
        href: `/${locale}/admin/dashboard`,
        moduleId: 'analytics',
      },
      {
        id: 'crm',
        label: 'Manage Customers',
        href: `/${locale}/admin/crm`,
        moduleId: 'crm',
      },
      {
        id: 'finance',
        label: 'View Finance',
        href: `/${locale}/admin/finance`,
        moduleId: 'finance',
      },
      {
        id: 'inventory',
        label: 'Check Inventory',
        href: `/${locale}/admin/inventory`,
        moduleId: 'inventory',
      },
      {
        id: 'orders',
        label: 'View Orders',
        href: `/${locale}/admin/ops`,
        moduleId: 'operations',
      },
    ];

    snapshot.quickActions = quickActions;

    // 7. Initialize opportunities and challenges as empty (no configured rules yet)
    snapshot.opportunities = [];
    snapshot.challenges = [];

    // 8. Initialize charts (disabled by default)
    snapshot.charts = {
      enabled: false,
      status: 'not_configured',
      note: 'Charts not configured',
    };

    return snapshot;
  } catch (error) {
    console.error('[owner-console] Error loading snapshot:', error);

    // Return snapshot with error status in kpis
    return {
      ...snapshot,
      kpis: {
        revenue: { status: 'error', note: 'Failed to load data' },
        activeOrders: { status: 'error', note: 'Failed to load data' },
        customerSatisfaction: { status: 'error', note: 'Failed to load data' },
        performanceScore: { status: 'error', note: 'Failed to load data' },
      },
    };
  }
}
