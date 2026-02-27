import { getTranslations } from 'next-intl/server';
import {
  applyThemePresetAction,
  restoreThemeRevisionAction,
  saveThemePresetAction,
  saveThemeSettingsAction,
} from '@/app/[locale]/admin/theme/actions';
import { requireOwner } from '@/lib/auth/guards';
import { normalizeThemeTokens } from '@/lib/builder/normalize';
import {
  getOwnerSiteSettings,
  listThemePresets,
  listThemeRevisions,
} from '@/lib/builder/repository';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const ERROR_KEYS = new Set(['missing_fields', 'invalid_request', 'save_failed']);
const STATUS_KEYS = new Set(['saved', 'applied', 'preset_saved', 'restored']);

function pickParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export default async function OwnerThemePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  await requireOwner(locale);

  const [settings, presets, revisions] = await Promise.all([
    getOwnerSiteSettings(),
    listThemePresets(),
    listThemeRevisions(),
  ]);
  const t = await getTranslations('ownerBuilder');

  const errorParam = pickParam(query.error);
  const statusParam = pickParam(query.status);
  const errorKey = errorParam && ERROR_KEYS.has(errorParam) ? errorParam : undefined;
  const statusKey = statusParam && STATUS_KEYS.has(statusParam) ? statusParam : undefined;
  const tokens = normalizeThemeTokens(settings?.active_theme_tokens_json ?? {});

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('theme.title')}</h1>
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
        <h2 className="text-start text-base font-medium text-foreground">{t('theme.current')}</h2>
        <form action={saveThemeSettingsAction.bind(null, locale)} className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="bg_intensity_light" className="block text-start text-xs text-muted-foreground">
              {t('fields.bgIntensityLight')}
            </label>
            <input
              id="bg_intensity_light"
              name="bg_intensity_light"
              type="number"
              step="0.05"
              min="0"
              max="2"
              defaultValue={settings?.bg_intensity_light ?? 1}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="bg_intensity_dark" className="block text-start text-xs text-muted-foreground">
              {t('fields.bgIntensityDark')}
            </label>
            <input
              id="bg_intensity_dark"
              name="bg_intensity_dark"
              type="number"
              step="0.05"
              min="0"
              max="2"
              defaultValue={settings?.bg_intensity_dark ?? 1}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground md:col-span-2">
            <input
              type="checkbox"
              name="bg_motion_enabled"
              defaultChecked={settings?.bg_motion_enabled ?? true}
            />
            <span>{t('fields.bgMotionEnabled')}</span>
          </label>

          <div className="space-y-1">
            <label htmlFor="light_base" className="block text-start text-xs text-muted-foreground">
              {t('fields.lightBase')}
            </label>
            <input
              id="light_base"
              name="light_base"
              defaultValue={tokens.light.base}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="light_secondary" className="block text-start text-xs text-muted-foreground">
              {t('fields.lightSecondary')}
            </label>
            <input
              id="light_secondary"
              name="light_secondary"
              defaultValue={tokens.light.secondary}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="light_primary" className="block text-start text-xs text-muted-foreground">
              {t('fields.lightPrimary')}
            </label>
            <input
              id="light_primary"
              name="light_primary"
              defaultValue={tokens.light.primary}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="light_text" className="block text-start text-xs text-muted-foreground">
              {t('fields.lightText')}
            </label>
            <input
              id="light_text"
              name="light_text"
              defaultValue={tokens.light.text}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="dark_base" className="block text-start text-xs text-muted-foreground">
              {t('fields.darkBase')}
            </label>
            <input
              id="dark_base"
              name="dark_base"
              defaultValue={tokens.dark.base}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="dark_secondary" className="block text-start text-xs text-muted-foreground">
              {t('fields.darkSecondary')}
            </label>
            <input
              id="dark_secondary"
              name="dark_secondary"
              defaultValue={tokens.dark.secondary}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="dark_accent" className="block text-start text-xs text-muted-foreground">
              {t('fields.darkAccent')}
            </label>
            <input
              id="dark_accent"
              name="dark_accent"
              defaultValue={tokens.dark.accent}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="dark_text" className="block text-start text-xs text-muted-foreground">
              {t('fields.darkText')}
            </label>
            <input
              id="dark_text"
              name="dark_text"
              defaultValue={tokens.dark.text}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="radius" className="block text-start text-xs text-muted-foreground">
              {t('fields.radius')}
            </label>
            <input
              id="radius"
              name="radius"
              defaultValue={tokens.radius}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="shadow_soft" className="block text-start text-xs text-muted-foreground">
              {t('fields.shadowSoft')}
            </label>
            <input
              id="shadow_soft"
              name="shadow_soft"
              defaultValue={tokens.shadowSoft}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label htmlFor="typography_scale" className="block text-start text-xs text-muted-foreground">
              {t('fields.typographyScale')}
            </label>
            <input
              id="typography_scale"
              name="typography_scale"
              defaultValue={tokens.typographyScale}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-md border border-border/70 bg-card/70 px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('actions.save')}
            </button>
          </div>
        </form>
      </section>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-start text-base font-medium text-foreground">{t('theme.presets')}</h2>
        <form action={saveThemePresetAction.bind(null, locale)} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            name="preset_name"
            placeholder={t('labels.presetName')}
            className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
          />

          <input type="hidden" name="light_base" value={tokens.light.base} />
          <input type="hidden" name="light_secondary" value={tokens.light.secondary} />
          <input type="hidden" name="light_primary" value={tokens.light.primary} />
          <input type="hidden" name="light_text" value={tokens.light.text} />
          <input type="hidden" name="dark_base" value={tokens.dark.base} />
          <input type="hidden" name="dark_secondary" value={tokens.dark.secondary} />
          <input type="hidden" name="dark_accent" value={tokens.dark.accent} />
          <input type="hidden" name="dark_text" value={tokens.dark.text} />
          <input type="hidden" name="radius" value={tokens.radius} />
          <input type="hidden" name="shadow_soft" value={tokens.shadowSoft} />
          <input type="hidden" name="typography_scale" value={tokens.typographyScale} />

          <button
            type="submit"
            className="rounded-md border border-border/70 bg-card/70 px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('actions.savePreset')}
          </button>
        </form>

        {presets.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border/70 p-6 text-start">
            <p className="text-sm text-muted-foreground">{t('empty.noItems')}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {presets.map((preset) => (
              <article key={preset.id} className="rounded-xl border border-border/70 bg-card/60 p-4">
                <p className="text-start text-sm font-medium text-foreground">
                  {preset.name || t('labels.untitledPreset')}
                </p>
                <p className="mt-1 text-start text-xs text-muted-foreground">
                  {new Date(preset.created_at).toLocaleString()}
                </p>
                <form action={applyThemePresetAction.bind(null, locale)} className="mt-3">
                  <input type="hidden" name="preset_id" value={preset.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t('actions.applyPreset')}
                  </button>
                </form>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-start text-base font-medium text-foreground">{t('theme.revisions')}</h2>
        {revisions.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border/70 p-6 text-start">
            <p className="text-sm text-muted-foreground">{t('empty.noItems')}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {revisions.map((revision) => (
              <article key={revision.id} className="rounded-xl border border-border/70 bg-card/60 p-4">
                <p className="text-start text-xs text-muted-foreground">
                  {new Date(revision.created_at).toLocaleString()}
                </p>
                <form action={restoreThemeRevisionAction.bind(null, locale)} className="mt-3">
                  <input type="hidden" name="revision_id" value={revision.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t('actions.restore')}
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
