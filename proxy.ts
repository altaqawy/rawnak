import { createServerClient } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import {
  defaultLocale,
  localeCookieName,
  locales,
  type Locale,
} from '@/i18n/config';
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from '@/lib/supabase/config';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: false,
  localeCookie: {
    name: localeCookieName,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  },
});

const OWNER_ONLY_ROUTE_PATTERNS = [
  /^\/(ar|en)\/admin\/pages(?:\/.*)?$/i,
  /^\/(ar|en)\/admin\/builder(?:\/.*)?$/i,
  /^\/(ar|en)\/admin\/templates(?:\/.*)?$/i,
  /^\/(ar|en)\/admin\/theme(?:\/.*)?$/i,
  /^\/(ar|en)\/admin\/media(?:\/.*)?$/i,
  /^\/(ar|en)\/admin\/audit(?:\/.*)?$/i,
  /^\/(ar|en)\/admin\/settings(?:\/.*)?$/i,
  /^\/(ar|en)\/admin\/site-settings(?:\/.*)?$/i,
  /^\/(ar|en)\/preview(?:\/.*)?$/i,
];

function localeFromPath(pathname: string): Locale {
  const segment = pathname.split('/')[1];
  return segment === 'en' ? 'en' : defaultLocale;
}

function matchesOwnerOnlyPath(pathname: string) {
  return OWNER_ONLY_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

export default async function proxy(request: NextRequest) {
  const response = intlMiddleware(request);
  const pathname = request.nextUrl.pathname;

  if (!matchesOwnerOnlyPath(pathname)) {
    return response;
  }

  const locale = localeFromPath(pathname);

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
  }

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
  }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (roleRow?.role !== 'owner') {
    return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|auth|_next|_vercel|.*\\..*).+)'],
};
