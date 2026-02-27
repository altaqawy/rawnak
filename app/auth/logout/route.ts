import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { defaultLocale, isLocale } from '@/i18n/config';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const localeParam = searchParams.get('locale');
  const locale = localeParam && isLocale(localeParam) ? localeParam : defaultLocale;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(new URL(`/${locale}`, origin));
}
