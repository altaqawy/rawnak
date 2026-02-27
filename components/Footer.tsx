import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { SiteLogo } from '@/components/SiteLogo';
import { getPublicSiteSettings } from '@/lib/builder/repository';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';

type FooterProps = {
  locale?: string;
};

function toLocale(value: string | undefined): Locale {
  if (!value) return defaultLocale;
  return isLocale(value) ? value : defaultLocale;
}

export default async function Footer({ locale }: FooterProps) {
  const currentLocale = toLocale(locale);
  const t = await getTranslations('footer');
  const settings = await getPublicSiteSettings();
  const brandName =
    currentLocale === 'ar'
      ? settings.brandNameAr ?? t('brand')
      : settings.brandNameEn ?? t('brand');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-background/70 py-10 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 text-center md:px-6">
        <Link href={`/${currentLocale}`} aria-label={brandName}>
          <SiteLogo
            alt={brandName}
            src={settings.logoPath}
            className="size-14 border border-border/70 bg-background/80 shadow-[var(--shadow-soft)]"
          />
        </Link>
        <p className="text-sm font-medium text-foreground">{brandName}</p>
        <p className="max-w-xl text-sm text-muted-foreground">{t('note')}</p>
        <p className="text-xs text-muted-foreground">
          &copy; {year} {brandName}
        </p>
      </div>
    </footer>
  );
}
