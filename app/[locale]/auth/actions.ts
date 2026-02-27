'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAppRole } from '@/lib/auth/roles';
import { getPublicSiteSettings } from '@/lib/builder/repository';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';

function toLocale(value: string): Locale {
  return isLocale(value) ? value : defaultLocale;
}

function withQuery(pathname: string, query: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

async function getOrigin(): Promise<string | null> {
  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host');
  if (!host) return null;

  const proto = headerList.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

export async function loginAction(localeInput: string, formData: FormData) {
  const locale = toLocale(localeInput);

  if (!isSupabaseConfigured()) {
    redirect(withQuery(`/${locale}/auth/login`, { error: 'supabase_not_configured' }));
  }

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '').trim();

  if (!email || !password) {
    redirect(withQuery(`/${locale}/auth/login`, { error: 'missing_fields' }));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(withQuery(`/${locale}/auth/login`, { error: 'invalid_credentials' }));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(withQuery(`/${locale}/auth/login`, { error: 'invalid_credentials' }));
  }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  const role = roleRow?.role && isAppRole(roleRow.role) ? roleRow.role : 'customer';

  if (role === 'customer') {
    redirect(`/${locale}/portal`);
  }

  redirect(`/${locale}/admin`);
}

export async function signupAction(localeInput: string, formData: FormData) {
  const locale = toLocale(localeInput);

  if (!isSupabaseConfigured()) {
    redirect(withQuery(`/${locale}/auth/signup`, { error: 'supabase_not_configured' }));
  }

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '').trim();

  if (!email || !password) {
    redirect(withQuery(`/${locale}/auth/signup`, { error: 'missing_fields' }));
  }

  const publicSettings = await getPublicSiteSettings();
  if (publicSettings.customersSignupEnabled === false) {
    redirect(withQuery(`/${locale}/auth/signup`, { error: 'signup_disabled' }));
  }

  const supabase = await createSupabaseServerClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { locale },
      emailRedirectTo: origin ? `${origin}/auth/callback?locale=${locale}` : undefined,
    },
  });

  if (error) {
    redirect(withQuery(`/${locale}/auth/signup`, { error: 'signup_failed' }));
  }

  if (data.session) {
    redirect(`/${locale}/portal`);
  }

  redirect(withQuery(`/${locale}/auth/login`, { status: 'check_email' }));
}

export async function logoutAction(localeInput: string) {
  const locale = toLocale(localeInput);

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect(`/${locale}`);
}
