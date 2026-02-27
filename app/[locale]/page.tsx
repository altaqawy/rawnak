import { getLocale, getTranslations } from 'next-intl/server';
import { BlockRenderer } from '@/components/builder/BlockRenderer';
import { SiteLogo } from '@/components/SiteLogo';
import {
  collectMediaPathsFromBlocks,
  createSignedMediaUrlMap,
  getPublicSiteSettings,
  getPublishedPageBySlug,
} from '@/lib/builder/repository';
import { normalizeBlocks } from '@/lib/builder/normalize';
import { defaultLocale, isLocale } from '@/i18n/config';

export default async function HomePage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const [settings, page] = await Promise.all([
    getPublicSiteSettings(),
    getPublishedPageBySlug('home'),
  ]);

  const brandName =
    locale === 'ar'
      ? settings.brandNameAr || settings.brandNameEn || t('brand.name')
      : settings.brandNameEn || settings.brandNameAr || t('brand.name');
  const tagline =
    locale === 'ar'
      ? settings.taglineAr || settings.taglineEn || t('brand.tagline')
      : settings.taglineEn || settings.taglineAr || t('brand.tagline');
  const safeLocale = isLocale(locale) ? locale : defaultLocale;

  if (page) {
    const mediaUrlMap = await createSignedMediaUrlMap(collectMediaPathsFromBlocks(page.blocks_json));
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <BlockRenderer
          blocks={normalizeBlocks(page.blocks_json)}
          locale={safeLocale}
          emptyText={t('system.noItems')}
          mediaUrlMap={mediaUrlMap}
        />
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-4 py-24 text-center md:px-6 md:py-32">
      <SiteLogo
        alt={brandName}
        src={settings.logoPath}
        priority
        className="mb-8 size-28 border border-border/80 bg-background/80 shadow-[var(--shadow-soft)] md:size-36"
      />
      <h1 className="text-4xl font-semibold tracking-[0.08em] text-foreground md:text-6xl">
        {brandName}
      </h1>
      <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-xl">
        {tagline}
      </p>
    </section>
  );
}
