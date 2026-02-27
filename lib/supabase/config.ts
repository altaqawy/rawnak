export const SUPABASE_ENV_KEYS = {
  url: 'NEXT_PUBLIC_SUPABASE_URL',
  anon: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  serviceRole: 'SUPABASE_SERVICE_ROLE_KEY',
} as const;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function getSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) {
    throw new Error(`${SUPABASE_ENV_KEYS.url} is required.`);
  }
  return value;
}

export function getSupabaseAnonKey(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) {
    throw new Error(`${SUPABASE_ENV_KEYS.anon} is required.`);
  }
  return value;
}

export function getSupabaseServiceRoleKey(): string {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) {
    throw new Error(`${SUPABASE_ENV_KEYS.serviceRole} is required.`);
  }
  return value;
}
