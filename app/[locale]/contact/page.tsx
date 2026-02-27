import { getLocale, getTranslations } from 'next-intl/server';
import { BlockRenderer } from '@/components/builder/BlockRenderer';
import {
  collectMediaPathsFromBlocks,
  createSignedMediaUrlMap,
  getPublishedPageBySlug,
} from '@/lib/builder/repository';
import { normalizeBlocks } from '@/lib/builder/normalize';
import { defaultLocale, isLocale } from '@/i18n/config';

export default async function ContactPage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const safeLocale = isLocale(locale) ? locale : defaultLocale;
  const page = await getPublishedPageBySlug('contact');

  if (page) {
    const mediaUrlMap = await createSignedMediaUrlMap(collectMediaPathsFromBlocks(page.blocks_json));
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6 md:py-24">
        <h1 className="text-start text-3xl font-semibold tracking-wide text-foreground md:text-5xl">
          {safeLocale === 'ar' ? page.title_ar || t('pages.contact.title') : page.title_en || t('pages.contact.title')}
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

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6 md:py-24">
      <h1 className="text-start text-3xl font-semibold tracking-wide text-foreground md:text-5xl">
        {t('pages.contact.title')}
      </h1>
      <p className="mt-4 text-start text-sm text-muted-foreground md:text-base">
        {t('system.sectionPending')}
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <article className="glass-card rounded-2xl border border-border/70 p-6">
          <h2 className="text-start text-lg font-medium text-foreground">{t('system.detailsArea')}</h2>
          <p className="mt-3 text-start text-sm text-muted-foreground">{t('system.noItems')}</p>
        </article>

        <article className="glass-card rounded-2xl border border-border/70 p-6">
          <h2 className="text-start text-lg font-medium text-foreground">{t('system.formArea')}</h2>
          <p className="mt-3 text-start text-sm text-muted-foreground">{t('system.noItems')}</p>
        </article>
      </div>
    </section>
  );
}
