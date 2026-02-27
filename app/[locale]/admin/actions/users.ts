'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { canGrantRole, isAppRole, normalizeScopes, type AppRole } from '@/lib/auth/roles';
import { requireOwnerOrAdmin } from '@/lib/auth/guards';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { isSupabaseAdminConfigured, isSupabaseConfigured } from '@/lib/supabase/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';

function withQuery(pathname: string, query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

function normalizeRoleScopes(role: AppRole, scopesInput: string[]) {
  if (role === 'owner' || role === 'admin') {
    return ['all'];
  }

  if (role === 'customer') {
    return null;
  }

  const normalized = normalizeScopes(scopesInput);
  return normalized.length ? normalized : null;
}

async function getOrigin(): Promise<string | null> {
  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host');
  if (!host) return null;

  const proto = headerList.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

export async function inviteStaffAction(locale: string, formData: FormData) {
  await requireOwnerOrAdmin(locale);

  if (!isSupabaseAdminConfigured()) {
    redirect(withQuery(`/${locale}/admin/users`, { error: 'supabase_not_configured' }));
  }

  const email = String(formData.get('email') ?? '').trim();
  if (!email) {
    redirect(withQuery(`/${locale}/admin/users`, { error: 'missing_fields' }));
  }

  const origin = await getOrigin();
  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { invited: true },
    redirectTo: origin ? `${origin}/auth/callback?locale=${locale}&next=/${locale}/admin/users` : undefined,
  });

  if (error) {
    redirect(withQuery(`/${locale}/admin/users`, { error: 'invite_failed' }));
  }

  revalidatePath(`/${locale}/admin/users`);
  redirect(withQuery(`/${locale}/admin/users`, { status: 'invited' }));
}

export async function assignRoleAction(locale: string, formData: FormData) {
  const context = await requireOwnerOrAdmin(locale);

  if (!isSupabaseConfigured()) {
    redirect(withQuery(`/${locale}/admin/users`, { error: 'supabase_not_configured' }));
  }

  const userId = String(formData.get('user_id') ?? '').trim();
  const roleInput = String(formData.get('role') ?? '').trim();
  const scopesInput = formData
    .getAll('scopes')
    .filter((value): value is string => typeof value === 'string');

  if (!userId || !isAppRole(roleInput)) {
    redirect(withQuery(`/${locale}/admin/users`, { error: 'invalid_request' }));
  }

  if (!canGrantRole(context.role, roleInput)) {
    redirect(withQuery(`/${locale}/admin/users`, { error: 'cannot_grant_owner' }));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('user_roles').upsert(
    {
      user_id: userId,
      role: roleInput,
      scopes: normalizeRoleScopes(roleInput, scopesInput),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    redirect(withQuery(`/${locale}/admin/users`, { error: 'save_failed' }));
  }

  revalidatePath(`/${locale}/admin/users`);
  redirect(withQuery(`/${locale}/admin/users`, { status: 'saved' }));
}
