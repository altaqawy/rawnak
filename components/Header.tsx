import HeaderClient from '@/components/HeaderClient';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';
import { getAuthContext } from '@/lib/auth/session';
import {
  getPublicSiteSettings,
  listPublishedNavPages,
} from '@/lib/builder/repository';

type HeaderProps = {
  locale?: string;
};

function toLocale(value: string | undefined): Locale {
  if (!value) return defaultLocale;
  return isLocale(value) ? value : defaultLocale;
}

export default async function Header({ locale }: HeaderProps) {
  const context = await getAuthContext();
  const resolvedLocale = toLocale(locale);
  const [site, navPages] = await Promise.all([
    getPublicSiteSettings(),
    listPublishedNavPages(),
  ]);

  const brandName =
    resolvedLocale === 'ar'
      ? site.brandNameAr ?? 'رونق أوفيشال'
      : site.brandNameEn ?? 'Rawnak Official';

  return (
    <HeaderClient
      locale={resolvedLocale}
      role={context.role}
      isAuthenticated={Boolean(context.user)}
      brandName={brandName}
      logoPath={site.logoPath ?? '/brand/rawnak-logo.png'}
      navPages={navPages}
    />
  );
}
