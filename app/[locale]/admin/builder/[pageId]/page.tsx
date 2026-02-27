import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { OwnerPageEditor } from '@/components/builder/OwnerPageEditor';
import {
  restoreRevisionAction,
  saveBlockGroupTemplateAction,
  savePageAction,
  savePageTemplateAction,
} from '@/app/[locale]/admin/pages/actions';
import {
  createSignedMediaUrlMap,
  getOwnerPageById,
  listMediaItems,
  listOwnerPages,
  listOwnerTemplates,
  listPageRevisions,
} from '@/lib/builder/repository';
import { normalizeBlocks } from '@/lib/builder/normalize';
import { requireOwner } from '@/lib/auth/guards';

type PageProps = {
  params: Promise<{ locale: string; pageId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const ERROR_KEYS = new Set(['missing_fields', 'invalid_request', 'save_failed', 'delete_failed']);
const STATUS_KEYS = new Set(['saved', 'restored', 'template_saved']);

function pickParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export default async function OwnerVisualBuilderPage({ params, searchParams }: PageProps) {
  const { locale, pageId } = await params;
  const query = await searchParams;
  await requireOwner(locale);

  const page = await getOwnerPageById(pageId);
  if (!page) {
    notFound();
  }

  const [revisions, templates, mediaItems, allPages] = await Promise.all([
    listPageRevisions(pageId),
    listOwnerTemplates(),
    listMediaItems(),
    listOwnerPages(),
  ]);
  const mediaUrlMap = await createSignedMediaUrlMap(mediaItems.map((item) => item.storage_path));

  const t = await getTranslations('ownerBuilder');
  const errorParam = pickParam(query.error);
  const statusParam = pickParam(query.status);
  const errorKey = errorParam && ERROR_KEYS.has(errorParam) ? errorParam : undefined;
  const statusKey = statusParam && STATUS_KEYS.has(statusParam) ? statusParam : undefined;

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('editor.title')}</h1>
        <p className="mt-2 text-start text-sm text-muted-foreground">{page.slug}</p>
        {errorKey ? (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {t(`messages.${errorKey}`)}
          </p>
        ) : null}
        {statusKey ? (
          <p className="mt-4 rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-sm text-muted-foreground">
            {t(`messages.${statusKey}`)}
          </p>
        ) : null}
      </header>

      <OwnerPageEditor
        locale={locale}
        pageId={page.id}
        initialSlug={page.slug}
        initialTitleAr={page.title_ar ?? ''}
        initialTitleEn={page.title_en ?? ''}
        initialNavLabelAr={page.nav_label_ar ?? ''}
        initialNavLabelEn={page.nav_label_en ?? ''}
        initialShowInNav={page.show_in_nav}
        initialNavOrder={page.nav_order}
        initialStatus={page.status}
        initialBlocks={normalizeBlocks(page.blocks_json)}
        revisions={revisions}
        templates={templates}
        availablePages={allPages.map((item) => ({ id: item.id, slug: item.slug }))}
        mediaItems={mediaItems}
        mediaUrlMap={mediaUrlMap}
        saveAction={savePageAction.bind(null, locale)}
        restoreRevisionAction={restoreRevisionAction.bind(null, locale)}
        savePageTemplateAction={savePageTemplateAction.bind(null, locale)}
        saveBlockGroupTemplateAction={saveBlockGroupTemplateAction.bind(null, locale)}
      />
    </div>
  );
}
