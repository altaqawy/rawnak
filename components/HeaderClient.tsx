'use client';

import { Languages, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { SiteLogo } from '@/components/SiteLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { isLocale, localeCookieName, type Locale } from '@/i18n/config';
import { isStaffRole, type AppRole } from '@/lib/auth/roles';
import { cn } from '@/lib/utils';

const STATIC_NAV_ORDER = ['home', 'services', 'products', 'diy', 'portfolio', 'about', 'contact'] as const;

type HeaderClientProps = {
  locale: Locale;
  role: AppRole | null;
  isAuthenticated: boolean;
  brandName: string;
  logoPath: string;
  navPages: Array<{
    slug: string;
    nav_label_ar: string | null;
    nav_label_en: string | null;
    title_ar: string | null;
    title_en: string | null;
    nav_order: number;
  }>;
};

type NavItem = {
  key: string;
  href: string;
  label: string;
};

function switchLocalePath(pathname: string, targetLocale: Locale): string {
  const segments = pathname.split('/');
  if (isLocale(segments[1] ?? '')) {
    segments[1] = targetLocale;
    return segments.join('/') || `/${targetLocale}`;
  }

  return `/${targetLocale}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

function readLocale(pathname: string, fallback: Locale): Locale {
  const candidate = pathname.split('/')[1] ?? '';
  return isLocale(candidate) ? candidate : fallback;
}

function fallbackLabel(
  slug: string,
  t: ReturnType<typeof useTranslations>,
) {
  if ((STATIC_NAV_ORDER as readonly string[]).includes(slug)) {
    return t(slug);
  }
  return slug;
}

function slugToHref(locale: Locale, slug: string) {
  if (slug === 'home') return `/${locale}`;
  return `/${locale}/${slug}`;
}

export default function HeaderClient({
  locale,
  role,
  isAuthenticated,
  brandName,
  logoPath,
  navPages,
}: HeaderClientProps) {
  const t = useTranslations('nav');
  const pathname = usePathname() || '/';
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentLocale = useMemo(() => readLocale(pathname, locale), [locale, pathname]);
  const nextLocale: Locale = currentLocale === 'ar' ? 'en' : 'ar';

  const navItems = useMemo<NavItem[]>(() => {
    if (navPages.length === 0) {
      return STATIC_NAV_ORDER.map((slug) => ({
        key: slug,
        href: slugToHref(currentLocale, slug),
        label: t(slug),
      }));
    }

    return [...navPages]
      .sort((a, b) => a.nav_order - b.nav_order)
      .map((item) => {
        const label =
          currentLocale === 'ar'
            ? item.nav_label_ar || item.title_ar || fallbackLabel(item.slug, t)
            : item.nav_label_en || item.title_en || fallbackLabel(item.slug, t);

        return {
          key: item.slug,
          href: slugToHref(currentLocale, item.slug),
          label,
        };
      });
  }, [currentLocale, navPages, t]);

  const authLinks = useMemo(() => {
    if (!isAuthenticated) {
      return [
        { href: `/${currentLocale}/auth/login`, label: t('login') },
        { href: `/${currentLocale}/auth/signup`, label: t('signup') },
      ];
    }

    if (role === 'customer') {
      return [
        { href: `/${currentLocale}/portal`, label: t('portal') },
        { href: `/auth/logout?locale=${currentLocale}`, label: t('logout') },
      ];
    }

    if (isStaffRole(role)) {
      return [
        { href: `/${currentLocale}/admin`, label: t('admin') },
        { href: `/auth/logout?locale=${currentLocale}`, label: t('logout') },
      ];
    }

    return [{ href: `/auth/logout?locale=${currentLocale}`, label: t('logout') }];
  }, [currentLocale, isAuthenticated, role, t]);

  const onSwitchLanguage = () => {
    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.push(switchLocalePath(pathname, nextLocale));
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link href={`/${currentLocale}`} aria-label={t('goHome')} className="flex items-center gap-3">
          <SiteLogo
            alt={t('goHome')}
            src={logoPath}
            className="size-10 border border-border/70 bg-background/80 shadow-[var(--shadow-soft)]"
            priority
          />
          <span className="hidden text-sm font-semibold tracking-[0.16em] text-foreground sm:inline-block">
            {brandName}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 xl:flex">
          {navItems.map((item) => {
            const active =
              item.href === `/${currentLocale}`
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'text-sm text-muted-foreground transition-colors hover:text-foreground',
                  active && 'text-foreground',
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href={'/' + currentLocale + '/tools'}
            className={cn(
              'text-sm font-semibold text-muted-foreground transition-colors hover:text-blue-500',
              pathname.startsWith('/' + currentLocale + '/tools') && 'text-blue-500',
            )}
          >
            {currentLocale === 'ar' ? 'أدوات رونق' : 'Tools'}
          </Link>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {authLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSwitchLanguage}
            aria-label={t('language')}
            className="h-8 rounded-full border-border/70 bg-card/70 px-3 text-xs tracking-wide"
          >
            <Languages className="size-4" />
            <span>{nextLocale.toUpperCase()}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="xl:hidden"
            aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border/70 bg-background/95 px-4 py-4 xl:hidden md:px-6">
          <nav className="grid gap-2">
            {navItems.map((item) => {
              const active =
                item.href === `/${currentLocale}`
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    'rounded-lg border border-transparent px-3 py-2 text-start text-sm text-muted-foreground transition-colors hover:text-foreground',
                    active && 'border-border/80 bg-card/70 text-foreground',
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href={'/' + currentLocale + '/tools'}
              className={cn(
                'rounded-lg border border-transparent px-3 py-2 text-start text-sm font-semibold text-muted-foreground transition-colors hover:text-blue-500',
                pathname.startsWith('/' + currentLocale + '/tools') && 'border-border/80 bg-card/70 text-blue-500',
              )}
              onClick={() => setMenuOpen(false)}
            >
              {currentLocale === 'ar' ? 'أدوات رونق' : 'Tools'}
            </Link>
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-start text-sm text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
