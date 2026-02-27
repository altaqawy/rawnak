import { getLocale, getTranslations } from 'next-intl/server';
import { EmptyStateGrid } from '@/components/EmptyStateGrid';
import { PublishedContentGrid } from '@/components/PublishedContentGrid';
import { BlockRenderer } from '@/components/builder/BlockRenderer';
import {
  collectMediaPathsFromBlocks,
  createSignedMediaUrlMap,
  getPublishedPageBySlug,
} from '@/lib/builder/repository';
import { normalizeBlocks } from '@/lib/builder/normalize';
import { listPublishedContent } from '@/lib/content/repository';
import { defaultLocale, isLocale } from '@/i18n/config';

export default async function ProductsPage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const safeLocale = isLocale(locale) ? locale : defaultLocale;
  const page = await getPublishedPageBySlug('products');

  if (page) {
    const mediaUrlMap = await createSignedMediaUrlMap(collectMediaPathsFromBlocks(page.blocks_json));
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6 md:py-24">
        <h1 className="text-start text-3xl font-semibold tracking-wide text-foreground md:text-5xl">
          {safeLocale === 'ar' ? page.title_ar || t('pages.products.title') : page.title_en || t('pages.products.title')}
        </h1>
        <div className="mt-10">
          <BlockRenderer
            blocks={normalizeBlocks(page.blocks_json)}
            locale={safeLocale}
            emptyText={t('system.noItems')}
            mediaUrlMap={mediaUrlMap}
          />
        </div>
      </section>
    );
  }

  const items = await listPublishedContent('products');

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6 md:py-24">
      <h1 className="text-start text-3xl font-semibold tracking-wide text-foreground md:text-5xl">
        {t('pages.products.title')}
      </h1>
      <p className="mt-4 text-start text-sm text-muted-foreground md:text-base">
        {t('system.sectionPending')}
      </p>

      <div className="mt-10">
        {items.length === 0 ? (
          <EmptyStateGrid message={t('system.noItems')} items={6} columns={3} />
        ) : (
          <PublishedContentGrid locale={locale} collection="products" items={items} />
        )}
      </div>
    </section>
  );
}
