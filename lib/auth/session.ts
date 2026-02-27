import 'server-only';

import { cache } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  type AppRole,
  isAppRole,
  normalizeScopes,
} from '@/lib/auth/roles';

export type AuthContext = {
  user: { id: string; email: string | null } | null;
  role: AppRole | null;
  scopes: string[];
};

export const getAuthContext = cache(async (): Promise<AuthContext> => {
  if (!isSupabaseConfigured()) {
    return {
      user: null,
      role: null,
      scopes: [],
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      role: null,
      scopes: [],
    };
  }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role, scopes')
    .eq('user_id', user.id)
    .maybeSingle();

  const role = roleRow?.role && isAppRole(roleRow.role)
    ? roleRow.role
    : 'customer';

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    role,
    scopes: normalizeScopes((roleRow?.scopes as string[] | null) ?? []),
  };
});

export async function getCurrentUserRole(): Promise<AppRole | null> {
  const context = await getAuthContext();
  return context.role;
}
