import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { listInventoryItems, listStockMoves } from '@/lib/admin-console/repository';

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminInventoryLedgerPage({ params }: PageProps) {
  const { locale } = await params;
  await requireOwner(locale);
  const t = await getTranslations('adminModules');
  const [items, moves] = await Promise.all([listInventoryItems(), listStockMoves()]);

  const balanceMap = new Map<string, number>();
  for (const item of items as any[]) balanceMap.set(item.id, 0);
  for (const move of moves as any[]) {
    const current = balanceMap.get(move.item_id) ?? 0;
    balanceMap.set(move.item_id, move.direction === 'in' ? current + Number(move.quantity) : current - Number(move.quantity));
  }

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('inventory.ledger')}</h1>
      </header>
      <section className="glass-card rounded-2xl border border-border/70 p-6">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <div className="space-y-2">
            {(items as any[]).map((item) => (
              <div key={item.id} className="rounded-md border border-border/70 p-3 text-sm text-muted-foreground">
                {(item.sku || item.name_ar || item.name_en || item.id) + ' · ' + (balanceMap.get(item.id) ?? 0)}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
