import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { listAuditLog } from '@/lib/builder/repository';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export default async function OwnerAuditPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  await requireOwner(locale);

  const t = await getTranslations('ownerBuilder');
  const actionFilter = pickParam(query.action);
  const entityFilter = pickParam(query.entity);
  const records = await listAuditLog();
  const filtered = records.filter((record) => {
    if (actionFilter && record.action !== actionFilter) return false;
    if (entityFilter && record.entity_type !== entityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('audit.title')}</h1>
        <p className="mt-2 text-start text-sm text-muted-foreground">{t('empty.authorizedOnly')}</p>
      </header>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <form className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="audit-action" className="block text-start text-xs text-muted-foreground">
              {t('fields.action')}
            </label>
            <input
              id="audit-action"
              name="action"
              defaultValue={actionFilter ?? ''}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="audit-entity" className="block text-start text-xs text-muted-foreground">
              {t('fields.entityType')}
            </label>
            <input
              id="audit-entity"
              name="entity"
              defaultValue={entityFilter ?? ''}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="rounded-md border border-border/70 bg-card/70 px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('actions.filter')}
            </button>
          </div>
        </form>

        {filtered.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border/70 p-6 text-start">
            <p className="text-sm text-muted-foreground">{t('empty.noItems')}</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border/70">
            <table className="min-w-full text-start text-sm">
              <thead className="bg-card/70">
                <tr>
                  <th className="px-3 py-2 text-xs text-muted-foreground">{t('fields.createdAt')}</th>
                  <th className="px-3 py-2 text-xs text-muted-foreground">{t('fields.action')}</th>
                  <th className="px-3 py-2 text-xs text-muted-foreground">{t('fields.entityType')}</th>
                  <th className="px-3 py-2 text-xs text-muted-foreground">{t('fields.entityId')}</th>
                  <th className="px-3 py-2 text-xs text-muted-foreground">{t('fields.actorId')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => (
                  <tr key={record.id} className="border-t border-border/70">
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {new Date(record.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{record.action}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{record.entity_type}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{record.entity_id ?? '-'}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{record.actor_id ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
