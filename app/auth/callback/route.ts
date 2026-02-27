import { NextResponse } from 'next/server';
import { isAppRole } from '@/lib/auth/roles';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { defaultLocale, isLocale } from '@/i18n/config';

function getLocale(value: string | null) {
  if (!value) return defaultLocale;
  return isLocale(value) ? value : defaultLocale;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const locale = getLocale(searchParams.get('locale'));
  const nextPath = searchParams.get('next');

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, origin));
  }

  const supabase = await createSupabaseServerClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, origin));
  }

  if (nextPath && nextPath.startsWith(`/${locale}/`)) {
    return NextResponse.redirect(new URL(nextPath, origin));
  }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  const role = roleRow?.role && isAppRole(roleRow.role) ? roleRow.role : 'customer';
  const destination = role === 'customer' ? `/${locale}/portal` : `/${locale}/admin`;

  return NextResponse.redirect(new URL(destination, origin));
}
