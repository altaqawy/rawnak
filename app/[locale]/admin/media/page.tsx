import { getTranslations } from 'next-intl/server';
import { deleteMediaAction, uploadMediaAction } from '@/app/[locale]/admin/media/actions';
import { requireOwner } from '@/lib/auth/guards';
import { createSignedMediaUrlMap, listMediaItems } from '@/lib/builder/repository';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const ERROR_KEYS = new Set(['missing_fields', 'invalid_request', 'save_failed', 'delete_failed']);
const STATUS_KEYS = new Set(['saved', 'deleted']);

function pickParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export default async function OwnerMediaPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  await requireOwner(locale);

  const t = await getTranslations('ownerBuilder');
  const items = await listMediaItems();
  const signedUrlMap = await createSignedMediaUrlMap(items.map((item) => item.storage_path));
  const errorParam = pickParam(query.error);
  const statusParam = pickParam(query.status);
  const errorKey = errorParam && ERROR_KEYS.has(errorParam) ? errorParam : undefined;
  const statusKey = statusParam && STATUS_KEYS.has(statusParam) ? statusParam : undefined;

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('media.title')}</h1>
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
        <h2 className="text-start text-base font-medium text-foreground">{t('media.upload')}</h2>
        <form action={uploadMediaAction.bind(null, locale)} className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <label htmlFor="media-file" className="block text-start text-xs text-muted-foreground">
              {t('fields.file')}
            </label>
            <input
              id="media-file"
              name="file"
              type="file"
              accept="image/*,video/*,audio/*,.glb,.gltf,application/json,.json"
              required
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm file:mr-3 file:border-0 file:bg-transparent file:text-xs file:text-muted-foreground"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="media-alt-ar" className="block text-start text-xs text-muted-foreground">
              {t('fields.altAr')}
            </label>
            <input
              id="media-alt-ar"
              name="alt_ar"
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="media-alt-en" className="block text-start text-xs text-muted-foreground">
              {t('fields.altEn')}
            </label>
            <input
              id="media-alt-en"
              name="alt_en"
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-md border border-border/70 bg-card/70 px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('actions.upload')}
            </button>
          </div>
        </form>
      </section>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-start text-base font-medium text-foreground">{t('media.library')}</h2>
        {items.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border/70 p-6 text-start">
            <p className="text-sm text-muted-foreground">{t('empty.noItems')}</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const mediaUrl = signedUrlMap[item.storage_path] ?? '';
              const isImage = item.media_type === 'image';
              return (
                <article key={item.id} className="rounded-xl border border-border/70 bg-card/60 p-4">
                  {mediaUrl && isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaUrl}
                      alt={item.alt_en ?? item.alt_ar ?? ''}
                      className="h-40 w-full rounded-lg border border-border/70 object-cover"
                    />
                  ) : (
                    <div className="h-40 w-full rounded-lg border border-dashed border-border/70 bg-background/40" />
                  )}
                  <p className="mt-3 text-start text-xs text-muted-foreground">{item.media_type}</p>
                  <p className="mt-1 break-all text-start text-xs text-muted-foreground">{item.storage_path}</p>
                  {item.alt_ar ? <p className="mt-1 text-start text-xs text-muted-foreground">{item.alt_ar}</p> : null}
                  {item.alt_en ? <p className="mt-1 text-start text-xs text-muted-foreground">{item.alt_en}</p> : null}

                  <form action={deleteMediaAction.bind(null, locale)} className="mt-3">
                    <input type="hidden" name="media_id" value={item.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {t('actions.delete')}
                    </button>
                  </form>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
