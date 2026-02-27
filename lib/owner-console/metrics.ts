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
