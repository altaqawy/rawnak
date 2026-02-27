import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { listInventoryItems, listStockMoves } from '@/lib/admin-console/repository';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminInventoryReportPage({ params }: PageProps) {
  const { locale } = await params;
  await requireOwner(locale);
  const t = await getTranslations('adminModules');
  const [items, moves] = await Promise.all([listInventoryItems(), listStockMoves()]);

  const stockIn = moves
    .filter((move: any) => move.direction === 'in')
    .reduce((sum: number, move: any) => sum + Number(move.quantity ?? 0), 0);
  const stockOut = moves
    .filter((move: any) => move.direction === 'out')
    .reduce((sum: number, move: any) => sum + Number(move.quantity ?? 0), 0);

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('reports.inventory')}</h1>
        <a
          href={`/api/admin/export?dataset=inventory`}
          className="mt-3 inline-block rounded-md border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground"
        >
          {t('actions.exportCsv')}
        </a>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="glass-card rounded-2xl border border-border/70 p-4">
          <p className="text-sm text-muted-foreground">{t('inventory.items')}</p>
          <p className="mt-2 text-xl font-semibold text-foreground">{items.length}</p>
        </article>
        <article className="glass-card rounded-2xl border border-border/70 p-4">
          <p className="text-sm text-muted-foreground">{t('inventory.stockIn')}</p>
          <p className="mt-2 text-xl font-semibold text-foreground">{stockIn}</p>
        </article>
        <article className="glass-card rounded-2xl border border-border/70 p-4">
          <p className="text-sm text-muted-foreground">{t('inventory.stockOut')}</p>
          <p className="mt-2 text-xl font-semibold text-foreground">{stockOut}</p>
        </article>
      </section>
    </div>
  );
}

