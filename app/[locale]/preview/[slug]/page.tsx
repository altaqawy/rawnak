import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { BlockRenderer } from '@/components/builder/BlockRenderer';
import { requireOwner } from '@/lib/auth/guards';
import {
  collectMediaPathsFromBlocks,
  createSignedMediaUrlMap,
  getOwnerPageBySlug,
} from '@/lib/builder/repository';
import { normalizeBlocks } from '@/lib/builder/normalize';
import { defaultLocale, isLocale } from '@/i18n/config';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function OwnerPreviewBySlugPage({ params }: PageProps) {
  const { locale, slug } = await params;
  await requireOwner(locale);

  const page = await getOwnerPageBySlug(slug);
  if (!page) {
    notFound();
  }

  const t = await getTranslations('system');
  const safeLocale = isLocale(locale) ? locale : defaultLocale;
  const mediaUrlMap = await createSignedMediaUrlMap(collectMediaPathsFromBlocks(page.blocks_json));

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 md:px-6 md:py-14">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">
          {safeLocale === 'ar' ? page.title_ar || page.slug : page.title_en || page.slug}
        </h1>
        <p className="mt-2 text-start text-sm text-muted-foreground">{page.status}</p>
      </header>
      <BlockRenderer
        blocks={normalizeBlocks(page.blocks_json)}
        locale={safeLocale}
        emptyText={t('noItems')}
        mediaUrlMap={mediaUrlMap}
      />
    </section>
  );
}
