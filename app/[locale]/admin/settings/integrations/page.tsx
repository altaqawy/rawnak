import { getTranslations } from 'next-intl/server';
import { importDataFileAction } from '@/app/[locale]/admin/settings/integrations/actions';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

const ERROR_KEYS = new Set(['invalid_target', 'file_required', 'import_failed']);
const STATUS_KEYS = new Set(['import_done', 'dry_run_done']);

export default async function IntegrationsSettingsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const t = await getTranslations('adminImport');

  const statusParam = pickParam(query.status);
  const errorParam = pickParam(query.error);
  const statusKey = statusParam && STATUS_KEYS.has(statusParam) ? statusParam : undefined;
  const errorKey = errorParam && ERROR_KEYS.has(errorParam) ? errorParam : undefined;

  const summary = {
    target: pickParam(query.target) ?? '-',
    parsed: pickParam(query.parsed) ?? '0',
    valid: pickParam(query.valid) ?? '0',
    written: pickParam(query.written) ?? '0',
    skipped: pickParam(query.skipped) ?? '0',
    errors: pickParam(query.errors) ?? '0',
  };

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-start text-base font-medium text-foreground">{t('title')}</h2>
        <p className="mt-2 text-start text-sm text-muted-foreground">{t('subtitle')}</p>

        {statusKey ? (
          <p className="mt-4 rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-sm text-muted-foreground">
            {t(`status.${statusKey}`)}
          </p>
        ) : null}
        {errorKey ? (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {t(`errors.${errorKey}`)}
          </p>
        ) : null}
      </section>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <form action={importDataFileAction.bind(null, locale)} className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="target" className="block text-start text-xs text-muted-foreground">
              {t('fields.target')}
            </label>
            <select id="target" name="target" defaultValue="" className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm" required>
              <option value="" disabled>
                {t('fields.selectTarget')}
              </option>
              <option value="services">{t('targets.services')}</option>
              <option value="products">{t('targets.products')}</option>
              <option value="kits">{t('targets.kits')}</option>
              <option value="portfolio_items">{t('targets.portfolio')}</option>
              <option value="inventory_items">{t('targets.inventoryItems')}</option>
              <option value="customers">{t('targets.customers')}</option>
              <option value="leads_requests">{t('targets.leads')}</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="mode" className="block text-start text-xs text-muted-foreground">
              {t('fields.mode')}
            </label>
            <select id="mode" name="mode" defaultValue="insert" className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm">
              <option value="insert">{t('modes.insert')}</option>
              <option value="upsert">{t('modes.upsert')}</option>
            </select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <label htmlFor="file" className="block text-start text-xs text-muted-foreground">
              {t('fields.file')}
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm file:mr-3 file:border-0 file:bg-transparent"
              required
            />
          </div>
          <label className="md:col-span-2 inline-flex items-center gap-2 text-start text-xs text-muted-foreground">
            <input type="checkbox" name="dry_run" className="h-4 w-4 rounded border-border/70" />
            <span>{t('fields.dryRun')}</span>
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="rounded-md border border-border/70 bg-card/70 px-4 py-2 text-xs">
              {t('actions.import')}
            </button>
          </div>
        </form>
      </section>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <h3 className="text-start text-sm font-medium text-foreground">{t('summary.title')}</h3>
        <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
          <p>{t('summary.target')}: {summary.target}</p>
          <p>{t('summary.parsed')}: {summary.parsed}</p>
          <p>{t('summary.valid')}: {summary.valid}</p>
          <p>{t('summary.written')}: {summary.written}</p>
          <p>{t('summary.skipped')}: {summary.skipped}</p>
          <p>{t('summary.errors')}: {summary.errors}</p>
        </div>
      </section>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <h3 className="text-start text-sm font-medium text-foreground">{t('columns.title')}</h3>
        <ul className="mt-3 grid gap-1 text-start text-xs text-muted-foreground">
          <li>{t('columns.content')}</li>
          <li>{t('columns.inventory')}</li>
          <li>{t('columns.customers')}</li>
          <li>{t('columns.leads')}</li>
        </ul>
      </section>
    </div>
  );
}

