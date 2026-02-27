import { getTranslations } from 'next-intl/server';
import { createCustomerAction } from '@/app/[locale]/admin/actions/console';
import { requireOwner } from '@/lib/auth/guards';
import { listCustomers } from '@/lib/admin-console/repository';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export default async function AdminCustomersPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  await requireOwner(locale);
  const t = await getTranslations('adminModules');
  const q = pickParam(query.q)?.trim().toLowerCase();
  const items = (await listCustomers()).filter((item: any) => {
    if (!q) return true;
    return (item.name || '').toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('customers.title')}</h1>
      </header>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <form action={createCustomerAction.bind(null, locale)} className="grid gap-3 md:grid-cols-2">
          <input name="name" placeholder={t('fields.name')} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <input name="user_id" placeholder={t('fields.userId')} className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm" />
          <div className="md:col-span-2">
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
          <a href={`/api/admin/export?dataset=customers`} className="rounded-md border border-border/70 bg-card/70 px-4 py-2 text-xs text-muted-foreground">
            {t('actions.exportCsv')}
          </a>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <div className="space-y-2">
            {items.map((item: any) => (
              <div key={item.id} className="rounded-md border border-border/70 p-3 text-sm text-muted-foreground">
                {(item.name || '-') + ' · ' + item.id}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
