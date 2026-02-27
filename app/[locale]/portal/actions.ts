'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireCustomer } from '@/lib/auth/guards';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';

function withQuery(pathname: string, query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

export async function updateProfileAction(locale: string, formData: FormData) {
  const context = await requireCustomer(locale);

  if (!isSupabaseConfigured() || !context.user) {
    redirect(withQuery(`/${locale}/portal/profile`, { error: 'supabase_not_configured' }));
  }

  const displayName = String(formData.get('display_name') ?? '').trim();

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName || null, locale })
    .eq('id', context.user.id);

  if (error) {
    redirect(withQuery(`/${locale}/portal/profile`, { error: 'save_failed' }));
  }

  revalidatePath(`/${locale}/portal/profile`);
  redirect(withQuery(`/${locale}/portal/profile`, { status: 'saved' }));
}
