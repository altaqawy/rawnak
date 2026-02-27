import { getTranslations } from 'next-intl/server';
import { saveOwnerSiteSettingsAction } from '@/app/[locale]/admin/settings/actions';
import { requireOwner } from '@/lib/auth/guards';
import { getOwnerSiteSettings } from '@/lib/builder/repository';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const ERROR_KEYS = new Set(['missing_fields', 'save_failed']);
const STATUS_KEYS = new Set(['saved']);

function pickParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export default async function OwnerSiteSettingsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  await requireOwner(locale);

  const t = await getTranslations('ownerBuilder');
  const settings = await getOwnerSiteSettings();
  const errorParam = pickParam(query.error);
  const statusParam = pickParam(query.status);
  const errorKey = errorParam && ERROR_KEYS.has(errorParam) ? errorParam : undefined;
  const statusKey = statusParam && STATUS_KEYS.has(statusParam) ? statusParam : undefined;

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('settings.title')}</h1>
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
        {!settings ? (
          <div className="rounded-xl border border-dashed border-border/70 p-6 text-start">
            <p className="text-sm text-muted-foreground">{t('empty.noItems')}</p>
          </div>
        ) : (
          <form action={saveOwnerSiteSettingsAction.bind(null, locale)} className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="brand_name_ar" className="block text-start text-xs text-muted-foreground">
                {t('fields.brandNameAr')}
              </label>
              <input
                id="brand_name_ar"
                name="brand_name_ar"
                defaultValue={settings.brand_name_ar ?? ''}
                className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="brand_name_en" className="block text-start text-xs text-muted-foreground">
                {t('fields.brandNameEn')}
              </label>
              <input
                id="brand_name_en"
                name="brand_name_en"
                defaultValue={settings.brand_name_en ?? ''}
                className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="tagline_ar" className="block text-start text-xs text-muted-foreground">
                {t('fields.taglineAr')}
              </label>
              <input
                id="tagline_ar"
                name="tagline_ar"
                defaultValue={settings.tagline_ar ?? ''}
                className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="tagline_en" className="block text-start text-xs text-muted-foreground">
                {t('fields.taglineEn')}
              </label>
              <input
                id="tagline_en"
                name="tagline_en"
                defaultValue={settings.tagline_en ?? ''}
                className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label htmlFor="logo_path" className="block text-start text-xs text-muted-foreground">
                {t('fields.logoPath')}
              </label>
              <input
                id="logo_path"
                name="logo_path"
                defaultValue={settings.logo_path ?? ''}
                className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
              />
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-muted-foreground md:col-span-2">
              <input
                type="checkbox"
                name="customers_signup_enabled"
                defaultChecked={settings.customers_signup_enabled ?? true}
              />
              <span>{t('fields.customersSignupEnabled')}</span>
            </label>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded-md border border-border/70 bg-card/70 px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {t('actions.save')}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
