import { getTranslations } from 'next-intl/server';
import { applyTemplateToNewPageAction, deleteTemplateAction } from '@/app/[locale]/admin/templates/actions';
import { requireOwner } from '@/lib/auth/guards';
import { listOwnerTemplates } from '@/lib/builder/repository';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const ERROR_KEYS = new Set(['missing_fields', 'invalid_request', 'save_failed', 'delete_failed']);
const STATUS_KEYS = new Set(['saved', 'deleted']);

function pickParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function templateKind(snapshotJson: unknown): 'page' | 'block_group' {
  if (!snapshotJson || typeof snapshotJson !== 'object') return 'page';
  const value = (snapshotJson as Record<string, unknown>).kind;
  return value === 'block_group' ? 'block_group' : 'page';
}

export default async function OwnerTemplatesPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  await requireOwner(locale);

  const t = await getTranslations('ownerBuilder');
  const templates = await listOwnerTemplates();
  const errorParam = pickParam(query.error);
  const statusParam = pickParam(query.status);
  const errorKey = errorParam && ERROR_KEYS.has(errorParam) ? errorParam : undefined;
  const statusKey = statusParam && STATUS_KEYS.has(statusParam) ? statusParam : undefined;

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('templates.title')}</h1>
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
        <h2 className="text-start text-base font-medium text-foreground">{t('templates.apply')}</h2>
        <form action={applyTemplateToNewPageAction.bind(null, locale)} className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <label htmlFor="template-id" className="block text-start text-xs text-muted-foreground">
              {t('fields.template')}
            </label>
            <select
              id="template-id"
              name="template_id"
              required
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            >
              <option value="">{t('labels.selectTemplate')}</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name || t('labels.untitledTemplate')}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="apply-template-slug" className="block text-start text-xs text-muted-foreground">
              {t('fields.slug')}
            </label>
            <input
              id="apply-template-slug"
              name="slug"
              required
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="apply-template-title-ar" className="block text-start text-xs text-muted-foreground">
              {t('fields.titleAr')}
            </label>
            <input
              id="apply-template-title-ar"
              name="title_ar"
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="apply-template-title-en" className="block text-start text-xs text-muted-foreground">
              {t('fields.titleEn')}
            </label>
            <input
              id="apply-template-title-en"
              name="title_en"
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-md border border-border/70 bg-card/70 px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('actions.applyTemplate')}
            </button>
          </div>
        </form>
      </section>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-start text-base font-medium text-foreground">{t('templates.list')}</h2>
        {templates.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border/70 p-6 text-start">
            <p className="text-sm text-muted-foreground">{t('empty.noItems')}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {templates.map((template) => (
              <article key={template.id} className="rounded-xl border border-border/70 bg-card/60 p-4">
                <p className="text-start text-sm font-medium text-foreground">
                  {template.name || t('labels.untitledTemplate')}
                </p>
                <p className="mt-1 text-start text-xs text-muted-foreground">
                  {t(`labels.${templateKind(template.snapshot_json)}`)} - {new Date(template.created_at).toLocaleString()}
                </p>
                <form action={deleteTemplateAction.bind(null, locale)} className="mt-3">
                  <input type="hidden" name="template_id" value={template.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t('actions.delete')}
                  </button>
                </form>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
