import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createPageAction, deletePageAction } from '@/app/[locale]/admin/pages/actions';
import { requireOwner } from '@/lib/auth/guards';
import { listOwnerPages } from '@/lib/builder/repository';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const ERROR_KEYS = new Set(['missing_fields', 'invalid_request', 'save_failed', 'delete_failed']);
const STATUS_KEYS = new Set(['saved', 'deleted']);

function pickParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export default async function OwnerPagesPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  await requireOwner(locale);
  const t = await getTranslations('ownerBuilder');
  const pages = await listOwnerPages();

  const errorParam = pickParam(query.error);
  const statusParam = pickParam(query.status);
  const errorKey = errorParam && ERROR_KEYS.has(errorParam) ? errorParam : undefined;
  const statusKey = statusParam && STATUS_KEYS.has(statusParam) ? statusParam : undefined;

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('pages.title')}</h1>
        <p className="mt-2 text-start text-sm text-muted-foreground">{t('empty.authorizedOnly')}</p>

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

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-start text-base font-medium text-foreground">{t('pages.create')}</h2>
        <form action={createPageAction.bind(null, locale)} className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="create-page-slug" className="block text-start text-xs text-muted-foreground">
              {t('fields.slug')}
            </label>
            <input
              id="create-page-slug"
              name="slug"
              required
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="create-page-title-ar" className="block text-start text-xs text-muted-foreground">
              {t('fields.titleAr')}
            </label>
            <input
              id="create-page-title-ar"
              name="title_ar"
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="create-page-title-en" className="block text-start text-xs text-muted-foreground">
              {t('fields.titleEn')}
            </label>
            <input
              id="create-page-title-en"
              name="title_en"
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="create-page-nav-label-ar" className="block text-start text-xs text-muted-foreground">
              {t('fields.navLabelAr')}
            </label>
            <input
              id="create-page-nav-label-ar"
              name="nav_label_ar"
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="create-page-nav-label-en" className="block text-start text-xs text-muted-foreground">
              {t('fields.navLabelEn')}
            </label>
            <input
              id="create-page-nav-label-en"
              name="nav_label_en"
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="create-page-nav-order" className="block text-start text-xs text-muted-foreground">
              {t('fields.navOrder')}
            </label>
            <input
              id="create-page-nav-order"
              name="nav_order"
              type="number"
              defaultValue={100}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground md:col-span-3">
            <input type="checkbox" name="show_in_nav" />
            <span>{t('fields.showInNav')}</span>
          </label>
          <div className="md:col-span-3">
            <button
              type="submit"
              className="rounded-md border border-border/70 bg-card/70 px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('actions.createPage')}
            </button>
          </div>
        </form>
      </section>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-start text-base font-medium text-foreground">{t('pages.list')}</h2>
        {pages.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border/70 p-6 text-start">
            <p className="text-sm text-muted-foreground">{t('empty.noItems')}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {pages.map((page) => (
              <article key={page.id} className="rounded-xl border border-border/70 bg-card/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-start text-sm font-medium text-foreground">{page.slug}</p>
                    <p className="mt-1 text-start text-xs text-muted-foreground">
                      {t(`status.${page.status}`)} | {new Date(page.updated_at).toLocaleString()}
                    </p>
                    <p className="mt-1 text-start text-xs text-muted-foreground">
                      {t('fields.showInNav')}: {page.show_in_nav ? t('labels.yes') : t('labels.no')} | {t('fields.navOrder')}: {page.nav_order}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/${locale}/admin/builder/${page.id}`}
                      className="rounded-md border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {t('actions.edit')}
                    </Link>
                    <Link
                      href={`/${locale}/preview/${page.slug}`}
                      className="rounded-md border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {t('actions.preview')}
                    </Link>
                    <form action={deletePageAction.bind(null, locale)}>
                      <input type="hidden" name="page_id" value={page.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {t('actions.delete')}
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

