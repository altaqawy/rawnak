import { getTranslations } from 'next-intl/server';
import { createInventoryItemAction } from '@/app/[locale]/admin/actions/console';
import { requireOwner } from '@/lib/auth/guards';
import { listInventoryItems } from '@/lib/admin-console/repository';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export default async function AdminInventoryItemsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  await requireOwner(locale);
  const t = await getTranslations('adminModules');
  const q = pickParam(query.q)?.trim().toLowerCase();
  const items = (await listInventoryItems()).filter((item: any) => {
    if (!q) return true;
    return (item.sku || '').toLowerCase().includes(q) || (item.name_ar || '').toLowerCase().includes(q) || (item.name_en || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('inventory.items')}</h1>
      </header>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <form action={createInventoryItemAction.bind(null, locale)} className="grid gap-3 md:grid-cols-3">
          <input name="sku" placeholder={t('fields.sku')} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <input name="name_ar" placeholder={t('fields.nameAr')} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <input name="name_en" placeholder={t('fields.nameEn')} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <div className="md:col-span-3">
            <button type="submit" className="rounded-md border border-border/70 bg-card/70 px-4 py-2 text-xs">{t('actions.create')}</button>
          </div>
        </form>
      </section>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <form className="flex items-center gap-2">
            <input
              name="q"
              defaultValue={pickParam(query.q) ?? ''}
              placeholder={t('fields.search')}
              className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
            <button type="submit" className="rounded-md border border-border/70 bg-card/70 px-4 py-2 text-xs">
              {t('actions.filter')}
            </button>
          </form>
          <a href={`/api/admin/export?dataset=inventory`} className="rounded-md border border-border/70 bg-card/70 px-4 py-2 text-xs text-muted-foreground">
            {t('actions.exportCsv')}
          </a>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <div className="space-y-2">
            {items.map((item: any) => (
              <div key={item.id} className="rounded-md border border-border/70 p-3 text-sm text-muted-foreground">
                {(item.sku || '-') + ' · ' + (item.name_ar || item.name_en || '-')}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
