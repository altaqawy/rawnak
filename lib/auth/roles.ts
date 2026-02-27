export const ROLE_VALUES = [
  'owner',
  'admin',
  'supervisor',
  'employee',
  'customer',
] as const;

export const STAFF_ROLES = [
  'owner',
  'admin',
  'supervisor',
  'employee',
] as const;

export const CONTENT_SCOPE_VALUES = [
  'all',
  'services',
  'products',
  'kits',
  'portfolio',
] as const;

export type AppRole = (typeof ROLE_VALUES)[number];
export type StaffRole = (typeof STAFF_ROLES)[number];
export type ContentScope = (typeof CONTENT_SCOPE_VALUES)[number];

const ROLE_RANK: Record<AppRole, number> = {
  owner: 5,
  admin: 4,
  supervisor: 3,
  employee: 2,
  customer: 1,
};

export function isAppRole(value: string): value is AppRole {
  return ROLE_VALUES.includes(value as AppRole);
}

export function isStaffRole(role: AppRole | null): role is StaffRole {
  return Boolean(role && STAFF_ROLES.includes(role as StaffRole));
}

export function normalizeScopes(
  scopes: string[] | null | undefined,
): ContentScope[] {
  if (!scopes || scopes.length === 0) {
    return [];
  }

  const valid = scopes.filter((scope): scope is ContentScope =>
    CONTENT_SCOPE_VALUES.includes(scope as ContentScope),
  );

  if (valid.includes('all')) {
    return ['all'];
  }

  return Array.from(new Set(valid));
}

export function roleHasScope(
  role: AppRole | null,
  scopes: string[] | null | undefined,
  scope: Exclude<ContentScope, 'all'>,
): boolean {
  if (!role) return false;
  if (role === 'owner' || role === 'admin') return true;

  const normalized = normalizeScopes(scopes);
  if (normalized.includes('all')) return true;

  return normalized.includes(scope);
}

export function canPublishContent(role: AppRole | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'supervisor';
}

export function canManageUsersAndRoles(role: AppRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

export function canManageSiteSettings(role: AppRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

export function canGrantRole(
  actorRole: AppRole | null,
  targetRole: AppRole,
): boolean {
  if (!actorRole) return false;
  if (actorRole === 'owner') return true;
  if (actorRole === 'admin') return targetRole !== 'owner';
  return false;
}

export function compareRolePriority(
  left: AppRole | null,
  right: AppRole | null,
): number {
  if (!left && !right) return 0;
  if (!left) return -1;
  if (!right) return 1;

  return ROLE_RANK[left] - ROLE_RANK[right];
}
