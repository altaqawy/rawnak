/**
 * Owner Console Repository
 * Single entry point for loading unified Owner Dashboard data from Supabase
 */

import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireOwner } from '@/lib/auth/guards';
import { detectOpportunities, detectChallenges } from './metrics';
import type { OwnerSnapshot } from './types';

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

  // 2. Initialize snapshot structure
  const snapshot: OwnerSnapshot = {
    scope: {
      ownerId: authContext.user?.id,
      locale,
    },
    kpis: {
      revenue: { status: 'not_configured', note: 'No payment data' },
      activeOrders: { status: 'not_configured', note: 'No active leads' },
      customerSatisfaction: { status: 'not_configured', note: 'Not configured' },
      performanceScore: { status: 'not_configured', note: 'No conversion data' },
    },
    health: [],
    opportunities: [],
    challenges: [],
    quickActions: [],
    charts: {
      enabled: false,
      status: 'not_configured',
      note: 'Charts not configured',
    },
  };

  // 3. If no owner ID, return not configured
  if (!snapshot.scope.ownerId) {
    return snapshot;
  }

  try {
    const supabase = await createSupabaseServerClient();

    // 4. Load all data in parallel
    const [analytics, customers, leads, finance, inventory] = await Promise.all([
      loadAnalyticsData(supabase),
      loadCustomerData(supabase),
      loadLeadsData(supabase),
      loadFinanceData(supabase),
      loadInventoryData(supabase),
    ]);

    // 5. Build KPIs from loaded data
    if (finance.totalRevenue !== undefined && finance.totalRevenue > 0) {
      snapshot.kpis.revenue = {
        value: Math.round(finance.totalRevenue),
        currency: 'EGP',
        status: 'ok',
      };
    }

    if (leads.activeLeads !== undefined && leads.activeLeads > 0) {
      snapshot.kpis.activeOrders = {
        value: leads.activeLeads,
        status: 'ok',
      };
    }

    if (analytics.completionRate !== undefined) {
      snapshot.kpis.performanceScore = {
        value: Math.round(analytics.completionRate * 100) / 100,
        status: 'ok',
      };
    }

    // 6. Calculate health status
    snapshot.health = [
      {
        moduleId: 'analytics',
        status: analytics.totalEvents > 0 ? 'green' : 'yellow',
        reason: analytics.totalEvents > 0 ? undefined : 'No analytics events recorded',
      },
      {
        moduleId: 'crm',
        status: leads.totalLeads > 0 ? 'green' : 'yellow',
        reason: leads.totalLeads > 0 ? undefined : 'No leads recorded',
      },
      {
        moduleId: 'finance',
        status: finance.totalRevenue ? 'green' : 'yellow',
        reason: finance.totalRevenue ? undefined : 'No payments recorded',
      },
      {
        moduleId: 'inventory',
        status: inventory.totalItems > 0 ? 'green' : 'yellow',
        reason: inventory.totalItems > 0 ? undefined : 'No inventory items',
      },
      {
        moduleId: 'operations',
        status: 'unknown',
        reason: 'Not configured',
      },
      {
        moduleId: 'content',
        status: 'unknown',
        reason: 'Not configured',
      },
      {
        moduleId: 'team',
        status: 'unknown',
        reason: 'Not configured',
      },
      {
        moduleId: 'reports',
        status: 'unknown',
        reason: 'Not configured',
      },
      {
        moduleId: 'settings',
        status: 'unknown',
        reason: 'Not configured',
      },
    ];

    // 7. Detect opportunities and challenges
    snapshot.opportunities = detectOpportunities({
      analytics,
      customers,
      leads,
      finance,
      inventory,
    });

    snapshot.challenges = detectChallenges({
      analytics,
      customers,
      leads,
      finance,
      inventory,
    });

    // 8. Load quick actions
    snapshot.quickActions = [
      {
        id: 'dashboard',
        label: 'ownerDashboard.modules.analytics',
        href: `/${locale}/admin/dashboard`,
        moduleId: 'analytics',
      },
      {
        id: 'crm',
        label: 'ownerDashboard.modules.crm',
        href: `/${locale}/admin/crm`,
        moduleId: 'crm',
      },
      {
        id: 'finance',
        label: 'ownerDashboard.modules.finance',
        href: `/${locale}/admin/finance`,
        moduleId: 'finance',
      },
      {
        id: 'inventory',
        label: 'ownerDashboard.modules.inventory',
        href: `/${locale}/admin/inventory`,
        moduleId: 'inventory',
      },
    ];

    return snapshot;
  } catch (error) {
    console.error('[owner-console] Error loading snapshot:', error);

    // Return snapshot with error status
    return {
      ...snapshot,
      kpis: {
        revenue: { status: 'error', note: 'Failed to load revenue' },
        activeOrders: { status: 'error', note: 'Failed to load orders' },
        customerSatisfaction: { status: 'error', note: 'Failed to load data' },
        performanceScore: { status: 'error', note: 'Failed to load data' },
      },
    };
  }
}

async function loadAnalyticsData(supabase: any) {
  try {
    const { data, error } = await supabase.rpc('get_owner_analytics_summary', {
      from_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (error) throw error;
    if (!data || data.length === 0) {
      return { totalEvents: 0, pageViews: 0, clicks: 0, completionRate: undefined };
    }

    return {
      totalEvents: data[0]?.total_events ?? 0,
      pageViews: data[0]?.page_views ?? 0,
      clicks: data[0]?.clicks ?? 0,
      completionRate: data[0]?.completion_rate,
    };
  } catch (error) {
    console.error('[analytics] Load failed:', error);
    return { totalEvents: 0, pageViews: 0, clicks: 0, completionRate: undefined };
  }
}

async function loadCustomerData(supabase: any) {
  try {
    const { data, error, count } = await supabase
      .from('customers')
      .select('id, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    return {
      totalCustomers: count ?? 0,
      lastCustomerAt: data?.[0]?.created_at,
    };
  } catch (error) {
    console.error('[customers] Load failed:', error);
    return { totalCustomers: 0, lastCustomerAt: undefined };
  }
}

async function loadLeadsData(supabase: any) {
  try {
    const { data: activeLeads, error: activeError } = await supabase
      .from('leads_requests')
      .select('id', { count: 'exact' })
      .eq('status', 'in_progress');

    if (activeError) throw activeError;

    const { data: allLeads, error: allError } = await supabase
      .from('leads_requests')
      .select('id', { count: 'exact' });

    if (allError) throw allError;

    return {
      activeLeads: activeLeads?.length ?? 0,
      totalLeads: allLeads?.length ?? 0,
    };
  } catch (error) {
    console.error('[leads] Load failed:', error);
    return { activeLeads: 0, totalLeads: 0 };
  }
}

async function loadFinanceData(supabase: any) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('amount')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) throw error;

    const totalRevenue = data?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) ?? 0;

    return {
      totalRevenue: totalRevenue > 0 ? totalRevenue : undefined,
      paymentCount: data?.length ?? 0,
    };
  } catch (error) {
    console.error('[finance] Load failed:', error);
    return { totalRevenue: undefined, paymentCount: 0 };
  }
}

async function loadInventoryData(supabase: any) {
  try {
    const { data, error, count } = await supabase
      .from('inventory_items')
      .select('id', { count: 'exact' });

    if (error) throw error;

    return {
      totalItems: count ?? 0,
    };
  } catch (error) {
    console.error('[inventory] Load failed:', error);
    return { totalItems: 0 };
  }
}
