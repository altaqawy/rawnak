/**
 * Owner Console Metrics & Rules
 * Configurable thresholds for Opportunities and Challenges detection
 */

/**
 * Configurable rules for detecting opportunities and challenges.
 * If a rule field is undefined => treat as "Needs configuration" for that detection type.
 * Do not guess thresholds.
 */
export const ownerConsoleRules = {
  opportunities: {
    highConversionThreshold: undefined as number | undefined, // optional: e.g., 0.05 (5%)
    topProductMinSales: undefined as number | undefined, // optional: e.g., 10
    highTrafficCountryMin: undefined as number | undefined, // optional: e.g., 100
    newCustomerWindowDays: undefined as number | undefined, // optional: e.g., 7
  },
  challenges: {
    overdueInvoiceDays: undefined as number | undefined, // optional: e.g., 30
    lowStockThreshold: undefined as number | undefined, // optional: e.g., 5
    pendingOrdersThreshold: undefined as number | undefined, // optional: e.g., 10
    conversionDropPercent: undefined as number | undefined, // optional: e.g., 10
    complaintsThreshold: undefined as number | undefined, // optional: e.g., 5
  },
};

/**
 * Helper functions for metric calculations
 */

export function isOpportunitiesConfigured(): boolean {
  return Object.values(ownerConsoleRules.opportunities).some(v => v !== undefined);
}

export function isChallengesConfigured(): boolean {
  return Object.values(ownerConsoleRules.challenges).some(v => v !== undefined);
}

/**
 * Check if a specific opportunity detection rule is configured
 */
export function isOpportunityRuleConfigured(
  ruleKey: keyof typeof ownerConsoleRules.opportunities,
): boolean {
  return ownerConsoleRules.opportunities[ruleKey] !== undefined;
}

/**
 * Check if a specific challenge detection rule is configured
 */
export function isChallengeRuleConfigured(
  ruleKey: keyof typeof ownerConsoleRules.challenges,
): boolean {
  return ownerConsoleRules.challenges[ruleKey] !== undefined;
}

/**
 * Get all configured opportunity rules
 */
export function getConfiguredOpportunityRules(): Partial<typeof ownerConsoleRules.opportunities> {
  const configured = {} as Partial<typeof ownerConsoleRules.opportunities>;
  Object.entries(ownerConsoleRules.opportunities).forEach(([key, value]) => {
    if (value !== undefined) {
      configured[key as keyof typeof ownerConsoleRules.opportunities] = value;
    }
  });
  return configured;
}

/**
 * Get all configured challenge rules
 */
export function getConfiguredChallengeRules(): Partial<typeof ownerConsoleRules.challenges> {
  const configured = {} as Partial<typeof ownerConsoleRules.challenges>;
  Object.entries(ownerConsoleRules.challenges).forEach(([key, value]) => {
    if (value !== undefined) {
      configured[key as keyof typeof ownerConsoleRules.challenges] = value;
    }
  });
  return configured;
}

/**
 * Detect opportunities from loaded data
 */
export function detectOpportunities(data: {
  analytics: any;
  customers: any;
  leads: any;
  finance: any;
  inventory: any;
}) {
  const opportunities: any[] = [];

  // Only detect if rules are configured
  if (!isOpportunitiesConfigured()) {
    return opportunities; // Empty if no rules configured
  }

  // Check for high conversion rate
  if (
    isOpportunityRuleConfigured('highConversionThreshold') &&
    data.analytics.completionRate !== undefined &&
    data.analytics.completionRate >= (ownerConsoleRules.opportunities.highConversionThreshold || 0)
  ) {
    opportunities.push({
      id: 'high-conversion',
      title: 'ownerDashboard.opportunities.highConversion',
      description: 'Conversion rate is above average',
      severity: 'medium',
      moduleId: 'analytics',
      evidence: { conversionRate: data.analytics.completionRate },
    });
  }

  // Check for recent customers
  if (
    isOpportunityRuleConfigured('newCustomerWindowDays') &&
    data.customers.lastCustomerAt
  ) {
    const daysSinceLastCustomer =
      (Date.now() - new Date(data.customers.lastCustomerAt).getTime()) /
      (1000 * 60 * 60 * 24);
    const windowDays = ownerConsoleRules.opportunities.newCustomerWindowDays || 7;

    if (daysSinceLastCustomer <= windowDays) {
      opportunities.push({
        id: 'recent-customers',
        title: 'ownerDashboard.opportunities.recentCustomers',
        description: 'New customers acquired recently',
        severity: 'low',
        moduleId: 'crm',
        evidence: { lastCustomerDaysAgo: Math.round(daysSinceLastCustomer) },
      });
    }
  }

  // Check for growing revenue
  if (
    data.finance.totalRevenue &&
    data.finance.totalRevenue > 0
  ) {
    opportunities.push({
      id: 'revenue-growth',
      title: 'ownerDashboard.opportunities.revenueGrowth',
      description: 'Positive revenue signals detected',
      severity: 'high',
      moduleId: 'finance',
      evidence: { totalRevenue: data.finance.totalRevenue },
    });
  }

  return opportunities;
}

/**
 * Detect challenges from loaded data
 */
export function detectChallenges(data: {
  analytics: any;
  customers: any;
  leads: any;
  finance: any;
  inventory: any;
}) {
  const challenges: any[] = [];

  // Only detect if rules are configured
  if (!isChallengesConfigured()) {
    return challenges; // Empty if no rules configured
  }

  // Check for low conversion rate
  if (
    isOpportunityRuleConfigured('highConversionThreshold') &&
    data.analytics.completionRate !== undefined &&
    data.analytics.completionRate < (ownerConsoleRules.opportunities.highConversionThreshold || 0.05)
  ) {
    challenges.push({
      id: 'low-conversion',
      title: 'ownerDashboard.challenges.lowConversion',
      description: 'Conversion rate is below average',
      severity: 'medium',
      moduleId: 'analytics',
      evidence: { conversionRate: data.analytics.completionRate },
    });
  }

  // Check for pending orders
  if (
    isOpportunityRuleConfigured('pendingOrdersThreshold') &&
    data.leads.activeLeads > (ownerConsoleRules.opportunities.topProductMinSales || 10)
  ) {
    challenges.push({
      id: 'high-pending-orders',
      title: 'ownerDashboard.challenges.pendingOrders',
      description: 'Many orders awaiting processing',
      severity: 'medium',
      moduleId: 'crm',
      evidence: { activeLeads: data.leads.activeLeads },
    });
  }

  // Check for no revenue
  if (data.finance.paymentCount === 0) {
    challenges.push({
      id: 'no-revenue',
      title: 'ownerDashboard.challenges.noRevenue',
      description: 'No payments recorded in this period',
      severity: 'high',
      moduleId: 'finance',
      evidence: { paymentCount: data.finance.paymentCount },
    });
  }

  return challenges;
}
