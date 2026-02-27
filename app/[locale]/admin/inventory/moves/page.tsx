import { getTranslations } from 'next-intl/server';
import { createStockMoveAction } from '@/app/[locale]/admin/actions/console';
import { requireOwner } from '@/lib/auth/guards';
import { listInventoryItems, listStockMoves } from '@/lib/admin-console/repository';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export default async function AdminInventoryMovesPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  await requireOwner(locale);
  const t = await getTranslations('adminModules');
  const q = pickParam(query.q)?.trim().toLowerCase();
  const [items, allMoves] = await Promise.all([listInventoryItems(), listStockMoves()]);
  const moves = allMoves.filter((move: any) => {
    if (!q) return true;
    return String(move.direction).toLowerCase().includes(q) || String(move.reference_type || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('inventory.moves')}</h1>
      </header>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <form action={createStockMoveAction.bind(null, locale)} className="grid gap-3 md:grid-cols-3">
          <select name="item_id" className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" required>
            <option value="">{t('fields.item')}</option>
            {items.map((item: any) => (
              <option key={item.id} value={item.id}>{item.sku || item.name_ar || item.name_en || item.id}</option>
            ))}
          </select>
          <select name="direction" className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm">
            <option value="in">{t('inventory.stockIn')}</option>
            <option value="out">{t('inventory.stockOut')}</option>
          </select>
          <input name="quantity" placeholder={t('fields.quantity')} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" required />
          <input name="reference_type" placeholder={t('fields.referenceType')} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <input name="reference_id" placeholder={t('fields.referenceId')} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <input name="note" placeholder={t('fields.note')} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
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
        {moves.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <div className="space-y-2">
            {moves.map((move: any) => (
              <div key={move.id} className="rounded-md border border-border/70 p-3 text-sm text-muted-foreground">
                {move.direction} · {move.quantity} · {new Date(move.occurred_at).toLocaleString()}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
