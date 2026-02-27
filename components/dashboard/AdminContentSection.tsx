import { getTranslations } from 'next-intl/server';
import {
  createContentAction,
  deleteContentAction,
  recordContentCompletionAction,
  updateContentAction,
} from '@/app/[locale]/admin/actions/content';
import {
  listManageableContent,
  type ContentCollection,
  type ContentItem,
} from '@/lib/content/repository';
import { Button } from '@/components/ui/button';

type Props = {
  locale: string;
  collection: ContentCollection;
  title: string;
  searchParams?: Record<string, string | string[] | undefined>;
};

const ERROR_KEYS = new Set(['missing_fields', 'invalid_request', 'save_failed', 'delete_failed']);
const STATUS_KEYS = new Set(['saved', 'deleted']);

function pickParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function statusClassName(kind: 'error' | 'status') {
  if (kind === 'error') {
    return 'border-destructive/30 bg-destructive/10 text-destructive';
  }
  return 'border-border/70 bg-card/70 text-muted-foreground';
}

function defaultContent(item: ContentItem, locale: string) {
  return {
    title: locale === 'ar' ? item.title_ar : item.title_en,
    description: locale === 'ar' ? item.description_ar : item.description_en,
  };
}

export async function AdminContentSection({ locale, collection, title, searchParams }: Props) {
  const t = await getTranslations('admin');
  const items = await listManageableContent(collection);
  const errorParam = pickParam(searchParams?.error);
  const statusParam = pickParam(searchParams?.status);
  const errorKey = errorParam && ERROR_KEYS.has(errorParam) ? errorParam : undefined;
  const statusKey = statusParam && STATUS_KEYS.has(statusParam) ? statusParam : undefined;

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-2 text-start text-sm text-muted-foreground">{t('content.hint')}</p>

        {errorKey && (
          <p className={`mt-4 rounded-lg border px-3 py-2 text-sm ${statusClassName('error')}`}>
            {t(`messages.${errorKey}`)}
          </p>
        )}

        {statusKey && (
          <p className={`mt-4 rounded-lg border px-3 py-2 text-sm ${statusClassName('status')}`}>
            {t(`messages.${statusKey}`)}
          </p>
        )}
      </header>

      <article className="glass-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-start text-lg font-medium text-foreground">{t('content.createTitle')}</h2>
        <p className="mt-1 text-start text-sm text-muted-foreground">{t('content.createHint')}</p>

        <form action={createContentAction.bind(null, locale)} className="mt-4 grid gap-3 md:grid-cols-2">
          <input type="hidden" name="collection" value={collection} />

          <div className="space-y-1">
            <label htmlFor={`${collection}-create-title-ar`} className="block text-start text-xs text-muted-foreground">
              {t('fields.titleAr')}
            </label>
            <input
              id={`${collection}-create-title-ar`}
              name="title_ar"
              required
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor={`${collection}-create-title-en`} className="block text-start text-xs text-muted-foreground">
              {t('fields.titleEn')}
            </label>
            <input
              id={`${collection}-create-title-en`}
              name="title_en"
              required
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor={`${collection}-create-slug`} className="block text-start text-xs text-muted-foreground">
              {t('fields.slug')}
            </label>
            <input
              id={`${collection}-create-slug`}
              name="slug"
              required
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor={`${collection}-create-status`} className="block text-start text-xs text-muted-foreground">
              {t('fields.status')}
            </label>
            <select
              id={`${collection}-create-status`}
              name="status"
              defaultValue="draft"
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            >
              <option value="draft">{t('status.draft')}</option>
              <option value="published">{t('status.published')}</option>
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label htmlFor={`${collection}-create-description-ar`} className="block text-start text-xs text-muted-foreground">
              {t('fields.descriptionAr')}
            </label>
            <textarea
              id={`${collection}-create-description-ar`}
              name="description_ar"
              rows={3}
              className="w-full rounded-md border border-border/70 bg-background/70 px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label htmlFor={`${collection}-create-description-en`} className="block text-start text-xs text-muted-foreground">
              {t('fields.descriptionEn')}
            </label>
            <textarea
              id={`${collection}-create-description-en`}
              name="description_en"
              rows={3}
              className="w-full rounded-md border border-border/70 bg-background/70 px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label htmlFor={`${collection}-create-assigned-to`} className="block text-start text-xs text-muted-foreground">
              {t('fields.assignedTo')}
            </label>
            <input
              id={`${collection}-create-assigned-to`}
              name="assigned_to"
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit">{t('actions.create')}</Button>
          </div>
        </form>
      </article>

      <article className="glass-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-start text-lg font-medium text-foreground">{t('content.itemsTitle')}</h2>
        <p className="mt-1 text-start text-sm text-muted-foreground">{t('content.itemsHint')}</p>

        {items.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border/70 p-6 text-start">
            <p className="text-sm text-muted-foreground">{t('empty.noItems')}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t('empty.authorizedOnly')}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {items.map((item) => {
              const localized = defaultContent(item, locale);

              return (
                <div key={item.id} className="rounded-xl border border-border/70 bg-card/60 p-4">
                  <p className="text-start text-sm font-medium text-foreground">
                    {localized.title}
                  </p>
                  <p className="mt-1 text-start text-xs text-muted-foreground">
                    {item.slug}
                  </p>
                  {localized.description ? (
                    <p className="mt-2 text-start text-xs text-muted-foreground">{localized.description}</p>
                  ) : null}

                  <form action={updateContentAction.bind(null, locale)} className="mt-4 grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="collection" value={collection} />
                    <input type="hidden" name="id" value={item.id} />

                    <div className="space-y-1">
                      <label htmlFor={`${collection}-${item.id}-title-ar`} className="block text-start text-xs text-muted-foreground">
                        {t('fields.titleAr')}
                      </label>
                      <input
                        id={`${collection}-${item.id}-title-ar`}
                        name="title_ar"
                        defaultValue={item.title_ar}
                        required
                        className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor={`${collection}-${item.id}-title-en`} className="block text-start text-xs text-muted-foreground">
                        {t('fields.titleEn')}
                      </label>
                      <input
                        id={`${collection}-${item.id}-title-en`}
                        name="title_en"
                        defaultValue={item.title_en}
                        required
                        className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor={`${collection}-${item.id}-slug`} className="block text-start text-xs text-muted-foreground">
                        {t('fields.slug')}
                      </label>
                      <input
                        id={`${collection}-${item.id}-slug`}
                        name="slug"
                        defaultValue={item.slug}
                        required
                        className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor={`${collection}-${item.id}-status`} className="block text-start text-xs text-muted-foreground">
                        {t('fields.status')}
                      </label>
                      <select
                        id={`${collection}-${item.id}-status`}
                        name="status"
                        defaultValue={item.status}
                        className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
                      >
                        <option value="draft">{t('status.draft')}</option>
                        <option value="published">{t('status.published')}</option>
                      </select>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label htmlFor={`${collection}-${item.id}-description-ar`} className="block text-start text-xs text-muted-foreground">
                        {t('fields.descriptionAr')}
                      </label>
                      <textarea
                        id={`${collection}-${item.id}-description-ar`}
                        name="description_ar"
                        defaultValue={item.description_ar ?? ''}
                        rows={2}
                        className="w-full rounded-md border border-border/70 bg-background/70 px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label htmlFor={`${collection}-${item.id}-description-en`} className="block text-start text-xs text-muted-foreground">
                        {t('fields.descriptionEn')}
                      </label>
                      <textarea
                        id={`${collection}-${item.id}-description-en`}
                        name="description_en"
                        defaultValue={item.description_en ?? ''}
                        rows={2}
                        className="w-full rounded-md border border-border/70 bg-background/70 px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label htmlFor={`${collection}-${item.id}-assigned-to`} className="block text-start text-xs text-muted-foreground">
                        {t('fields.assignedTo')}
                      </label>
                      <input
                        id={`${collection}-${item.id}-assigned-to`}
                        name="assigned_to"
                        defaultValue={item.assigned_to ?? ''}
                        className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
                      />
                    </div>

                    <div className="md:col-span-2 flex flex-wrap gap-2">
                      <Button type="submit">{t('actions.save')}</Button>
                    </div>
                  </form>

                  <form action={deleteContentAction.bind(null, locale)} className="mt-2">
                    <input type="hidden" name="collection" value={collection} />
                    <input type="hidden" name="id" value={item.id} />
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" variant="outline">
                        {t('actions.delete')}
                      </Button>
                    </div>
                  </form>
                  <form action={recordContentCompletionAction.bind(null, locale)} className="mt-2">
                    <input type="hidden" name="collection" value={collection} />
                    <input type="hidden" name="id" value={item.id} />
                    <Button type="submit" variant="outline">
                      {t('actions.markCompleted')}
                    </Button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </article>
    </div>
  );
}
